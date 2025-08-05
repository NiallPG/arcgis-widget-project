import { ReactElement, createElement } from "react";
import { ArcWidgetPreviewProps } from "../typings/ArcWidgetProps";

export function preview({ widgetHeight, basemap }: ArcWidgetPreviewProps): ReactElement {
    return (
        <div
            style={{
                height: widgetHeight || 400,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f0f0",
                border: "1px solid #ccc",
                borderRadius: "4px"
            }}
        >
            <div style={{ textAlign: "center", color: "#666" }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>ArcGIS Map Widget</div>
                <div style={{ fontSize: "12px" }}>Basemap: {basemap || "streetsnavigation"}</div>
                <div style={{ fontSize: "12px", marginTop: "4px" }}>Map will render here in runtime</div>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/ArcWidget.css");
}
