 // "Source: Institute for Economics and Peace. Learn more at economicsandpeace.org and visionofhumanity.org".
var next = document.getElementById("next-year"),
    prev = document.getElementById("prev-year")
    diffToggle = document.getElementById("diff-toggle"),
    regionToggle = document.getElementById("region-toggle"),
    yearSlider = document.getElementById("year-slider");

var widthFull = 1600,
    aspectRatio = 0.45,
    mapOffset = {x: 0.475, y: 0.57},
    mapScale = 0.185,
    legendDim = {height: 10, width: 150, x: 0.05, y: 0.8},
    opacityAlt = 0.7,
    defColDomain = [5,0],
    altColDomain = [1.5,-1.5],
    color = d3.scaleQuantile()
        .domain(defColDomain)
        .range([
            d3.rgb("rgb(100, 200, 100)"),
            d3.rgb("rgb(110, 200, 110)"),
            d3.rgb("rgb(120, 200, 120)"),
            d3.rgb("rgb(130, 200, 130)"),
            d3.rgb("rgb(140, 200, 140)"),
            d3.rgb("rgb(150, 200, 150)"),
            d3.rgb("rgb(160, 200, 160)"),
            d3.rgb("rgb(170, 200, 170)"),
            d3.rgb("rgb(180, 200, 180)"),
            d3.rgb("rgb(190, 200, 190)"),
            d3.rgb("rgb(200, 200, 200)"),
            d3.rgb("rgb(200, 190, 190)"),
            d3.rgb("rgb(200, 180, 180)"),
            d3.rgb("rgb(200, 170, 170)"),
            d3.rgb("rgb(200, 160, 160)"),
            d3.rgb("rgb(200, 150, 150)"),
            d3.rgb("rgb(200, 140, 140)"),
            d3.rgb("rgb(200, 130, 130)"),
            d3.rgb("rgb(200, 120, 120)"),
            d3.rgb("rgb(200, 110, 110)"),
            d3.rgb("rgb(200, 100, 100)")
        ]),
    colorAlt = '#f0f0f0',
    startYear = 2008
    currYear = 2018;

var detailCols = [
        'Access to Small Arms',
        'Armed Services Personnel Rate',
        'Deaths from External Conflict',
        'Deaths from Internal Conflict',
        'External Conflicts Fought',
        'External Peace',
        'Homicide Rate',
        'Incarceration Rate',
        'Intensity of Internal Conflict',
        'Internal Conflicts Fought',
        'Internal Peace',
        'Militarisation',
        'Military Expenditure (%GDP)',
        'Neighbouring Countries Relations',
        'Nuclear and Heavy Weapons',
        'Ongoing Conflict',
        'Overall Score',
        'Perceptions of Criminality',
        'Police Rate',
        'Political Instability',
        'Political Terror Scale',
        'Refugees and IDPs',
        'Safety & Security',
        'Terrorism Impact',
        'UN Peacekeeping Funding',
        'Violent Crime',
        'Violent Demonstrations',
        'Weapons Exports',
        'Weapons Imports'
    ];

var regions = [
    {properties: {SUBREGION: 'Eastern Africa'}},
    {properties: {SUBREGION: 'Western Asia'}},
    {properties: {SUBREGION: 'South-Eastern Asia'}},
    {properties: {SUBREGION: 'South America'}},
    {properties: {SUBREGION: 'Southern Europe'}},
    {properties: {SUBREGION: 'Melanesia'}},
    {properties: {SUBREGION: 'Central Asia'}},
    {properties: {SUBREGION: 'Micronesia'}},
    {properties: {SUBREGION: 'Caribbean'}},
    {properties: {SUBREGION: 'Polynesia'}},
    {properties: {SUBREGION: 'Northern America'}},
    {properties: {SUBREGION: 'Western Africa'}},
    {properties: {SUBREGION: 'Northern Europe'}},
    {properties: {SUBREGION: 'Eastern Europe'}},
    {properties: {SUBREGION: 'Northern Africa'}},
    {properties: {SUBREGION: 'Eastern Asia'}},
    {properties: {SUBREGION: 'Western Europe'}},
    {properties: {SUBREGION: 'Southern Africa'}},
    {properties: {SUBREGION: 'Southern Asia'}},
    {properties: {SUBREGION: 'Middle Africa'}},
    {properties: {SUBREGION: 'Central America'}},
    {properties: {SUBREGION: 'Australia and New Zealand'}}
];

var svg = d3.select(".map-container")
        .append("svg")
        .attr("width", widthFull)
        .attr("height", aspectRatio*widthFull)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1600 720")
        .classed("svg-content-responsive", true),
    ocean = svg.append("rect")
        .attr("width", widthFull)
        .attr("height", aspectRatio*widthFull)
        .attr("class", "ocean")
        .on("click", hideDetail),
    map = svg.append("g"),
    currDim = d3.select(".map-container").node().getBoundingClientRect(),
    projection = d3
        .geoNaturalEarth1()
        .scale(mapScale * d3.max([currDim.width, 400]))
        .translate([currDim.width*mapOffset.x, currDim.height*mapOffset.y]),
    path = d3.geoPath()
        .projection(projection);

// enable zooming
var zoom = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0,0],[widthFull, widthFull*aspectRatio]]);
function zoomed() {
  map.attr("transform", d3.event.transform);
}
svg.call(zoom.on("zoom", zoomed));


// add legend
var lgnd = svg.append("g")
        .attr("class", "legend"),
    lgndScale = d3.scaleLinear()
        .domain(defColDomain)
        .range([0, legendDim.height]),
    lgndAxis = d3.axisRight()
        .scale(lgndScale)
        .tickValues([]),
    gradient = lgnd.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");
d3.range(5).forEach(function(i) {
    gradient.append('stop')
        .attr('offset', (i*20) + "%")
        .attr('stop-color', color(i))
        .attr('stop-opacity', opacityAlt);
});

function drawlegend() {
    lgnd.select("g").remove();

    lgnd.attr('transform', 'translate('
        + (currDim.width*legendDim.x) + ','
        + (currDim.height*legendDim.y) + ')'
    );

    var inner = lgnd.append("g");

    inner.append('rect')
        .attr('width', legendDim.width)
        .attr('height', legendDim.height)
        .style('fill', 'url(#gradient)');

    lgndTick = inner.append("g")
        .attr("class", "legend axis")
        .attr("transform", "translate(" + legendDim.width + ", 0)")
        .call(lgndAxis);

    inner.append("text")
        .attr("x", legendDim.width*0.5)
        .attr("y", "-1.5em")
        .attr("text-anchor", "middle")
        .text("GPI");

    inner.append("text")
        .attr("class", "label")
        .attr("x", legendDim.width)
        .attr("y", "-.5em")
        .attr("text-anchor", "end")
        .style("fill", color(5))
        .text("High");

    inner.append("text")
        .attr("class", "label")
        .attr("x", 0)
        .attr("y", "-.5em")

        .style("fill", color(0))
        .text("Low");

    inner.append("text")
        .attr("class", "subtext")
        .attr("y", legendDim.height + 5)
        .attr("alignment-baseline", "hanging")
        .text("Lower GPI indicates higher level of peace.");
}

drawlegend();

var gpi,
    diff
    handleMouseOver = true;

function hideDetail() {
    detailBox.lower();
    // color map
    mapR.each(function(d) {
        d.active = true;
    });
    mapC.each(function(d) {
        d.active = true;
    });
    fillmap();

    handleMouseOver = true;
    detailBox.style("opacity", 0);
    plot01.selectAll("*").remove();
    plot02.selectAll("*").remove();
}

function fillmap() {
    if(regionToggle.checked) {
        mapR
            .style("fill", function(d) {
                score = diffToggle.checked?
                    (d.score[startYear]==null)?null:d.score[yearSlider.value] - d.score[startYear]:
                    d.score[yearSlider.value];
                return (score!=null && d.active)?color(score):colorAlt;
            })
            .style("stroke", "#ffffff");
    } else {
        mapC
            .style("fill", function(d) {
                score = diffToggle.checked?
                    (d.score[startYear]==null)?null:d.score[yearSlider.value] - d.score[startYear]:
                    d.score[yearSlider.value];
                return (score!=null && d.active)?color(score):colorAlt;
            })
            .style("stroke", "#ffffff");
    }
}

function redraw() {
    hideDetail();
    if(diffToggle.checked) {
        color.domain(altColDomain);
    } else {
        color.domain(defColDomain);
    }

    // color map
    mapR.each(function(d) {
        d.active = true;
    });
    mapC.each(function(d) {
        d.active = true;
    });
    fillmap();

    // reorder maps
    if(regionToggle.checked) {
        mapC.style("opacity", 0);
        d3.select(".regions").raise();
        mapR.style("opacity", 1);
    } else {
        mapR.style("opacity", 0);
        d3.select(".countries").raise();
        mapC.style("opacity", 1);
    }

    // re-enable widgets
    diffToggle.disabled = false;
    regionToggle.disabled = false;
    if(yearSlider.value == startYear) {
        next.disabled = false;
    } else if(yearSlider.value == currYear) {
        prev.disabled = false;
    } else {
        prev.disabled = false;
        next.disabled = false;
    }
}

d3.json('plots/data/countries_50m.topojson').then(function(data){

    countries = topojson.feature(data, data.objects.countries).features.filter(
        function(g) { return (g.properties.GU_A3 == "GRL" || g.properties.GU_A3 == "ATA")?false:true;}
    );
    boundaries = topojson.mesh(
                data, data.objects.countries, function(a, b) { return a !== b; }
    );

    regions.forEach(function(d){
        // console.log(d.properties.SUBREGION);
        d.type = "Feature";
        d.geometry = topojson.merge(
            data, data.objects.countries.geometries.filter(function(g){
                return (g.properties.GU_A3 == "GRL")
                    ?false:g.properties.SUBREGION == d.properties.SUBREGION;
        }));
    })

    d3.csv('plots/data/gpi.csv').then(function(_gpi){
        gpi = _gpi;
        gpi.forEach(function(d){
            var first = gpi.filter(function(g) {
                    return g.GU_A3 == d.GU_A3 && g.Year == startYear;
                })[0].Score;
            d.diff = (first==0)?null:(d.Score - first);
        });
        var sorted = {};
        for(i = startYear; i <= currYear; i ++) {
            sorted[i] = gpi.filter(function(g) {
                return g.Year == i;
            }).map(function(g) { return (g.diff==null)?null:g.diff; });
            sorted[i].sort(function(a, b){ return a - b; });
        }
        gpi.forEach(function(d){
            d.diff_rank = sorted[d.Year].indexOf(d.diff) + 1;
        });
        x.domain(d3.extent(gpi, function(d) { return parseTime(d.Year); }));

        mapR = map
            .append("g")
            .attr("id", "regions")
            .attr("class", "map regions")
            .selectAll(".region")
            .data(regions, function(d) {
                d.active = true;
                d.name = d.properties.SUBREGION;
                d.score = {};
                d.diff = {};
                d.detail = {};
                for(year = startYear; year <= currYear; year++){
                    var selected = gpi.filter(function(g){
                        return (g.SUBREGION == d.properties.SUBREGION) && (g.Year == year);
                    })
                    d.score[year] = d3.mean(selected, function(s) {return (s.Score==null)?null:s.Score; });
                    d.diff[year] = d.score[year] - d.score[startYear];
                    d.detail[year] = {};
                    detailCols.forEach(function(c) {
                        d.detail[year][c] = d3.mean(selected, function(s) {return (s[c]==null)?null:s[c]; });
                    });
                }
            })
            .enter()
            .append("path")
            .attr("class", "region")
            .style("fill", colorAlt)
            .attr("d", path)
            .style("opacity", 0)
            .on("mouseover", mouseoverHandler)
            .on("mouseout", mouseoutHandler)
            .on("click", clickHandler);
        mapR
            .append("title")
            .text(function(d) { return d.name; });

        mapC = map
            .append("g")
            .attr("id", "countries")
            .attr("class", "map countries")
            .selectAll(".country")
            .data(countries, function(d) {
                var selected = gpi.filter(function(g) {
                        return (g.GU_A3 == d.properties.GU_A3)
                    });
                d.active = true;
                d.name = d.properties.NAME_LONG;
                d.score = {};
                d.rank = {};
                d.diff = {};
                d.diff_rank = {};
                d.detail = {};
                selected.forEach(function(s) {
                    d.score[s.Year] = (s.Score==0)?null:s.Score;
                    d.rank[s.Year] = (s.Rank==0)?null:s.Rank;
                    d.diff[s.Year] = (s.diff==null)?null:s.diff;
                    d.diff_rank[s.Year] = (s.diff_rank==null)?null:s.diff_rank;
                    d.detail[s.Year] = {};
                    detailCols.forEach(function(c) {
                        d.detail[s.Year][c] = (s[c]==null)?null:s[c];
                    });
                });
            })
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", colorAlt)
            .on("mouseover", mouseoverHandler)
            .on("mouseout", mouseoutHandler)
            .on("click", clickHandler);
        mapC
            .append("title")
            .text(function(d) { return d.name; });

        function clickHandler(d) {
            highlight(d3.select(this));
            handleMouseOver = false;
            detailBox.style("opacity", 1);
            detailBox.raise();
            detail
                .html("<h1>" + d.name + "</h1><p>Hover over details to see trend for each category.<br/>Lower GPI indicates higher level of peace.</p>")
            drawline(d);
            drawbar(d);
        }

        function mouseoverHandler() {
            if (handleMouseOver){
                highlight(d3.select(this));
            }
        }

        function mouseoutHandler() {
            if (handleMouseOver){
                mapR.each(function(d) {
                    d.active = true;
                });
                mapC.each(function(d) {
                    d.active = true;
                });
                fillmap();
            }
        }

        function highlight(selected) {
            mapR.each(function(d) {
                d.active = false;
            });
            mapC.each(function(d) {
                d.active = false;
            });
            selected.each(function(d) {
                d.active = true;
            });
            fillmap();
        }

        fillmap();

        window.addEventListener("resize", function(){
            resize();
        });
    });
});
