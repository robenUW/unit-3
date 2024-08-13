//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){

    var attrArray = ["Buck_2007","Antlerless_2007","Buck_2008","Antlerless_2008","Buck_2009","Antlerless_2009","Buck_2010","Antlerless_2010","Buck_2011","Antlerless_2011","Buck_2012","Antlerless_2012","Buck_2013","Antlerless_2013","Buck_2014","Antlerless_2014","Buck_2015","Antlerless_2015","Buck_2016","Antlerless_2016","Buck_2017","Antlerless_2017","Buck_2018","Antlerless_2018","Buck_2019","Antlerless_2019","Buck_2020","Antlerless_2020","Buck_2021","Antlerless_2021","Buck_Total","Antlerless_Total","BuckPercentTotal","AntlerlessPercentTotal"]
    var expressed = attrArray[0]; //initial attribute

    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 473,
        leftPadding = 30,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";


    //create a scale to size bars proportionally to frame and for axis
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 6000]);


    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
    function setMap(){
        //map frame dimensions
        var width = window.innerWidth * 0.500,
            height = 460;

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

                //set graticules
        function setGraticule(map, path){
            //create graticule generator
            var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

            //create graticule background
            var gratBackground = map.append("path")
                .datum(graticule.outline()) //bind graticule background
                .attr("class", "gratBackground") //assign class for styling
                .attr("d", path) //project graticule

            //create graticule lines
            var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
                .data(graticule.lines()) //bind graticule lines to each element to be created
                .enter() //create an element for each datum
                .append("path") //append each element to the svg as a path element
                .attr("class", "gratLines") //assign class for styling
                .attr("d", path); //project graticule lines
            };

                //add coordinated visualization to the map
                setChart(csvData, colorScale);  
                createDropdown(csvData)
                
        };

    }; //end setMap

    function joinData(newyorkWMU, csvData){
        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<csvData.length; i++){
            var csvRegion = csvData[i]; //the current region
        
            var csvKey = csvRegion.UNIT; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a=0; a<newyorkWMU.length; a++){
                                                
                var geojsonProps = newyorkWMU[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.UNIT; //the geojson primary key

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

    function setEnumerationUnits(newyorkWMU, map, path, colorScale){
        
        //add surrounding countries to map
        var countries = map.append("path")
            .datum(usa)
            .attr("class", "usa")
            .attr("d", path);

        //add NY WMUs regions to map
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
                    //console.log(value)
                    return colorScale(value);
                    console.log(value)
                } else {
                    return "#ccc";
                }
            })
            .on("mouseover", function(event, d){
                highlight(d.properties);
            })
            .on("mouseout", function(event, d){
                dehighlight(d.properties);
            })
            .on("mousemove", moveLabel);
        
        var desc = wmus.append("desc")
            .text('{"stroke": "000", "stroke-width": "0.5px"}');

    };

    function makeColorScale(data){
        var colorClasses = [
            "#EADDCA",
            "#E1C16E",
            "#CD7F32",
            "#800020",];
        //create color scale generator
        var colorScale = d3.scaleQuantile()
            .range(colorClasses);

        //build two-value array of minimum and maximum expressed attribute values
        var minmax = [
            d3.min(data, function(d) { return parseFloat(d[expressed]); }),
            d3.max(data, function(d) { return parseFloat(d[expressed]); })
        ];

        //assign two-value array as scale domain
        colorScale.domain(minmax);
        
        return colorScale;
    };

    //function to create a dropdown menu for attribute selection
    function createDropdown(csvData){
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });

        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };

    //dropdown change event handler
    function changeAttribute(attribute, csvData) {
        //change the expressed attribute
        expressed = attribute;

        //recreate the color scale
        var colorScale = makeColorScale(csvData);

        //recolor enumeration units
        var regions = d3.selectAll(".regions")
            .transition()
            .duration(1000)
            .style("fill", function(d){            
                var value = d.properties[expressed];            
                if(value) {                
                    return colorScale(value);           
                } else {                
                    return "#ccc";            
                }    
            });

        //Sort, resize, and recolor bars
        var bars = d3.selectAll(".bar")
            //Sort bars
            .sort(function(a, b){
                return b[expressed] - a[expressed];
            })
            .transition() //add animation
            .delay(function(d, i){
                return i * 20
            })
            .duration(500);
        

        updateChart(bars, csvData.length, colorScale);
    }; //end of changeAttribute()


    //function to create coordinated bar chart
    function setChart(csvData, colorScale){
        
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
            .on("mouseover", function(event, d){
                highlight(d)
            })
            .on("mouseout", function(event, d){
                dehighlight(d);
            })
            .on("mousemove", moveLabel);

        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');
        
        //create a text element for the chart title
        var chartTitle = chart.append("text")
            .attr("x", 40)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Harvests: by Year " + expressed);
        
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
        
        //set bar positions, heights, and colors
        updateChart(bars, csvData.length, colorScale);
    }; //end of setChart()

    //function to position, size, and color bars in chart
    function updateChart(bars, n, colorScale){
        //position bars
        bars.attr("x", function(d, i){
                return i * (chartInnerWidth / n) + leftPadding;
            })
            //size/resize bars
            
            .attr("height", function(d, i){
                //console.log(d[expressed])
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            //color/recolor bars
        
            .style("fill", function(d){            
                var value = d[expressed];            
                if(value) {                
                    return colorScale(value);            
                } else {                
                    return "#ccc";            
                }    
        });

    
        //at the bottom of updateChart()...add text to chart title
        var chartTitle = d3.select(".chartTitle")
            .text("Harvests: by Year " + expressed);
    }; //end of updateChart


    //set graticules
    function setGraticule(map, path){
        //create graticule generator
        var graticule = d3.geoGraticule()
        .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule background
        var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines
    };

    //function to highlight enumeration units and bars
    function highlight(props){
        
        //change stroke
        var selected = d3.selectAll("." + props.UNIT)
            .style("stroke", "blue")
            .style("stroke-width", "0");
        setLabel(props);
};

    //function to reset the element style on mouseout
function dehighlight(props){
        var selected = d3.selectAll("." + props.UNIT)
            .style("stroke", function(){
                return getStyle(this, "stroke")
            })
            .style("stroke-width", function(){
                return getStyle(this, "stroke-width")
            });

        function getStyle(element, styleName){
            var styleText = d3.select(element)
                .select("desc")
                .text();

            var styleObject = JSON.parse(styleText);

            return styleObject[styleName];
        };
        d3.select(".infolabel")
            .remove();
};

    //function to create dynamic label
function setLabel(props){
        //label content
        var labelAttribute = "<h1>" + props[expressed] +
            "</h1><b>" + expressed + "</b>";

        //create info label div
        var infolabel = d3.select("body")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", props.UNIT + "_label")
            .html(labelAttribute);

        var wmuLabel = infolabel.append("div")
            .attr("class", "labelname")
            .html(props.UNIT);
};

        //Example 2.8 line 1...function to move info label with mouse
function moveLabel(){
        //get width of label
        var labelWidth = d3.select("infolabel")
            .node()
            .getBoundingClientRect()
            .width;

        //use coordinates of mousemove event to set label coordinates
        var x1 = event.clientX + 10,
            y1 = event.clientY - 75,
            x2 = event.clientX - labelWidth - 10,
            y2 = event.clientY + 25;

        //horizontal label coordinate, testing for overflow
        var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
        //vertical label coordinate, testing for overflow
        var y = event.clientY < 75 ? y2 : y1; 

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
};

})(); //last line of main.js