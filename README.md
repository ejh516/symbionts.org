# symbionts.org

This repository contains the Flask and client-side code for a database for multiple bacterial
genomes.  The data model is held in MongoDB, and any rich, annotated sequence format that can
be read by Biopython's SeqIO module can be imported into the database.  As well as a web
presentation layer, the site also implements a RESTful-style interface to access the underlying
data in JSON format; this is in fact the method used by the client-side javascript to retreive 
data from the server.

## Prerequisites

The following software need to be installed on your system:
* a web server (e.g., apache)
* Python
* MongoDB
* Python modules:
  * Flask
  * pymongo
  * biopython (only required to import data)
* BLAST+ from [NCBI](http://www.ncbi.nlm.nih.gov) (only required to generate BLAST matches between genomes)

## Installation

All that is required to install the software for a local server is:

```bash
$ git clone https://github.com/peteashton/symbiont.org.git
```

To run using the (insecure) Flask web server, you just need to the main Flask application:

```bash
$ python symbiont.py
```

The database will then be available at http://localhost:5000/

### Running as a WSGI Application

Instructions for doing this will vary depending on the web server used, and the operating system
on which the software is installed.  For Apache, it is a matter of setting up a virtual host in the 
`httpd.conf` file which points to the `symbionts.wsgi` file and editing the `symbionts.wsgi` 
file to add the location of the software into the Python search path.

## Importing Data

Genbank and EMBL rich, annotated sequence files can be loaded into the database using the importSequence.py 
script in the tools folder.  By default, the data will be imported into the MongoDB instance that is running
on the default port, and into a database called "symbiont" and a 

## Web interface

Coming soon...

## RESTful interface

Coming soon...

### License

The source code for the symbionts.org website is provided under the MIT license.
