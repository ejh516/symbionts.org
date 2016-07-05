import os
from pymongo import MongoClient
import argparse


parser = argparse.ArgumentParser(description="Python script for going through steps of adding a new genome to the Symbionts database.")


# STEP 1: Before running this script download .gb files from NCBI. If there are any plasmids concatenate these with main chromosome file. 
# Place all files in folder and use this folder name as input for this script.

parser.add_argument("dataFolder", 
                    nargs=1, 
                    type=str, 
                    help="Path to the folder which contains the genome files.")
parser.add_argument("toolsFolder", 
                    nargs=1, 
                    type=str, 
                    help="Path to the folder which contains the python scripts (e.g. tools folder in symbionts.org")
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
parser.add_argument("--blastHitscollection", 
                    type=str,
                    default='internal_blast_hits',
                    help="Name of the collection containing internal blast hits (default = internal_blast_hits") 
parser.add_argument("--orthologuescollection", 
                    type=str,
                    default='orthologues',
                    help="Name of the collection containing orthologues data (default=orthologues)")

args = parser.parse_args()
client = MongoClient(args.host, args.port)
db = client[args.database]
internal_blast_hits = db[args.blastHitscollection]
orthologues = db[args.orthologuesecollection]



# STEP 2: Import the genomes into the MongoDB database using importSequence.py script.

dataFolder = args.dataFolder[0]
toolsFolder = args.toolsFolder[0]

for filename in os.listdir(folder):
	print filename
	s = toolsFolder + "importSequence.py "+dataFolder + "/" + filename
	 os.system("python "+s)

# STEP 3: Create a FASTA file for all the CDS features in the database using dumpBlastDB.py (without the split file flag)

s = toolsFolder+"dumpBlastDB.py  "+dataFolder+ "/symbionts_proteins.fasta"
os.system("python "+s)

# STEP 4: Run blast query - every CDS in database against every other CDS in database.
# On server: makeblastdb  -in 'symbionts_proteins.fasta' -dbtype prot
#			 blastp -db 'fasta_file' -query 'symbionts_proteins.fasta' -evalue 1e-10 -outfmt 7 -out 'selfmatches.txt'

#STEP 5: delete current mongodb collections - drop current internal_blast hits and orthologues collections

db.internal_blast_hits.drop()
db.orthologues.drop()

#STEP 6: import new blast hits into internal_blast hits collection using importBLASTselfmatch.py

s = toolsFolder+"importBLASTselfmatch.py  "+dataFolder+ "/selfmatches.txt"
os.system("python "+s)

#STEP 7: create new orthologues collection using createOrthologuesCollection.py

s = toolsFolder+"createOrthologuesCollection.py  "+dataFolder+ "/selfmatches.txt"
os.system("python "+s)

#STEP 8: Create FASTA files for the new genomes and plasmids using dumpBlastDB.py (with the split file flag)

s = toolsFolder+"dumpBlastDB.py  "+dataFolder+ "/symbionts_proteins --split"
os.system("python "+s)

#STEP 9: run KAAS queries using FASTA files from each genome and plasmid (http://www.genome.jp/kaas-bin/kaas_main) and save output from each as text file.

#STEP 10: add KO details to CDS features in database by running addKONumbers.py with the FASTA file as input1 and KONumbers.txt as input2

newFolder = "/Users/kn675/Python/NewGenomesFasta/KAASoutput"

for filename in os.listdir(newFolder):
	print filename
	s = toolsFolder + "addKONumbers.py "+folder + "/" + filename + " "+ toolsFolder "/KONumbers.txt"
	os.system(s)

