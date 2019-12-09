export interface MetricQuery {
    metricType: string;
    name: string;
    geo: string;
    from?: number;
    to?: number;
    time?: number;
    period: string;
    value?: string;
    id?: string;
}
export interface BatchTimeseriesQuery {
    names: {
        [mid: string]: string;
    };
    geo: string;
    from: number;
    to: number;
    period: string;
}
export interface DataPoint {
    name: string;
    value: {
        sum: number;
        cnt: number;
        min: number;
        max: number;
        stddev: number;
    };
}
export declare class WebAPIClient {
    baseURL: string;
    constructor(baseURL: string);
    /**
     * Query parameters:
     *
     * metricType -- (required) one of timeseries, snapshot
     * name -- (required) metric name
     * geo -- (required) encoded geo filter (e.g. China|Beijing|...)
     * from -- for timeseries: timestamp to start with (in milliseconds)
     * to -- for timeseries: timestamp to end with (in milliseconds)
     * time -- for snapshots: timestamp to query (in milliseconds); time will be moved to the boundary of the aggregation period
     * period -- (required) aggregation period (1s, 15s, 1min, 5min, 1h, 1d, 1w)
     * value -- the distribution parameter for snapshot queries (e.g. in vkey:metric for skey by period value is vkey)
     * id -- used to correlate the requests with the chart plots
     * ref -- request sequence number
     * periodicity -- ???
     * periodicSeq -- ???
     *
     * @param queries metric queries
     *
     * @return promise which result is array of metrics data
     */
    getData(queries: MetricQuery[], _options?: object): Promise<any[]>;
    _constructBatchFuture(multimetricURI: string, queryParams: any, _options: object): Promise<{
        [name: string]: DataPoint[];
    }>;
    getTimeseriesBatch(queries: BatchTimeseriesQuery[], _options?: object): Promise<{
        [name: string]: DataPoint[];
    }[]>;
    /**
     * Query historic data for multiple geos, intervals and periods
     * in a single request using the multimetric `.batches` extension.
     *
     * @param queries the array of query requests. Each request contains
     *   a mapping of metric ID to a metric name to query for the given combination
     *   of geo and interval
     * @returns the promise of the dict which contains combined mapping
     *   of metric IDs to the data point arrays. When input batch requests
     *   contain the same metric ID, the behavior is undetermined
     */
    getTimeseriesMultiBatch(queries: BatchTimeseriesQuery[], noPrune?: boolean, _options?: object): Promise<{
        [name: string]: DataPoint[];
    }>;
    getConfig: (this: WebAPIClient, _options?: object) => Promise<import("axios").AxiosResponse<any>>;
    getGeoStruct(_options?: object): Promise<import("axios").AxiosResponse<any>>;
    getDevicesByGeo(geoSpec: any, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    getDeviceMetadata(deviceId: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    getBinaryObjectURL(collection: string, key: string): Promise<string>;
    /**
     * filter -- a string or an array of strings (for multiple disjuncts)
     * id -- an array of strings
     *
     * Returns a promise of:
     *
     * [
     *   {
     *      "id": ...,
     *      "<domain>": {
     *          ...
     *      }
     *   }
     * ]
     */
    search(domain: string, filter: string[], id: string[], _options?: object): Promise<{
        id: string;
        [domain: string]: any;
    }[]>;
    createOrUpdateEntity(objId: string, scope: string, domain: string, data: object, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    getObjectDomain(objId: string, domain: string, _options?: object): Promise<any>;
    getMapValues(id: string, domain: string, name: string, from: string, to: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    getMapValue(id: string, domain: string, name: string, key: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    addValueToMap(id: string, domain: string, name: string, key: string, value: any, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    editMapValue(id: string, domain: string, name: string, key: string, value: any, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    deleteMapValue(id: string, domain: string, name: string, key: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
}
