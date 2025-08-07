import { ReactElement, createElement } from "react";
import { ArcMap } from "./components/ArcGISMap";
import { ArcWidgetContainerProps } from "../typings/ArcWidgetProps";
import "./ui/ArcWidget.css";

export function ArcWidget({
    apiKey,
    basemap,
    centerLat,
    centerLon,
    zoomLevel,
    widgetHeight,
    showZoomControls,
    showAttribution,
    dataSource,
    latitudeAttribute,
    longitudeAttribute,
    titleAttribute,
    markerColor,
    enableSearch,
    searchStartExpanded,
    searchPosition,
    enableBasemapToggle,
    basemapTogglePosition,
    enableLegend,
    legendPosition,
    legendStartExpanded,
    enableLayerToggle,
    layerToggleStartExpanded,
    layerTogglePosition,
    dynamicLayerSource,
    layerIdAttribute,
    layerUrlAttribute,
    layerTypeAttribute,
    layerTitleAttribute,
    layerVisibleAttribute,
    layerOpacityAttribute,
    enablePopups,
    class: className
}: ArcWidgetContainerProps): ReactElement {
    const combinedClassName = `arcgis-map-widget ${className || ""}`.trim();

    return (
        <ArcMap
            apiKey={apiKey}
            basemap={basemap}
            centerLat={Number(centerLat)}
            centerLon={Number(centerLon)}
            zoomLevel={zoomLevel}
            widgetHeight={widgetHeight}
            showZoomControls={showZoomControls}
            showAttribution={showAttribution}
            dataSource={dataSource}
            latitudeAttribute={latitudeAttribute}
            longitudeAttribute={longitudeAttribute}
            titleAttribute={titleAttribute}
            markerColor={markerColor}
            enableSearch={enableSearch}
            searchStartExpanded={searchStartExpanded}
            searchPosition={searchPosition}
            enableBasemapToggle={enableBasemapToggle}
            basemapTogglePosition={basemapTogglePosition}
            enableLegend={enableLegend}
            legendPosition={legendPosition}
            legendStartExpanded={legendStartExpanded}
            enableLayerToggle={enableLayerToggle}
            layerToggleStartExpanded={layerToggleStartExpanded}
            layerTogglePosition={layerTogglePosition}
            dynamicLayerSource={dynamicLayerSource}
            layerIdAttribute={layerIdAttribute}
            layerUrlAttribute={layerUrlAttribute}
            layerTypeAttribute={layerTypeAttribute}
            layerTitleAttribute={layerTitleAttribute}
            layerVisibleAttribute={layerVisibleAttribute}
            layerOpacityAttribute={layerOpacityAttribute}
            enablePopups={enablePopups}
            className={combinedClassName}
        />
    );
}
