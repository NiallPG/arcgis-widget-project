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
            className={combinedClassName}
        />
    );
}
