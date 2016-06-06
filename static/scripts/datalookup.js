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
            row_cells = row_cells + "<td>" + feature.gene + "</td>";
            row_cells = row_cells + "<td>" + feature.type + "</td>"
            if (result.genome == 'all' && feature.genome in all_species) {
               var species_name = format_species_name(all_species[feature.genome]);
               row_cells = row_cells + "<td>" + species_name + "</td>";
            }
            row_cells = row_cells + "<td>" + feature.product + "</td>";
            table.append("<tr>" + row_cells + "</tr>");
        }
    }
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
                row_cells = row_cells + "<td>" + format_species_name(genome.organism) + "</td>";
                var tax = genome.taxonomy[0];
                for (var j=1; j< genome.taxonomy.length; j++) {
                 tax = tax + "</br>" + genome.taxonomy[j];
                }
            row_cells = row_cells + "<td>" + tax + "</td>";
            row_cells = row_cells + "<td>" + genome.numPlasmids + "</td>";
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
    table.append("<tr><td> Organism </td><td>" + format_species_name(result.organism) + "</td></tr>");
    
    var tax = result.taxonomy[0];
    for (var j=1; j< result.taxonomy.length; j++) {
            tax = tax + "</br>" + result.taxonomy[j];
    }
    table.append("<tr><td> Taxonomy </td><td>" + tax + "</td></tr>");

    if (result['plasmids'].length>0)
    {
        var plasmids = "<a href=\"/plasmiddetails/" + result.plasmids[0] + "\">" + result.plasmids[0] + "</a>";
        for (var j=1; j< result.plasmids.length; j++) {
                plasmids = plasmids + "</br><a href=\"/plasmiddetails/" + result.plasmids[j] + "\">" + result.plasmids[j] + "</a>";
        }
    } 
    else{
        var plasmids = "None.";
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
     if (result['references'].length>0)
    {
        ref_table.append(getReferenceList(result['references']));
    }
}

function format_plasmid_data(result, text_status, jqXHR, target_div_plasmid_details, target_div_plasmid_references) {

    // Format table of plasmid details
    $("#spinning_wheel_div").remove();
    target_div_plasmid_details.append("<h3>Plasmid details</h3>");
    target_div_plasmid_details.append("<table><thead><tbody id=\"results_table\"></tbody></table>");
    var table = $('#results_table');
    table.append("<tr><td> ID </td><td>" + result._id + "</td></tr>");
    table.append("<tr><td> Organism </td><td>" + format_species_name(result.organism) + "</td></tr>");
    table.append("<tr><td> Parent chromosome </td><td><a href=\"/genomedetails/" + result.parent_chromosome + "\">" + result.parent_chromosome + "</a></td></tr>"); 
    table.append("<tr><td> No. Genes </td><td>" + result.numGenes + "</td></tr>");
    table.append("<tr><td> No. CDSs </td><td>" + result.numCDSs + "</td></tr>");
    table.append("<tr><td> No. Pseudogenes </td><td>" + result.numPseudogenes + "</td></tr>");

    //not sure if plasmids will have tRNAs and rRNAs - check later
    table.append("<tr><td> No. tRNAs </td><td>" + result.numTRNAs + "</td></tr>");
    table.append("<tr><td> No. rRNAs </td><td>" + result.numRRNAs + "</td></tr>");

    // Format table of references
    target_div_plasmid_references.append("<h3>References</h3>");
    target_div_plasmid_references.append("<table><thead><tbody id=\"ref_table\"></tbody></table>");
    var ref_table = $('#ref_table');
     if (result['references'].length>0)
    {
        ref_table.append(getReferenceList(result['references']));
    }
}

function getReferenceList(refs)
{
    var refList = "";
    for (var j=0; j< refs.length; j++) {
        r = refs[j].authors +". "+ refs[j].title +". "+ refs[j].journal + ". PubMed ID: " + refs[j].pubmed_id;
        refList = refList + "<tr><td>" + r + "</td></tr>";       
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

    if(result.replicon_type == "chromosome")
    {
        table.append("<tr><td> Genome </td><td><a href=\"/genomedetails/" + result.genome + "\">" + result.genome + "</a></td></tr>"); 
    }
    if(result.replicon_type == "plasmid")
    {
        table.append("<tr><td> Plasmid </td><td><a href=\"/plasmiddetails/" + result.genome + "\">" + result.genome + "</a></td></tr>"); 
    }
    
    table.append("<tr><td> Species </td><td>" + format_species_name(result.organism) + "</td></tr>");
    table.append("<tr><td> Type </td><td>" + result.type + "</td></tr>");
    table.append("<tr><td> Name </td><td>" + result.gene + "</td></tr>");
    table.append("<tr><td> Location </td><td> <i>Start:</i> " + result.location.start + " <i>End:</i> " + result.location.end + " <i>Strand:</i> " + result.location.strand + "</td></tr>");
    table.append("<tr><td> Function </td><td>" + result.function + "</td></tr>");
    table.append("<tr><td> Product </td><td>" + result.product + "</td></tr>");
    table.append("<tr><td> EC Number </td><td>" + result.EC_number + "</td></tr>");
    table.append("<tr><td> Protein ID </td><td><a href=http://www.ncbi.nlm.nih.gov/protein/" + result.protein_id + ">" + result.protein_id+ "</a></td></tr>"); 
    
    var db_xref = result.db_xref[0];

    for (var j=1; j< result.db_xref.length; j++) {

         db_xref = db_xref + "</br>" + result.db_xref[j];
    }
    table.append("<tr><td> Other database references </td><td>" + db_xref + "</td></tr>");
    
}

function format_orthologue_data(returned_result, text_status, jqXHR, target_div) {

    locus = returned_result.current_gene.locus_tag;
    target_div.append("<h3>Orthologues: " + locus + "</h3>");

    numOrthologues = returned_result.orthologues.length;

    if (numOrthologues>0){

        var header_row = "<tr><th>Orthologue</th><th>Genome</th><th>Organism</th></tr>";
        target_div.append("<table><thead>" + header_row + "</thead><tbody id=\"orthologues_table\"></tbody></table>");
        var table = $('#orthologues_table');

         for (var i=0; i<numOrthologues; i++){

            if(returned_result.orthologues[i].replicon_type == "chromosome"){
                table.append("<tr><td><a href=\"/genedetails/" + returned_result.orthologues[i]._id + "\">" + 
                    returned_result.orthologues[i].locus_tag + "</a></td><td><a href=\"/genomedetails/" + 
                    returned_result.orthologues[i].genome + "\">" + 
                    returned_result.orthologues[i].genome + "</a></td><td>" + 
                    format_species_name(returned_result.orthologues[i].organism) + "</td></tr>"); 
            }
            if(returned_result.orthologues[i].replicon_type == "plasmid"){
                table.append("<tr><td><a href=\"/genedetails/" + returned_result.orthologues[i]._id + "\">" + 
                    returned_result.orthologues[i].locus_tag + "</a></td><td><a href=\"/plasmiddetails/" + 
                    returned_result.orthologues[i].genome + "\">" + 
                    returned_result.orthologues[i].genome + "</a></td><td>"+
                    format_species_name(returned_result.orthologues[i].organism)+"</td></tr>"); 
            }
         }
    }
    else{
        target_div.append("<a>No orthologues found.</a>")
    }


}



function format_genomic_context_data(result, text_status, jqXHR, target_div, target_canvas) {

    //MODEL SECTION...?

    function Model (genomeList){
      this.genomeList = genomeList; 

    }

    function Genome(id, genesForDisplay) {
        this.id = id;
        this.genesForDisplay = genesForDisplay;
        this.gene_of_interest_start_point = null;
    }

    Genome.prototype.draw = function(context, start_y, fillStyle, canvasWidth){       

        for (var j=0; j< this.genesForDisplay.length; j++) {

          this.genesForDisplay[j].draw(context, this.gene_of_interest_start_point-(canvasWidth/2)*10, start_y, fillStyle); //-(canvasWidth/2)*10 to mark centre of canvas
        }

    }


    Genome.prototype.addGene = function(id, locus_tag, start, end, strand)
    {
        aGene = new Gene(id, locus_tag, start, end, strand);
        this.genesForDisplay.push(aGene);
    }

    function Gene(id, locus_tag, start, end, strand) {
        this.id = id;
        this.locus_tag = locus_tag;  
        this.start = start;
        this.end = end;
        this.length = end-start;
        this.strand = strand;
    }

    Gene.prototype.draw = function(context, x_offset, start_y, fillStyle){       
        context.fillStyle = fillStyle;
        context.fillRect((this.start-x_offset)/10,start_y,this.length/10,20);
        context.fillStyle = "rgb(0,0,0)";
        context.font="10px Helvetica";
        context.fillText(this.locus_tag, (this.start-x_offset)/10,(start_y+30));

    }


    Model.prototype.refreshGenome = function(id, genesForDisplay){

        for (var i = 0; i<this.genomeList.length; i++){
            if(this.genomeList[i].id == id){
                this.genomeList[i].genesForDisplay = [];
                for (var j=0; j< genesForDisplay.length; j++) {
                    this.genomeList[i].addGene(genesForDisplay[j].id, genesForDisplay[j].locus_tag, genesForDisplay[j].start, genesForDisplay[j].end, genesForDisplay[j].strand);
            }
            }
        }
    }


    Model.prototype.createGenome = function (id, gene_of_interest_start_point){

        geneList = [];

        aGenome = new Genome(id, geneList);

        aGenome.gene_of_interest_start_point = gene_of_interest_start_point;

        this.genomeList.push(aGenome);

    }



    //CONTROLLER SECTION...

    //make a model
    var genomeList = [];

    theModel = new Model(genomeList);

    function getGeneList(genome_ID, start_pos, end_pos){

        $.ajax({
                "url": "/gene_context_info/" + genome_ID +"/" + start_pos+ "/" +end_pos, 
                "success": function(data, status_text, jqXHR) {
                                    format_gene_list(data, status_text, jqXHR);
                           },
                "dataType": 'json'
               });
        
    }


    function format_gene_list(returnedGeneList, status_text, jqXHR){

        theModel.refreshGenome(returnedGeneList._id, returnedGeneList.geneList); 

    }

    
    function refreshGeneLists(start_pos, end_pos){


            for (var i = 0; i<theModel.genomeList.length; i++){

                getGeneList(theModel.genomeList[i].id, theModel.genomeList[i].gene_of_interest_start_point + start_pos, theModel.genomeList[i].gene_of_interest_start_point + end_pos);

                //alert("Genome " + i + " size: "+ theModel.genomeList[i].genesForDisplay.count());

            }



    }

    function createGenomes(numOrthologues){

        theModel.createGenome(result.current_gene.genome, result.current_gene.start);

        for (var i=0; i<numOrthologues; i++){
            theModel.createGenome(result.orthologues[i].genome, result.orthologues[i].start);

        }

    }

    target_div.append("<h3>" + result.current_gene.locus_tag + "</h3>");


    //first create the genomes

    start_position = -5000;
    end_position = 5000;
    numOrthologues = result.orthologues.length;


    createGenomes(numOrthologues);

    //initial start and end positions -5kb to 5kb
    refreshGeneLists(start_position,end_position);



    //VIEW SECTION...


    var can = target_canvas,
      ctx = can.getContext('2d'),
      dragging = false,
      lastX = 0,
      translated = 0,
      scale_factor = 1.0,
      scale = 1.0;

      can.height = 100+(numOrthologues*100);
      can.width = 1000;


     var grid = (function(dX, dY){
        var c = document.createElement("canvas"),
        ctx = c.getContext('2d');
        c.width = dX;
        c.height = dY;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, dX, dY);

        ctx.strokeStyle = 'black';
        ctx.moveTo(.5, dY/2);
        ctx.lineTo(dX + .5, dY/2);
        ctx.stroke();

        ctx.moveTo(.5, .5);
        ctx.lineTo(.5, dY + .5);
        ctx.stroke();
  
        return ctx.createPattern(c, 'repeat');
        })(500, 100);


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
            start_position = start_position - (delta*10);
            end_position = end_position - (delta*10);
            draw();
            }
    }

    window.onmouseup = function () {
        dragging = false;
        refreshGeneLists(start_position, end_position);// is the the best place???
        draw();
    }

    // can.addEventListener("mousewheel", mouseWheelHandler, false);

    // function mouseWheelHandler(e){

    //     var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    //     draw(scale_factor);
    //     if (delta < 0) { 
    //         scale_factor =  0.8;        
    //         draw(scale_factor);  
    //         return false;
    //     }
    //     if (delta > 0) 
    //     { 
    //         scale_factor = 1.25;
    //         draw(scale_factor);
    //         return false;
    //     }

    //     return false;

    // }

    draw();

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


      ctx.clearRect(-translated, 0, can.width, can.height);
      ctx.rect(-translated, 0, can.width, can.height);

      ctx.fillStyle = grid; //grid should depend on scale - how much we've zoomed in/out
      ctx.fill();

      //draw markers
      //find scale once I have implemeneted zoom - switch statement maybe?... e.g. if scale is 2, markers every 10kb, scale is 1, markers every 5kb. if scale is 0.5, markers at 2.5kb, scale is 0.1, markers every 1 kb

      var sc = 5000;
      var rem = start_position%sc;

      var st = start_position - rem;

      ctx.fillStyle = "rgb(112,128,144)";

      for (var i = st;i<=end_position+sc; i += sc)
      {
        ctx.font="15px Helvetica";
        ctx.fillText(((i-5000)/1000) + "kb", 5+(i/10),15);
    }




      for (var i = 0; i < theModel.genomeList.length; i++) {

         redColour = i*100;

        fillStyle = "rgb(" + redColour + ",0,0)";

        y_coord = (i*100) + 40;

        theModel.genomeList[i].draw(ctx,y_coord, fillStyle, can.width);


      }
    

    setInterval(draw,100); 

    }

}
    


























