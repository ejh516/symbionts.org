
from __future__ import print_function, division

from flask import Flask, jsonify, render_template, request
from bson.objectid import ObjectId
from pymongo import MongoClient

import sys
import os
import re

# Create the Flask app object that will be imported by the wsgi file

app = Flask(__name__)
m_connection = MongoClient(host="c2d2fs0.york.ac.uk")
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

# Genomes page
@app.route("/genomes")
def genomes():
    return render_template("genomes.html")

# MultiFun page
@app.route("/multifun")
def multifun():
    return render_template("multifun.html")

# Contact page
@app.route("/contact")
def contacts():
    return render_template("contact.html")

# Help page
@app.route("/help")
def help():
    return render_template("help.html")

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
            aResult = {"_id": "Undefined.","genome": "Undefined.","locus_tag": "Undefined.", "gene": "Undefined.", "type": "Undefined.", "product":"Undefined.", "organism": "Undefined."}
            if '_id' in result:
                aResult["_id"] = str(result['_id'])
            if 'genome' in result:
                aResult["genome"] = result['genome']               
            if 'locus_tag' in result:
                aResult["locus_tag"] = result['locus_tag'][0]
            if 'gene' in result:
                aResult["gene"] = result['gene'][0]
            if 'type' in result:
                aResult["type"] = result['type']
            if 'product' in result:
                aResult["product"] = result['product'][0]

                # only add search result if a locus_tag exists
            if aResult['locus_tag'] != "Undefined.": 
                raw_results.append(aResult)
            else:
                results['hit_count'] = int(results['hit_count'])-1
            results['results'] = raw_results

    return jsonify(results)

@app.route("/gene_info/<gene_id>")
def get_gene_by_ID(gene_id):

    oid = ObjectId(gene_id)

    features = db.genome.features
    genome = db.genome
    aResult = {"_id": gene_id,"genome": "Undefined.","locus_tag": "Undefined.", "gene": "Undefined.", "type": "Undefined", "product":"Undefined.", "replicon_type": "Undefined.", "organism": "Undefined.", "location": {"start":"0","end":"0","strand":"Undefined."},"EC_number": "Undefined.","protein_id": "Undefined.","db_xref": ["Undefined."], "function": "Undefined."}

    result = features.find_one({"_id": oid}, {"translation":0})

    if 'locus_tag' in result:
        aResult["locus_tag"] = result['locus_tag']
    if 'genome' in result:
        aResult["genome"] = result['genome']
    if 'type' in result:
        aResult["type"] = result['type']
    if 'gene' in result:
        aResult["gene"] = result['gene']
    if 'location' in result:
        if 'start' in result['location']:
            aResult["location"]["start"] = result["location"]["start"]
        if 'end' in result['location']:
            aResult["location"]["end"] = result["location"]["end"]
        if 'strand' in result['location']:
            aResult["location"]["strand"] = result["location"]["strand"]
    if 'product' in result:
        aResult["product"] = result['product']
    if 'EC_number' in result:
        aResult["EC_number"] = result['EC_number']
    if 'protein_id' in result:
        aResult["protein_id"] = result['protein_id']
    if 'db_xref' in result:
        aResult["db_xref"] = result['db_xref']

    replicon_result =  genome.find_one({"_id":result["genome"]})

    if 'organism' in replicon_result:
        aResult["organism"] = replicon_result["organism"]
    if 'replicon_type' in replicon_result:
        aResult["replicon_type"] = replicon_result["replicon_type"]
      
    return jsonify(aResult)

@app.route("/orthologue_info/<gene_id>")
def get_orthologues_by_ID(gene_id):

    oid = ObjectId(gene_id)

    features = db.genome.features
    genome = db.genome
    orthologues = db.orthologues

    results = {}

    current_gene_results = {"_id":gene_id, "genome": "Undefined.", "locus_tag": "Undefined.", "start": "0", "end": "0", "strand": "Undefined."}
    current_gene = features.find_one({"_id": oid}, {"translation":0})
    if "genome" in current_gene:
        current_gene_results["genome"] = current_gene["genome"]
    if "locus_tag" in current_gene:
        current_gene_results["locus_tag"] = current_gene["locus_tag"]
    if "location" in current_gene:
        if 'start' in current_gene['location']:
            current_gene_results["start"] = current_gene["location"]["start"]
        if 'end' in current_gene['location']:
            current_gene_results["end"] = current_gene["location"]["end"]
        if 'strand' in current_gene['location']:
            current_gene_results["strand"] = current_gene["location"]["strand"]  

    replicon_result =  genome.find_one({"_id":current_gene_results["genome"]})

    if 'organism' in replicon_result:
            current_gene_results["organism"] = replicon_result["organism"]
    if 'replicon_type' in replicon_result:
            current_gene_results["replicon_type"] = replicon_result["replicon_type"]    

    results["current_gene"] = current_gene_results

    orthologue_results = []
 
    ids = orthologues.find({"$or" :[{"qid":gene_id},{"sid":gene_id}]})

    for result in ids:

        aResult = {"_id": "Undefined.", "genome": "Undefined.","start": "0","end": "0","strand": "Undefined.", "organism": "Undefined.", "replicon_type": "Undefined."}

        if result["qid"]==gene_id:
            aResult["_id"] = result["sid"]
            aResult["genome"] = result["sgenome"]
            orth_oid = ObjectId(result["sid"])
        elif result["sid"]==gene_id:
            aResult["_id"] = result["qid"]
            aResult["genome"] = result["qgenome"]
            orth_oid = ObjectId(result["qid"])  

        gene_results = features.find_one({"_id": orth_oid}, {"translation":0})

        if 'location' in gene_results:
            if 'start' in gene_results['location']:
                aResult["start"] = gene_results["location"]["start"]
            if 'end' in gene_results['location']:
                aResult["end"] = gene_results["location"]["end"]
            if 'strand' in gene_results['location']:
                aResult["strand"] = gene_results["location"]["strand"]

        if "locus_tag" in gene_results:
            aResult["locus_tag"] = gene_results["locus_tag"]

        replicon_results =  genome.find_one({"_id":aResult["genome"]})

        if 'organism' in replicon_results:
            aResult["organism"] = replicon_results["organism"]
        if 'replicon_type' in replicon_results:
            aResult["replicon_type"] = replicon_results["replicon_type"]   

        orthologue_results.append(aResult)
  
    results["orthologues"] = orthologue_results
    return jsonify(results)


@app.route("/gene_context_info/<genome_id>/<start_pos>/<end_pos>")
def get_neighbouring_genes(genome_id, start_pos, end_pos):

    genome = db.genome
    features = db.genome.features

    # find CDSs only for now
    results = features.find({"genome": genome_id, "type": "CDS", "$or":[{"location.start":{"$lt":float(end_pos), "$gt":float(start_pos)}},{"location.end":{"$lt":float(end_pos), "$gt":float(start_pos)}}]}) 

    geneList = []

    for aGene in results:

        aResult = {"_id": "Undefined.","locus_tag": "Undefined.", "name": "Undefined.", "type": "Undefined.", "start": "-1", "end": "-1", "strand":"0"}
        if '_id' in aGene:
            aResult["_id"] = str(aGene['_id'])
        if 'locus_tag' in aGene:
            aResult["locus_tag"] = aGene['locus_tag']
        if 'gene' in aGene:
            aResult["name"] = aGene['gene']
        if 'type' in aGene:
            aResult["type"] = aGene['type']
        if 'location' in aGene:
            if 'start' in aGene['location']:
                aResult["start"] = aGene["location"]["start"]
            if 'end' in aGene['location']:
                aResult["end"] = aGene["location"]["end"]
            if 'strand' in aGene['location']:
                aResult["strand"] = aGene["location"]["strand"]

        geneList.append(aResult)


    aResult = {"_id":genome_id, "organism": "an_Organism", "geneList":geneList}

    return jsonify(aResult)


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
            aResult = {"_id":"Undefined.","organism":"Undefined.","taxonomy":["Undefined."],"numPlasmids":"0"}
            if '_id' in result:
                aResult["_id"] = result["_id"]
            if 'organism' in result:
                aResult["organism"] = result["organism"]
            if 'taxonomy' in result:
                aResult["taxonomy"] = result["taxonomy"]
            if 'plasmids' in result:
                aResult["numPlasmids"] = len(result["plasmids"])

            #for each genome, count the number of genes in the features collection
            aResult["numGenes"]= features.find({'type': 'gene', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            #for each genome, count the number of CDSs in the features collection
            aResult["numCDSs"]= features.find({'type': 'CDS', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            #for each genome, count the number of pseudogenes in the features collection
            aResult["numPseudogenes"]= features.find({'type': 'gene','gene':{"$exists":1},'pseudo':{"$exists":1},'genome': result["_id"]}).count()
            #for each genome, count the number of tRNAs in the features collection
            aResult["numTRNAs"]= features.find({'type': 'tRNA', 'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            #for each genome, count the number of rRNAs in the features collection
            aResult["numRRNAs"]= features.find({'type': 'rRNA', 'pseudo':{"$exists":0},'genome': result["_id"]}).count()
            raw_results.append(aResult)
   
        results['results'] = raw_results

    return jsonify(results)

@app.route("/genome_info/<genome_id>")
def get_genome_by_ID(genome_id):

    genome = db.genome
    features = db.genome.features

# Get data for given genome    
    result = genome.find_one({"_id": genome_id}, {"sequence":0})

    aResult = {"_id":"Undefined.","organism":"Undefined.","taxonomy":["Undefined."],"plasmids":[], "references": [], "parent_chromosome": "Undefined"}

    if '_id' in result:
        aResult["_id"] = result["_id"]
    if 'organism' in result:
        aResult["organism"] = result["organism"]
    if 'taxonomy' in result:
        aResult["taxonomy"] = result["taxonomy"]
    if 'plasmids' in result:
        aResult["plasmids"] = result["plasmids"]
    if 'parent_chromosome' in result:
        aResult["parent_chromosome"] = result["parent_chromosome"]
    if 'references' in result:
        # aResult["references"] =[]
        for ref in result['references']:
            aRef = {"authors": "No authors", "title": "No title", "journal": "No journal", "pubmed_id": "None given."}
            if 'authors' in ref:
                aRef["authors"] = ref["authors"]
            if 'title' in ref:
                aRef["title"] = ref["title"]
            if 'journal' in ref:
                aRef["journal"] = ref["journal"]
            if 'pubmed_id' in ref:
                aRef["pubmed_id"] = ref["pubmed_id"]
            aResult["references"].append(aRef)


    aResult["numGenes"]= features.find({'type': 'gene', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()
    aResult["numCDSs"]= features.find({'type': 'CDS', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()
    aResult["numPseudogenes"]= features.find({'type': 'gene','gene':{"$exists":1},'pseudo':{"$exists":1},'genome': genome_id}).count()
    aResult["numTRNAs"]= features.find({'type': 'tRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()
    aResult["numRRNAs"]= features.find({'type': 'rRNA', 'gene':{"$exists":1},'pseudo':{"$exists":0},'genome': genome_id}).count()

    return jsonify(aResult)

@app.route("/multifun_info/<multifun_ref>")
def get_mulitifun_info(multifun_ref):
    genomes = db.genome
    features = db.genome.features

    multifun = re.split(" ",multifun_ref)
    multifun_number = multifun[0]

    search_results = features.find({"MultiFun":{"$regex":"^" + multifun_number}})

    hit_count = search_results.count()

    feature_dict = {}
    for feature in search_results:

        if feature["genome"] not in feature_dict:
            feature_dict[feature["genome"]] = {}
        if feature["genome"] == "NC_000913.3" and 'gene' in feature:
            feature_dict[feature["genome"]][feature["gene"][0]] = [feature["gene"], str(feature["_id"])]
        elif 'ecoli_orthologue_gene' in feature and 'locus_tag' in feature:
            feature_dict[feature["genome"]][feature["ecoli_orthologue_gene"][0]] = [feature["locus_tag"], str(feature["_id"])]


    organisms = {}
    for genome in feature_dict:
        replicon_result =  genomes.find_one({"_id":genome})
        organisms[genome] = {}
        if 'organism' in replicon_result:
                organisms[genome]["organism"] = replicon_result["organism"]
        if 'replicon_type' in replicon_result:
                organisms[genome]["replicon_type"] = replicon_result["replicon_type"].capitalize()    
                
  
    results = {"multifun": multifun_ref, "hit_count": hit_count,  "organisms": organisms, "features": feature_dict}



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
