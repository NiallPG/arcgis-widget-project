/**
 * This file was generated from ArcWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

export type BasemapEnum = "streetsnavigation" | "streets" | "satellite" | "hybrid" | "topo" | "gray" | "darkgray" | "oceans";

export type MarkerColorEnum = "blue" | "red" | "green" | "yellow" | "orange" | "purple";

export type SearchPositionEnum = "topright" | "topleft" | "bottomright" | "bottomleft";

export type BasemapTogglePositionEnum = "topright" | "topleft" | "bottomright" | "bottomleft";

export type LegendPositionEnum = "topright" | "topleft" | "bottomright" | "bottomleft";

export type LayerTogglePositionEnum = "topright" | "topleft" | "bottomright" | "bottomleft";

export interface ArcWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    apiKey: string;
    basemap: BasemapEnum;
    centerLat: Big;
    centerLon: Big;
    zoomLevel: number;
    widgetHeight: number;
    showZoomControls: boolean;
    showAttribution: boolean;
    dataSource?: ListValue;
    latitudeAttribute?: ListAttributeValue<Big>;
    longitudeAttribute?: ListAttributeValue<Big>;
    titleAttribute?: ListAttributeValue<string>;
    markerColor: MarkerColorEnum;
    enableSearch: boolean;
    searchStartExpanded: boolean;
    searchPosition: SearchPositionEnum;
    enableBasemapToggle: boolean;
    basemapTogglePosition: BasemapTogglePositionEnum;
    enableLegend: boolean;
    legendPosition: LegendPositionEnum;
    enableLayerToggle: boolean;
    layerToggleStartExpanded: boolean;
    layerTogglePosition: LayerTogglePositionEnum;
}

export interface ArcWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    apiKey: string;
    basemap: BasemapEnum;
    centerLat: number | null;
    centerLon: number | null;
    zoomLevel: number | null;
    widgetHeight: number | null;
    showZoomControls: boolean;
    showAttribution: boolean;
    dataSource: {} | { caption: string } | { type: string } | null;
    latitudeAttribute: string;
    longitudeAttribute: string;
    titleAttribute: string;
    markerColor: MarkerColorEnum;
    enableSearch: boolean;
    searchStartExpanded: boolean;
    searchPosition: SearchPositionEnum;
    enableBasemapToggle: boolean;
    basemapTogglePosition: BasemapTogglePositionEnum;
    enableLegend: boolean;
    legendPosition: LegendPositionEnum;
    enableLayerToggle: boolean;
    layerToggleStartExpanded: boolean;
    layerTogglePosition: LayerTogglePositionEnum;
}
