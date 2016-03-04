var gapi = "AIzaSyDGr4IEBrD3_0E2xJgh6odNqQL3hlj70yw";

window.onload = function() {
var svg = d3.select("#main");

var colorScale = d3.scale.ordinal();
colorScale.range = (['beige','red']);
colorScale.domain = (['Spanish','Nahvatl','Nexitzo Zapotec','Cajonos Zapotec','Bijanos Zapotec','Mixe','Chihantec']);

var languageToColor = function(l) {
	if (l == 'Spanish') {
		return '#574F28';
	}
	if (l == 'Nahvatl') {
		return '#66051D';
	}
	if (l == 'Nexitzo Zapotec') {
		return '#6A8000';
	}
	if (l == 'Cajonos Zapotec') {
		return '#256917';
	}
	if (l == 'Bijanos Zapotec') {
		return '#0C5F36';
	}
	if (l == 'Mixe') {
		return '#7A2F2A';
	}
	if (l == 'Chihantec') {
		return '#6D2612';
	}
}


var xsz = 800;
var ysz = 550;
var minlat = 0;
var maxlat = 0;
var minlon = 0;
var maxlon = 0;
var minelev = 0;
var maxelev = 0;

var places = [];
var villa_alta;

var grantors = [];
var money = [];
var poplang = [];

var buildElevation = function(p) {
	//var url = "https://maps.googleapis.com/maps/api/elevation/json?locations="+p.lat+","+p.lon+"&key="+gapi;
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
	p.alpha = (p.elev-minelev)/(maxelev-minelev)*0.05+0.95;
}

var buildGrantors = function() {
	grantors.forEach(function(g){
		places.forEach(function(p){
			if (g.place_id == p.place_id) {
				g.place = p;
				p.grantors.push(g);
			}
		});

		/*if (g.place) {
			g.svg = svg.append("text")
		    .attr("x", g.place.x)
		    .attr("y", g.place.y)
		    .attr("dy", "-.35em")
		    .text(g.name);
		}*/
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
		if (!set || p.elev < minelev) minelev = p.elev;
		if (!set || p.elev > maxelev) maxelev = p.elev;
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
loadJSON("./data/population_language.json",function(data){
	data = JSON.parse(data);
	data.forEach(function(plj){
		poplang.push(plj);
	});

loadJSON("./data/money.json",function(data){
	data = JSON.parse(data);
	data.forEach(function(mj){
		money.push(mj);
	});
loadJSON("./data/places.json",function(data){
	data = JSON.parse(data);
	data.forEach(function(pj){
		pj.lat = parseFloat(pj.lat);
		pj.lon = parseFloat(pj.lon);
		money.forEach(function(m){
			if (pj.place_id == m.place_id) {
				if (m.money) {
			var mparts = m.money.split(".");
			var mstr = mparts[0] + " pesos";
			if (mparts.length == 2) mstr += " y " + mparts[1] + " reales"
			 pj.money = mstr;
			 pj.money_val = m.money;
			}
			}
		});

		poplang.forEach(function(pl){
			if (pj.place_id == pl.place_id) {
				pj.language = pl.languages;
				pj.population = parseFloat(pl.population);
			}
		});
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
//

loadJSON("./data/villa_alta.json",function(data){
	data = JSON.parse(data);
	data.lat = parseFloat(data.lat);
	data.lon = parseFloat(data.lon);
	data.language = "Spanish";
	villa_alta = data;
	normalize(villa_alta);
	
});
});
});

var setupCollision = function() {

var all_places = places;
all_places.unshift(villa_alta);
console.log(all_places);

var nodes = all_places.map(function(p) { 
	var r = 0;
	if (p.language == "Spanish") r = 100;
	if (p.population) r = p.population*0.05;
	return {radius: r, place: p, x: p.x, y: p.y}; }),
    root = nodes[0],
    color = d3.scale.category10();

var buildTooltip = function(p) {
	var tstr = p.name_pueblo+"\n";
	if (p.money) {
		tstr += "\n"+p.money+"\n";
	}
	if (p.language) {
		tstr += "\n"+p.language+"\n";
	}
	if (p.grantors) {
	p.grantors.forEach(function(g){
		tstr += "\n"+g.name + ", " + g.title;
	});
    }
    return tstr;
}

svg.selectAll("circle")
    .data(nodes.slice(1))
  	.enter().append("svg:circle")
    .attr("r", function(d) { 
    	var r = 0;
		if (d.place.population) r = Math.max(0.0,d.place.population*0.05-4);
    	return r })
    .style("fill-opacity", function(d) { return d.place.alpha;})
    .style("fill", "black")
    .attr("cx", function(d) { return d.place.x})
	.attr("cy", function(d) { return d.place.y})
    .attr("stroke-width", 5)
    .attr("stroke", function(d) { return languageToColor(d.place.language); })
    .append("svg:title")
    /*.text(function(d) { 
    	return buildTooltip(d.place); });*/
	
	$('svg circle').tipsy({ 
        gravity: 'nw', 
        title: function() {
          var d = this.__data__;
          return buildTooltip(d.place); 
        }});

root.radius = 30;
root.fixed = true;

var CalculateStarPoints = function(centerX, centerY, arms, outerRadius, innerRadius)
{
   var results = "";

   var angle = Math.PI / arms;

   for (var i = 0; i < 2 * arms; i++)
   {
      // Use outer or inner radius depending on what iteration we are in.
      var r = (i & 1) == 0 ? outerRadius : innerRadius;
      
      var currX = centerX + Math.cos(i * angle) * r;
      var currY = centerY + Math.sin(i * angle) * r;

      // Our first time we simply append the coordinates, subsequet times
      // we append a ", " to distinguish each coordinate pair.
      if (i == 0)
      {
         results = currX + "," + currY;
      }
      else
      {
         results += ", " + currX + "," + currY;
      }
   }

   return results;
}
villa_alta.svg = svg.append("svg:polygon")
  .attr("id", "star_1")
  .attr("visibility", "visible")
  .style("fill","#960018")
  .attr("points", CalculateStarPoints(villa_alta.x, villa_alta.y, 5, 30, 15))
  .attr("id","villa_alta")
  .append("svg:title")
    /*.text(function() { 
    	
    	return buildTooltip(villa_alta); });*/

$('#villa_alta').tipsy({ 
        gravity: 'nw', 
        title: function() {
          var d = this.__data__;
          return buildTooltip(villa_alta); 
        }});

var force = d3.layout.force()
    .gravity(0.03)
    .charge(function(d, i) { return i ? 0 : 0.0; })
    .nodes(nodes)
    .size([xsz, ysz]);

force.on("tick", function(e) {
  var q = d3.geom.quadtree(nodes),
      i = 0,
      n = nodes.length;

  while (++i < n) q.visit(collide(nodes[i]));

  svg.selectAll("circle")
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});

var started = false;
var xos = (window.innerWidth-xsz)*0.5;
if (xos < 0) xos = 0;

document.getElementById("start_button").onclick = function(){if (!started) {
  		console.log("starting");
  		force.start();
  		started = true;
  	}};


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