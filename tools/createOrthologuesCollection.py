from pymongo import MongoClient

import argparse

parser = argparse.ArgumentParser(description="Create a MongoDB collection of orthologues from an existing collection of internal BLAST hits.")

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
parser.add_argument("--existing_collection", 
                    type=str,
                    default='internal_blast_hits',
                    help="Name of the existing collection containing internal BLAST hits. (default=internal_blast_hits)") 
parser.add_argument("--orthologues_collection", 
                    type=str,
                    default='orthologues',
                    help="Name of the new collection of orthologues. (default=orthologues)") 

args = parser.parse_args()

client = MongoClient(args.host, args.port)

db = client[args.database]
internal_blast_hits = db[args.existing_collection]
orthologues = db[args.orthologues_collection]


# get all distinct qids in the collection

qids = internal_blast_hits.distinct("qid")

# for every qid in the collection, find the top hit (based on evalue, then score) for each genome for which there is a hit

for qid in set(qids[:20]):

     # find distinct sgenomes for that qid
     sgenomes = internal_blast_hits.distinct("sgenome", {'qid':qid})

     for sgenome in sgenomes:

          #check that this qid doesn't already have a BBH in this genome
          if (orthologues.find({"qid":qid, "sgenome":sgenome}).limit(1).count() == 0):               

               # get best hit for that qid and that sgenome after sorting by evalue and then score
               q_hit = internal_blast_hits.find({"qid":qid, "sgenome":sgenome}).sort([["evalue",1], ["score",-1]]).limit(1)

               # see if the sid in best hit has the qid as best hit in qid's genome
               qgenome = internal_blast_hits.find_one({"qid":qid},{"qgenome":1})
               s_hit = internal_blast_hits.find({"qid":q_hit[0]["sid"], "sgenome":qgenome["qgenome"]}).sort([["evalue",1], ["score",-1]]).limit(1)

               if (s_hit.count()>0):
                    if (s_hit[0]["sid"] == qid):
                         # print "Found a BBH: %s, %s and %s, %s" %(q_hit[0]["qid"],q_hit[0]["qgenome"],q_hit[0]["sid"],q_hit[0]["sgenome"])
                         # orthologues.insert_one({"qid": q_hit[0]["qid"], "sid": q_hit[0]["sid"], "qgenome": q_hit[0]["qgenome"], "sgenome": q_hit[0]["sgenome"]})
                         orthologues.insert_one(q_hit[0])




