window.onload = function() {
var svg = d3.select("#main");

var colorScale = d3.scale.ordinal();
colorScale.range = (['beige','red']);
colorScale.domain = (['Spanish','Nahvatl','Nexitzo Zapotec','Cajonos Zapotec','Bijanos Zapotec','Mixe','Chihantec']);

var buildPlace = function(pj) {
	console.log(pj);
	var x = parseFloat(pj.lat);
	var y = parseFloat(pj.lon);
	y += 200.0;
	svg.append("circle")
    .attr("cx", x)
    .attr("cy", y)
    //.attr("fill", colorScale(pj.language))
    .attr("r", 2.5);
};


loadJSON("./data/places.json",function(data){
	data = JSON.parse(data);
	data.forEach(function(pj){
		buildPlace(pj);
	});
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