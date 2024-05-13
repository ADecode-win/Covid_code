# COVID-19 CASES IN EUROPEAN COUNTRIES IN 2020 


## Overview
This application provides an interactive and user-friendly platform for visualizing COVID-19 case data across European countries throughout the year 2020. Designed with simplicity and ease of use in mind, it offers powerful tools to analyze pandemic trends over time.

## Key Features
### Interactive Time Series Visualization
- **Graphical Display**: View the total number of COVID-19 cases displayed over-time on a clean and clear graph. Each point on the graph represents a specific day with the ability to see details about cases and deaths on hover.
- **Country and Month Selection**: Customize data views by selecting specific countries and months using dropdown menus, or choose "None" to view the data for the entire year without any monthly segmentation.
- **Data Point Interactivity**: Hover over any red dot on the graph to reveal detailed data for that date, including the number of cases and deaths, enhancing the informational value of the visualization.
### Data Interaction
- **Slider Functionality**: A slider allows users to play through the entire year's data, providing a dynamic overview of the pandemic’s development. This is useful for presentations and educational purposes, offering a visual timeline of the spread.
- **Hide/Show Data Points**: Toggle to hide or show data points on the graph for a clearer view of trends without individual day interruptions.
### FHIR JSON Integration
- **Drag and Drop Upload**: Supports uploading of FHIR JSON format files through a drag-and-drop interface, tailored for visualizing health data for individual countries. Ensure that each file uploaded contains data for a specific country only and not multiple countries, to maintain the visualization's clarity and accuracy.
- **Downloadable FHIR Files**: Users can click the "Download FHIR Files" button to simultaneously download both "fhir_bundle.json" and "fhir_sample.json" files. These files can be visualized by uploading them back into the application. The "fhir_sample.json" file is specifically prepared with data for one country to facilitate easy use and understanding of the visualization features.
### Design and Usability
- **User-Friendly Interface**: Features a straightforward design with clearly labeled controls, making it accessible for users of all skill levels.
- **Utility Across Fields**: While it is particularly useful for health professionals and researchers, the tool's detailed visual analysis capability makes it also suitable for educators, policymakers, and the general public.
## Purpose
The application aims to provide comprehensive insights into the COVID-19 pandemic's impact across Europe for the year 2020, aiding in the understanding and analysis of the virus's spread and effects. It serves as an invaluable resource for data-driven decision-making and educational purposes.
