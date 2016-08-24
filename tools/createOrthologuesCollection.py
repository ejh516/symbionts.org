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

internal_blast_hits_indices = internal_blast_hits.index_information().keys()

if 'evalue_score' not in internal_blast_hits_indices:
    internal_blast_hits.create_index([("evalue",1), ("score", -1)], name='evalue_score')
if 'qid' not in internal_blast_hits_indices:
    internal_blast_hits.create_index([("qid",1)], name='qid')

# get all distinct qids in the collection

qids = internal_blast_hits.distinct("qid")
print len(qids)

# for every qid in the collection, find the top hit (based on evalue, then score) for each genome for which there is a hit

i = 0
for qid in set(qids):
     i = i+1
     print(i)
    

     # find distinct sgenomes for that qid
     sgenomes = internal_blast_hits.distinct("sgenome", {'qid':qid})

     for sgenome in sgenomes:

          #check that this qid doesn't already have a BBH in this genome
          if (orthologues.find({"sid":qid, "qgenome":sgenome}).limit(1).count() == 0):               

               # get best hit for that qid and that sgenome after sorting by evalue and then score
               q_hit = internal_blast_hits.find({"qid":qid, "sgenome":sgenome}).sort([["evalue",1], ["score",-1]])
               q_best_hit = q_hit[0]

              # check that sgenome is not the same as qgenome
               if (q_best_hit["qgenome"] != q_best_hit["sgenome"] ): 

                   # see if the sid in best hit has the qid as best hit in qid's genome
                   qgenome = internal_blast_hits.find_one({"qid":qid},{"qgenome":1})
                   s_hit = internal_blast_hits.find({"qid":q_best_hit["sid"], "sgenome":qgenome["qgenome"]}).sort([["evalue",1], ["score",-1]])
                   
                   if (s_hit.count()>0):
                        s_best_hit = s_hit[0]
                        if (s_best_hit["sid"] == qid):
                                  orthologues.insert_one({"qid": q_best_hit["qid"], "sid": q_best_hit["sid"], "qgenome": q_best_hit["qgenome"], "sgenome": q_best_hit["sgenome"]})

                         




