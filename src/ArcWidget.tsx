import { ReactElement, createElement } from "react";
import { ArcMap } from "./components/HelloWorldSample";
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
    enableSearch,
    searchStartExpanded,
    searchPosition,
    enableBasemapToggle,
    basemapTogglePosition,
    enableLegend,
    legendPosition,
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
            enableSearch={enableSearch}
            searchStartExpanded={searchStartExpanded}
            searchPosition={searchPosition}
            enableBasemapToggle={enableBasemapToggle}
            basemapTogglePosition={basemapTogglePosition}
            enableLegend={enableLegend}
            legendPosition={legendPosition}
            className={combinedClassName}
        />
    );
}
