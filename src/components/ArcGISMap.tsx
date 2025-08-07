import { ReactElement, createElement, useEffect, useRef, useState } from "react";
import { BasemapEnum, SearchPositionEnum, BasemapTogglePositionEnum, LegendPositionEnum, LayerTogglePositionEnum, MarkerColorEnum, DrawingToolsPositionEnum } from "../../typings/ArcWidgetProps";
import { ListValue, ListAttributeValue, ActionValue } from "mendix";
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
    legendStartExpanded: boolean;
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
    enableDrawingTools?: boolean;
    drawingToolsPosition?: DrawingToolsPositionEnum;
    onSelectionAction?: ActionValue;
    showSelectionCount?: boolean;
    clearSelectionOnDraw?: boolean;
    showFeatureList?: boolean;
    maxFeaturesInList?: number;
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
    legendStartExpanded,
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
    enableDrawingTools,
    drawingToolsPosition,
    onSelectionAction,
    showSelectionCount,
    clearSelectionOnDraw,
    showFeatureList,
    maxFeaturesInList,
    className
}: ArcMapProps): ReactElement {
    const mapDiv = useRef<HTMLDivElement>(null);
    const mapView = useRef<any>(null);
    const sketchWidget = useRef<any>(null);
    const graphicsLayerRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCount, setSelectedCount] = useState<number>(0);
    const [selectedFeatures, setSelectedFeatures] = useState<any[]>([]);

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
                    ["esri/config", "esri/Map", "esri/views/MapView", "esri/widgets/Zoom", "esri/widgets/Attribution", "esri/widgets/Search", "esri/widgets/BasemapGallery", "esri/widgets/Legend", "esri/widgets/LayerList", "esri/widgets/Expand", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/layers/MapImageLayer", "esri/layers/WMSLayer", "esri/Graphic", "esri/geometry/Point", "esri/symbols/SimpleMarkerSymbol", "esri/widgets/Sketch", "esri/geometry/geometryEngine", "esri/symbols/SimpleFillSymbol"],
                    (config: any, EsriMap: any, MapView: any, Zoom: any, Attribution: any, Search: any, BasemapGallery: any, Legend: any, LayerList: any, Expand: any, GraphicsLayer: any, FeatureLayer: any, MapImageLayer: any, WMSLayer: any, Graphic: any, Point: any, SimpleMarkerSymbol: any, Sketch: any, geometryEngine: any, SimpleFillSymbol: any) => {
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
                                    if (layerUrl) {
                                        let layer: any = null;
                                        
                                        // Create popup template if popups are enabled
                                        let popupTemplate = null;
                                        if (enablePopups !== false) {
                                            // Use default popup template that shows all fields in a table
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
                                
                                // Store reference for spatial queries
                                graphicsLayerRef.current = graphicsLayer;

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
                                        
                                        if (legendStartExpanded) {
                                            mapView.current.ui.add(legendWidget, positionMapping[legendPosition] || "bottom-right");
                                        } else {
                                            const legendExpand = new Expand({
                                                view: mapView.current,
                                                content: legendWidget,
                                                expanded: false,
                                                expandIconClass: "esri-icon-legend"
                                            });
                                            mapView.current.ui.add(legendExpand, positionMapping[legendPosition] || "bottom-right");
                                        }
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

                                    // Add drawing tools for spatial selection
                                    if (enableDrawingTools) {
                                        // Create a graphics layer for selections
                                        const selectionLayer = new GraphicsLayer({
                                            title: "Selection Graphics",
                                            listMode: "hide" // Hide from layer list
                                        });
                                        map.add(selectionLayer);

                                        // Create the sketch widget
                                        const sketch = new Sketch({
                                            layer: selectionLayer,
                                            view: mapView.current,
                                            creationMode: "single", // Only one selection at a time
                                            availableCreateTools: ["rectangle", "polygon", "circle"],
                                            defaultCreateOptions: {
                                                mode: "click" // or "freehand"
                                            },
                                            visibleElements: {
                                                createTools: {
                                                    point: false,
                                                    polyline: false
                                                },
                                                selectionTools: {
                                                    "lasso-selection": false
                                                },
                                                settingsMenu: false
                                            }
                                        });

                                        // Store reference for cleanup
                                        sketchWidget.current = sketch;

                                        // Add to UI
                                        mapView.current.ui.add(sketch, positionMapping[drawingToolsPosition || "topleft"] || "top-left");

                                        // Handle drawing completion
                                        sketch.on("create", (event: any) => {
                                            if (event.state === "complete") {
                                                const drawnGeometry = event.graphic.geometry;
                                                
                                                // Query features within the drawn area
                                                performSpatialQuery(drawnGeometry, map, geometryEngine, Graphic, SimpleFillSymbol);
                                            }
                                        });

                                        // Handle updates to existing drawings
                                        sketch.on("update", (event: any) => {
                                            if (event.state === "complete") {
                                                const updatedGeometry = event.graphics[0].geometry;
                                                performSpatialQuery(updatedGeometry, map, geometryEngine, Graphic, SimpleFillSymbol);
                                            }
                                        });

                                        // Function to perform spatial query
                                        const performSpatialQuery = (geometry: any, mapObj: any, geoEngine: any, GraphicClass: any, FillSymbol: any) => {
                                            const selectedFeatures: any[] = [];
                                            let totalCount = 0;

                                            // Clear previous selection if configured
                                            if (clearSelectionOnDraw && selectionLayer.graphics.length > 1) {
                                                const drawnShape = selectionLayer.graphics.getItemAt(selectionLayer.graphics.length - 1);
                                                selectionLayer.graphics.removeAll();
                                                selectionLayer.graphics.add(drawnShape);
                                            }

                                            // Highlight the selection area
                                            const selectionGraphic = selectionLayer.graphics.getItemAt(selectionLayer.graphics.length - 1);
                                            if (selectionGraphic) {
                                                selectionGraphic.symbol = new FillSymbol({
                                                    color: [51, 51, 204, 0.2],
                                                    style: "solid",
                                                    outline: {
                                                        color: [51, 51, 204],
                                                        width: 2
                                                    }
                                                });
                                            }

                                            // Query data source markers
                                            if (graphicsLayerRef.current) {
                                                graphicsLayerRef.current.graphics.forEach((graphic: any) => {
                                                    if (geoEngine.intersects(geometry, graphic.geometry)) {
                                                        selectedFeatures.push({
                                                            type: "dataSource",
                                                            attributes: graphic.attributes,
                                                            geometry: graphic.geometry
                                                        });
                                                        totalCount++;

                                                        // Highlight selected marker
                                                        const highlightGraphic = new GraphicClass({
                                                            geometry: graphic.geometry,
                                                            symbol: new SimpleMarkerSymbol({
                                                                color: [255, 255, 0],
                                                                size: 14,
                                                                outline: {
                                                                    color: [255, 0, 0],
                                                                    width: 3
                                                                }
                                                            })
                                                        });
                                                        selectionLayer.add(highlightGraphic);
                                                    }
                                                });
                                            }

                                            // Query dynamic layers
                                            mapObj.layers.forEach((layer: any) => {
                                                if (layer.type === "feature" && layer.visible) {
                                                    // Query features on client side if available
                                                    if (layer.graphics && layer.graphics.length > 0) {
                                                        layer.graphics.forEach((graphic: any) => {
                                                            if (geoEngine.intersects(geometry, graphic.geometry)) {
                                                                selectedFeatures.push({
                                                                    type: "featureLayer",
                                                                    layerTitle: layer.title,
                                                                    attributes: graphic.attributes,
                                                                    geometry: graphic.geometry
                                                                });
                                                                totalCount++;
                                                            }
                                                        });
                                                    } else {
                                                        // For server-side layers, perform query
                                                        layer.queryFeatures({
                                                            geometry: geometry,
                                                            spatialRelationship: "intersects",
                                                            returnGeometry: true,
                                                            outFields: ["*"]
                                                        }).then((result: any) => {
                                                            if (result.features.length > 0) {
                                                                result.features.forEach((feature: any) => {
                                                                    selectedFeatures.push({
                                                                        type: "featureLayer",
                                                                        layerTitle: layer.title,
                                                                        attributes: feature.attributes,
                                                                        geometry: feature.geometry
                                                                    });
                                                                });
                                                                totalCount += result.features.length;
                                                                setSelectedCount(totalCount);

                                                                // Trigger Mendix action if configured
                                                                if (onSelectionAction && selectedFeatures.length > 0) {
                                                                    handleSelectionAction(selectedFeatures);
                                                                }
                                                            }
                                                        }).catch((error: any) => {
                                                            console.error("Query failed for layer:", layer.title, error);
                                                        });
                                                    }
                                                }
                                            });

                                            // Update count and features list
                                            setSelectedCount(totalCount);
                                            setSelectedFeatures(selectedFeatures);

                                            // Trigger Mendix action if we have synchronous results
                                            if (onSelectionAction && selectedFeatures.length > 0) {
                                                handleSelectionAction(selectedFeatures);
                                            }
                                        };

                                        // Function to handle Mendix action
                                        const handleSelectionAction = (_features: any[]) => {
                                            if (onSelectionAction && onSelectionAction.canExecute) {
                                                // Convert selected features to Mendix objects if entity is configured
                                                // This would require creating Mendix objects from the features
                                                // For now, execute the action with the current context
                                                onSelectionAction.execute();
                                            }
                                        };
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
            if (sketchWidget.current) {
                sketchWidget.current.destroy();
                sketchWidget.current = null;
            }
            if (mapView.current) {
                mapView.current.destroy();
                mapView.current = null;
            }
            graphicsLayerRef.current = null;
        };
    }, [apiKey, basemap, centerLat, centerLon, zoomLevel, showZoomControls, showAttribution, dataSource, latitudeAttribute, longitudeAttribute, titleAttribute, markerColor, dynamicLayerSource, layerIdAttribute, layerUrlAttribute, layerTypeAttribute, layerTitleAttribute, layerVisibleAttribute, layerOpacityAttribute, enablePopups, enableSearch, searchStartExpanded, searchPosition, enableBasemapToggle, basemapTogglePosition, enableLegend, legendPosition, legendStartExpanded, enableLayerToggle, layerToggleStartExpanded, layerTogglePosition, enableDrawingTools, drawingToolsPosition, clearSelectionOnDraw, onSelectionAction, showFeatureList, maxFeaturesInList]);

    return (
        <div
            className={className}
            style={{
                height: widgetHeight > 0 ? `${widgetHeight}px` : "600px",
                minHeight: widgetHeight > 0 ? `${widgetHeight}px` : "600px",
                width: "100%",
                position: "relative",
                display: "block"
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
                    width: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0
                }}
            />
            {showSelectionCount && selectedCount > 0 && (
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(255, 255, 255, 0.98)",
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        fontSize: "16px",
                        color: "#333333",
                        zIndex: 1000,
                        maxWidth: showFeatureList ? "600px" : "300px",
                        maxHeight: "80vh",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.1)"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: showFeatureList ? "16px" : "0" }}>
                        <span style={{ fontWeight: "600" }}>
                            {selectedCount} feature{selectedCount !== 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={() => {
                                setSelectedCount(0);
                                setSelectedFeatures([]);
                            }}
                            style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "20px",
                                color: "#666",
                                padding: "0",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "50%",
                                transition: "background-color 0.2s"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            aria-label="Close selection"
                        >
                            ×
                        </button>
                    </div>
                    
                    {showFeatureList && selectedFeatures.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                            <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "#555" }}>
                                Feature Details:
                            </div>
                            <div style={{ maxHeight: "50vh", overflow: "auto", border: "1px solid #eee", borderRadius: "6px", padding: "12px", backgroundColor: "#fafafa" }}>
                                {selectedFeatures.slice(0, maxFeaturesInList || 10).map((feature, index) => (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            padding: "8px", 
                                            borderBottom: index < selectedFeatures.slice(0, maxFeaturesInList || 10).length - 1 ? "1px solid #f0f0f0" : "none",
                                            fontSize: "13px"
                                        }}
                                    >
                                        <div style={{ fontWeight: "600", color: "#0066cc" }}>
                                            {feature.type === "dataSource" ? "Data Point" : feature.layerTitle || "Feature"}
                                        </div>
                                        {Object.entries(feature.attributes || {}).slice(0, 3).map(([key, value]) => (
                                            <div key={key} style={{ marginTop: "2px" }}>
                                                <span style={{ color: "#666" }}>{key.replace(/_/g, ' ')}:</span> {String(value)}
                                            </div>
                                        ))}
                                        {Object.keys(feature.attributes || {}).length > 3 && (
                                            <div style={{ color: "#999", fontSize: "12px", marginTop: "2px" }}>
                                                ...and {Object.keys(feature.attributes).length - 3} more attributes
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {selectedFeatures.length > (maxFeaturesInList || 10) && (
                                    <div style={{ padding: "8px", textAlign: "center", color: "#999", fontSize: "12px" }}>
                                        Showing {maxFeaturesInList || 10} of {selectedFeatures.length} features
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
