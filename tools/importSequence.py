#!/usr/bin/env python

from __future__ import print_function, division

from Bio import SeqIO
from Bio.Seq import Seq
import json
from pymongo import MongoClient

import argparse

parser = argparse.ArgumentParser(description="Import a rich sequence format flat file (e.g., genbank or embl) into a MongoDB database.")
parser.add_argument("filename", 
                    nargs=1, 
                    type=str, 
                    help="Name of the sequence file to import")
parser.add_argument("--format", 
                    type=str,
                    default='genbank',
                    help="Format of the sequence file")
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
                    help="Name of the collection to use to store the genomes (default=genomes)") 
parser.add_argument("--featurecollection", 
                    type=str,
                    default='genome.features',
                    help="Name of the collection used to store the genome features (default=genome.features)")
args = parser.parse_args()

client = MongoClient(args.host, args.port)

db = client[args.database]
genomes = db[args.genomecollection]
features = db[args.featurecollection]

first_id = None
plasmid_ids = []
for seq in SeqIO.parse(args.filename[0], args.format):

# Store the ID of the first sequence in the file, and assume it is the chromosome, and that subsequent sequences 
# are plasmids

    if not first_id:
        first_id = seq.id

# Start with the top level annotations

    genome = {}

# Add the basics

    genome['description'] = seq.description
    genome['_id'] = seq.id
    genome['name'] = seq.name
    genome['sequence'] = str(seq.seq)

# If there are references in the genome file, re-format them to a 
# slighty nicer sub-documents and store them as an array

    if 'references' in seq.annotations:
        genome['references'] = []
        for reference in seq.annotations['references']:
            new_reference = {'title': reference.title,
                             'authors': reference.authors,
                             'journal': reference.journal,
                             'location': {'start': reference.location[0].start.position,
                                          'end': reference.location[0].end.position,
                                          'strand': reference.location[0].strand}
                            }
            if reference.pubmed_id != "":
                new_reference['pubmed_id'] = reference.pubmed_id
            if reference.medline_id != "":
                new_reference['medline_id'] = reference.medline_id
            if reference.comment != "":
                new_reference['comment'] = reference.comment
            if reference.consrtm != "":
                new_reference['consortium'] = reference.consrtm
            
            genome['references'].append(new_reference)
        del seq.annotations['references']

# Add all of the other annotations as straight subdocuments

    for key, annotation in seq.annotations.items():
        genome[key] = annotation

# Insert the genome document into the genomes collection

    if genome['_id'] != first_id:
        plasmid_ids.append(genome["_id"])
        genome['parent_chromosome'] = first_id
        genome['replicon_type'] = 'plasmid'
    else:
        genome['replicon_type'] = 'chromosome'


    genome_id = genomes.insert_one(genome).inserted_id

# Now go through the features, create one document per feature and add all
# their qualifiers as top-level keys, inserting each document.  Use the genomes
# _id as a reference

    for feature in seq.features:
        new_feature = {}
        new_feature['genome'] = genome_id
        new_feature['type'] = feature.type
        new_feature['location'] = { 'start': feature.location.start.position,
                                    'end': feature.location.end.position,
                                    'strand': feature.location.strand}
        if feature.id != "<unknown id>":
            new_feature['id'] = feature.id
        for key, qualifier in feature.qualifiers.items():
            new_feature[key] = qualifier

# For CDS features, check if the translation is present

        if feature.type == "CDS":
            if "translation" not in new_feature:
                feature_sequence = genome['sequence'][new_feature['location']['start']:new_feature['location']['end']]
                feature_sequence = Seq(feature_sequence)
                if new_feature['location']['strand'] == -1:
                    feature_sequence = feature_sequence.reverse_complement()
                feature_sequence = feature_sequence.translate()
                new_feature['translation'] = str(feature_sequence)

# Add to the genome.features collection

        features.insert_one(new_feature)

    feature_tags = ['id', 'locus_tag', 'locus_id', 'name', 'genome', 'gene', 'gene_synonyms', 'location']
    for cds in features.find({'genome': genome_id, 'type': 'CDS'}):
        if not features.find_one({'type': 'gene', 'genome': genome_id, 'location': cds['location']}):
            new_gene = {}
            new_gene['type'] = 'gene'
            for tag in feature_tags:
                if tag in cds:
                    new_gene[tag] = cds[tag]
            features.insert_one(new_gene)

# If there were plasmids, update the genome with a list of the plasmid ids

if len(plasmid_ids) > 0:
    genomes.update_one({"_id": first_id}, {"$set": {"plasmids": plasmid_ids}})

# Make sure that the genomes and genome.features collections are properly indexed

genome_indices = genomes.index_information().keys()
feature_indices = features.index_information().keys()

if 'species' not in genome_indices:
    genomes.create_index([("organism",1)], name='species')
if 'full_text' not in feature_indices:
    features.create_index([("$**": 'text')], name='full_text')
