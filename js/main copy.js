//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    //map frame dimensions
    var width = 960,
        height = 800;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //Example 2.1 line 15...create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([10.91, 42.69])

        .rotate([85, 1, 0])
        
        .parallels([29.5, 45.5])
        
        .scale(6000)
        
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);


    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/DeerWMU.csv")); //load attributes from csv    
    promises.push(d3.json("data/WMU_NY_WGS84.topojson")); //load chlropleth spatial data 
    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0],
            ny = data[1];


        //translate europe TopoJSON
        var newyorkWMU = topojson.feature(ny, ny.objects.WMU_NY_WGS84).features;
        
        console.log(newyorkWMU)

        //add France regions to map
        var wmus = map.selectAll(".wmus")
            .data(newyorkWMU)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "wmus" + d.properties.UNIT;
            })
            .attr("d", path);


        //Example 2.6 line 1...create graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        //Example 2.6 line 5...create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
    
    



            createDropdown()
    

//function to create a dropdown menu for attribute selection
    function createDropdown(){
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown");

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data()
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    }
