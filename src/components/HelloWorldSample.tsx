import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { BasemapEnum, SearchPositionEnum, BasemapTogglePositionEnum, LegendPositionEnum, LayerTogglePositionEnum } from "../../typings/ArcWidgetProps";

declare global {
    interface Window {
        require: any;
        dojoConfig: any;
    }
}

const basemapMapping: Record<string, string> = {
    streetsnavigation: "streets-navigation-vector",
    streets: "streets-vector",
    satellite: "satellite",
    hybrid: "hybrid",
    topo: "topo-vector",
    gray: "gray-vector",
    darkgray: "dark-gray-vector",
    oceans: "oceans"
};

const positionMapping: Record<string, string> = {
    topright: "top-right",
    topleft: "top-left",
    bottomright: "bottom-right",
    bottomleft: "bottom-left"
};

export interface ArcMapProps {
    apiKey?: string;
    basemap: BasemapEnum;
    centerLat: number;
    centerLon: number;
    zoomLevel: number;
    widgetHeight: number;
    showZoomControls: boolean;
    showAttribution: boolean;
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
    className?: string;
}

export function ArcMap({
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
    enableLayerToggle,
    layerToggleStartExpanded,
    layerTogglePosition,
    className
}: ArcMapProps): ReactElement {
    const mapDiv = useRef<HTMLDivElement>(null);
    const mapView = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapDiv.current) {
            return;
        }

        const initializeMap = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);

                if (!window.require) {
                    const cssLink = document.createElement("link");
                    cssLink.rel = "stylesheet";
                    cssLink.href = "https://js.arcgis.com/4.29/esri/themes/light/main.css";
                    document.head.appendChild(cssLink);

                    const script = document.createElement("script");
                    script.src = "https://js.arcgis.com/4.29/";
                    document.head.appendChild(script);

                    await new Promise<void>((resolve, reject) => {
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error("Failed to load ArcGIS API"));
                    });
                }

                window.require(
                    ["esri/config", "esri/Map", "esri/views/MapView", "esri/widgets/Zoom", "esri/widgets/Attribution", "esri/widgets/Search", "esri/widgets/BasemapGallery", "esri/widgets/Legend", "esri/widgets/LayerList", "esri/widgets/Expand"],
                    (config: any, EsriMap: any, MapView: any, Zoom: any, Attribution: any, Search: any, BasemapGallery: any, Legend: any, LayerList: any, Expand: any) => {
                        try {
                            if (apiKey) {
                                config.apiKey = apiKey;
                            }

                            const map = new EsriMap({
                                basemap: basemapMapping[basemap] || basemap
                            });

                            if (mapView.current) {
                                mapView.current.destroy();
                            }

                            mapView.current = new MapView({
                                container: mapDiv.current,
                                map,
                                center: [centerLon, centerLat],
                                zoom: zoomLevel
                            });

                            mapView.current
                                .when(() => {
                                    setIsLoading(false);

                                    mapView.current.ui.empty("top-left");
                                    mapView.current.ui.empty("bottom-right");

                                    if (showZoomControls) {
                                        const zoomWidget = new Zoom({
                                            view: mapView.current
                                        });
                                        mapView.current.ui.add(zoomWidget, "top-left");
                                    }

                                    if (showAttribution) {
                                        const attributionWidget = new Attribution({
                                            view: mapView.current
                                        });
                                        mapView.current.ui.add(attributionWidget, "bottom-right");
                                    }

                                    if (enableSearch) {
                                        const searchWidget = new Search({
                                            view: mapView.current,
                                            expanded: searchStartExpanded
                                        });
                                        mapView.current.ui.add(searchWidget, positionMapping[searchPosition] || "top-right");
                                    }

                                    if (enableBasemapToggle) {
                                        const basemapGallery = new BasemapGallery({
                                            view: mapView.current
                                        });
                                        mapView.current.ui.add(basemapGallery, positionMapping[basemapTogglePosition] || "bottom-left");
                                    }

                                    if (enableLegend) {
                                        const legendWidget = new Legend({
                                            view: mapView.current
                                        });
                                        mapView.current.ui.add(legendWidget, positionMapping[legendPosition] || "top-right");
                                    }

                                    if (enableLayerToggle) {
                                        const layerList = new LayerList({
                                            view: mapView.current
                                        });
                                        
                                        if (layerToggleStartExpanded) {
                                            mapView.current.ui.add(layerList, positionMapping[layerTogglePosition] || "top-right");
                                        } else {
                                            const layerListExpand = new Expand({
                                                view: mapView.current,
                                                content: layerList,
                                                expanded: false,
                                                expandIconClass: "esri-icon-layer-list"
                                            });
                                            mapView.current.ui.add(layerListExpand, positionMapping[layerTogglePosition] || "top-right");
                                        }
                                    }
                                })
                                .catch((err: any) => {
                                    console.error("MapView error:", err);
                                    setError("Failed to initialize map view");
                                    setIsLoading(false);
                                });
                        } catch (err) {
                            console.error("Map creation error:", err);
                            setError("Failed to create map");
                            setIsLoading(false);
                        }
                    },
                    (err: any) => {
                        console.error("ArcGIS modules loading error:", err);
                        setError("Failed to load ArcGIS modules");
                        setIsLoading(false);
                    }
                );
            } catch (error) {
                console.error("Error initializing ArcGIS Map:", error);
                setError("Failed to initialize ArcGIS API");
                setIsLoading(false);
            }
        };

        initializeMap();

        return () => {
            if (mapView.current) {
                mapView.current.destroy();
                mapView.current = null;
            }
        };
    }, [apiKey, basemap, centerLat, centerLon, zoomLevel, showZoomControls, showAttribution]);

    return (
        <div
            className={className}
            style={{
                height: `${widgetHeight}px`,
                width: "100%",
                position: "relative"
            }}
        >
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 1000,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        padding: "16px",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                >
                    <div>Loading ArcGIS Map...</div>
                </div>
            )}
            {error && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        color: "#d32f2f",
                        zIndex: 1000,
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        padding: "16px",
                        borderRadius: "4px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                >
                    <div>Error: {error}</div>
                    <div style={{ fontSize: "12px", marginTop: "8px", color: "#666" }}>
                        Check your internet connection and API key
                    </div>
                </div>
            )}
            <div
                ref={mapDiv}
                style={{
                    height: "100%",
                    width: "100%"
                }}
            />
        </div>
    );
}
