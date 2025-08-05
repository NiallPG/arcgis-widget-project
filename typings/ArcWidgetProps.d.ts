/**
 * This file was generated from ArcWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { Big } from "big.js";

export type BasemapEnum = "streetsnavigation" | "streets" | "satellite" | "hybrid" | "topo" | "gray" | "darkgray" | "oceans";

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
}
