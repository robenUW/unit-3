# Web Mapping and Cartographic Visualization - Unit 3

This project demonstrates a web map application built using HTML, JavaScript, and CSS. The primary JavaScript libraries used are D3.js and TopoJSON. The application visualizes deer harvest data by Wildlife Management Units (WMUs) in New York State.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Data Files](#data-files)
- [Customization](#customization)
- [Acknowledgments](#acknowledgments)

## Getting Started

To get this project up and running on your local machine, follow these instructions:

1. **Clone the repository** to your local machine.
   ```sh
   git clone https://github.com/yourusername/your-repo.git
   ```
   
2. **Navigate to the project directory.**
   ```sh
   cd your-repo
   ```

3. **Open `index.html` in your preferred web browser** to view the project.
   ```sh
   open index.html
   ```

Make sure you have the necessary `data` folder in the project root directory containing the required data files (`DeerWMU.csv`, `WMU_NY_WGS84.topojson`, `US_State_Boundaries.topojson`, `Canada.topojson`).

## Project Structure

- `index.html` - The main HTML file.
- `css/`
  - `style.css` - The main CSS file.
- `js/`
  - `topojson.js` - TopoJSON library.
  - `d3.v7.js` - D3.js library.
  - `colorbrewer.js` - Color palettes for D3.js.
  - `main.js` - The main JavaScript file containing the functionality of the application.
- `data/` - Folder containing the required data files.

## Usage

Upon opening `index.html`, the application will display a choropleth map of New York's Wildlife Management Units (WMUs) along with a coordinated bar chart. The user can interact with the following features:

- **Dropdown Menu**: Select different attributes to visualize.
- **Hover Effects**: Highlight regions on both the map and the bar chart when hovering over the respective elements.

## Data Files

The project relies on the following data files within the `data/` directory:

- `DeerWMU.csv` - CSV file containing deer harvest data.
- `WMU_NY_WGS84.topojson` - TopoJSON file containing the WMU boundaries for New York.
- `US_State_Boundaries.topojson` - TopoJSON file containing US state boundaries.
- `Canada.topojson` - TopoJSON file containing Canada boundaries.

Ensure these files are properly placed in the `data/` directory.

## Customization

Feel free to customize the project to suit your needs. You can update the datasets, change the colors, modify the scales, and more. The main logic for mapping and charting can be found in `main.js`.

## Acknowledgments

This project uses the following third-party libraries:

- [D3.js](https://d3js.org/)
- [TopoJSON](https://github.com/topojson/topojson)
- [ColorBrewer](https://colorbrewer2.org/)
