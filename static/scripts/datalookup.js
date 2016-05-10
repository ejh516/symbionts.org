function format_search_results(result, text_status, jqXHR, target_div, all_species) {

    var header_row = "";
    if (result.genome == 'all') {
        header_row = "<tr><th>Locus</th><th>Name</th><th>Type</th><th>Species</th><th>Product</th></tr>";
    } else {
        header_row = "<tr><th>Locus</th><th>Name</th><th>Type</th><th>Product</th></tr>";
    }

// Replace the current contents of the div with a heading, then append an empty table

    $("#spinning_wheel_div").remove();
    target_div.append("<h3>" + result.hit_count + " features found</h3>");

    if (result.hit_count > 0) {

        target_div.append("<table><thead>" + header_row + 
                            "</thead><tbody id=\"results_table\"></tbody></table>");

    // Get a reference to the body of the table, then append a row for each result

        var table = $('#results_table');
        for (var i=0; i < result.results.length; i++) {
            feature = result.results[i];
            var row_cells = "<td><a href=\"/genedetails/" + feature._id + "\">" + feature.locus_tag + "</a></td>";
            if (feature.hasOwnProperty('gene')) {
                row_cells = row_cells + "<td>" + feature.gene + "</td>";
            } else {
                row_cells = row_cells + "<td></td>";
            }
            row_cells = row_cells + "<td>" + feature.type + "</td>"
            if (result.genome == 'all') {
                var species_name = format_species_name(all_species[feature.genome]);
                row_cells = row_cells + "<td>" + species_name + "</td>";
            }
            if (feature.hasOwnProperty('product')) {
                row_cells = row_cells + "<td>" + feature.product + "</td>";
            } else {
                row_cells = row_cells + "<td></td>";
            }
            table.append("<tr>" + row_cells + "</tr>");
        }
    }
}

function format_gene_data(results, text_status, jqXHR, target_div, all_species) {

}

function format_species_name(species) {
    var words = species.split(" ");
    if (words.length > 1) {
        species = "<i>" + words[0] + " " + words[1] + "</i>";
        for (i = 2; i < words.length; i++) {
            species = species + " " + words[i];
        }
    }
    return species
}

function format_genome_results(result, text_status, jqXHR, target_div) {

    var header_row = "<tr><th>Genome ID</th><th>Organism</th><th>Taxonomy</th><th>No. Plasmids</th><th>No. Genes</th><th>No. CDSs</th><th>No. Pseudogenes</th></tr>";

    $("#spinning_wheel_div").remove();
     target_div.append("<h3>" + result.hit_count + " Genomes found</h3>");

    if (result.hit_count > 0) {
        target_div.append("<table><thead>" + header_row + 
                            "</thead><tbody id=\"results_table\"></tbody></table>");

        var table = $('#results_table');

        for (var i=0; i < result.results.length; i++) {
            genome = result.results[i];
            var formatted_species_name = format_species_name(genome.organism);
            var row_cells = "<td><a href=\"/genomedetails/" + genome._id + "\">" + genome._id + "</a></td><td>" + formatted_species_name + "</td>";
            var tax = genome.taxonomy[0];
             for (var j=1; j< genome.taxonomy.length; j++) {
                 tax = tax + "</br>" + genome.taxonomy[j];
             }
             row_cells = row_cells + "<td>" + tax + "</td>";
            
            if (genome.hasOwnProperty('plasmids'))
            {
                row_cells = row_cells + "<td>" + genome.plasmids.length + "</td>";
            } else {
                row_cells = row_cells + "<td>0</td>";
            }

            row_cells = row_cells + "<td>" + genome.numGenes + "</td><td>" + genome.numCDSs + "</td><td>" + genome.numPseudogenes + "</td>";

            table.append("<tr>" + row_cells + "</tr>");
            
            
        }
    }
}

function format_genome_data(result, text_status, jqXHR, target_div_details, target_div_references) {

    $("#spinning_wheel_div").remove();
    target_div_details.append("<h3>Genome details</h3>");
    target_div_details.append("<table><thead><tbody id=\"results_table\"></tbody></table>");
    var table = $('#results_table');
    table.append("<tr><td> ID </td><td>" + result._id + "</td></tr>");
    table.append("<tr><td> Organism </td><td>" + format_species_name(result.organism) + "</td></tr>");
    var tax = result.taxonomy[0];
    for (var j=1; j< result.taxonomy.length; j++) {
        tax = tax + "</br>" + result.taxonomy[j];
    }
    table.append("<tr><td> Taxonomy </td><td>" + tax + "</td></tr>");
    var numPlasmids = 0;
    if (result.hasOwnProperty('plasmids'))
    {
        numPlasmids = result.plasmids.length;
    } 
    table.append("<tr><td> No. Plasmids </td><td>" + numPlasmids + "</td></tr>");
    table.append("<tr><td> No. Genes </td><td>" + result.numGenes + "</td></tr>");
    table.append("<tr><td> No. CDSs </td><td>" + result.numCDSs + "</td></tr>");
    table.append("<tr><td> No. Pseudogenes </td><td>" + result.numPseudogenes + "</td></tr>");

    target_div_references.append("<h3>References</h3>");
    //target_div_references.append("<table><thead><tr><th>Authors</th></tr></thead><tbody id=\"results_table\"></tbody></table>");
    target_div_references.append("<table><thead><tbody id=\"ref_table\"></tbody></table>");
    var ref_table = $('#ref_table');
    if(result.hasOwnProperty('references'))
    {
        for (var j=0; j< result.references.length; j++) {
             var ref = result.references[j].authors +". " +result.references[j].title + ". "+ result.references[j].journal;
             if (result.references[j].hasOwnProperty('pubmed_id'))
             {
                ref = ref + ". PubMed ID: " + result.references[j].pubmed_id;
             }
             ref_table.append("<tr><td>" + ref + "</td></tr>")        
        }

    }

    
    
}
