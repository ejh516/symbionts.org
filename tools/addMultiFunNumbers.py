
from bson.objectid import ObjectId
from pymongo import MongoClient

import argparse
import re

parser = argparse.ArgumentParser(description="Add MultiFun numbers to CDS features in E.Coli and all the orthologues in other species.")

parser.add_argument("UniProtToGOMappingFilename", 
                    nargs=1, 
                    type=str, 
                    help="Name of input text file containing EcoGene numbers mapped to GO numbers.")
parser.add_argument("GOtoMultiFunMappingFilename", 
                    nargs=1, 
                    type=str, 
                    help="Name of the input text file which maps each GO number to a MultiFun number.")
parser.add_argument("--host", 
                    type=str,
                    default='localhost',
                    help="Hostname for the MongoDB database (default=localhost)")
parser.add_argument("--port",
                    type=str,
                    default=27017,
                    help="Port where MongoDB is listening (default=27017)")
parser.add_argument("--database", 
                    type=str,
                    default='symbiont',
                    help="Name of the database to store the data in (default=symbiont)")
parser.add_argument("--featurecollection", 
                    type=str,
                    default='genome.features',
                    help="Name of the collection containing CDS feature data (default=genome.features)")
parser.add_argument("--orthologuescollection", 
                    type=str,
                    default='orthologues',
                    help="Name of the collection containing CDS orthologues (default=orthlogues)")  


args = parser.parse_args()
client = MongoClient(args.host, args.port)
db = client[args.database]
features = db[args.featurecollection]
orthologues = db[args.orthologuescollection]
UniProtFilename = args.UniProtToGOMappingFilename[0]
MultiFunFilename = args.GOtoMultiFunMappingFilename[0]

GOMultiFun = {}
with open(MultiFunFilename, "r") as MFFile:
     for line in MFFile:
          if line.startswith('MultiFun'):
               parsedline = re.split(' ', line)
               m = re.split(':', parsedline[0])
               multiFun = m[1]
               parsedline = re.split(' ; ', line)
               if len(parsedline)>1:
                    m = re.split(':', parsedline[1])
                    GO = re.split('\n',m[1])[0]
                    GOMultiFun[GO] = multiFun

UniProtGo = {}
with open(UniProtFilename, "r") as UniProtFile:
     for line in UniProtFile:
          if line.startswith('UniProtKB'):
               parsedline = re.split('\t', line)
               m = re.split(':',parsedline[4])
               GO = m[1]
               if parsedline[1] in UniProtGo:
                    if GO not in UniProtGo[parsedline[1]]:
                         UniProtGo[parsedline[1]].append(GO)
               else:
                    UniProtGo[parsedline[1]] = [GO]

# print(UniProtGo)


# Go through E.Coli features? and get UniProt number, get GO numbers from it and map these to MultiFun refs. Add list of MultiFun refs to the feature.


ecoliFeatures = features.find({"genome":"NC_000913.3", "type": "CDS", "db_xref": {"$regex":"^UniProt"}})

for feature in ecoliFeatures:
      for f in feature["db_xref"]:
          if f.startswith("UniProt"):
               parsedline = re.split(":", f)
               uni = parsedline[1]
               if uni in UniProtGo:
                    GO = UniProtGo[uni]
                    multifun = []
                    for g in GO:
                         if g in GOMultiFun:
                              if GOMultiFun[g] not in multifun:
                                   multifun.append(GOMultiFun[g])

                    features.update({"_id":feature["_id"]},{"$set":{"MultiFun":multifun}})

# Go through orthologues collection and get features which have orthologues in E.Coli. Copy the E.Coli UniProt number and Multifun numbers to feature in other genome.

ecoliOrthologues = orthologues.find({"qgenome":"NC_000913.3"})

for orth in ecoliOrthologues:
     ecolifeature = features.find_one({"_id": ObjectId(orth["qid"])})

     if 'MultiFun' in ecolifeature:
          multi = ecolifeature["MultiFun"]
          #copy over gene name too
          gene = ecolifeature["gene"]
          features.update({"_id":ObjectId(orth["sid"])},{"$set":{"MultiFun":multi}})
          features.update({"_id":ObjectId(orth["sid"])},{"$set":{"ecoli_orthologue_gene":gene}})

          print("Updated: "+ orth["sid"])


ecoliOrthologues = orthologues.find({"sgenome":"NC_000913.3"})

for orth in ecoliOrthologues:
     ecolifeature = features.find_one({"_id": ObjectId(orth["sid"])})

     if 'MultiFun' in ecolifeature:
          multi = ecolifeature["MultiFun"]
          gene = ecolifeature["gene"]
          features.update({"_id":ObjectId(orth["qid"])},{"$set":{"MultiFun":multi}})
          features.update({"_id":ObjectId(orth["qid"])},{"$set":{"ecoli_orthologue_gene":gene}})
          print("Updated: "+ orth["qid"])













