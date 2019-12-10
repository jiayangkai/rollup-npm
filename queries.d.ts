import { BatchTimeseriesQuery, MetricQuery, WebAPIClient } from './WebAPIClient';
import { GeoSpec, Value } from './WebConfig';
interface I18n {
    [lang: string]: string;
}
interface InternationalizedLabel {
    i18n: I18n;
}
declare type ALabel = string | InternationalizedLabel;
export declare function getLabel(label: ALabel, locale: string): string;
export interface AnnotatedMetricSpec {
    name: ALabel;
    valueType: string;
    ['default-stats']: string;
    querySpecs: {
        timeseries: {
            [scope: string]: any;
        };
    };
    note: ALabel;
    timezone: string;
    decimal: number;
    unit: ALabel;
    category: string | string[];
    axis?: string | undefined | null;
    axisValue?: string | undefined | null;
    domain?: string | undefined | null;
    metric?: string | undefined | null;
    categoryList?: string[];
}
export interface FieldSpec {
    name: ALabel;
    note: ALabel;
    decimal: number;
    unit: ALabel;
}
export interface ObjectSpec {
    axis?: {
        [axisName: string]: string[];
    };
    class?: Array<{
        i18n?: I18n;
        fqn: string;
    }>;
    name: string;
}
interface AnnotatedWebAPIConfig {
    geoSubLevels: string[];
    metricSpecs: {
        [metricName: string]: AnnotatedMetricSpec;
    };
    geoLevels: string[];
    fieldSpecs: {
        [domain: string]: {
            [category: string]: {
                [metric: string]: FieldSpec;
            };
        };
    };
}
export declare function annotatedWebConfig(webApiURL: string, config: AnnotatedWebAPIConfig | null, mapStruct: any, webApiClient: WebAPIClient): Promise<AnnotatedWebConfig>;
export declare function globalConfig(webApiURL?: string, config?: AnnotatedWebAPIConfig | null, mapStruct?: any, webApiClient?: WebAPIClient): Promise<AnnotatedWebConfig>;
export interface TimeseriesDataPoint {
    timestamp: number;
    value: Value;
    sum?: number;
}
export declare class AnnotatedWebConfig {
    private config;
    private readonly mapStruct;
    private client;
    private webConfig;
    constructor(config: AnnotatedWebAPIConfig, mapStruct: any, client: WebAPIClient);
    filterMetrics(metricType: string, geoLevels: string[], axis: string, axisValues: string[], domain: string, categories: string[], metrics: string[], resolution: string): {
        [metricName: string]: AnnotatedMetricSpec;
    };
    getGeoSpecFromGeoNotation(notation: string): GeoSpec;
    getGeoNotationFromGeoSpec(geoSpec: GeoSpec): string;
    getGeoLevels(geoSpec: GeoSpec): string[];
    /**
     * 获取完整的geo层级
     *
     * @returns {string[]}
     * @memberof AnnotatedWebConfig
     */
    getGeoRootLevels(): string[];
    /**
     * 获取顶级组织下的子geo层级，即不包含enterprise
     *
     * @returns {string[]}
     * @memberof AnnotatedWebConfig
     */
    getGeoSubLevels(): string[];
    getMapStruct(): any;
    json2array(): {
        level: string;
        geo: any;
        class: any;
        i18n: any;
        sub: any[];
        process: any;
    }[];
    /**
     *
     * @param queries
     * [{from: 1539129600000
     *  geo: "zb_e"
     *  id: "process$blast_furnance.Consumption.oxygen"
     *  metricType: "timeseries"
     *  name: "process$blast_furnance.Consumption.oxygen"
     *  period: "1h"
     *  to: 1547388445646}]
     *
     *  @return
     */
    timeseries(queries: MetricQuery[]): Promise<Array<{
        id: string;
        data: TimeseriesDataPoint[];
    }>>;
    /**
     * @param domain
     * @param filter -- a string or an array of strings (for multiple disjuncts)
     * @param id -- an array of strings
     *
     */
    search(domain: string, filter: string[], id: string[], _options?: object): Promise<{
        [domain: string]: any;
        id: string;
    }[]>;
    /**
     * 修改整个模型对象或新建模型对象
     * 注意会整体覆盖，所以需要将原有属性保留 { ...originalValue,newValue }
     * Creates or updates object with specified domain data.
     * @param objectId object id
     * @param scope equipment object id, ie "zb_e|rolling_f1|bar_w1|bar_l1" . instruction has no scope,so should be set null
     * @param domain domain, mixin type, ie "Target","steel___OxygenPipelineInstruction"
     * @param data data, mixin value,ie {state:'accepted'}
     * @result
     *
     */
    createOrUpdateEntity(objectId: string, scope: string, domain: string, data: object, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Return the array of tuples (key, value) where X <= key < Y
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param from lower bound of the key 值必须可以计算
     * @param to upper bound of the key
     */
    getMapValues(id: string, domain: string, name: string, from: string, to: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Returns key value
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     */
    getMapValue(id: string, domain: string, name: string, key: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    /**
     * 模型对象必须存在，否则先用createOrUpdateEntity()创建
     * 给模型对象添加一个自定义的属性（若无）${name},值为[ ...  {  key:${key}, value:${value} } ... ],value可以为任意类型。key推荐为连续的值，如时间戳，方便查询。
     * 如果指定的属性存在，则数组新增一个value对象。key的值必须不同，否则会返回500错误。
     * 如果需要修改指定key对应的value，使用 editMapValue api。
     * Add the value to the customized or specified field of map
     * @param id : object id  ie  instruction ID:  "zb_e|oxygen_p1|oxygen_p1_1552357589",
     * @param domain : domain, mixin type,    ie "Target" , "steel___OxygenPipelineInstruction"
     * @param name : name of filed gonna to add/modify     ie: actions
     * @param key : key to new data
     * @param value : value is either a primitive type or a object
     * @example
     window._config.addValueToMap(
     "zb_e|oxygen_p1|oxygen_p1_1552444028",      // instruction ID
     "steel___OxygenPipelineInstruction",        // domain
     "actions",                                  // customized field name
     `${new Date().getTime()}`,      // used as new entry ID; recommend to use timestamp for uniqueness and ordering.
     { user:"iron_f1",log: "changed state from new to accepted" }
     )
     result:{
            id: "zb_e|oxygen_p1|oxygen_p1_1552444028"
            steel___OxygenPipelineInstruction:{
                actions:[{
                    key: "1552444095543"
                    value: {user: "iron_f1",log: "changed state from new to accepted" }
                }]
            }
        }
     */
    addValueToMap(id: string, domain: string, name: string, key: string, value: any, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Edit the value in the map
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     * @param value the value is either a primitive type or a document
     */
    editMapValue(id: string, domain: string, name: string, key: string, value: any, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Delete the map value
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     */
    deleteMapValue(id: string, domain: string, name: string, key: string, _options?: object): Promise<import("axios").AxiosResponse<any>>;
    /**
     * Retrieves domain data from object.
     * @param objectId object id，ie:'zb_e|oxygen_p1|oxygen_p1_1552357589'
     * @param domain domain/mixin type, ie:"steel___OxygenPipelineInstruction"
     */
    getObjectDomain(objectId: string, domain: string, _options?: object): Promise<any>;
    /**
     *
     *  @return
     */
    timeseriesBatch(queries: BatchTimeseriesQuery[], _options?: object): Promise<Array<{
        [name: string]: TimeseriesDataPoint[];
    }>>;
    /**
     *
     *  @return
     */
    timeseriesMultiBatch(queries: BatchTimeseriesQuery[], noPrune?: boolean, _options?: object): Promise<{
        [name: string]: TimeseriesDataPoint[];
    }>;
    /**
     * Find objects specified by the filter. If filter element is null, skip this element
     *
     */
    findObjects({ classes, }: {
        classes?: string[];
    }): Array<{
        key: GeoSpec;
        spec: ObjectSpec;
    }>;
    isInstance(obj: GeoSpec, cls: string): boolean;
    getSources(obj: GeoSpec, relationType: string): Array<{
        key: GeoSpec;
        spec: ObjectSpec;
    }>;
    getDestinations(obj: GeoSpec, relationType: string): Array<{
        key: GeoSpec;
        spec: ObjectSpec;
    }>;
    private _findObjects;
    private _findObjectsByRelation;
    private _findObjectByGeoNotation;
    private _findObjectByGeoSpec;
}
export declare function aggregateTimeseries(timeseries: TimeseriesDataPoint[][]): TimeseriesDataPoint[];
export {};
/**
 *  process$blast_furnance.Consumption.oxygen as follows:
 * {
 * "category":"Gas",
 * "name":{"i18n":{"zh-CN":"氧气","en-US":"Oxygen"}},
 * "valueType":"number:statistics",
 * "default-stats":"avg",
 * "querySpecs":{
 *      "timeseries":{
 *          "enterprise":{
 *              "periods":["1h"],
 *              "factory":{
 *                  "workshop":{
 *                      "line_shift":{
 *                          "periods":["1h"],
 *                          "equipment_product":{"periods":["1h"]}
 *                          },
 *                       "periods":["1h"]
 *                   },
 *                   "periods":["1h"]}
 *              }
 *        }
 *   },
 *  "note":{"i18n":{"zh-CN":"氧气消耗量","en-US":"Oxygen Consumption"}},
 *  "timezone":"UTC",
 *  "decimal":3,
 *  "unit":"m³",
 *  "axis":"process",
 *  "axisValue":"blast_furnance",
 *  "domain":"Consumption",
 *  "metric":"oxygen"
 *  }
 */
