document.addEventListener("DOMContentLoaded", function () {
    const margin = { top: 270, right: 30, bottom: 70, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;
    const parseDate = d3.timeParse("%d/%m/%Y");
    const formatDate = d3.timeFormat("%d.%m.%Y");
    const year = 2020;
    let uploadedData = [];
    let circlesVisible = true;
    let timer, playing = false;
    const europeanCountries = new Set();
    let fhirCountry = "";

    // Create selectors and containers
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

    const fileUploadForm = document.getElementById("file-upload-form");
    const visualizeButton = document.getElementById("visualize-btn");
    const removeButton = document.getElementById("remove-btn");
    const fileInput = document.getElementById("file-upload");
    const selector = d3.select("#country-selector");
    const dragDropArea = document.getElementById('drag-drop-area');
    const fileNameDisplay = document.getElementById('file-name-display');

    dragDropArea.addEventListener('click', function () {
        fileInput.click(); // Simulate click on the actual file input when drag-drop area is clicked
    });

    dragDropArea.addEventListener('dragover', function (event) {
        event.preventDefault(); // Prevent default behavior (Prevent file from being opened)
        dragDropArea.style.backgroundColor = '#f0f0f0';
    });

    dragDropArea.addEventListener('dragleave', function (event) {
        event.preventDefault();
        dragDropArea.style.backgroundColor = '#fff'; // Revert background color
    });

    dragDropArea.addEventListener('drop', function (event) {
        event.preventDefault();
        dragDropArea.style.backgroundColor = '#fff'; // Revert background color
        if (event.dataTransfer.files.length > 0) {
            fileInput.files = event.dataTransfer.files;
            fileNameDisplay.textContent = "Uploaded: " + fileInput.files[0].name; // Display the file name
            console.log("File dropped: ", fileInput.files[0].name);
            /*visualizeButton.click();*/
        }
    });

    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = "Uploaded: " + fileInput.files[0].name; // Display the file name when selected via file dialog
        }
    });
   
    // Fetch initial European data and populate the dropdown
    d3.json("filtered_european_data.json").then(function (data) {
        data.forEach(d => {
            d.date = parseDate(d.dateRep);
            d.cases = +d.cases;
            d.deaths = +d.deaths;
            europeanCountries.add(d.countriesAndTerritories);
        });

        const uniqueCountries = Array.from(europeanCountries).sort();
        selector.selectAll("option")
            .data(uniqueCountries)
            .enter().append("option")
            .attr("value", d => d)
            .text(d => d.replace(/_/g, ' '));

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
                .on("mouseover", function (event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html("Date: " + formatDate(d.date) + "<br/>Cases: " + d.cases + "<br/>Deaths: " + d.deaths)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function () {
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
            if (value && month === "None") {
                showSliderWithPlayPauseControls(true);
                updateChart(value, slider.value());
            } else {
                showSliderWithPlayPauseControls(false);
                updateChart(value);
            }
        }

        // Create slider and play/pause button
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

        const playPauseButton = sliderSvg.append("foreignObject")
            .attr("x", 860)
            .attr("y", 20)
            .attr("width", 120)
            .attr("height", 50)
            .append("xhtml:button")
            .attr("class", "play-pause-btn")
            .text("Play")
            .style("background-color", "#32CD32")
            .on("click", function () {
                playing = !playing;
                if (playing) {
                    this.textContent = "Pause";
                    this.style.backgroundColor = "#EE4B2B";
                    timer = d3.interval(function () {
                        let nextValue = new Date(slider.value());
                        nextValue.setDate(nextValue.getDate() + 1);
                        if (nextValue > slider.max()) {
                            playing = false;
                            playPauseButton.text("Play");
                            playPauseButton.style("background-color", "#32CD32");
                            timer.stop();
                        } else {
                            slider.value(nextValue);
                        }
                    }, 100); // Faster interval
                } else {
                    this.textContent = "Play";
                    this.style.backgroundColor = "#32CD32";
                    timer.stop();
                }
            });

        function showSliderWithPlayPauseControls(show) {
                const sliderSvg = d3.select('#slider-range svg');
                sliderSvg.style("display", show ? "" : "none");  // Adjusts display based on the show parameter
}

        selector.on("change", function () {
            updateUIBasedOnSelection(this.value);
        });

        monthSelector.on("change", function () {
            updateUIBasedOnSelection(selector.node().value);
        });
    });

    // Handle FHIR data and months dynamically
        function transformFHIRToStandard(fhirData) {
            return fhirData.map(obs => ({
                dateRep: obs.effectiveDateTime,
                cases: obs.valueQuantity.value,
                countriesAndTerritories: obs.subject.reference.split("/")[1],
        }));
    }

    function clearChartAndFileInput() {
        uploadedData = [];
        svg.selectAll("*").remove();
        fileUploadForm.reset();
        fileInput.value = '';  // This clears the selected file from the file input
        fileNameDisplay.textContent = '';
        selector.attr("disabled", null).property("selectedIndex", 0);
        monthSelector.attr("disabled", null).property("selectedIndex", 0);  
        fhirCountry = "";
        d3.select('#slider-range svg').style("display", "none");
        showSliderWithPlayPauseControls(false);
    }
    removeButton.addEventListener("click", function(event) {
        event.preventDefault();
        clearChartAndFileInput();
    });

    function updateFHIRChart(data, title) {
        const x = d3.scaleTime()
            .range([0, width])
            .domain(d3.extent(data, d => parseDate(d.dateRep)));
        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.cases)]);

        svg.selectAll("*").remove();

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x)
                .tickFormat(formatDate)
                .ticks(d3.timeDay.every(1)))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g").call(d3.axisLeft(y));

        const line = d3.line()
            .x(d => x(parseDate(d.dateRep)))
            .y(d => y(d.cases));

        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => x(parseDate(d.dateRep)))
            .attr("cy", d => y(d.cases))
            .attr("r", 5)
            .attr("fill", "red")
            .style("display", circlesVisible ? null : "none")
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                    tooltip.html(`Date: ${formatDate(parseDate(d.dateRep))}<br>Cases: ${d.cases}<br>Deaths: ${d.deaths}`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
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
            .text(`${title}`);
    }

    // Visualize the uploaded FHIR data
    visualizeButton.addEventListener("click", function (event) {
        event.preventDefault();
        if (!fileInput.files[0]) {
            alert("Please upload a file before visualizing.");
        } else {
            const file = fileInput.files[0];
            const reader = new FileReader();
            reader.onload = function () {
                let data;
                try {
                    data = JSON.parse(reader.result);
                } catch (error) {
                    console.error("Parsing Error:", error);
                    alert("Error parsing the uploaded file. Please ensure it's a valid JSON file.");
                    return;
                }

                if (Array.isArray(data) && data[0]?.resourceType === "Observation") {
                    uploadedData = transformFHIRToStandard(data);

                    if (uploadedData.length > 0) {
                        fhirCountry = uploadedData[0].countriesAndTerritories.replace(/_/g, ' ');
                        const title = `Total Number of Covid cases in ${fhirCountry} in 2020`;
                        updateFHIRChart(uploadedData, title);
                    } else {
                        alert("No data available for visualization.");
                    }
                } else {
                    uploadedData = data;
                }
            };
            reader.readAsText(file);
        };
        });

    const toggleButton = d3.select("#toggle-btn");
    toggleButton.on("click", function () {
        circlesVisible = !circlesVisible;
        svg.selectAll("circle").style("display", circlesVisible ? null : "none");
        this.textContent = circlesVisible ? "Hide Data Points" : "Show Data Points";
    });

    const downloadButton = document.getElementById("download-btn");
downloadButton.addEventListener("click", function () {
    const fileUrls = ["/fhir_bundle.json", "/fhir_sample.json"];

    fileUrls.forEach(function (fileUrl) {
        const downloadLink = document.createElement("a");
        downloadLink.href = fileUrl;
        downloadLink.download = fileUrl.split('/').pop(); // Extracting filename from URL
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        });
    });
});