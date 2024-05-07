document.addEventListener("DOMContentLoaded", function() {
    const margin = { top: 270, right: 30, bottom: 70, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    const parseDate = d3.timeParse("%d/%m/%Y");
    const formatDate = d3.timeFormat("%d.%m.%Y");
    const year = 2020;

    const europeanCountries = ['Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium', 'Bosnia_and_Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia',
        'Denmark', 'Estonia', 'Faroe_Islands', 'Finland', 'France', 'Georgia', 'Germany', 'Gibraltar', 'Greece', 'Guernsey', 'Holy_See', 'Hungary',
        'Iceland', 'Ireland', 'Isle_of_Man', 'Italy', 'Jersey', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova',
        'Monaco', 'Montenegro', 'Netherlands', 'North_Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San_Marino', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United_Kingdom'];

    const selector = d3.select("#country-selector");
    selector.selectAll("option")
        .data(europeanCountries)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d.replace(/_/g, ' '));

    const monthSelector = d3.select("#month-selector");
    const svgContainer = d3.select("#chart-container");
    const svg = svgContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px");

    const messageContainer = d3.select("#message-container");
    const focusLink = document.getElementById("focus-link");

    let circlesVisible = true;
    let timer, playing = false;

    const toggleButton = d3.select("#toggle-btn");
    toggleButton.on("click", function() {
        circlesVisible = !circlesVisible;
        svg.selectAll("circle").style("display", circlesVisible ? null : "none");
        this.textContent = circlesVisible ? "Hide Data Points" : "Show Data Points";
    });

    const downloadButton = document.getElementById("download-btn");
    downloadButton.addEventListener("click", function() {
        const fileUrl = "/fhir_bundle.json";
        const downloadLink = document.createElement("a");
        downloadLink.href = fileUrl;
        downloadLink.download = "fhir_bundle.json";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    d3.json("filtered_european_data.json").then(function(data) {
        data.forEach(d => {
            d.date = parseDate(d.dateRep);
            d.cases = +d.cases;
            d.deaths = +d.deaths;
        });

        const dates = data.map(d => d.date);
        const uniqueDates = [...new Set(dates)].sort(d3.ascending);

        function filterDataByMonthAndCountry(country, month) {
            let filteredData;
            if (month === "None") {
                filteredData = data.filter(d => d.countriesAndTerritories === country);
            } else {
                const startDate = new Date(`${year}-${month}-01`);
                const endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
                filteredData = data.filter(d => d.countriesAndTerritories === country && d.date >= startDate && d.date <= endDate);
            }
            return filteredData;
        }

        function updateChartTitle(country, month) {
            const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
            let title = `Total Number of Covid cases in ${country.replace(/_/g, ' ')}`;
            if (month === "None") {
                title += " in 2020";
            } else {
                const monthDate = new Date(`${year}-${month}-01`);
                const monthName = monthFormatter.format(monthDate);
                title += ` in ${monthName} ${year}`;
            }
            return title;
        }

        function updateChart(country, date = null) {
            const month = monthSelector.node().value;
            const filteredData = filterDataByMonthAndCountry(country, month);

            const xDomain = date ? [d3.min(filteredData, d => d.date), date] : d3.extent(filteredData, d => d.date);
            const x = d3.scaleTime().range([0, width]).domain(xDomain);
            const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(filteredData, d => d.cases)]);

            svg.selectAll("*").remove();

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d.%m.%Y")))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            svg.append("g").call(d3.axisLeft(y));

            const line = d3.line().x(d => x(d.date)).y(d => y(d.cases));
            svg.append("path")
                .datum(filteredData.filter(d => !date || d.date <= date))
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2)
                .attr("d", line);

            svg.selectAll("circle")
                .data(filteredData.filter(d => !date || d.date <= date))
                .enter()
                .append("circle")
                .attr("cx", d => x(d.date))
                .attr("cy", d => y(d.cases))
                .attr("r", 5)
                .attr("fill", "red")
                .style("display", circlesVisible ? null : "none")
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html("Date: " + formatDate(d.date) + "<br/>Cases: " + d.cases + "<br/>Deaths: " + d.deaths)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - (margin.left - 20))
                .attr("x", 0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .style("fill", "#777")
                .style("font-family", "sans-serif")
                .text("Total Number of Covid cases");

            svg.append("text")
                .attr("class", "chart-title")
                .attr("x", margin.left - 50)
                .attr("y", margin.top - 420)
                .style("font-size", "24px")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .text(updateChartTitle(country, month));
        }

        function updateUIBasedOnSelection(value) {
            const month = monthSelector.node().value;
            if (value) {
                if (month === "None") {
                    sliderSvg.style("display", "block");
                    playButton.style("display", "block");
                } else {
                    sliderSvg.style("display", "none");
                    playButton.style("display", "none");
                }
                messageContainer.style("visibility", "hidden");
                svgContainer.style("display", "block");
                updateChart(value, month === "None" ? slider.value() : null);
            } else {
                sliderSvg.style("display", "none");
                playButton.style("display", "none");
                messageContainer.style("visibility", "visible");
                svgContainer.style("display", "none");
            }
        }

        const sliderSvg = d3.select('#slider-range').append('svg')
            .attr('width', 920)
            .attr('height', 100)
            .style("display", "none");

        const sliderG = sliderSvg.append('g')
            .attr('transform', 'translate(50,30)');

        const slider = d3.sliderBottom()
            .min(d3.min(uniqueDates))
            .max(d3.max(uniqueDates))
            .step(1000 * 60 * 60 * 24)
            .width(800)
            .tickFormat(d3.timeFormat("%d %b %Y"))
            .ticks(5)
            .fill('#008000')
            .on('onchange', val => {
                updateChart(selector.node().value, val);
            });

        sliderG.call(slider);

        const playButton = sliderSvg.append('foreignObject')
            .attr('x', 860)
            .attr('y', 20)
            .attr('width', 120)
            .attr('height', 50)
            .append("xhtml:button")
            .attr('class', 'play-pause-btn')
            .text('Play')
            .style("display", "block")
            .style("background-color", "#32CD32")
            .on('click', function() {
                if (!playing) {
                    timer = setInterval(function() {
                        let date = slider.value();
                        const nextDate = new Date(date.getTime() + (1000 * 60 * 60 * 24));
                        if (nextDate > d3.max(uniqueDates)) {
                            clearInterval(timer);
                            playing = false;
                            playButton.textContent = 'Play';
                            playButton.style.backgroundColor = '#32CD32';
                        } else {
                            slider.value(nextDate);
                            updateChart(selector.node().value, nextDate);
                        }
                    }, 100);
                    playing = true;
                    this.textContent = 'Pause';
                    this.style.backgroundColor = '#EE4B2B';
                } else {
                    clearInterval(timer);
                    playing = false;
                    this.textContent = 'Play';
                    this.style.backgroundColor = '#32CD32';
                }
            });

        selector.on("change", function() {
            updateUIBasedOnSelection(this.value);
        });

        monthSelector.on("change", function() {
            updateUIBasedOnSelection(selector.node().value);
        });

        focusLink.addEventListener("click", function(event) {
            event.preventDefault();
            messageContainer.style("visibility", "hidden");
            svgContainer.style("display", "none");
            const dropdown = document.getElementById("country-selector");
            if (dropdown) {
                dropdown.focus();
            }
            return false;
        });

        updateUIBasedOnSelection(selector.property('value'));
    });
});