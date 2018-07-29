// draw minimap
var plotWidth = 400,
    plotHeight = 300,
    plotWidth02 = 300,
    plotHeight02 = 300,
    plotMargin = {left: 80, top: 20, right: 240, bottom: 50},
    plotPadding = {left: 10, top: 15, right: 20, bottom: 10}
    diffYDomain = [4, -1];

var detailBox = d3.select(".details")
        .style("opacity", 0),
    detail = detailBox.append("div"),
    detailPlots = detailBox.append("div").attr("class", "mini-plots-container"),
    plot01 = detailPlots.append("svg")
        .attr("class", "mini-plot")
        .attr("width", (plotWidth + plotMargin.left + plotMargin.right + plotPadding.left + plotPadding.right))
        .attr("height", (plotHeight + plotMargin.top + plotMargin.bottom + plotPadding.top + plotPadding.bottom)),
    plot02 = detailPlots.append("svg")
        .attr("class", "mini-plot")
        .attr("width",  (plotWidth02 + plotMargin.left + plotMargin.left + plotPadding.left + plotPadding.right))
        .attr("height", (plotHeight02 + plotMargin.top + plotMargin.bottom + plotPadding.top + plotPadding.bottom));

// set the ranges
var tt = 600,
    x = d3.scaleTime()
        .range([0, plotWidth]),
    y = d3.scaleLinear()
        .range([0, plotHeight]),
    linePlotAxisX = d3.axisBottom(x).tickValues([parseTime(startYear), parseTime(currYear)])
    x02= d3.scaleLinear()
        .range([plotWidth02, 0]),
    y02 = d3.scaleBand()
        .range([0, plotHeight02])
        .domain(detailCols)
        .padding(0.5);

// define the line
var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); });

function drawline(d) {
    plot01.selectAll("*").remove();
    var t = d3.transition().duration(tt).ease(d3.easeQuadOut);
    var selected = d3.entries(d.score),
        ref = gpi.filter(function(g) {
            return g.GU_A3 == "AVG";
        }),
        linePlotAxisY = d3
            .axisLeft(y)
            .tickValues(defColDomain)
            .tickFormat(d3.format("d")),
        title = "GPI by Year";
    y.domain(defColDomain);
    selected.forEach(function(s) {
        s.date = parseTime(s.key);
        s.value = (s.value==null)?null:+s.value;
    });

    ref.forEach(function(r) {
        r.date = parseTime(r.Year);
        r.value = +r.Score;
    });

    if(diffToggle.checked) {
        y.domain(diffYDomain);
        linePlotAxisY
            .tickValues(diffYDomain)
            .tickFormat(d3.format("+.0%"));
        selected.forEach(function(s) {
            s.value = (s.value==null)?null:s.value/d.score[startYear] - 1;
        });
        year0 = (ref.filter(function(r) { return r.Year == startYear; })[0].value);
        ref.forEach(function(r) {
            r.value =(r.value/year0) - 1;
        });
        title = "% Change by Year";
    }

    var y2 = y(selected.filter(function(s) {
            return s.key == currYear;
        })[0].value) +
        (30 *
            ((ref.filter(function(r) {
                return r.Year == currYear
            })[0].value < selected.filter(function(s) {
                return s.key == currYear;
            })[0].value)?-1:1)
        );

    // plot title
    plot01.append("g")
        .attr("transform", "translate(" + (plotMargin.left) + ","+ plotMargin.top + ")")
        .attr("class", "title")
        .append("text")
        .text(title);
    // x axis
    plot01.append("g")
        .attr("transform", "translate(" + (plotMargin.left + plotPadding.left) + "," + (plotHeight + plotMargin.top + plotPadding.top + plotPadding.bottom) + ")")
        .attr("class", "axis x")
        .call(linePlotAxisX)
        .append("text")
        .attr("class", "label")
        .attr("x", plotWidth/2)
        .attr("y", "1.7em")
        .text("Year");
    // y axis
    plot01.append("g")
        .attr("transform", "translate("+ (plotMargin.left) + "," + (plotMargin.top + plotPadding.top) + ")")
        .attr("class", "axis y")
        .call(linePlotAxisY)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("x", -1*plotHeight/2)
        .attr("dx", "0.7em")
        .attr("y", "-2.5em")
        .style("text-anchor", "end")
        .text("GPI");
    // Add reference line and circles
    var refLine = plot01.append("g")
        .attr("width", plotWidth)
        .attr("height", plotHeight)
        .attr("transform", "translate(" + (plotMargin.left + plotPadding.left) + "," + (plotMargin.top + plotPadding.top) + ")")
        .attr("class", "mini-plot ref");
    refLine
        .append("path")
        .data([ref])
        .attr("class", "line")
        .attr("d", line);
    refLine
        .selectAll("circle")
        .data(ref)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.value); })
        .style("fill", function(d) { return color(d.value); })
        .append("title")
        .text(function(s) { return "Year: " + s.Year + "\nGPI: " + (diffToggle.checked?d3.format("+.2%")(s.value):d3.format(".2f")(s.value)); });

    // Add country line and cirlces
    var linePlot = plot01.append("g")
        .attr("width", plotWidth)
        .attr("height", plotHeight)
        .attr("transform", "translate(" + (plotMargin.left + plotPadding.left) + "," + (plotMargin.top + plotPadding.top) + ")")
        .attr("class", "mini-plot");
    linePlot
        .append("path")
        .data([selected.filter(function(d) { return d.value!=null; })])
        .attr("class", "line")
        .attr("d", line);
    linePlot
        .selectAll("circle")
        .data(selected.filter(function(d) { return d.value!=null; }))
        .enter().append("circle")
        .attr("class", "circle")
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.value); })
        .style("fill", function(d) { return color(d.value); })
        .append("title")
        .text(function(s) { return "Year: " + s.key + "\nGPI: " + (diffToggle.checked?d3.format("+.2%")(s.value):d3.format(".2f")(s.value)); });
    // Add legends
    var legendArea = plot01.append("g")
        .attr("class", "legend")
        .attr("width", 30)
        .attr("height", 40)
        .attr("transform", "translate(" +  (plotMargin.left + plotPadding.left) + "," + (plotMargin.top + plotPadding.top) + ")");
    var legendAreaRef = legendArea
        .append("g")
        .attr("class", "mini-plot ref")
        .attr("transform", "translate(0,15)");
    legendAreaRef
        .append("line")
        .attr("class", "line")
        .attr("x1", 0)
        .attr("x2", 30)
        .attr("y1", 0)
        .attr("y2", 0);
    legendAreaRef
        .append("text")
        .attr("class", "label")
        .attr("dx", 35)
        .text("Global Average");
    var legendAreaMain = legendArea
        .append("g")
        .attr("class", "mini-plot");
    legendAreaMain
        .append("line")
        .attr("class", "line")
        .attr("x1", 0)
        .attr("x2", 30)
        .attr("y1", 0)
        .attr("y2", 0);
    legendAreaMain
        .append("text")
        .attr("class", "label")
        .attr("dx", 35)
        .text(d.name);

    // add texts
    linePlot.append("line")
        .attr("class", "description")
        .datum(selected.filter(function(s){ return s.key == currYear; })[0])
        .attr("x1", function(s) { return x(s.date) + 7; })
        .attr("y1", function(s) { return y(s.value); })
        .attr("x2", function(s) { return x(s.date) + 7; })
        .attr("y2", function(s) { return y(s.value); })
        .transition(t)
        .attr("x2", plotWidth + 30)
        .attr("y2", y2);
    descText = linePlot.append("text")
        .datum(selected.filter(function(s){ return s.key == currYear; })[0])
        .attr("class", "description")
        .attr("x", plotWidth + 30)
        .attr("y", y2 - (regionToggle.checked?0:15))
        .attr("dy", "0.5em")
        .style("opacity", 0)
        .style("fill", function(s) { return color(s.value); })
        .text(function(s) {
            if(diffToggle.checked){
                return "Change in GPI: " + d3.format("+,.3f")(d.diff[currYear]);
            } else {
                return "GPI: " + d3.format(".2f")(s.value);
            }
        });

    // add ranking only for countries
    if(!regionToggle.checked) {
        descText.append("tspan")
            .attr("class", "rank")
            .attr("dy", "10")
            .attr("x", plotWidth + 30)
            .style("fill", function(s) { return color(s.value); })
            .text(function(s) {
                if(diffToggle.checked){
                    return d3.format(",d")(d.diff_rank[currYear]);
                } else {
                    return d3.format(",d")(d.rank[currYear]);
                }
            });
        descText.append("tspan")
            .text(function(s) {
                if(diffToggle.checked){
                    return getNumSuffix(d.diff_rank[currYear]);
                } else {
                    return getNumSuffix(d.rank[currYear]);
                }
            })
            .style("fill", function(s) { return color(s.value); });
        descText.append("tspan")
            .attr("dx", 5)
            .text(diffToggle.checked?"in making":"peaceful")
            .style("fill", function(s) { return color(s.value); });
        descText.append("tspan")
            .attr("dx", diffToggle.checked?"-4.5em":"-4.0em")
            .attr("dy", "1.1em")
            .text(diffToggle.checked?"progress":"nation")
            .style("fill", function(s) { return color(s.value); });
        descText.append("tspan")
            .attr("dx", diffToggle.checked?"-4.1em":"-3.0em")
            .attr("dy", "1.1em")
            .text(diffToggle.checked?"toward":"in 2018.")
            .style("fill", function(s) { return color(s.value); });
        if(diffToggle.checked) {
            descText.append("tspan")
                .attr("dx", diffToggle.checked?"-3.3em":"-3.0em")
                .attr("dy", "1.1em")
                .text("peace by 2018.")
                .style("fill", function(s) { return color(s.value); });
        }
    }
    descText
        .transition(t)
        .style("opacity", 1);
}

function drawbar(d) {
    plot02.selectAll("*").remove();
    var t = d3.transition().duration(tt).ease(d3.easeQuadOut);
    var selected = d3.entries(d.detail[yearSlider.value]),
        ref = d3.entries(gpi.filter(function(g) {
            return g.GU_A3 == "AVG" && g.Year == yearSlider.value;
        })[0]),
        barPlotAxisX = d3
            .axisBottom(x02)
            .tickValues(defColDomain)
            .tickFormat(d3.format("d"));

    x02.domain(defColDomain);

    // shift plot area to the right
    barPlot = plot02.append("g")
        .attr("class", "mini-plot")
        .attr("transform", "translate(" + (plotMargin.left*2 + plotPadding.left) + "," + (plotMargin.top + plotPadding.top) + ")");

    if(diffToggle.checked) {
        x02.domain(altColDomain);
        barPlotAxisX
            .tickValues(altColDomain)
            .tickFormat(d3.format("+.0%"));
        selected.forEach(function(s) {
            s.value = (s.value==null || d.detail[startYear][s.key]==null)?null:(s.value/d.detail[startYear][s.key] - 1);
        });
        year0 = (gpi.filter(function(g) {
            return g.GU_A3 == "AVG" && g.Year == startYear;
        })[0])
        ref.forEach(function(r) {
            r.value =(r.value/year0[r.key]) - 1;
        });
        barPlot.append("g")
            .attr("class", "axis y")
            .attr("transform", "translate(" + plotWidth02*0.5 + ",0)")
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", plotHeight02);
    }

    // add title
    plot02.append("g")
        .attr("transform", "translate(" + (plotMargin.left*2) + ","+ plotMargin.top + ")")
        .attr("class", "title")
        .append("text")
        .text("Details for " + yearSlider.value);
    barPlot.append("g")
        .attr("class", "mini-plot ref")
        .selectAll(".bar")
        .data(ref.filter(function(r) {
            return detailCols.indexOf(r.key) > -1;
        })).enter().append("polygon")
        .attr("class", "bar")
        .attr("points", function(r) {
            y0 = y02(r.key);
            y1 = y02(r.key) + y02.bandwidth();
            x0 = diffToggle.checked?(plotWidth02*0.5):0;
            x1 = x02(r.value);
            return x0 + "," + y0 + " " +
                x1 + "," + y0 + " " +
                x1 + "," + y1 + " " +
                x0 + "," + y1;
        });
    // add axis
    plot02.append("g")
        .attr("class", "axis y")
        .attr("transform", "translate(" + (plotMargin.left*2) + "," + (plotMargin.top + plotPadding.top) + " )")
        .call(d3.axisLeft(y02));
    plot02.append("g")
        .attr("class", "axis y hidden")
        .attr("transform", "translate(0," + (plotMargin.top + plotPadding.top) + " )")
        .selectAll("rect")
        .data(selected.filter(function (s) {
            return detailCols.indexOf(s.key) > -1;
        })).enter()
        .append("rect")
        .attr("y", function(c) { return y02(c.key); })
        .attr("width", plotMargin.left*2)
        .attr("height", y02.bandwidth())
        // .style("stroke", "")
        .on("mouseover", addsubline)
        .on("mouseout", removesubline)
        .raise();
    plot02.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(" + (plotMargin.left*2 + plotPadding.left) + "," + (plotMargin.top + plotPadding.top + plotHeight02 + plotPadding.bottom) + " )")
        .call(barPlotAxisX);

    var peaks = barPlot.append("g")
        .attr("width", plotWidth)
        .attr("height", plotHeight)
        .attr("class", "mini-plot")
        .attr("transform", "translate(0," + y02.bandwidth()*0.5 + ")");
    var lines = peaks
            .selectAll(".line")
            .data(selected.filter(function (s) {
                return detailCols.indexOf(s.key) > -1;
            })).enter().append("line")
            .attr("class", "line")
            .style("stroke", function(s) { return color(s.value); })
            .attr("x1", diffToggle.checked?(plotWidth02*0.5):0)
            .attr("x2", diffToggle.checked?(plotWidth02*0.5):0)
            .attr("y1", function(s) { return y02(s.key); })
            .attr("y2", function(s) { return y02(s.key); })
            .on("mouseover", addsubline)
            .on("mouseout", removesubline);
    lines.transition(t)
        .attr("x2", function(s) { return x02(s.value); });
    lines.append("title")
        .text(function(s) { return diffToggle.checked?d3.format("+.2%")(s.value):d3.format(".2f")(s.value); });

    var circles = peaks
            .selectAll("circle")
            .data(selected.filter(function (d) {
                return detailCols.indexOf(d.key) > -1 && d.value <= x02.domain()[0] && d.value >= x02.domain()[1];
            })).enter()
            .append("circle")
            .attr("class", "circle")
            .style("fill", function(s) { return color(s.value); })
            .attr("cy", function(s) { return y02(s.key); })
            .attr("cx", diffToggle.checked?(plotWidth02*0.5):0)
            .on("mouseover", addsubline)
            .on("mouseout", removesubline);;
    circles.append("title")
        .text(function(s) { return diffToggle.checked?d3.format("+.2%")(s.value):d3.format(".2f")(s.value); });
    circles.transition(t)
        .attr("cx", function(s) { return x02(s.value); });

    // add arrows
    plot02.append("defs")
        .selectAll("marker")
        .data(selected.filter(function (d) {
            return detailCols.indexOf(d.key) > -1
            && d.value > x02.domain()[0] && d.value > x02.domain()[1];
        })).enter()
        .append("svg:marker")
        .attr("id", function(d,i) {return "arrow" + i;})
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5)
        .attr("refY", 0)
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class","arrowHead")
        .style("fill", function(s) { return color(s.value); })
        .on("mouseover", addsubline)
        .on("mouseout", removesubline);
    var arrows = peaks
            .selectAll(".arrow")
            .data(selected.filter(function (d) {
                return detailCols.indexOf(d.key) > -1
                && d.value > x02.domain()[0] && d.value > x02.domain()[1];
            })).enter()
            .append("line")
            .attr("class", "arrow")
            .style("stroke", function(s) { return color(s.value); })
            .attr("marker-end", function(d,i) {return "url(#arrow" + i + ")"})
            .attr("x1", diffToggle.checked?(plotWidth02*0.5):0)
            .attr("x2", diffToggle.checked?(plotWidth02*0.5):0)
            .attr("y1", function(s) { return y02(s.key); })
            .attr("y2", function(s) { return y02(s.key); })
            .on("mouseover", addsubline)
            .on("mouseout", removesubline);
    arrows.append("title")
        .text(function(s) { return diffToggle.checked?d3.format("+.2%")(s.value):d3.format(".2f")(s.value); });
    arrows.transition(t)
        .attr("x1", function(s) { return x02(Math.sign(s.value)); })
        .attr("x2", function(s) { return x02(Math.sign(s.value)); });

    // Add legends
    var legendArea = plot02.append("g")
        .attr("class", "legend diff")
        .attr("width", 30)
        .attr("height", 40)
        .attr("transform", "translate(" +  (plotMargin.left*2 + plotWidth02 - 120) + "," + (plotPadding.top) + ")");
    var legendAreaRef = legendArea
        .append("g")
        .attr("class", "mini-plot ref")
        .attr("transform", "translate(0,15)");
    legendAreaRef
        .append("rect")
        .attr("class", "bar")
        .attr("x", 0)
        .attr("y", -0.7*y02.bandwidth())
        .attr("width", 30)
        .attr("height", y02.bandwidth());
    legendAreaRef
        .append("text")
        .attr("class", "label")
        .attr("dx", 35)
        .text("Global Average");
    var legendAreaMain = legendArea
        .append("g")
        .attr("class", "mini-plot");
    legendAreaMain
        .append("line")
        .attr("class", "line")
        .attr("x1", 0)
        .attr("x2", 30)
        .attr("y1", 0)
        .attr("y2", 0);
    legendAreaMain
        .append("circle")
        // .attr("class", "line")
        .attr("cx", 29)
        .attr("cy", 0)
        .attr("r", 3);
    legendAreaMain
        .append("text")
        .attr("class", "label")
        .attr("dx", 35)
        .text(d.name);

    function addsubline(f, i) {
        plot01.select(".ref").style("opacity", 0);
        plot01.select(".legend").select(".ref").select(".label").text(f.key);
        var id = "sub-line-" + i;
        var sub =  d3.entries(d.detail);
        sub.forEach(function(s) {
            s.date = parseTime(s.key);
            s.value = (s.value[f.key]==null)?null:+s.value[f.key];
        });

        if(diffToggle.checked) {
            year0 = (sub.filter(function(s) { return s.key == startYear; })[0].value);
            sub.forEach(function(s) {
                s.value = (s.value==null || year0==0)?null:s.value/year0 - 1;
            });
        }
        // Add country line and cirlces
        var linePlot = plot01.append("g")
            .attr("width", plotWidth)
            .attr("height", plotHeight)
            .attr("transform", "translate(" + (plotMargin.left + plotPadding.left) + "," + (plotMargin.top + plotPadding.top) + ")")
            .attr("class", "mini-plot sub-line")
            .attr("id", id);
        linePlot
            .append("path")
            .data([sub.filter(function(s) { return s.value!=null; })])
            .attr("class", "line")
            .attr("d", line);
        linePlot
            .selectAll("circle")
            .data(sub.filter(function(s) { return s.value!=null; }))
            .enter().append("circle")
            .attr("class", "circle")
            .attr("cx", function(s) { return x(s.date); })
            .attr("cy", function(s) { return y(s.value); })
            .style("fill", function(d) { return color(d.value); })
            .append("title")
            .text(function(s) { return "Year: " + s.key + "\nGPI: " + (diffToggle.checked?d3.format("+.2%")(s.value):d3.format(".2f")(s.value)); });
        linePlot.lower();

        lines.style("opacity", function(l) { return (l.key == f.key)?1:0.3; });
        circles.style("opacity", function(c) { return (c.key == f.key)?1:0.3; });
        arrows.style("opacity", function(a) { return (a.key == f.key)?1:0.3; });
    }

    function removesubline(f, i) {
        d3.select("#"+"sub-line-" + i).remove();
        plot01.selectAll(".ref").style("opacity", 1);
        plot01.select(".legend").select(".ref").select(".label").text("Global Average");
        lines.style("opacity", 1);
        circles.style("opacity", 1);
        arrows.style("opacity", 1);
    }
}
