from __future__ import division, print_function

import pymongo
from Bio.Blast import Applications
import os, tempfile
import subprocess

client = pymongo.MongoClient()
db = client.symbiont

# Go through the CDS features for all genomes, and save the protein sequences
# in FASTA format

filename = "symbionts-proteins.fasta"
with open(ffilename, "w") as tmpfile:
    for genome in db.genome.find():
        for feature in db.genome.features.find({"genome": genome["_id"]}):
            if feature['type'] == 'CDS':
                if 'translation' not in feature:
                    feature['translation'] = ['NONE']
                defline = ">" + feature['genome'] + "\\" + feature['locus_tag'][0]
                if 'product' in feature:
                    defline = defline + " " + feature['product'][0]
                print(defline, file=tmpfile)
                print(feature['translation'][0], file=tmpfile)
tmpfile.close()
