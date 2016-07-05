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
    

    var parsed = result.db_xref[0].split(":");
    if(parsed.length>1){
    db_xref = parsed[0] + ": " + parsed[1];
    }
    else{
        db_xref = "None."
    }
    for (var j=1; j< result.db_xref.length; j++) {

        parsed = result.db_xref[j].split(":");
        db_xref = db_xref + "</br>" + parsed[0] + ": " + parsed[1] ;
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
        target_div.append("<p>No orthologues found.</p>")
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
        this.gene_of_interest_end_point = null;
        this.orientation = null;
    }

    function Gene(id, displayName, start, end, strand) {
        this.id = id;
        this.displayName = displayName;  
        this.start = start;
        this.end = end;
        this.length = end-start;
        this.strand = strand;
        this.flipped = false;
        this.hovered = false;
        this.canvasCovered = [0,0,0,0]; //starting x coordinate, starting y coordinate, length and height
    }

    Model.prototype.refreshGenome = function(id, genesForDisplay){

        for (var i = 0; i<this.genomeList.length; i++){

            //N.B. issue with orthologues/paralogues? of same genome so ignoring these here
            if(this.genomeList[i].id == id){
                this.genomeList[i].genesForDisplay = [];
                for (var j=0; j< genesForDisplay.length; j++) {

                    var displayName = genesForDisplay[j].locus_tag;

                    if (genesForDisplay[j].name != "Undefined.") //if gene name exists, use this instead of locus_tag
                    {
                        displayName = genesForDisplay[j].name;
                    }
                    this.genomeList[i].addGene(genesForDisplay[j]._id, displayName, genesForDisplay[j].start, genesForDisplay[j].end, genesForDisplay[j].strand);
                }
            }
        }
    }


    Model.prototype.createGenome = function (id, gene_of_interest_start_point, gene_of_interest_end_point, orientation){

        geneList = [];

        aGenome = new Genome(id, geneList);

        aGenome.gene_of_interest_start_point = gene_of_interest_start_point;

        aGenome.gene_of_interest_end_point = gene_of_interest_end_point;

        aGenome.orientation = orientation;

        var newGenome = true;
        for (var i = 0; i<this.genomeList.length; i++){
            if (this.genomeList[i].id ==id){
                newGenome = false;
            }
        }

        if (newGenome){
            this.genomeList.push(aGenome);
        }

    }

    Genome.prototype.draw = function(context, start_y, startStyle, scaling){ 

        //if orientation is -1, flip genome

        if(this.orientation == "-1")
        {

            //change start and end position and strand of every gene in genome

            for (var j=0; j< this.genesForDisplay.length; j++) {

                this.genesForDisplay[j].flip(this.gene_of_interest_start_point);
            }

            this.gene_of_interest_start_point = this.gene_of_interest_end_point;

        }

        //first write genome name
        context.fillStyle = "rgb(175,175,175)";
        context.font = "12px Helvetica";
        context.fillText(this.id, 500*scaling+2,start_y+50);



        //then draw all the genes

        var drawBox = false;
        var box_x = 0;
        var name = "Unknown.";
        var genome = "Unknown.";
        var start = "0";
        var end = "0";

        for (var j=0; j< this.genesForDisplay.length; j++) {

            specialStyle = false;

            if(this.genesForDisplay[j].start == this.gene_of_interest_start_point)
            {
                specialStyle = true;
            }

          this.genesForDisplay[j].draw(context, this.gene_of_interest_start_point, start_y, startStyle, specialStyle, scaling); 

  

          if (this.genesForDisplay[j].hovered)
          { 

            drawBox = true; 
            var x = (this.genesForDisplay[j].start-(this.gene_of_interest_start_point-5000*scaling))/(10*scaling);
            box_x = x + this.genesForDisplay[j].length/(2*10*scaling) - 100;

            name = this.genesForDisplay[j].displayName;
            genome = this.id;
            start = this.genesForDisplay[j].start;
            end = this.genesForDisplay[j].end;

          }
        }

        //draw pop-up box if a gene is hovered over

        if (drawBox == true) {

            context.beginPath();//not quite sure why I have to do this to prevent initial triangle being drawn
            context.closePath();


            context.fillStyle = "white";
            context.rect(box_x, start_y-40, 200, 100)
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.fill();
            context.stroke();

            context.font = "12px Helvetica";
            context.fillStyle = "black";
            context.fillText("Gene: " + name, box_x + 10,start_y - 17);
            context.fillText("Position: " + start+ " to " +end, box_x + 10,start_y+3);
            context.fillText("Genome: " + genome, box_x + 10,start_y+23);           
            context.fillText("Organism: " + "anOrganism", box_x + 10,start_y+43);

        }
    }


    Genome.prototype.addGene = function(id, displayName, start, end, strand)
    {
        aGene = new Gene(id, displayName, start, end, strand);
        aGene.canvasCovered = [0,0,0,0];
        this.genesForDisplay.push(aGene);
    }


    Gene.prototype.flip = function (flipping_point){

        if (this.flipped == false){

            if (this.strand == "1")
            {
                this.strand = "-1";
            }
            else{
                this.strand = "1";
            }

            var temp1 = this.start + 2*(flipping_point - this.start);
            var temp2 = this.end + 2*(flipping_point - this.end);

            this.start = temp2;
            this.end = temp1;

            this.flipped = true;

        }
    }

    Gene.prototype.checkIfHoveredOver = function(x_coord, y_coord)
    {
        if ((x_coord>=this.canvasCovered[0]) && x_coord<=(this.canvasCovered[0]+this.canvasCovered[2]) && y_coord>=this.canvasCovered[1] && y_coord<=(this.canvasCovered[1]+this.canvasCovered[3]))

        {
            this.hovered = true;

        }
        else{
            this.hovered = false;
        }
    }

    Gene.prototype.draw = function(context, x_offset, start_y, startStyle, specialStyle, scaling){  

        var start_x = (this.start-(x_offset-5000*scaling))/(10*scaling);
        var size =  this.length/(10*scaling); 
        var height = 20; 


        var middleStyle = "rgb(200,200,200)";
        var endStyle = "rgba(200,200,200, 0.3)";
        var fontStyle = "10px Helvetica";

        var name = this.displayName;
        var textStart_x = (this.start-(x_offset-5000*scaling))/(10*scaling);
        var textStart_y = start_y+35;

        if (this.hovered == true)
        {
            startStyle = "rgb(0,0,200)";

        }


        if (specialStyle)
        {
            context.lineWidth = 3;
            context.strokeStyle = "black";
            context.strokeRect(start_x,start_y,size,height);
            context.fillStyle = startStyle;
            context.fillRect(start_x,start_y,size,height);
            fontStyle = "bold 10px Helvetica";

        }
        else{

                if(this.strand == "-1"){
                        var grd=ctx.createLinearGradient(start_x,start_y,start_x + size,start_y + height);
                }
                else{
                        var grd=ctx.createLinearGradient(start_x + size,start_y + height, start_x,start_y);
                }

            grd.addColorStop(0,startStyle);
            grd.addColorStop(0.75,middleStyle);
            grd.addColorStop(1,endStyle);
            context.fillStyle = grd;
            context.fillRect(start_x,start_y,size,height);
        }


        context.font = fontStyle;

        if (this.hovered == true)
        {

           context.fillStyle = "blue";
        }
        else{
        context.fillStyle = "black";
        }
        context.fillText(name, textStart_x,textStart_y);

        //draw triangles on end of gene


        context.beginPath();


        if(this.strand == "-1"){

                context.moveTo(start_x, start_y);
                context.lineTo(start_x-10, start_y+10);
                context.lineTo(start_x, start_y+20);
            
        }
        else{

                context.moveTo(start_x + size, start_y);
                context.lineTo(start_x+size+10, start_y+10);
                context.lineTo(start_x + size, start_y+20);

        }
          
  
        context.strokeStyle = startStyle;
        context.lineWidth = 3;

        context.closePath();

        //context.strokeStyle = "red";

        context.stroke();      

         
        context.fillStyle = startStyle;
        context.fill();

        //set canvas covered
        this.canvasCovered = [start_x, start_y, size, height];


    }


    //CONTROLLER SECTION...


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

    
    function refreshGeneLists(start_p, end_p){


            for (var i = 0; i<theModel.genomeList.length; i++){

                start_pos = theModel.genomeList[i].gene_of_interest_start_point + start_p;
                end_pos = theModel.genomeList[i].gene_of_interest_start_point + end_p;

                if (theModel.genomeList[i].orientation == "-1") // need to find genes on other side of genome and then flip them when drawing them
                {
                        temp1 = start_pos + 2*(theModel.genomeList[i].gene_of_interest_start_point - start_pos);
                        start_pos = end_pos + 2*(theModel.genomeList[i].gene_of_interest_start_point - end_pos);
                        end_pos = temp1;
                }

                getGeneList(theModel.genomeList[i].id, start_pos,end_pos );

            }



    }

    function createGenomes(numOrthologues){

        theModel.createGenome(result.current_gene.genome, result.current_gene.start, result.current_gene.end, result.current_gene.strand);

        for (var i=0; i<numOrthologues; i++){
            theModel.createGenome(result.orthologues[i].genome, result.orthologues[i].start, result.orthologues[i].end, result.orthologues[i].strand);

        }

    }

    function goToGeneDetailsPage(id){

        window.location.href = "/genedetails/" + id; //slow
       
    }

    //make a model
    var genomeList = [];

    theModel = new Model(genomeList);


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
      scale = 1.0;

      can.height = theModel.genomeList.length*100;
      can.width = 950;



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

    can.onmousemove = function (e) {
        var evt = e || event;
        if (dragging) {
            var delta = evt.offsetX - lastX;
            translated += delta;
            ctx.translate (delta, 0);
            lastX = evt.offsetX;

            start_position = start_position - (10*delta)*scale;
            end_position = end_position - (10*delta)*scale;
            draw();

         
            }
        else{

            var rect = can.getBoundingClientRect();
            var x_coord= start_position/(10*scale) + (e.clientX - rect.left) + 500;
            var y_coord= (e.clientY - rect.top);

            for (var i = 0; i<theModel.genomeList.length; i++)
            {
                for (var j = 0; j<theModel.genomeList[i].genesForDisplay.length; j++)
                {
                    theModel.genomeList[i].genesForDisplay[j].checkIfHoveredOver(x_coord, y_coord); 
                }
            }

        }
    }

    can.onmouseup = function (e) {

        dragging = false;

        //if mouseup on a gene that's hovered over go to that gene's page...

        var rect = can.getBoundingClientRect();
            var x_coord= start_position/(10*scale) + (e.clientX - rect.left) + 500;
            var y_coord= (e.clientY - rect.top);

            for (var i = 0; i<theModel.genomeList.length; i++)
            {
                for (var j = 0; j<theModel.genomeList[i].genesForDisplay.length; j++)
                {
                    if(theModel.genomeList[i].genesForDisplay[j].hovered){

                        goToGeneDetailsPage(theModel.genomeList[i].genesForDisplay[j].id);
                        return false;
                    } 
                }
            }

        //refresh gene lists after dragging
        refreshGeneLists(start_position, end_position);
        draw();

    }

    function mouseWheelHandler(e){

        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        var prev_scale = scale;

        if (delta > 0) { 

        zoomIn();

        }
        if (delta < 0) 
        { 

        zoomOut();
        }


        return false;

    }


    function zoomIn()
    {

        var prev_scale = scale;
        if (scale>=0.5)
            {
                scale = scale/2;

                var midpoint = start_position + (end_position - start_position)/2;

                var new_length = (end_position - start_position) * (scale/prev_scale);

                start_position = midpoint - new_length/2;
                end_position = midpoint + new_length/2;

                refreshGeneLists(start_position, end_position);            

                ctx.clearRect(-translated, 0, can.width, can.height);

                ctx.translate(translated, 0);

                translated = 2*translated

                ctx.clearRect(-translated, 0, can.width, can.height);


                draw();

                showScale();
                
            }

        else{

            alert ("Cannot zoom in further.");
        }
        

        return false;
    }

    function zoomOut()
    {
        //alert("zooming out");

        var prev_scale = scale;
        if (scale<=2.0)
            {
                scale = scale*2;

                var midpoint = start_position + (end_position - start_position)/2;

                var new_length = (end_position - start_position) * (scale/prev_scale);

                start_position = midpoint - new_length/2;
                end_position = midpoint + new_length/2;

                refreshGeneLists(start_position, end_position);


                ctx.clearRect(-translated, 0, can.width, can.height);

                translated = 0.5*translated;

                ctx.translate(-translated, 0);

                ctx.clearRect(-translated, 0, can.width, can.height);

                draw();

                showScale();

            }
        else {

            alert ("Cannot zoom out further.");
        }
        

        return false;
    }

    function showScale(){

        var s = String("--------- " + (scale*10/4).toFixed(2)).slice(-5);
        document.getElementById("scale").innerHTML = "|---------------- " + s + "kb ----------------|";

    }

    function draw() {    

        ctx.clearRect(-translated, 0, can.width, can.height);
        ctx.rect(-translated, 0, can.width, can.height);

        ctx.fillStyle = grid; 
        ctx.fill();

        //draw markers
        var sc = 5000 * scale;
        var rem = start_position%sc;

        var st = start_position - rem;

        ctx.fillStyle = "rgb(100,100,100)";

        for (var i = st;i<=end_position+sc; i += sc)
        {
        ctx.font="15px Helvetica";
        ctx.fillText(((i-(5000*scale))/1000) + "kb", 5+(i/(10*scale)),20);
        }


        if(theModel.genomeList.length>0){

            //draw main genome first
            theModel.genomeList[0].draw(ctx, 40, "rgb(50,50,50)", scale);

            //then draw orthologue genomes
            for (var i = 1; i < theModel.genomeList.length; i++) {

                fillStyle = "rgb(80,140,150)";

                y_coord = (i*100) + 40;

                theModel.genomeList[i].draw(ctx,y_coord, fillStyle, scale);

              }

        }
  
        setInterval(draw,100); 

    }


    can.addEventListener("mousewheel", mouseWheelHandler, false);
    document.getElementById("zoom_in_button").addEventListener("click", zoomIn, false);
    document.getElementById("zoom_out_button").addEventListener("click", zoomOut, false);

    draw();

    showScale();


}
    