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

            if (feature.hasOwnProperty('locus_tag')) {
                var row_cells = "<td><a href=\"/genedetails/" + feature._id + "\">" + feature.locus_tag[0] + "</a></td>";
            } else {
                row_cells = row_cells + "<td></td>"; //some features may not have locus_tags?
            }

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
        species = "<i>" + words[0] + " " +words[1]+ "</i>";

         for (var j = 2; j < words.length; j++) {

              species = species + " " + words[j];
          }
     }

    return species;
}

function format_genome_results(result, text_status, jqXHR, target_div) {

    var header_row = "<tr><th>Genome ID</th><th>Organism</th><th>Taxonomy</th><th>No. Plasmids</th><th>No. Genes</th><th>No. CDSs</th><th>No. Pseudogenes</th><th>No. tRNAs</th><th>No. rRNAs</th></tr>";

    $("#spinning_wheel_div").remove();
     target_div.append("<h3>" + result.hit_count + " Genomes found</h3>");

    if (result.hit_count > 0) {
        target_div.append("<table><thead>" + header_row + 
                            "</thead><tbody id=\"results_table\"></tbody></table>");

        var table = $('#results_table');

        for (var i=0; i < result.results.length; i++) {
            genome = result.results[i];
            var row_cells = "<td><a href=\"/genomedetails/" + genome._id + "\">" + genome._id + "</a></td>";

            if ('organism' in genome)
            {
                row_cells = row_cells + "<td>" + format_species_name(genome.organism) + "</td>";
            }
            else
            {
              row_cells = row_cells + "<td> Not found.</td>";  
            }

            if ('taxonomy' in genome)
            {
                var tax = genome.taxonomy[0];
                for (var j=1; j< genome.taxonomy.length; j++) {
                 tax = tax + "</br>" + genome.taxonomy[j];
                }
                row_cells = row_cells + "<td>" + tax + "</td>";
            }
            else
            {
              row_cells = row_cells + "<td> Not found.</td>";  
            } 
            
            if ('plasmids' in genome)
            {
                row_cells = row_cells + "<td>" + genome.plasmids.length + "</td>";
            } 
            else 
            {
                row_cells = row_cells + "<td>0</td>";
            }

            row_cells = row_cells + "<td>" + genome.numGenes + "</td><td>" + genome.numCDSs + "</td><td>" + genome.numPseudogenes +"</td><td>" + genome.numTRNAs + "</td><td>" + genome.numRRNAs + "</td>";
            table.append("<tr>" + row_cells + "</tr>");
                       
        }
    }
}

function format_genome_data(result, text_status, jqXHR, target_div_details, target_div_references) {

    // Format table of genome details
    $("#spinning_wheel_div").remove();
    target_div_details.append("<h3>Genome details</h3>");
    target_div_details.append("<table><thead><tbody id=\"results_table\"></tbody></table>");
    var table = $('#results_table');
    table.append("<tr><td> ID </td><td>" + result._id + "</td></tr>");

    if ('organism' in result)
    {
        table.append("<tr><td> Organism </td><td>" + format_species_name(result.organism) + "</td></tr>");
    }

    if ('taxonomy' in result)
    {
        var tax = result.taxonomy[0];
        for (var j=1; j< result.taxonomy.length; j++) {
            tax = tax + "</br>" + result.taxonomy[j];
            }
        table.append("<tr><td> Taxonomy </td><td>" + tax + "</td></tr>");
    }

  
    if ('plasmids' in result)
    {
       var plasmids = "<a href=\"/plasmiddetails/" + result.plasmids[0] + "\">" + result.plasmids[0] + "</a>";
        for (var j=1; j< result.plasmids.length; j++) {
            plasmids = plasmids + "</br><a href=\"/plasmiddetails/" + result.plasmids[j] + "\">" + result.plasmids[j] + "</a>";
        } 
    } 
    else
    {
        var plasmids = "None";
    }
    table.append("<tr><td> Plasmids </td><td>" + plasmids + "</td></tr>");
    table.append("<tr><td> No. Genes </td><td>" + result.numGenes + "</td></tr>");
    table.append("<tr><td> No. CDSs </td><td>" + result.numCDSs + "</td></tr>");
    table.append("<tr><td> No. Pseudogenes </td><td>" + result.numPseudogenes + "</td></tr>");
    table.append("<tr><td> No. tRNAs </td><td>" + result.numTRNAs + "</td></tr>");
    table.append("<tr><td> No. rRNAs </td><td>" + result.numRRNAs + "</td></tr>");

    // Format table of references
    target_div_references.append("<h3>References</h3>");
    target_div_references.append("<table><thead><tbody id=\"ref_table\"></tbody></table>");
    var ref_table = $('#ref_table');
     if ('references' in result)
    {
        ref_table.append(getReferenceList(result));
    }
}

function format_plasmid_data(result, text_status, jqXHR, target_div_plasmid_details, target_div_plasmid_references) {

    // Format table of plasmid details
    $("#spinning_wheel_div").remove();
    target_div_plasmid_details.append("<h3>Plasmid details</h3>");
    target_div_plasmid_details.append("<table><thead><tbody id=\"results_table\"></tbody></table>");
    var table = $('#results_table');
    table.append("<tr><td> ID </td><td>" + result._id + "</td></tr>");

    if ('organism' in result)
    {
        table.append("<tr><td> Organism </td><td>" + format_species_name(result.organism) + "</td></tr>");
    }

    if ('parent_chromosome' in result)
    {
        table.append("<tr><td> Parent chromosome </td><td><a href=\"/genomedetails/" + result.parent_chromosome + "\">" + result.parent_chromosome + "</a></td></tr>"); 
    }

    table.append("<tr><td> No. Genes </td><td>" + result.numGenes + "</td></tr>");
    table.append("<tr><td> No. CDSs </td><td>" + result.numCDSs + "</td></tr>");
    table.append("<tr><td> No. Pseudogenes </td><td>" + result.numPseudogenes + "</td></tr>");
    table.append("<tr><td> No. tRNAs </td><td>" + result.numTRNAs + "</td></tr>");
    table.append("<tr><td> No. rRNAs </td><td>" + result.numRRNAs + "</td></tr>");

    // Format table of references
    target_div_plasmid_references.append("<h3>References</h3>");
    target_div_plasmid_references.append("<table><thead><tbody id=\"ref_table\"></tbody></table>");
    var ref_table = $('#ref_table');
     if ('references' in result)
    {
        ref_table.append(getReferenceList(result));
    }
}

function getReferenceList(result)
{
    var refList = "";
    for (var j=0; j< result.references.length; j++) {

             var ref = "";
             if ('authors' in result.references[j])
             {
                ref = ref + result.references[j].authors +". ";
             }

             if ('title' in result.references[j])
             {
                ref = ref + result.references[j].title +". ";
             }

             if ('journal' in result.references[j])
             {
                ref = ref + result.references[j].journal;
             }
             if ('pubmed_id' in result.references[j])
             {
                ref = ref + ". PubMed ID: " + result.references[j].pubmed_id;
             }
             refList = refList + "<tr><td>" + ref + "</td></tr>";       
        }
        return refList;
}

function format_basic_gene_data(result, text_status, jqXHR, target_div) {

    $("#spinning_wheel_div").remove();

    header = "<h3>Gene details: "
    if('locus_tag' in result)
    {
        header = header + result.locus_tag
    }    
    target_div.append(header + "</h3>");

    target_div.append("<table><thead><tbody id=\"results_table\"></tbody></table>");
    var table = $('#results_table');

    if ('genome' in result && 'replicon_type' in result)
    {
        if(result.replicon_type == "chromosome")
        {
            table.append("<tr><td> Genome </td><td><a href=\"/genomedetails/" + result.genome + "\">" + result.genome + "</a></td></tr>"); 
        }
        if(result.replicon_type == "plasmid")
        {
            table.append("<tr><td> Plasmid </td><td><a href=\"/plasmiddetails/" + result.genome + "\">" + result.genome + "</a></td></tr>"); 
        }
    }

    if ('organism' in result)
    {
        table.append("<tr><td> Species </td><td>" + format_species_name(result.organism) + "</td></tr>");
    }

    if ('type' in result)
    {
        table.append("<tr><td> Type </td><td>" + result.type + "</td></tr>");
    }

    if ('gene' in result)
    {
        table.append("<tr><td> Name </td><td>" + result.gene + "</td></tr>");
    }

    if ('location' in result)
    {
        table.append("<tr><td> Location </td><td> <i>Start:</i> " + result.location.start + " <i>End:</i> " + result.location.end + " <i>Strand:</i> " + result.location.strand + "</td></tr>");
    }

    if ('function' in result)
    {
        table.append("<tr><td> Function </td><td>" + result.function + "</td></tr>");
    }

    if ('product' in result)
    {
        table.append("<tr><td> Product </td><td>" + result.product + "</td></tr>");
    }

    if ('EC_number' in result)
    {
        table.append("<tr><td> EC Number </td><td>" + result.EC_number + "</td></tr>");
    }

    if ('protein_id' in result)
    {

        table.append("<tr><td> Protein ID </td><td><a href=http://www.ncbi.nlm.nih.gov/protein/" + result.protein_id + ">" + result.protein_id+ "</a></td></tr>"); 
    }

    if ('db_xref' in result)
    {

        var db_xref = result.db_xref[0];
        for (var j=1; j< result.db_xref.length; j++) {
         db_xref = db_xref + "</br>" + result.db_xref[j];
        }
        table.append("<tr><td> Other database references </td><td>" + db_xref + "</td></tr>");
    }
}

function format_orthologue_data(returned_result, text_status, jqXHR, target_div) {

    locus = returned_result.current_gene.locus_tag;
    target_div.append("<h3>Orthologues: " + locus + "</h3>");

    var header_row = "<tr><th>Orthologue</th><th>Genome</th><th>Organism</th></tr>";
    target_div.append("<table><thead>" + header_row + "</thead><tbody id=\"orthologues_table\"></tbody></table>");
    var table = $('#orthologues_table');

    numOrthologues = returned_result.orthologues.length;
     for (var i=0; i<numOrthologues; i++)
     {
             if ('genome' in returned_result.orthologues[i] && 'replicon_type' in returned_result.orthologues[i])
            {
                if(returned_result.orthologues[i].replicon_type == "chromosome")
                {

                    table.append("<tr><td><a href=\"/genedetails/" + returned_result.orthologues[i]._id + "\">" + 
                                returned_result.orthologues[i].locus_tag + "</a></td><td><a href=\"/genomedetails/" + 
                                returned_result.orthologues[i].genome + "\">" + 
                                returned_result.orthologues[i].genome + "</a></td>" +
                                "<td>" + format_species_name(returned_result.orthologues[i].organism) + "</td></tr>"); 
                }
                if(returned_result.orthologues[i].replicon_type == "plasmid")
                {
                    table.append("<tr><td><a href=\"/genedetails/" + returned_result.orthologues[i]._id + "\">" + 
                        returned_result.orthologues[i].locus_tag + "</a></td><td><a href=\"/plasmiddetails/" + 
                        returned_result.orthologues[i].genome + "\">" + 
                        returned_result.orthologues[i].genome + "</a></td><td>"+
                        format_species_name(returned_result.orthologues[i].organism)+"</td></tr>"); 
                }
            }


     }


}


function format_genomic_context_data(result, text_status, jqXHR, target_div, target_canvas) {

    locus = result.current_gene.locus_tag;
    target_div.append("<h3>" + locus + "</h3>");
    
    start = parseInt(result.current_gene.start)
    end = parseInt(result.current_gene.end)
    size = (end - start)/10

    var gene_plot = [{x: 0, y: 300, length: size, locus_tag: locus, strand: result.current_gene.strand }]

    numOrthologues = result.orthologues.length;
     for (i=0; i<numOrthologues; i++)
     {
            start = parseInt(result.orthologues[i].start)
            end = parseInt(result.orthologues[i].end)
            size = (end - start)/10
            gene_plot.push({x:0, y: 300-((i+1)*100), length: size, locus_tag:result.orthologues[i].locus_tag, strand: result.orthologues[i].strand })
     }

    var can = target_canvas,
      ctx = can.getContext('2d'),
      dragging = false,
      lastX = 0,
      translated = 0,
      scale_factor = 1.0,
      scale = 1.0;

    var grid = (function(dX, dY){
        var can = document.createElement("canvas"),
        ctx = can.getContext('2d');
        can.width = dX;
        can.height = dY;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, dX, dY);

        ctx.strokeStyle = 'black';
        ctx.moveTo(.5, 0.5);
        ctx.lineTo(dX + .5, 0.5);
        ctx.stroke();

        ctx.moveTo(.5, .5);
        ctx.lineTo(.5, dY + .5);
        ctx.stroke();
  
        return ctx.createPattern(can, 'repeat');
        })(500, 100);

    ctx.scale(1, -1);
    ctx.translate(0, -400);

    can.onmousedown = function (e) {
        var evt = e || event;
        dragging = true;
        lastX = evt.offsetX;
    }

    window.onmousemove = function (e) {
        var evt = e || event;
        if (dragging) {
            var delta = evt.offsetX - lastX;
            translated += delta;
            ctx.translate(delta, 0);
            lastX = evt.offsetX;
            draw();
            }
    }

    window.onmouseup = function () {
        dragging = false;
    }

    window.addEventListener("mousewheel", mouseWheelHandler, false);

    function mouseWheelHandler(e){

    var mousex = e.clientX - can.offsetLeft;
    var mousey = e.clientY - can.offsetTop;

    if (mousex<=can.width && mousex>0 && mousey<=can.height && mousey>0)// check if cursor is within canvas
    {

        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

        // var wheel = event.wheelDelta/120;//n or -n
        // var zoom = 1 + wheel/2;
        // scale_factor *= zoom;

        draw(scale_factor);
        if (delta < 0) { 
            scale_factor =  0.8;        
            draw(scale_factor);  
            return false;
        }
        if (delta > 0) 
        { 
            scale_factor = 1.25;
            draw(scale_factor);
            return false;
        }

        return false;
    }
    }


    function draw() {
     
        //fix scaling
      if (scale_factor<1 && scale <=1 ) //can't zoom out anymore
      {
            scale_factor = 1.0;//don't zoom out 
      } 

      else
      {
          ctx.scale(scale_factor,scale_factor);
          scale = scale*scale_factor;
          scale_factor = 1.0;//reset scale_factor after scaling
        }

      ctx.clearRect(-translated, 0, 600, 400);
      ctx.rect(-translated, 0, 600, 400);
      ctx.fillStyle = grid;
      ctx.fill();
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.font="20px Helvetica";
      for (var i = 0; i < gene_plot.length; i++) 
      {
        ctx.beginPath();
        
        ctx.fillRect (gene_plot[i].x, gene_plot[i].y-10, gene_plot[i].length, 20);
        ctx.fillStyle = "rgb(0,0,0)";
        ctx.scale(1,-1);
        ctx.fillText(gene_plot[i].locus_tag, gene_plot[i].x, -(gene_plot[i].y+15));
        ctx.scale(1,-1);

        ctx.fillStyle = "rgb(200,0,0)";//change colour so that orthlogues arae red
      }
    }

    setInterval(draw,100);



}
    


























