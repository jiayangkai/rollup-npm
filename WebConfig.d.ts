import { MetricQuery, WebAPIClient } from "./WebAPIClient";
export declare function webConfig(webApiURL?: string, config?: any, mapStruct?: any, webApiClient?: any): Promise<WebConfig>;
interface Viewport {
    plotType: string;
    options: any;
    metrics: any[];
    categories: {
        name: string;
    };
    periods: string[];
    geoSpecs: string[];
}
interface Metric {
    name: string;
}
export interface GeoSpec {
    [name: string]: string;
}
export declare class WebConfig {
    private config;
    protected mapStruct: any;
    private webApiClient;
    constructor(config: any, mapStruct: any, webApiClient: WebAPIClient);
    timeseries(plots: {
        plotName: string;
        metricName: string;
        type?: string;
    }[], locale?: string): PlotSet;
    getData(queries: MetricQuery[], _options?: object): Promise<any[]>;
    search(domain: string, filter: string[], id: string[], _options?: object): Promise<{
        [domain: string]: any;
        id: string;
    }[]>;
    forPlotType(viewport: Viewport, plotTypes: string[]): boolean;
    getMetricUsage_(viewport: Viewport): "asCategory" | "normal";
    getValidMetricTypes_(viewport: Viewport, metric: Metric): string[];
    getGeoSpecFromGeoNotation(notation: string): GeoSpec;
    isGeoFieldEmpty(field: string): boolean;
    getGeoNotationFromGeoSpec(geoSpec: GeoSpec): string;
    createOrUpdateEntity(objId: string, scope: string, domain: string, data: object, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    getObjectDomain(objId: string, domain: string, _options?: object): Promise<any>;
    getMapValues(id: string, domain: string, name: string, from: string, to: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    getMapValue(id: string, domain: string, name: string, key: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    addValueToMap(id: string, domain: string, name: string, key: string, value: any, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    editMapValue(id: string, domain: string, name: string, key: string, value: any, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    deleteMapValue(id: string, domain: string, name: string, key: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
}
export interface Value {
    cnt: number;
    sum: number;
    stddev: number;
    min: number;
    max: number;
}
export interface DataPoint {
    name: string;
    value: Value;
}
export declare class PlotSet {
    private webConfig;
    private plotConfig;
    private viewport;
    protected locale: string;
    protected lastQuery: any;
    constructor(webConfig: WebConfig, plotConfig: any, viewport: Viewport, locale?: string);
    select(plotName: string | string[], geoSpec: string, period: string): this;
    aggregate(plotName: string, aggType: string): this;
    _get_aggFunction(aggType: string): ((entry: DataPoint) => number);
    getValueKey(geoNotation: string): Error | string;
    query({ from, to, time, area }: {
        from?: number;
        to?: number;
        time?: number;
        area?: any;
    }): Promise<QueryResult>;
}
export declare class QueryResult {
    private plotSet;
    private from;
    private to;
    private time;
    private area;
    private data;
    constructor(plotSet: PlotSet, { from, to, time, area }: {
        from?: number;
        to?: number;
        time?: number;
        area?: string;
    }, data: (Timeseries | Snapshot)[]);
    timeseries(index: number): Timeseries;
    snapshot(index: number): Snapshot;
    repeat({ from, to, time, area }: {
        from?: number;
        to?: number;
        time?: number;
        area?: any;
    }): any;
}
interface TimeseriesDataPoint {
    date: number;
    value: number;
}
declare class Timeseries {
    private data;
    constructor(data: TimeseriesDataPoint[]);
    getData(): TimeseriesDataPoint[];
}
interface SnapshotDataPoint {
    name: string;
    value: number;
}
declare class Snapshot {
    private data;
    constructor(data: SnapshotDataPoint[]);
    getData(): SnapshotDataPoint[];
}
export {};
