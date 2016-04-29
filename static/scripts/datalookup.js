function updateSeqData(div, geneID) {
}

function updateGenomicContext(div, geneID) {
}

function updateHomologues(div, geneID) {

}

function updateSNPs(div, geneID) {
}

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
    target_div.append("<table><thead>" + header_row + 
                        "</thead><tbody id=\"results_table\"></tbody></table>");

// Get a reference to the body of the table, then append a row for each result

    var table = $('#results_table');
    for (var i=0; i < result.results.length; i++) {
        feature = result.results[i];
        var row_cells = "<td>" + feature.locus_tag + "</td>";
        if (feature.hasOwnProperty('gene')) {
            row_cells = row_cells + "<td>" + feature.gene + "</td>";
        } else {
            row_cells = row_cells + "<td></td>";
        }
        row_cells = row_cells + "<td>" + feature.type + "</td>"
        if (result.genome == 'all') {
            row_cells = row_cells + "<td>" + all_species[feature.genome] + "</td>";
        }
        if (feature.hasOwnProperty('product')) {
            row_cells = row_cells + "<td>" + feature.product + "</td>";
        } else {
            row_cells = row_cells + "<td></td>";
        }
        table.append("<tr>" + row_cells + "</tr>");
    }
}
