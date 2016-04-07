from __future__ import print_function, division

from flask import Flask, jsonify, render_template
from pymongo import MongoClient

import sys
import os

# Create the Flask app object that will be imported by the wsgi file

app = Flask(__name__)
m_connection = MongoClient()

#
#  Routes listed in this section implement the basic web pages for the site (index, search results, gene pages, etc.)
#

# Home page
@app.route("/")
def hello():
    
    return render_template("index.html")

# Gene details page
@app.route("/genedetails")
def gene_details():
    return render_template("genepage.html")

#
#
#  Routes listed below provide the RESTful interface to the MongoDB database which contains the genome data
#
#

@app.route("/gene/<genome>/<geneID>")
def getGeneData(genome, geneID):
    return jsonify({'genome': genome, 'geneID': geneID})

# If we are not running as part of mod_wsgi, create a Flask web server (at http://localhost:5000)
# to test the code

if __name__ == "__main__":
    app.debug = True
    app.run()
