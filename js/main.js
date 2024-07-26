//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

var attrArray = ["Buck_2007","Antlerless_2007","Buck_2008","Antlerless_2008","Buck_2009","Antlerless_2009","Buck_2010","Antlerless_2010","Buck_2011","Antlerless_2011","Buck_2012","Antlerless_2012","Buck_2013","Antlerless_2013","Buck_2014","Antlerless_2014","Buck_2015","Antlerless_2015","Buck_2016","Antlerless_2016","Buck_2017","Antlerless_2017","Buck_2018","Antlerless_2018","Buck_2019","Antlerless_2019","Buck_2020","Antlerless_2020","Buck_2021","Antlerless_2021","Buck_Total","Antlerless_Total","BuckPercentTotal","AntlerlessPercentTotal"]
var expressed = attrArray[0]; //initial attribute

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
        .center([0, 40.7128]) // Centered on the latitude of New York
        .rotate([74.0060, 0]) // Rotated to the longitude of New York; note the sign inversion
        .parallels([41, 44]) // Roughly the latitudinal extent of New York State
        .scale(4671.72) // Adjust scale as needed for your visualization
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);


    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/DeerWMU.csv")); //load attributes from csv    
    promises.push(d3.json("data/WMU_NY_WGS84.topojson")); //load chlropleth spatial data 
    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0], ny = data[1];

        //place graticule on the map
        setGraticule(map, path);

        //translate europe TopoJSON
        var newyorkWMU = topojson.feature(ny, ny.objects.WMU_NY_WGS84).features;

        //add europe countries to map 

        //join csv
        newyorkWMU = joinData(newyorkWMU,csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

    
        //add enumeration units to map
        setEnumerationUnits(newyorkWMU, map, path, colorScale);

    };
}; //end setMap


//set graticules
function setGraticule(map, path){
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
};


//function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#D4B9DA",
        "#C994C7",
        "#DF65B0",
        "#DD1C77",
        "#980043"
    ];

    //create color scale generator
    var colorScale = d3.scaleThreshold()
        .range(colorClasses);

    //build array of all values of the expressed attribute
    var domainArray = [];
    for (var i=0; i<data.length; i++){
        var val = parseFloat(data[i][expressed]);
        domainArray.push(val);
    };

    //cluster data using ckmeans clustering algorithm to create natural breaks
    var clusters = ss.ckmeans(domainArray, 5);
    //reset domain array to cluster minimums
    domainArray = clusters.map(function(d){
        return d3.min(d);
    });
    //remove first value from domain array to create class breakpoints
    domainArray.shift();

    //assign array of last 4 cluster minimums as domain
    colorScale.domain(domainArray);

    return colorScale;
};

function joinData(newyorkWMU, csvData){
    //loop through csv to assign each set of csv attribute values to geojson region
    for (var i=0; i<csvData.length; i++){
        var csvRegion = csvData[i]; //the current region
        //console.log(csvRegion)
        var csvKey = csvRegion.WMU_NY_UNIT; //the CSV primary key
        //console.log(csvKey)
        //loop through geojson regions to find correct region
        for (var a=0; a<newyorkWMU.length; a++){
                            
            
            var geojsonProps = newyorkWMU[a].properties; //the current region geojson properties
            //console.log(geojsonProps)
            var geojsonKey = geojsonProps.UNIT; //the geojson primary key
            //console.log(geojsonKey)
            
            //where primary keys match, transfer csv data to geojson properties object
            if (geojsonKey == csvKey){

                //assign all attributes and values
                attrArray.forEach(function(attr){

                    var val = parseFloat(csvRegion[attr]); //get csv attribute value
                    
                    geojsonProps[attr] = val; //assign attribute and value to geojson properties       
                });
            };
        };
    }
    return newyorkWMU;
};




function setEnumerationUnits(newyorkWMU, map, path){
    //add France regions to map
    var wmus = map.selectAll(".wmus")
        .data(newyorkWMU)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "wmus" + d.properties.UNIT;
        })
        .attr("d", path);
};


})(); //last line of main.js