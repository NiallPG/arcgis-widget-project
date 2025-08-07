## ArcGIS Map Widget for Mendix

A comprehensive ArcGIS map widget for Mendix applications that provides interactive mapping capabilities with support for various layer types, spatial selection tools, and feature visualization.

## Features

- **Multiple Basemap Support**: Choose from various basemaps including streets, satellite, hybrid, topographic, and more
- **Dynamic Layer Loading**: Support for FeatureServer, MapServer, and WMS layer types
- **Interactive Popups**: Automatic popup generation showing feature attributes in formatted tables
- **Spatial Selection Tools**: Draw shapes (rectangle, polygon, circle) to select and query features within areas
- **Marker Visualization**: Display data points from Mendix entities with customizable colors
- **Configurable UI Controls**: 
  - Search widget with customizable positioning
  - Basemap toggle gallery
  - Legend with expand/collapse functionality
  - Layer list for visibility control
  - Zoom controls
- **Feature List Display**: View detailed information about selected features with scrollable interface
- **Responsive Design**: Adapts to container sizing with minimum height enforcement

## Usage

### Basic Setup in Mendix

1. **Create Data Models**:
   - For map markers: Entity with Latitude (Decimal), Longitude (Decimal), and Title (String) attributes
   - For dynamic layers: Entity with LayerURL (String), LayerType (String), LayerTitle (String), etc.

2. **Page Configuration**:
   - Place widget in a container with explicit height (e.g., 600px)
   - Configure data sources to retrieve your entities
   - Set coordinate center point and zoom level
   - Configure which UI controls to show/hide

3. **Layer Configuration**:
   - **Data Source**: Select entity containing lat/lon coordinates for markers
   - **Dynamic Layers**: Select entity containing layer URLs and metadata
   - **Popup Settings**: Enable/disable clickable popups on features

4. **Spatial Selection Setup**:
   - Enable drawing tools for spatial queries
   - Configure selection actions and feature list display
   - Set drawing tools position and selection behavior

### Key Configuration Options

- **Map Settings**: Basemap, center coordinates, zoom level, height
- **Data Visualization**: Marker colors, popup templates, layer styling
- **UI Controls**: Positioning and visibility of search, legend, layer list
- **Spatial Tools**: Drawing tools, selection actions, feature list display
- **Layer Management**: Dynamic layer loading, visibility, and opacity

## Demo project

See the widget in action with earthquake data visualization and spatial selection capabilities.

## Issues, suggestions and feature requests

Please report issues and feature requests in the [GitHub Issues](https://github.com/NiallPG/arcgis-widget-project/issues) section.

## Development and contribution

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

[specify contribution]
