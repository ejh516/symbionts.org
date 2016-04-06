# symbionts.org

This repository contains the Flask and client-side code for a database for multiple bacterial
genomes.  The data model is held in MongoDB, and any rich, annotated sequence format that can
be read by Biopython's SeqIO module can be imported into the database.  As well as a web
presentation layer, the site also implements a RESTful-style interface to access the underlying
data in JSON format; this is in fact the method used by the client-side javascript to retreive 
data from the server.

## Web interface

Coming soon...

## RESTful interface

Coming soon

### License

The source code for the symbionts.org website is provided under the MIT license.
