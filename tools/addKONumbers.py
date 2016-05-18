from pymongo import MongoClient

import argparse
import re

parser = argparse.ArgumentParser(description="Add KO number, name, definition, EC number and pathway name to CDSs in features collection.")

parser.add_argument("KOFeatureFilename", 
                    nargs=1, 
                    type=str, 
                    help="Name of the input file (from KAAS query) which maps CDS IDs to KO numbers.")
parser.add_argument("KODetailsFilename", 
                    nargs=1, 
                    type=str, 
                    help="Name of the input file which maps each KO number to name, definition, EC number and pathway.")
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


args = parser.parse_args()
client = MongoClient(args.host, args.port)
db = client[args.database]
features = db[args.featurecollection]
KOFeatureFilename = args.KOFeatureFilename[0]
KODetailsFilename = args.KODetailsFilename[0]

KOfeatures = {}
with open(KOFeatureFilename, "r") as KOFeatureFile:
     for line in KOFeatureFile:
          if line.startswith('A'):
               parsedline = re.split('<b>|</b>', line)
               pathA = parsedline[1]
               
          elif line.startswith('B'):
               parsedline = re.split('<b>|</b>', line)
               if len(parsedline) > 1:
                    pathB = parsedline[1]
              
          elif line.startswith('C'):
               parsedline = re.split('    ', line)[1]
               pathNumber = parsedline[0:5]
               pathC = parsedline[6:].split('[')[0][:-1]
          
          elif line.startswith('D'):
               parsedline = re.split('  |;', line)
               KONumber = parsedline[3]
               KOfeatures[KONumber] = {}
               KOfeatures[KONumber]["KO_name"] = parsedline[4]
               rest = parsedline[5].split("[EC:")
               KOfeatures[KONumber]["KO_definition"] = rest[0][1:]
               if len(rest)>1:
                    KOfeatures[KONumber]["KO_ECNumber"] = rest[1][:-2]
               KOfeatures[KONumber]["KO_pathway"] = "%s, %s, %s" % (pathA, pathB, pathC)

for feat in KOfeatures:
     #print KOfeatures[feat]["KO_name"]
     #print "%s: %s, %s" % (feat, KOfeatures[feat]["KO_name"], KOfeatures[feat]["KO_definition"])
     print "%s: %s" % (feat, KOfeatures[feat])

 




KODetailsFile = open(KODetailsFilename, "r")