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

@app.route("/gene/<gene_id>")
def get_gene_by_ID(gene_id):
# TODO: retrieve the feature details, replicon and genomes from MongoDB
    oid = ObjectId(gene_id)
    feature_collection = db.genome.features
    gene_details = feature_collection.find_one({"_id": oid})
    gene_details['_id'] = str(gene_details['_id'])
    replicon_details = db.genome.find_one({"_id": gene_details['genome']}, {"sequence": 0})
    genome_details = None
    if replicon_details['replicon_type'] == "plasmid":
        genome_details = db.genome.find_one({"_id": replicon_details['genome']}, {"sequence": 0})
    return jsonify({"feature": gene_details, "replicon": replicon_details, "genome": genome_details});

@app.route("/genome_info")
def get_genome_info():
    
    results = {}
    genome = db.genome

# Get genome data 

    genome_cursor = genome.find({'replicon_type':'chromosome'}, {'_ID':1, 'organism':1, 'taxonomy':1, 'plasmids':1})

# Have a look through results 

    results ['hit_count'] = genome_cursor.count()

    if results ['hit_count'] > 0:
        raw_results = []
        for result in genome_cursor:
            raw_results.append(result)
   
        results['results'] = raw_results

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
