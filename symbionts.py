from __future__ import print_function, division

from flask import Flask, jsonify, render_template, request
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
    all_species = get_genome_list()
    return render_template("index.html", species=all_species)

# Search/search results page
@app.route("/search", methods=['POST', 'GET'])
def search_page():
    all_species = get_genome_list()
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
    pass

# Contact page
@app.route("/contact")
def contacts():
    pass

# Help page
@app.route("/help")
def help():
    pass

# Gene details page
@app.route("/genedetails")
def gene_details():
    return render_template("genepage.html")

#
#
# Routes listed below provide the RESTful interface to the MongoDB database which 
# contains the genome data
#
#

@app.route("/gene/<genome>/<geneID>")
def getGeneData(genome, geneID):
    return jsonify({'genome': genome, 'geneID': geneID})

#
#
# Helper functions to execute common queries on the database
#
#

def get_genome_list():
    genome_collection = db.genome
    genome_cursor = db.genome.find({'replicon_type': 'chromosome'}, {'organism': 1})
    genomes = [rec for rec in genome_cursor]
    genomes.sort(key=lambda k: k['organism'])
    return genomes

# If we are not running as part of mod_wsgi, create a Flask web server (at http://localhost:5000)
# to test the code

if __name__ == "__main__":
    app.debug = True
    app.run()
