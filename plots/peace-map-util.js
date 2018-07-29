// get suffix for numbers
function getNumSuffix(n) {
    digits = n.toString().split('');
    last = digits.pop();
    if (digits.pop() == 1) {
        return "th";
    }
    switch(last) {
        case "1":
            return "st";
        case "2":
            return "nd";
        case "3":
            return "rd";
        default:
            return "th";
    }
}

// parse the date / time
var parseTime = d3.timeParse("%Y");

// resize
function resize() {
    currDim = d3.select(".map-container").node().getBoundingClientRect();
    projection
        .scale(mapScale * d3.max([currDim.width, 400]))
        .translate([currDim.width*mapOffset.x, currDim.height*mapOffset.y]);
    path.projection(projection);
    mapC.attr("d", path);
    mapR.attr("d", path);
    drawlegend();
}

// buttons
function changeYear(year) {
    document.getElementById('year-value').value=year;
    yearSlider.value = year;
    toggleDisplay();
}

function nextYear() {
    var year = +yearSlider.value;
    changeYear(year + 1);
}

function prevYear() {
    var year = +yearSlider.value;
    changeYear(year - 1);
}

function toggleDisplay() {
    diffToggle.disabled = true;
    regionToggle.disabled = true;
    prev.disabled = true;
    next.disabled = true;
    // setTimeout(redraw, 200);
    redraw();
}
