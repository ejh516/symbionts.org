from pymongo import MongoClient

import argparse

parser = argparse.ArgumentParser(description="Import a text file containing BLAST database internal hits into a MongoDB collection.")

parser.add_argument("filename", 
                    nargs=1, 
                    type=str, 
                    help="Name of the file to import")
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
parser.add_argument("--collection", 
                    type=str,
                    default='internal_blast_hits',
                    help="Name of the collection to use to store the BLAST hits (default=internal_blast_hits)") 

args = parser.parse_args()

client = MongoClient(args.host, args.port)

db = client[args.database]
internal_blast_hits = db[args.collection]

f = open(args.filename[0])

qidDict = {} #Dictionary to match qids to qgenomes
matches = [] #list of all results

for line in f:
	if line.startswith('# Query'):
		parsedline = line.split(" ")
		qid = parsedline[2]
		qgenome = parsedline[3]
		qidDict[qid] = qgenome
	if not(line.startswith('#')):	
		aMatch = {}
		parsedline = line.split("\t")
		if (parsedline[0] != parsedline[1]):
			aMatch["qid"] = parsedline[0]
			aMatch["sid"] = parsedline[1]
			aMatch["percid"] = parsedline[2]
			aMatch["evalue"] = parsedline[10]
			aMatch["score"] = parsedline[11].replace("\n", "")
			aMatch["qgenome"] = qgenome
			matches.append(aMatch)
			
for match in matches:
	sid = match["sid"]
	sgenome = qidDict[sid]
	match["sgenome"] = sgenome
	
	#insert the BLAST match into the collection
	internal_blast_hits.insert_one(match)



