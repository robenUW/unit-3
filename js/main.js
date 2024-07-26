//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

var attrArray = ["Buck_2007","Antlerless_2007","Buck_2008","Antlerless_2008","Buck_2009","Antlerless_2009","Buck_2010","Antlerless_2010","Buck_2011","Antlerless_2011","Buck_2012","Antlerless_2012","Buck_2013","Antlerless_2013","Buck_2014","Antlerless_2014","Buck_2015","Antlerless_2015","Buck_2016","Antlerless_2016","Buck_2017","Antlerless_2017","Buck_2018","Antlerless_2018","Buck_2019","Antlerless_2019","Buck_2020","Antlerless_2020","Buck_2021","Antlerless_2021","Buck_Total","Antlerless_Total","BuckPercentTotal","AntlerlessPercentTotal"]
var expressed = attrArray[0]; //initial attribute

//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap(){
    //map frame dimensions
    var width = window.innerWidth * 0.425,
        height = 800;

    //create new svg container for the map
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //Example 2.1 line 15...create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([0, 43]) // Centered on the latitude of New York
        .rotate([76, 0]) // Rotated to the longitude of New York; note the sign inversion
        .parallels([41, 44]) // Roughly the latitudinal extent of New York State
        .scale(5000) // Adjust scale as needed for your visualization
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);


    //use Promise.all to parallelize asynchronous data loading
    var promises = [];    
    promises.push(d3.csv("data/DeerWMU.csv")); //load attributes from csv    
    promises.push(d3.json("data/WMU_NY_WGS84.topojson")); //load chlropleth spatial data 
    promises.push(d3.json("data/US_State_Boundaries.topojson")); //load background data
    promises.push(d3.json("data/Canada.topojson")); //load background data
    Promise.all(promises).then(callback);

    function callback(data) {
        var csvData = data[0], ny = data[1]; usa = data[2];ca = data[3]

        //place graticule on the map
        setGraticule(map, path);

        //translate TopoJSONs
        var usastates = topojson.feature(usa, usa.objects.US_State_Boundaries),
            canada = topojson.feature(ca, ca.objects.Canada),
            newyorkWMU = topojson.feature(ny, ny.objects.WMU_NY_WGS84).features;

        
        //add US States to map
        var states = map.append("path")
            .datum(usastates)
            .attr("class", "usa")
            .attr("d", path); 

        //add Canada to map
        var canprov = map.append("path")
            .datum(canada)
            .attr("class", "ca")
            .attr("d", path); 
    
        //join csv
        newyorkWMU = joinData(newyorkWMU,csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

    
        //add enumeration units to map
        setEnumerationUnits(newyorkWMU, map, path, colorScale);

        //add coordinated visualization to the map
        setChart(csvData, colorScale);     

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

//Example 1.4 line 11...function to create color scale generator
function makeColorScale(data){
    var colorClasses = [
        "#EADDCA",
        "#E1C16E",
        "#CD7F32",
        "#800020",

    ];

    //create color scale generator
    var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    //build two-value array of minimum and maximum expressed attribute values
    var minmax = [
        d3.min(data, function(d) { return parseFloat(d[expressed]); }),
        d3.max(data, function(d) { return parseFloat(d[expressed]); })
    ];
    console.log(data)
    console.log(minmax)
    //assign two-value array as scale domain
    colorScale.domain(minmax);
    console.log(colorScale.quantiles())
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


//Example 1.3 line 38
function setEnumerationUnits(newyorkWMU, map, path, colorScale){
     //add Europe countries to map

    var countries = map.append("path")
     .datum(usa)
     .attr("class", "usa")
     .attr("d", path);

    //add France regions to map
    var wmus = map.selectAll(".wmus")
        .data(newyorkWMU)
        .enter()
        .append("path")
        .attr("class", function(d){
            return "regions " + d.properties.UNIT;
        })
        .attr("d", path)
            .style("fill", function(d){
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(d.properties[expressed]);
                } else {
                    return "#ccc";
                }
        });
};


//function to create coordinated bar chart
function setChart(csvData, colorScale){
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 30,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a rectangle for chart background fill
    var chartBackground = chart.append("rect")
        .attr("class", "chartBackground")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);

    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 5000]);

    //set bars for each province
    var bars = chart.selectAll(".bar")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function(a, b){
            return b[expressed]-a[expressed]
        })
        .attr("class", function(d){
            return "bar " + d.UNIT;
        })
        .attr("width", chartInnerWidth / csvData.length - 1)
        .attr("x", function(d, i){
            return i * (chartInnerWidth / csvData.length) + leftPadding;
        })
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        .style("fill", function(d){
            return colorScale(d[expressed]);
        });

    //create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 40)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Number of Variable " + expressed[3] + " in each region");

    //create vertical axis generator
    var yAxis = d3.axisLeft()
        .scale(yScale)       

    //place axis
    var axis = chart.append("g")
        .attr("class", "axis")
        .attr("transform", translate)
        .call(yAxis);

    //create frame for chart border
    var chartFrame = chart.append("rect")
        .attr("class", "chartFrame")
        .attr("width", chartInnerWidth)
        .attr("height", chartInnerHeight)
        .attr("transform", translate);
};


})(); //last line of main.js
