window.onload = function() {
var svg = d3.select("#main");
var xsz = 600;
var ysz = 400;

var places = [];

var buildPlaces = function() {
	// normalize
	var minlat = 0;
	var maxlat = 0;
	var minlon = 0;
	var maxlon = 0;
	var set = false;
	places.forEach(function(p){
		if (!set || p.lat < minlat) minlat = p.lat;
		if (!set || p.lat > maxlat) maxlat = p.lat;
		if (!set || p.lon < minlon) minlon = p.lon;
		if (!set || p.lon > maxlon) maxlon = p.lon;
		set = true;
	});
	places.forEach(function(p){
		p.x = (p.lon-minlon)/(maxlon-minlon)*xsz;
		p.y = (p.lat-minlat)/(maxlat-minlat)*ysz;
	});
	// build
	places.forEach(function(p){
		console.log(p);
		svg.append("circle")
	    .attr("cx", p.x)
	    .attr("cy", p.y)
	    .attr("r", 2.5);
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