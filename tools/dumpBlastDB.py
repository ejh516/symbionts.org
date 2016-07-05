from __future__ import division, print_function

import pymongo
from pymongo import MongoClient
from Bio.Blast import Applications
import os, tempfile
import subprocess
import argparse

parser = argparse.ArgumentParser(description="Go through the CDS features for all genomes and save the protein sequences in FASTA format.")

parser.add_argument("filename", 
                    nargs=1, 
                    type=str, 
                    help="Name of the output file which will contain the protein sequence data")
parser.add_argument('--split',
                    action='store_true', 
                    help='Split sequence data into multiple files by genome (default=create single file)')
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
parser.add_argument("--genomecollection", 
                    type=str,
                    default='genome',
                    help="Name of the collection containing genome data (default=genomes)") 
parser.add_argument("--featurecollection", 
                    type=str,
                    default='genome.features',
                    help="Name of the collection containing CDS feature data (default=genome.features)")

args = parser.parse_args()
client = MongoClient(args.host, args.port)
db = client[args.database]
genomes = db[args.genomecollection]
features = db[args.featurecollection]
filename = args.filename[0]

if not args.split:
    tmpfile = open(filename, "w")
for i, genome in enumerate(genomes.find()):
    if args.split:
        tmpfile = open(filename + "_genome_"+ genome["_id"], "w")
    for feature in features.find({"genome": genome["_id"]}):
        if feature['type'] == 'CDS':
            if 'translation' not in feature:
                feature['translation'] = ['NONE']
            defline = ">" + str(feature["_id"]) + " " + feature['genome'] + " " + feature['locus_tag'][0]
            if 'product' in feature:
                defline = defline + " " + feature['product'][0]
            print(defline, file=tmpfile)
            print(feature['translation'][0], file=tmpfile)
    if args.split:
        tmpfile.close()
if not args.split:
    tmpfile.close()
