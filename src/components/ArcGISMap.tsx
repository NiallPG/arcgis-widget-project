import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { BasemapEnum, SearchPositionEnum, BasemapTogglePositionEnum, LegendPositionEnum, LayerTogglePositionEnum, MarkerColorEnum } from "../../typings/ArcWidgetProps";
import { ListValue, ListAttributeValue } from "mendix";
import { Big } from "big.js";

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

const markerColorMapping: Record<string, [number, number, number]> = {
    blue: [0, 122, 255],
    red: [255, 59, 48],
    green: [52, 199, 89],
    yellow: [255, 204, 0],
    orange: [255, 149, 0],
    purple: [175, 82, 222]
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
    dataSource?: ListValue;
    latitudeAttribute?: ListAttributeValue<Big>;
    longitudeAttribute?: ListAttributeValue<Big>;
    titleAttribute?: ListAttributeValue<string>;
    markerColor: MarkerColorEnum;
    dynamicLayerSource?: ListValue;
    layerIdAttribute?: ListAttributeValue<string>;
    layerUrlAttribute?: ListAttributeValue<string>;
    layerTypeAttribute?: ListAttributeValue<string>;
    layerTitleAttribute?: ListAttributeValue<string>;
    layerVisibleAttribute?: ListAttributeValue<boolean>;
    layerOpacityAttribute?: ListAttributeValue<Big>;
    enablePopups?: boolean;
    popupTemplateAttribute?: ListAttributeValue<string>;
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
    dataSource,
    latitudeAttribute,
    longitudeAttribute,
    titleAttribute,
    markerColor,
    dynamicLayerSource,
    layerIdAttribute,
    layerUrlAttribute,
    layerTypeAttribute,
    layerTitleAttribute,
    layerVisibleAttribute,
    layerOpacityAttribute,
    enablePopups,
    popupTemplateAttribute,
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
                    ["esri/config", "esri/Map", "esri/views/MapView", "esri/widgets/Zoom", "esri/widgets/Attribution", "esri/widgets/Search", "esri/widgets/BasemapGallery", "esri/widgets/Legend", "esri/widgets/LayerList", "esri/widgets/Expand", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/layers/MapImageLayer", "esri/layers/WMSLayer", "esri/Graphic", "esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/PopupTemplate"],
                    (config: any, EsriMap: any, MapView: any, Zoom: any, Attribution: any, Search: any, BasemapGallery: any, Legend: any, LayerList: any, Expand: any, GraphicsLayer: any, FeatureLayer: any, MapImageLayer: any, WMSLayer: any, Graphic: any, Point: any, SimpleMarkerSymbol: any, PopupTemplate: any) => {
                        try {
                            if (apiKey) {
                                config.apiKey = apiKey;
                            }

                            const map = new EsriMap({
                                basemap: basemapMapping[basemap] || basemap
                            });

                            // Load dynamic layers from Mendix data source
                            if (dynamicLayerSource && dynamicLayerSource.items && layerUrlAttribute) {
                                dynamicLayerSource.items.forEach((layerItem: any) => {
                                    const layerUrl = layerUrlAttribute.get(layerItem).value;
                                    const layerType = layerTypeAttribute ? layerTypeAttribute.get(layerItem).value : "FeatureServer";
                                    const layerTitle = layerTitleAttribute ? layerTitleAttribute.get(layerItem).value : "Layer";
                                    const layerId = layerIdAttribute ? layerIdAttribute.get(layerItem).value : layerTitle;
                                    const visible = layerVisibleAttribute ? layerVisibleAttribute.get(layerItem).value : true;
                                    const opacity = layerOpacityAttribute ? Number(layerOpacityAttribute.get(layerItem).value?.toString() || "1") : 1.0;
                                    const customPopupTemplate = popupTemplateAttribute ? popupTemplateAttribute.get(layerItem).value : null;

                                    if (layerUrl) {
                                        let layer: any = null;
                                        
                                        // Create popup template if popups are enabled
                                        let popupTemplate = null;
                                        if (enablePopups !== false) {
                                            if (customPopupTemplate) {
                                                // Try to parse custom template JSON
                                                try {
                                                    popupTemplate = new PopupTemplate(JSON.parse(customPopupTemplate));
                                                } catch (e) {
                                                    console.warn("Failed to parse custom popup template, using default", e);
                                                }
                                            }
                                            
                                            // Use default popup template if no custom one provided
                                            if (!popupTemplate) {
                                                // For FeatureLayers, use a smart template that shows all fields in a table
                                                popupTemplate = {
                                                    title: layerTitle + " Details",
                                                    content: async (feature: any) => {
                                                        // Get all attributes from the feature
                                                        const attributes = feature.graphic.attributes;
                                                        
                                                        // Build a proper two-column table
                                                        let content = `
                                                            <div class="esri-feature__content-element">
                                                                <div class="esri-feature-fields">
                                                                    <table class="esri-feature-fields__table">
                                                                        <tbody>`;
                                                        
                                                        // Build table rows for each attribute
                                                        for (const [key, value] of Object.entries(attributes)) {
                                                            if (value !== null && value !== undefined && 
                                                                key !== 'OBJECTID' && key !== 'ObjectID' && 
                                                                key !== 'FID' && key !== 'Shape') {
                                                                
                                                                // Format field name (remove underscores, capitalize)
                                                                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                                                
                                                                // Format value based on type
                                                                let displayValue: any = value;
                                                                if (typeof value === 'number') {
                                                                    // Check if it's a date timestamp (milliseconds since epoch)
                                                                    if ((key.toLowerCase().includes('time') || key.toLowerCase().includes('date')) && value > 1000000000) {
                                                                        displayValue = new Date(value).toLocaleString();
                                                                    } else if (key.toLowerCase().includes('mag') || key.toLowerCase().includes('depth')) {
                                                                        // Keep decimals for magnitude and depth
                                                                        displayValue = value.toFixed(2);
                                                                    } else if (Number.isInteger(value)) {
                                                                        displayValue = value.toLocaleString();
                                                                    } else {
                                                                        displayValue = value.toFixed(4);
                                                                    }
                                                                }
                                                                
                                                                content += `
                                                                    <tr class="esri-feature-fields__row">
                                                                        <td class="esri-feature-fields__field-header">${label}</td>
                                                                        <td class="esri-feature-fields__field-data">${displayValue}</td>
                                                                    </tr>`;
                                                            }
                                                        }
                                                        
                                                        content += `
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>`;
                                                        
                                                        return content;
                                                    },
                                                    outFields: ["*"]
                                                };
                                            }
                                        }
                                        
                                        // Create appropriate layer type based on the service type
                                        if (layerType === "MapServer" || layerType === "MapImageLayer") {
                                            layer = new MapImageLayer({
                                                url: layerUrl,
                                                title: layerTitle,
                                                id: layerId,
                                                visible: visible,
                                                opacity: opacity,
                                                popupEnabled: enablePopups
                                            });
                                        } else if (layerType === "WMS" || layerType === "WMSLayer") {
                                            layer = new WMSLayer({
                                                url: layerUrl,
                                                title: layerTitle,
                                                id: layerId,
                                                visible: visible,
                                                opacity: opacity
                                            });
                                        } else {
                                            // Default to FeatureLayer for FeatureServer or unknown types
                                            layer = new FeatureLayer({
                                                url: layerUrl,
                                                title: layerTitle,
                                                id: layerId,
                                                visible: visible,
                                                opacity: opacity,
                                                outFields: ["*"],
                                                popupEnabled: enablePopups !== false,
                                                popupTemplate: popupTemplate
                                            });
                                        }

                                        if (layer) {
                                            map.add(layer);
                                            console.log(`Added dynamic layer: ${layerTitle} (${layerType})`);
                                        }
                                    }
                                });
                            }

                            // Create and add data layer if datasource is provided
                            if (dataSource && dataSource.items && latitudeAttribute && longitudeAttribute) {
                                const graphicsLayer = new GraphicsLayer({
                                    title: "Data Points"
                                });

                                const graphics = dataSource.items.map((item: any) => {
                                    const lat = latitudeAttribute.get(item).value;
                                    const lon = longitudeAttribute.get(item).value;
                                    const title = titleAttribute ? titleAttribute.get(item).value : "Location";

                                    if (lat && lon) {
                                        const point = new Point({
                                            longitude: Number(lon.toString()),
                                            latitude: Number(lat.toString())
                                        });

                                        const symbol = new SimpleMarkerSymbol({
                                            color: markerColorMapping[markerColor] || markerColorMapping.blue,
                                            size: 12,
                                            outline: {
                                                color: [255, 255, 255],
                                                width: 2
                                            }
                                        });

                                        return new Graphic({
                                            geometry: point,
                                            symbol: symbol,
                                            attributes: {
                                                title: title,
                                                objectId: item.id,
                                                latitude: Number(lat.toString()),
                                                longitude: Number(lon.toString())
                                            },
                                            popupTemplate: enablePopups !== false ? {
                                                title: title,
                                                content: `
                                                    <div class="esri-feature__content-element">
                                                        <div class="esri-feature-fields">
                                                            <table class="esri-feature-fields__table">
                                                                <tbody>
                                                                    <tr class="esri-feature-fields__row">
                                                                        <td class="esri-feature-fields__field-header">Location</td>
                                                                        <td class="esri-feature-fields__field-data">${title}</td>
                                                                    </tr>
                                                                    <tr class="esri-feature-fields__row">
                                                                        <td class="esri-feature-fields__field-header">Latitude</td>
                                                                        <td class="esri-feature-fields__field-data">${Number(lat.toString()).toFixed(6)}</td>
                                                                    </tr>
                                                                    <tr class="esri-feature-fields__row">
                                                                        <td class="esri-feature-fields__field-header">Longitude</td>
                                                                        <td class="esri-feature-fields__field-data">${Number(lon.toString()).toFixed(6)}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>`
                                            } : null
                                        });
                                    }
                                    return null;
                                }).filter(Boolean);

                                graphicsLayer.addMany(graphics);
                                map.add(graphicsLayer);
                            }

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
    }, [apiKey, basemap, centerLat, centerLon, zoomLevel, showZoomControls, showAttribution, dataSource, latitudeAttribute, longitudeAttribute, titleAttribute, markerColor, dynamicLayerSource, layerIdAttribute, layerUrlAttribute, layerTypeAttribute, layerTitleAttribute, layerVisibleAttribute, layerOpacityAttribute, enablePopups, popupTemplateAttribute, enableSearch, searchStartExpanded, searchPosition, enableBasemapToggle, basemapTogglePosition, enableLegend, legendPosition, enableLayerToggle, layerToggleStartExpanded, layerTogglePosition]);

    return (
        <div
            className={className}
            style={{
                height: widgetHeight > 0 ? `${widgetHeight}px` : "600px",
                minHeight: widgetHeight > 0 ? `${widgetHeight}px` : "600px",
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
