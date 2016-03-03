var gapi = "AIzaSyDGr4IEBrD3_0E2xJgh6odNqQL3hlj70yw";

window.onload = function() {
var svg = d3.select("#main");
var xsz = 600;
var ysz = 400;
var minlat = 0;
var maxlat = 0;
var minlon = 0;
var maxlon = 0;

var places = [];
var villa_alta;

var buildElevation = function(p) {
	var url = "https://maps.googleapis.com/maps/api/elevation/json?locations="+p.lat+","+p.lon+"&key="+gapi;
	console.log(p.name_pueblo)
	console.log(url);
	/*$.ajax({
     url: url,
   // The name of the callback parameter, as specified by the YQL service
     jsonp: "callback",
     jsonpCallback: 'callback',
   // Tell jQuery we're expecting JSONP
     dataType: "jsonp",
   // Work with the response
     success: function( response ) {
       console.log( response ); // server response
     }
   });*/
}

var normalize = function(p) {
	p.x = (p.lon-minlon)/(maxlon-minlon)*xsz;
	p.y = (p.lat-minlat)/(maxlat-minlat)*ysz;
}

var buildPlaces = function() {
	// normalize
	
	var set = false;
	places.forEach(function(p){
		if (!set || p.lat < minlat) minlat = p.lat;
		if (!set || p.lat > maxlat) maxlat = p.lat;
		if (!set || p.lon < minlon) minlon = p.lon;
		if (!set || p.lon > maxlon) maxlon = p.lon;
		set = true;
	});
	places.forEach(function(p){
		normalize(p);
	});
	// build
	places.forEach(function(p){
		//console.log(p);
		svg.append("circle")
	    .attr("cx", p.x)
	    .attr("cy", p.y)
	    .attr("r", 2.5);

	    buildElevation(p);
	});
}


loadJSON("./data/places.json",function(data){
	data = JSON.parse(data);
	data.forEach(function(pj){
		pj.lat = parseFloat(pj.lat);
		pj.lon = parseFloat(pj.lon);
		places.push(pj);
	});
	buildPlaces();
});

loadJSON("./data/villa_alta.json",function(data){
	data = JSON.parse(data);
	data.lat = parseFloat(data.lat);
	data.lon = parseFloat(data.lon);
	villa_alta = data;
	normalize(villa_alta);
	svg.append("circle")
	    .attr("cx", villa_alta.x)
	    .attr("cy", villa_alta.y)
	    .attr("r", 10);
});



}

function loadJSON(path, callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }