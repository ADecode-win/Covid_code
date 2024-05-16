# COVID-19 CASES IN EUROPEAN COUNTRIES IN 2020 


## Overview
This application provides an interactive and user-friendly platform for visualizing COVID-19 case data across European countries throughout the year 2020. Designed with simplicity and ease of use, it offers tools to analyze pandemic trends over time.

The repository consists of several key components:

- **index.html**: This file includes the HTML structure and embedded CSS for styling.
- **script.js**: This script leverages D3.js to visualize COVID-19 trends using a time series graph.
The time series graph is an invaluable tool for visualizing data collected over time. It provides numerous benefits for analysis and decision-making, such as revealing trends and allowing for the easy identification of upward, downward, or stable patterns.

### Data Handling
The data is sourced from the European Centre for Disease Prevention and Control (ECDC) or (https://opendata.ecdc.europa.eu/covid19)and is available in CSV, JSON, or XML formats. The following steps outline the data handling process:

- **Downloading Data**: The "JSON" file was downloaded using a script located at Covid_code/Backend/app/download_json.py, resulting in the Covid_19.json file. This file contains data from countries all over the world.
- **Preprocessing Data**: To focus on European countries, the Covid_19.json file was preprocessed using a script at Covid_code/Backend/app/preprocess.py, producing the filtered_european_data.json file.
- **Converting to FHIR Format**: The filtered_european_data.json file was converted to fhir_bundle.json using a script at Covid_code/Backend/app/create_fhir_bundle.py. Although the fhir_bundle.json file is large, it is included for completeness and can also be downloaded within the application.

### Sample Data
To ensure visualization compatibility with the FHIR format, a sample from the filtered_european_data.json was extracted and converted to the standard JSON format, stored in sample.json. This sample was then converted to FHIR format and stored in fhir_sample.json.

## App Interoperability
This application supports interoperability by accepting a standardised JSON file (sample.json) and converting it into FHIR format (fhir_sample.json) via a POST request. The process is as follows:
### JSON to FHIR Conversion:
- This JSON file (sample.json)is converted to FHIR format through a POST request, resulting in “fhir_sample.json.” **Note that for visualization, fhir_sample.json should contain data for a specific country only. If the file contains multiple countries, visualization is not possible**
### Downloading and Visualization:
- The FHIR formatted JSON file (fhir_sample.json) can be downloaded within the app.
- Users can then drag and drop this file onto the designated box within the app to visualize the data.
### Updating Data:
- While the application is running, the data in sample.json can be modified (changing dateRep, cases, deaths, and countriesAndTerritories).
- After updating, the modified JSON file is again converted to FHIR format via a POST request, producing an updated “fhir_sample.json.”
- Users can download the updated “fhir_sample.json” by clicking the "Download FHIR Sample" button.
### Visualizing Updated Data:
- The updated FHIR sample can be visualized by dragging and dropping it into the app's designated box and clicking "Visualize" to see the updated data.
### Retrieving Files with GET Function:
- The application provides a GET function to retrieve the necessary HTML (index.html), script file (script.js), FHIR files (fhir_bundle.json and fhir_sample.json), Filtered European data file (filtered_european_data.json) from the style directory.
- These files are essential for rendering the user interface and executing the visualization scripts, ensuring the application functions correctly.

## Key Features
### Interactive Time Series Visualization
- **Graphical Display**: View the total number of COVID-19 cases displayed over time on a clean and clear graph. Each point on the graph represents a specific date in the dd.mm.yyyy format with the ability to see details about cases and deaths on hover.
- **Country and Month Selection**: Customize data views by selecting specific countries and months using dropdown menus, or choose "None" to view the data for the entire year without any monthly segmentation.
- **Data Point Interactivity**: Hover over any red dot on the graph to reveal detailed data for that date, including the number of cases and deaths, enhancing the informational value of the visualization.
- **Visualize Button**: Enables visualization of the graph when a file is uploaded.
- **Remove Button**: Allows removal of any displayed graphs.
### Data Interaction
- **Slider Functionality**: A slider allows users to play through the entire year's data, providing a dynamic overview of the pandemic’s development. This is useful for presentations and educational purposes, offering a visual timeline of the spread.
- **Hide/Show Data Points**: Toggle to hide or show data points on the graph for a clearer view of trends without individual day interruptions.
### FHIR JSON Integration
- **Drag and Drop Upload**: Supports uploading of FHIR JSON format files through a drag-and-drop interface, tailored for visualizing health data for individual countries. Ensure that each file uploaded contains data for a specific country only and not multiple countries, to maintain the visualization's clarity and accuracy.
- **Downloadable FHIR Files**: Users can click the "Download FHIR Bundle" and "Download FHIR Sample" button to download the "fhir_bundle.json" and "fhir_sample.json" files respectively. The "fhir_sample.json" can be visualized by uploading it back into the application's drag and drop box. The "fhir_sample.json" file is specifically prepared with data for one country to facilitate easy use and understanding of the data visualization.
### Design and Usability
- **User-Friendly Interface**: Features a straightforward design with clearly labeled controls, making it accessible for users of all skill levels.
- **Utility Across Fields**: While it is particularly useful for health professionals and researchers, the tool's detailed visual analysis capability makes it also suitable for educators, policymakers, and the general public.
## NOTE
When a country and "None" are selected from the "Select a country" and "Select a month" drop-down boxes respectively, ensure the graph is initially removed by clicking the remove button before uploading the file for visualization.

## Images of the Application
<img width="1440" alt="image_0" src="https://github.com/ADecode-win/Covid_code/assets/80182151/a884e752-ce0e-42f6-90ad-38f4000e0edb">
<img width="1440" alt="image_00" src="https://github.com/ADecode-win/Covid_code/assets/80182151/aaf296ad-d17c-4a5b-a309-d2b9293cb5ad">
<img width="1440" alt="image_1" src="https://github.com/ADecode-win/Covid_code/assets/80182151/ac4baa80-63e5-45dd-a36c-f3fe935bdcf6">
<img width="1440" alt="image_2" src="https://github.com/ADecode-win/Covid_code/assets/80182151/702fe89f-8087-4826-a97b-5f79d5bc0044">
<img width="1440" alt="image_3" src="https://github.com/ADecode-win/Covid_code/assets/80182151/1f66fdcf-0dd6-4214-8391-8d3270343bcb">
<img width="1440" alt="image_4" src="https://github.com/ADecode-win/Covid_code/assets/80182151/f176703c-15a8-4a72-a0e2-8bc93d6e783c">
<img width="1440" alt="image_5" src="https://github.com/ADecode-win/Covid_code/assets/80182151/e7280230-fab3-4a93-86c0-4d7a98348e2d">
<img width="1440" alt="image_6" src="https://github.com/ADecode-win/Covid_code/assets/80182151/54284683-5b8c-4591-bcbd-101fb8533f65">
<img width="1440" alt="image_7" src="https://github.com/ADecode-win/Covid_code/assets/80182151/25b94821-8343-49ab-9eae-f45447008d96">



## Video of the Application
https://github.com/ADecode-win/Covid_code/assets/80182151/3db5e135-9413-4c05-a600-69e49d400b70



## Purpose
The application aims to provide comprehensive insights into the COVID-19 pandemic's impact across Europe for the year 2020, aiding in the understanding and analysis of the virus's spread. It serves as an invaluable resource for data-driven decision-making.

## Objectives
- To visualize COVID-19 case data for European countries throughout 2020.
- To provide an interactive and user-friendly platform for data analysis.
- To support health professionals, researchers, educators, policymakers, and the general public in understanding pandemic trends.

## Navigation Guide
1. **Filter Data**:
- Use the "Select a country" and "Select a month" dropdown menus to filter the data.
- If “None” is selected from “Select a month” along with any country from the dropdown menus, ensure the graph is initially removed by clicking the remove button before uploading a new file in the drag and drop box.
2. **Interact with the Graph**:
- Hover over the data points (red circles) to see detailed information about dates, cases, and deaths of a specific country. (**Tip**: For the best experience, pause the slider to view detailed information on the data points.)
- Use the slider to play through the year’s data dynamically.
3. **Download FHIR Files**:
- Click "Download FHIR Bundle" (not to be inserted in the drag and drop box) or "Download FHIR Sample" to get the respective files (both are JSON files).
4. **Upload Data**:
- Drag and drop the JSON file (fhir_sample.json) into the designated box.
- Click "Visualize" to generate the graph.
5. **Update Data**:
- Modify the sample.json file, then re-download the FHIR Sample file (fhir_sample.json)and re-upload it to visualize the updated version.

## How to use the Application

1. **Create a Codespace**

2. **Install Docker on Codespace**

3. **Clone the Git Repository**:
   - Run the following command to clone the repository:
     ```sh
     git clone https://github.com/ADecode-win/Covid_code.git
     ```

4. **Navigate to the Directory**:
   - Change to the directory of the project:
     ```sh
     cd Covid_code/Backend
     ```

5. **Run the Application**:
   - There are two ways to run the application:

   **Running with Shell Script**:
   - Make the script executable and then run it:
     ```sh
     chmod +x run_docker.sh
     ./run_docker.sh
     ```

   **Running with Docker Compose**:
   - Build and run the application using Docker Compose:
     ```sh
     docker-compose up --build
     ```

6. **Explore the Application**:
   - Open the application in the web browser to visualize the COVID-19 case data on the time series graph.


