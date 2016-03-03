window.onload = function() {
var svg = d3.select("#main");
console.log(svg);

svg.append("circle")
    .attr("cx", 10)
    .attr("cy", 10)
    .attr("r", 2.5);
}