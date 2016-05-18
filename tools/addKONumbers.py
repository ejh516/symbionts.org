from pymongo import MongoClient

import argparse

parser = argparse.ArgumentParser(description="Add KO numbers, name, definition, EC number and pathway name to CDSs in features collection.")

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

KOFeatureFile = open(KOFeatureFilename, "r")
KODetailsFile = open(KODetailsFilename, "r")