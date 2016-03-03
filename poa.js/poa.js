var gapi = "AIzaSyDGr4IEBrD3_0E2xJgh6odNqQL3hlj70yw";

window.onload = function() {
var svg = d3.select("#main");

var colorScale = d3.scale.ordinal();
colorScale.range = (['beige','red']);
colorScale.domain = (['Spanish','Nahvatl','Nexitzo Zapotec','Cajonos Zapotec','Bijanos Zapotec','Mixe','Chihantec']);


var xsz = 600;
var ysz = 600;
var minlat = 0;
var maxlat = 0;
var minlon = 0;
var maxlon = 0;

var places = [];
var villa_alta;

var grantors = [];

var buildElevation = function(p) {
	var url = "https://maps.googleapis.com/maps/api/elevation/json?locations="+p.lat+","+p.lon+"&key="+gapi;
	//console.log(p.name_pueblo)
	//console.log(url);
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

var buildGrantors = function() {
	grantors.forEach(function(g){
		places.forEach(function(p){
			if (g.place_id == p.place_id) {
				g.place = p;
				p.grantors.push(g);
			}
		});

		if (g.place) {
			svg.append("text")
		    .attr("x", g.place.x)
		    .attr("y", g.place.y)
		    .attr("dy", "-.35em")
		    .text(g.name);
		}
	});
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
		p.grantors = [];
	});
	// build
	places.forEach(function(p){
		//console.log(p);
		/*p.svg = svg.append("circle")
	    .attr("cx", p.x)
	    .attr("cy", p.y)
	    //.attr("fill", colorScale(pj.language))
	    .attr("r", 20);*/

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

	loadJSON("./data/grantors.json",function(data){
		data = JSON.parse(data);
		data.forEach(function(gj){
			grantors.push(gj);
		});
		buildGrantors();

		setupCollision();
	});
});

loadJSON("./data/villa_alta.json",function(data){
	data = JSON.parse(data);
	data.lat = parseFloat(data.lat);
	data.lon = parseFloat(data.lon);
	villa_alta = data;
	normalize(villa_alta);
	/*villa_alta.svg = svg.append("circle")
	    .attr("cx", villa_alta.x)
	    .attr("cy", villa_alta.y)
	    .attr("r", 10);*/
});

var setupCollision = function() {

/*var nodes = places,
    root = villa_alta,
    color = d3.scale.category10();*/

var all_places = places;
all_places.unshift(villa_alta);

var nodes = all_places.map(function(p) { return {radius: 12, place: p, x: p.x, y: p.y}; }),
    root = nodes[0],
    color = d3.scale.category10();

console.log(nodes[0]);

svg.selectAll("circle")
    .data(nodes.slice(1))
  .enter().append("circle")
    .attr("r", function(d) { return d.radius; })
    .style("fill", function(d, i) { return color(i % 3); })
    .append("svg:title")
    .text(function(d) { return d.place.name_pueblo; });

root.radius = 0;
root.fixed = true;

var force = d3.layout.force()
    .gravity(0.05)
    .charge(function(d, i) { return i ? 0 : 0.0; })
    .nodes(nodes)
    .size([xsz, ysz]);

force.start();

force.on("tick", function(e) {
  var q = d3.geom.quadtree(nodes),
      i = 0,
      n = nodes.length;

  while (++i < n) q.visit(collide(nodes[i]));

  svg.selectAll("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});

/*svg.on("mousemove", function() {
  var p1 = d3.mouse(this);
  root.px = p1[0];
  root.py = p1[1];
  force.resume();
});*/

function collide(node) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

};

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