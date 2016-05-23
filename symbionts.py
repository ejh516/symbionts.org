from __future__ import print_function, division

from flask import Flask, jsonify, render_template, request
from bson.objectid import ObjectId
from pymongo import MongoClient

import sys
import os

# Create the Flask app object that will be imported by the wsgi file

app = Flask(__name__)
m_connection = MongoClient()
db = m_connection.symbiont

#
# Routes listed in this section implement the basic web pages for the site 
# (index, search results, gene pages, etc.)
#

# Home page
@app.route("/")
def hello():
    all_species = get_species_list();
    return render_template("index.html", species=all_species)

# Search/search results page
@app.route("/search", methods=['POST', 'GET'])
def search_page():
    all_species = get_species_list();
    if request.method == "POST":
        return render_template("search.html", 
                                genome=request.form['genome'], 
                                search_text=request.form['search_text'],
                                species=all_species)
    else:
        return render_template("search.html", 
                                genome="", 
                                search_text="",
                                species=all_species)

@app.route("/genomes")
def genomes():
    #pass
    return render_template("genomes.html")

# Contact page
@app.route("/contact")
def contacts():
    pass

# Help page
@app.route("/help")
def help():
    pass

# Gene details page
@app.route("/genedetails/<gene_id>")
def gene_details(gene_id):
    all_species = get_species_list();
    return render_template("genedetails.html", id=gene_id, species=all_species)

# Genome details page
@app.route("/genomedetails/<genome_id>")
def genome_details(genome_id):
    return render_template("genomedetails.html", id=genome_id)

# Plasmid details page
@app.route("/plasmiddetails/<plasmid_id>")
def plasmid_details(plasmid_id):
    return render_template("plasmiddetails.html", id=plasmid_id)

#
# Routes listed below provide the RESTful interface to the MongoDB database which 
# contains the genome data
#

@app.route("/gene/<genome>/<geneID>")
def getGeneData(genome, geneID):
    return jsonify({'genome': genome, 'geneID': geneID})

@app.route("/search_all/<genome>/<search_text>")
def full_text_search(genome, search_text):

# Set up a default structure to return if the search fails

    results = {'hit_count': 0, 'results': [], 'search': search_text, 'genome': genome}
    features = db.genome.features

# Set the default search filter to just be the search text

    search_term = {"$text": {"$search": search_text}}

# If the user selected a species from the drop-down, add that to the filter

    if genome != 'all':
        search_term['genome'] = genome
    features_cursor = features.find(search_term)

# Have a look through the results (if any were retrieved)

    results['hit_count'] = features_cursor.count()

    if results['hit_count'] > 0:
        raw_results = []
        for result in features_cursor:
            result["_id"] = str(result['_id'])
            raw_results.append(result)
            results['results'] = raw_results

    return jsonify(results)

@app.route("/gene_info/<gene_id>")
def get_gene_by_ID(gene_id):

    oid = ObjectId(gene_id)

    features = db.genome.features
    genome = db.genome

    gene_results = features.find_one({"_id": oid}, {"translation":0})
    replicon_results =  genome.find_one({"_id":gene_results["genome"]})
    gene_results["organism"] = replicon_results["organism"]
    gene_results["replicon_type"] = replicon_results["replicon_type"]
    gene_results["_id"] = gene_id
  
    return jsonify(gene_results)

@app.route("/orthologue_info/<gene_id>")
def get_orthologues_by_ID(gene_id):

    oid = ObjectId(gene_id)

    features = db.genome.features
    # genome = db.genome
    orthologues = db.orthologues

    results = {}

    current_gene_results = {}
    current_gene_results["_id"] = gene_id

    current_gene = features.find_one({"_id": oid}, {"translation":0})
    current_gene_results["genome"] = current_gene["genome"]

    if "locus_tag" in current_gene:
        current_gene_results["locus_tag"] = current_gene["locus_tag"]
    else:
        current_gene_results["locus_tag"] = "Locus tag unknown."
  
    if "location" in current_gene:
        current_gene_results["start"] = current_gene["location"]["start"]
        current_gene_results["end"] = current_gene["location"]["end"]
        current_gene_results["strand"] = current_gene["location"]["strand"]

    results["current_gene"] = current_gene_results

    orthologue_results =[]
    aResult ={}

    qids = orthologues.find({"qid":gene_id})
    for result in qids:
        aResult["_id"] = result["sid"]
        aResult["genome"] = result["sgenome"]
        orth_oid = ObjectId(result["sid"])
        gene_results = features.find_one({"_id": orth_oid}, {"translation":0})
        if 'location' in gene_results:
            aResult["start"] = gene_results["location"]["start"]
            aResult["end"] = gene_results["location"]["end"]
            aResult["strand"] = gene_results["location"]["strand"]
        else:
            aResult["start"] = "0"
            aResult["end"] = "0"
            aResult["strand"] = "0"
        if "locus_tag" in gene_results:
            aResult["locus_tag"] = gene_results["locus_tag"]
        else:
            aResult["locus_tag"] = "Locus tag unknown."

        orthologue_results.append(aResult)

    sids = orthologues.find({"sid":gene_id})
    for result in sids:
        aResult["_id"] = result["qid"]
        aResult["genome"] = result["qgenome"]
        orth_oid = ObjectId(result["qid"])
        gene_results = features.find_one({"_id": orth_oid}, {"translation":0})
        if 'location' in gene_results:
            aResult["start"] = gene_results["location"]["start"]
            aResult["end"] = gene_results["location"]["end"]
            aResult["strand"] = gene_results["location"]["strand"]
        else:
            aResult["start"] = "0"
            aResult["end"] = "0"
            aResult["strand"] = "0"
        if "locus_tag" in gene_results:
            aResult["locus_tag"] = gene_results["locus_tag"]
        else:
            aResult["locus_tag"] = "Locus tag unknown."

        orthologue_results.append(aResult)

    results["orthologues"] = orthologue_results

  
    return jsonify(results)


@app.route("/genome_info")
def get_genome_info():
    
    results = {}
    genome = db.genome
    features = db.genome.features

# Get genome data 

    genome_cursor = genome.find({'replicon_type':'chromosome'}, {'_ID':1, 'organism':1, 'taxonomy':1, 'plasmids':1})

# Have a look through results 

    results ['hit_count'] = genome_cursor.count()

    if results ['hit_count'] > 0:
        raw_results = []
        for result in genome_cursor:
            #for each genome, count the number of genes in the features collection
            result["numGenes"]= features.find({'type': 'gene', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            #for each genome, count the number of CDSs in the features collection
            result["numCDSs"]= features.find({'type': 'CDS', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            #for each genome, count the number of pseudogenes in the features collection
            result["numPseudogenes"]= features.find({'type': 'gene','gene':{"$exists":1},'pseudo':{"$exists":1},'genome': result["_id"]}).count()
            #for each genome, count the number of tRNAs in the features collection
            result["numTRNAs"]= features.find({'type': 'tRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            #for each genome, count the number of rRNAs in the features collection
            result["numRRNAs"]= features.find({'type': 'rRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            raw_results.append(result)
   
        results['results'] = raw_results

    return jsonify(results)

@app.route("/genome_info/<genome_id>")
def get_genome_by_ID(genome_id):

    genome = db.genome
    features = db.genome.features

# Get data for given genome    
    results = genome.find_one({"_id": genome_id}, {"sequence":0})
    results["numGenes"]= features.find({'type': 'gene', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()
    results["numCDSs"]= features.find({'type': 'CDS', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()
    results["numPseudogenes"]= features.find({'type': 'gene','gene':{"$exists":1},'pseudo':{"$exists":1},'genome': genome_id}).count()
    results["numTRNAs"]= features.find({'type': 'tRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()
    results["numRRNAs"]= features.find({'type': 'rRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()

    return jsonify(results)

@app.route("/genome_info/<plasmid_id>")
def get_plasmid_by_ID(genome_id):
  
    genome = db.genome
    features = db.genome.features

# Get data for given genome    
    results = genome.find_one({"_id": plasmid_id}, {"sequence":0})
    results["numGenes"]= features.find({'type': 'gene', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': plasmid_id}).count()
    results["numCDSs"]= features.find({'type': 'CDS', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': plasmid_id}).count()
    results["numPseudogenes"]= features.find({'type': 'gene','gene':{"$exists":1},'pseudo':{"$exists":1},'genome': plasmid_id}).count()

    # Not sure if plasmids have tRNAs and rRNAs - remove these laster if necessary
    results["numTRNAs"]= features.find({'type': 'tRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': plasmid_id}).count()
    results["numRRNAs"]= features.find({'type': 'rRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': plasmid_id}).count()

    return jsonify(results)



#Helper functions to execute common queries on the database


def get_species_list():
    genome_collection = db.genome
    species_cursor = db.genome.find({'replicon_type': 'chromosome'}, {'organism': 1})
    species = [rec for rec in species_cursor]
    species.sort(key=lambda k: k['organism'])
    return species

# If we are not running as part of mod_wsgi, create a Flask web server running in debug mode
# (at http://localhost:5000) to test the code

if __name__ == "__main__":
    app.debug = True
    app.run()
