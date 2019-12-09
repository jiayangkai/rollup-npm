/* !
  * library v1.3.0-alpha.1
  * https://github.com/  (github address)
  *
  * (c) 2019 AuthorName
  */

'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var _ = require('lodash');

const codeMessage = {
    200: "服务器成功返回请求的数据。",
    201: "新建或修改数据成功。",
    202: "一个请求已经进入后台排队（异步任务）。",
    204: "删除数据成功。",
    400: "发出的请求有错误，服务器没有进行新建或修改数据的操作。",
    401: "用户没有权限（令牌、用户名、密码错误）。",
    403: "用户得到授权，但是访问是被禁止的。",
    404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
    406: "请求的格式不可得。",
    410: "请求的资源被永久删除，且不会再得到的。",
    422: "当创建一个对象时，发生一个验证错误。",
    500: "服务器发生错误，请检查服务器。",
    502: "网关错误。",
    503: "服务不可用，服务器暂时过载或维护。",
    504: "网关超时。"
};
// axios.defaults.timeout = 5000;
axios.defaults.baseURL = "../";
axios.defaults.headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    cache: false,
};
class CustomError extends Error {
    constructor(msg, url, method, status) {
        super(msg);
        this.url = url;
        this.method = method;
        this.status = status;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}
/**
 * 封装axios调用
 * @param opts
 */
const request = opts => {
    return axios(opts)
        //@ts-ignore
        .then(res => {
        if (res.status >= 200 && res.status < 300) {
            return res;
        }
    })
        .catch(err => {
        const res = err.response;
        if (!res) {
            const message = err.message;
            console.log(`%c *${opts.method.toUpperCase()} ${opts.url}* 请求未正确发送, 错误如下: `, "background: #222; color: #fff; font-weight: bold;");
            console.log(message);
            throw new CustomError(message, opts.url, opts.method, opts.status);
        }
        else {
            const message = codeMessage[res.status] || res.statusText;
            console.log(`%c *${opts.method.toUpperCase()} ${opts.url}* 请求失败, 响应如下:`, "background: #222; color: #bada55; font-weight: bold;");
            console.log(res);
            throw new CustomError(message, opts.url, opts.method, opts.status);
        }
    });
};
class Axios {
    static get(url, queries, _options) {
        return request({
            method: "get",
            url,
            params: queries,
            ..._options
        });
    }
    static post(url, data, _options) {
        return request({
            method: "post",
            url,
            data,
            ..._options
        });
    }
    static put(url, data, _options) {
        return request({
            method: "put",
            url,
            data,
            ..._options
        });
    }
    static delete(url, _options) {
        return request({
            method: "delete",
            url,
            ..._options
        });
    }
}

// Thingswise Analytic Platform
class WebAPIClient {
    constructor(baseURL) {
        this.getConfig = function (_options) {
            const getConfigURI = 'api/config';
            return Axios.get(getConfigURI, null, {
                baseURL: this.baseURL,
                ..._options
            });
        };
        this.baseURL = baseURL || '../';
    }
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
    getData(queries, _options) {
        const getDataURI = 'api/view/metric/';
        // return Promise.all(queries.map((q) => {
        //     return Axios.get(getDataURI, {
        //       ...q
        //     }, {
        //       baseURL: this.baseURL,
        //       ..._options
        //     })
        // }))
        return queries.reduce((prev, q) => {
            return prev.then((p) => {
                return Axios.get(getDataURI, {
                    ...q
                }, {
                    baseURL: this.baseURL,
                    ..._options
                }).then((r) => {
                    p.push(r);
                    return p;
                });
            });
        }, Promise.resolve([]));
    }
    _constructBatchFuture(multimetricURI, queryParams, _options) {
        return Axios.post(multimetricURI, {
            ...queryParams,
        }, {
            baseURL: this.baseURL,
            ..._options
        }).then(response => {
            const { data } = response.data;
            const result = {};
            for (const mid in data) {
                result[data[mid].name] = data[mid].data;
            }
            return result;
        });
    }
    getTimeseriesBatch(queries, _options) {
        const multimetricURI = 'api/view/multimetric/';
        const futures = [];
        for (const query of queries) {
            const queryParams = {
                metricType: 'timeseries',
                geo: query.geo,
                from: query.from,
                to: query.to,
                period: query.period,
                names: query.names,
            };
            if (Object.keys(queryParams.names).length == 0) {
                futures.push(Promise.resolve({}));
            }
            else {
                futures.push(this._constructBatchFuture(multimetricURI, queryParams, _options));
            }
        }
        return Promise.all(futures);
    }
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
    getTimeseriesMultiBatch(queries, noPrune = false, _options) {
        const multimetricURI = 'api/view/multimetric/';
        return Axios.post(multimetricURI, {
            metricType: 'timeseries',
            batches: queries,
            noPrune
        }, {
            baseURL: this.baseURL,
            ..._options
        }).then(response => {
            const { data } = response.data;
            const result = {};
            for (const mid in data) {
                result[mid] = data[mid].data;
            }
            return result;
        });
    }
    getGeoStruct(_options) {
        const getConfigURI = 'api/geo/struct';
        return Axios.get(getConfigURI, null, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    getDevicesByGeo(geoSpec, _options) {
        const getDevicesByGeoURI = 'api/geo/device';
        return Axios.get(getDevicesByGeoURI, geoSpec, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    getDeviceMetadata(deviceId, _options) {
        const getDeviceMetadataURI = 'api/device';
        return Axios.get(getDeviceMetadataURI, { deviceId }, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    getBinaryObjectURL(collection, key) {
        return Promise.resolve(this.baseURL + 'api/store/' + collection + '/' + key);
    }
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
    search(domain, filter, id, _options) {
        const searchURI = 'api/search/' + domain;
        return Axios.get(searchURI, {
            filter,
            id: id ? id.join(',') : null,
        }, {
            baseURL: this.baseURL,
            ..._options
        }).then((d) => d.data);
    }
    createOrUpdateEntity(objId, scope, domain, data, _options) {
        const createObjectWithMixinURI = 'api/entity/' + objId;
        return Axios.post(createObjectWithMixinURI, { mixinType: domain, mixin: data, scope: scope }, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    getObjectDomain(objId, domain, _options) {
        const getObjectMixinURI = 'api/entity/' + objId + '/' + domain;
        return Axios.get(getObjectMixinURI, null, {
            baseURL: this.baseURL,
            ..._options
        }).then((d) => d.data);
    }
    getMapValues(id, domain, name, from, to, _options) {
        const url = 'api/entity/' + id + '/' + domain + '/map/' + name;
        return Axios.get(url, { from, to }, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    getMapValue(id, domain, name, key, _options) {
        const url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.get(url, null, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    addValueToMap(id, domain, name, key, value, _options) {
        const url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.post(url, { value }, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    editMapValue(id, domain, name, key, value, _options) {
        const url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.put(url, { value }, {
            baseURL: this.baseURL,
            ..._options
        });
    }
    deleteMapValue(id, domain, name, key, _options) {
        const url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.delete(url, {
            baseURL: this.baseURL,
            ..._options
        });
    }
}

function getLabel(label, locale = "en-US") {
    if (!label) {
        return "";
    }
    if (typeof label === "string") {
        return label;
    }
    if (label["i18n"]) {
        if (label["i18n"][locale]) {
            return label["i18n"][locale];
        }
        if (label["i18n"]["en-US"]) {
            return label["i18n"]["en-US"];
        }
        // try to find first non-empty value
        const mbLabel = Object.keys(label["i18n"]).find((e) => { return Boolean(label["i18n"][e]); });
        return mbLabel ? mbLabel : "";
    }
    return "" + label;
}
class WebConfig {
    constructor(config, mapStruct, webApiClient) {
        this.config = config;
        this.mapStruct = mapStruct;
        this.webApiClient = webApiClient;
    }
    timeseries(plots, locale = "en-US") {
        const metricSpecs = this.config.metricSpecs || {};
        const plotConfig = {};
        const viewport = {
            "plotType": "timeseries",
            "options": {
                "timeseries": (this.config.defaultPlotOptions !== undefined ?
                    _.cloneDeep(this.config.defaultPlotOptions["timeseries"] || {}) : {})
            },
            "metrics": [],
            "categories": {
                "name": "geo" // or "metric" ???
            },
            "periods": [
                "1s"
            ],
            "geoSpecs": null
        };
        let index = 0;
        plots.forEach(({ plotName, metricName, type = "y-axis values" }) => {
            const metricSpec = metricSpecs[metricName];
            if (metricSpec) {
                if (plotConfig["yLabel"] === undefined) {
                    plotConfig["yLabel"] = getLabel(metricSpec["unit"], locale);
                }
                if (plotConfig["timezone"] === undefined) {
                    plotConfig["timezone"] = metricSpec["timezone"];
                }
                plotConfig[type] = plotConfig[type] || {};
                plotConfig[type][plotName] = {
                    "usedAs": type,
                    "decimal": metricSpec["decimal"] || 0,
                    "unit": getLabel(metricSpec["unit"], locale),
                    "name": getLabel(metricSpec["name"], locale),
                    "index": index++,
                    "__stats": metricSpec["default-stats"]
                };
                viewport["metrics"].push({
                    "id": plotName,
                    "periods": [],
                    "geoSpecs": [""],
                    "name": metricName,
                    "metricType": "timeseries"
                });
            }
            else {
                throw new Error(`Unknown metric ${metricName}`);
            }
        });
        return new PlotSet(this, plotConfig, viewport, locale);
    }
    getData(queries, _options) {
        return this.webApiClient.getData(queries, _options);
    }
    search(domain, filter, id, _options) {
        return this.webApiClient.search(domain, filter, id, _options);
    }
    forPlotType(viewport, plotTypes) {
        for (let i = 0; i < plotTypes.length; i++) {
            if (viewport && viewport.plotType === plotTypes[i]) {
                return true;
            }
        }
        return false;
    }
    getMetricUsage_(viewport) {
        if (this.forPlotType(viewport, ['barchart', 'hbarchart', 'piechart']) &&
            viewport.categories != null && viewport.categories.name === 'metric') {
            return 'asCategory';
        }
        else {
            return 'normal';
        }
    }
    getValidMetricTypes_(viewport, metric) {
        const metricName = (metric) ? metric.name : (viewport.metrics[0] ? viewport.metrics[0].name : null);
        if (metricName == null) {
            console.error("null metric name");
            return [];
        }
        const metricSpec = this.config.metricSpecs[metricName];
        // new
        if (_.isEmpty(this.config.plotTypes[viewport.plotType]) ||
            _.isEmpty(this.config.plotTypes[viewport.plotType].metricUsage)) {
            console.error("invalid plotType: " + viewport.plotType);
            return [];
        }
        const metricUsage = this.getMetricUsage_(viewport);
        const valueTypes = this.config.plotTypes[viewport.plotType].metricUsage[metricUsage];
        if (_.isEmpty(valueTypes)) {
            console.log('empty value types for: ' + viewport.plotType + '.' + metricUsage);
            return [];
        }
        const metricTypes = this.config.plotTypes[viewport.plotType].metricUsage[metricUsage][metricSpec.valueType];
        if (_.isEmpty(metricTypes)) {
            console.log('empty valueType spec for: ' + viewport.plotType + '.' + metricUsage + '.' + metricSpec.valueType);
            return [];
        }
        const metricTypeArr = [];
        metricTypes.forEach(function (mt) {
            if (!_.isEmpty(metricSpec.querySpecs[mt])) {
                metricTypeArr.push(mt);
            }
        });
        if (_.isEmpty(metricTypeArr)) { // shouldn't happen
            console.log('metric ' + metricName + ' has no matching metric type ' + metricTypes[0]);
        }
        return metricTypeArr;
    }
    getGeoSpecFromGeoNotation(notation) {
        if (_.isEmpty(notation)) {
            throw new Error('unexpected empty geo notation');
        }
        const geoFields = notation.split(this.config.geoDelimiter);
        const fieldLen = geoFields.length;
        const struct = {};
        const that = this;
        this.config.geoLevels.forEach(function (level, index) {
            if (fieldLen > index && !that.isGeoFieldEmpty(geoFields[index])) {
                struct[level] = geoFields[index];
            }
            else {
                struct[level] = '';
            }
        });
        return struct;
    }
    isGeoFieldEmpty(field) {
        return _.isEmpty(field) || field === 'none';
    }
    getGeoNotationFromGeoSpec(geoSpec) {
        if (_.isEmpty(geoSpec)) {
            console.warn('unexpected empty geo spec');
            return "";
        }
        const geoArr = [];
        let that = this;
        this.config.geoLevels.some(function (level) {
            if (!that.isGeoFieldEmpty(geoSpec[level])) {
                geoArr.push(geoSpec[level]);
                return false;
            }
            else {
                return true;
            }
        });
        return geoArr.join(this.config.geoDelimiter);
    }
    createOrUpdateEntity(objId, scope, domain, data, _options) {
        return this.webApiClient.createOrUpdateEntity(objId, scope, domain, data, _options);
    }
    getObjectDomain(objId, domain, _options) {
        return this.webApiClient.getObjectDomain(objId, domain, _options);
    }
    getMapValues(id, domain, name, from, to, _options) {
        return this.webApiClient.getMapValues(id, domain, name, from, to, _options);
    }
    getMapValue(id, domain, name, key, _options) {
        return this.webApiClient.getMapValue(id, domain, name, key, _options);
    }
    addValueToMap(id, domain, name, key, value, _options) {
        return this.webApiClient.addValueToMap(id, domain, name, key, value, _options);
    }
    editMapValue(id, domain, name, key, value, _options) {
        return this.webApiClient.editMapValue(id, domain, name, key, value, _options);
    }
    deleteMapValue(id, domain, name, key, _options) {
        return this.webApiClient.deleteMapValue(id, domain, name, key, _options);
    }
}
class PlotSet {
    constructor(webConfig, plotConfig, viewport, locale = "en-US") {
        this.webConfig = webConfig;
        this.plotConfig = plotConfig;
        this.viewport = viewport;
        this.locale = locale;
        this.lastQuery = null;
    }
    select(plotName, geoSpec, period) {
        if (_.isArray(plotName)) {
            const that = this;
            plotName.forEach((name) => {
                that.select(name, geoSpec, period);
            });
            return that;
        }
        if (!this.viewport["metrics"].some((metric) => {
            if (metric["id"] === plotName) {
                metric["periods"] = [period];
                metric["geoSpecs"] = [geoSpec];
                this.viewport["geoSpecs"] = [geoSpec];
                return true;
            }
            return false;
        })) {
            throw new Error(`Unknown plot ${plotName}`);
        }
        return this;
    }
    aggregate(plotName, aggType) {
        if (this.viewport.plotType === "timeseries") {
            for (var type in this.plotConfig) {
                var plot = this.plotConfig[type][plotName];
                if (plot) {
                    plot["__stats"] = aggType;
                    return this;
                }
            }
            throw new Error(`Unknown plot ${plotName}`);
        }
        else if (this.viewport.plotType === "geomap") {
            if (["color", "area"].some((type) => {
                if (this.plotConfig[type]["__plot_name"] === plotName) {
                    this.plotConfig[type]["__stats"] = aggType;
                    return true;
                }
                return false;
            })) {
                return this;
            }
            throw new Error(`Unknown plot ${plotName}`);
        }
        else {
            throw new Error(`Unsupported plot type ${this.viewport.plotType}`);
        }
    }
    _get_aggFunction(aggType) {
        let aggFunction;
        if (aggType === "avg" || aggType === "val") {
            aggFunction = (entry) => {
                if (entry.value.cnt === 0) {
                    return 0;
                }
                else {
                    return entry.value.sum / entry.value.cnt;
                }
            };
        }
        else if (aggType === "sum") {
            aggFunction = (entry) => {
                return entry.value.sum;
            };
        }
        else if (aggType === "cnt") {
            aggFunction = (entry) => {
                return entry.value.cnt;
            };
        }
        else if (aggType === "stddev") {
            aggFunction = (entry) => {
                return entry.value.stddev;
            };
        }
        else {
            console.warn(`Unknown aggregation type ${aggType}`);
            aggFunction = null;
        }
        return aggFunction;
    }
    getValueKey(geoNotation) {
        if (this.viewport.plotType === "geomap") {
            // TODO
            throw Error("Not supported" + geoNotation);
        }
        return "";
    }
    query({ from = 0, to = 0, time = 0, area = null }) {
        try {
            const queries = this.viewport["metrics"].map((m) => {
                if (m.geoSpecs.length <= 0) {
                    throw new Error(`geo not set for ${m.name}`);
                }
                if (m.periods.length <= 0) {
                    throw new Error(`period not set for ${m.name}`);
                }
                return {
                    from: from,
                    to: to,
                    time: time,
                    value: area ? this.getValueKey(area) : this.getValueKey(m.geoSpecs[0]),
                    geo: area || m.geoSpecs[0],
                    id: m.id,
                    metricType: m.metricType,
                    name: m.name,
                    period: m.periods[0],
                    ref: m.ref
                };
            });
            const that = this;
            return this.webConfig.getData(queries).then((dataBundles) => {
                this.lastQuery = { from, to, time, area };
                return new QueryResult(that, { from, to, time, area }, dataBundles.map((data) => {
                    if (data.metricType === "timeseries") {
                        console.log(data);
                        console.log(that.plotConfig);
                        if (that.viewport.plotType === "timeseries") {
                            for (var type in that.plotConfig) {
                                if (!that.plotConfig[type] || !that.plotConfig[type][data.id]) {
                                    continue;
                                }
                                const aggType = that.plotConfig[type][data.id]["__stats"];
                                var aggFunction = this._get_aggFunction(aggType);
                                if (aggFunction == null) {
                                    throw new Error(`Unknown aggregation type for plot ${data.id}`);
                                }
                                return new Timeseries(data.data.map((entry) => {
                                    return {
                                        date: Number(entry.name) * 1000.,
                                        value: aggFunction(entry)
                                    };
                                }));
                            }
                            throw new Error(`Unknown plot id ${data.id}`);
                        }
                        throw new Error(`Unsupported viewport type ${that.viewport.plotType} for metric ${data.metricType}`);
                    }
                    else if (data.metricType === "snapshot") {
                        if (that.viewport.plotType === "geomap") {
                            const type = ["area", "color"].find((type) => {
                                return data.id in that.plotConfig[type];
                            });
                            if (type) {
                                const aggType = that.plotConfig[type][data.id]["__stats"];
                                var aggFunction = this._get_aggFunction(aggType);
                                if (aggFunction == null) {
                                    throw new Error(`Unknown aggregation type for plot ${data.id}`);
                                }
                                return new Snapshot(data.data.map((entry) => {
                                    return {
                                        name: entry.name,
                                        value: aggFunction(entry)
                                    };
                                }));
                            }
                            throw new Error(`Unknown plot id ${data.id}`);
                        }
                        throw new Error(`Unsupported viewport type ${that.viewport.plotType} for metric ${data.metricType}`);
                    }
                    throw new Error(`Metric type ${data.metricType} not supported`);
                }));
            });
        }
        catch (e) {
            return Promise.reject(e);
        }
    }
}
class QueryResult {
    constructor(plotSet, { from = 0, to = 0, time = 0, area = null }, data) {
        this.plotSet = plotSet;
        this.from = from;
        this.to = to;
        this.time = time;
        this.area = area;
        this.data = data;
    }
    timeseries(index) {
        if (this.data[index] instanceof Timeseries) {
            return this.data[index];
        }
        throw new Error("Incompatible data bundle type");
    }
    snapshot(index) {
        if (this.data[index] instanceof Snapshot) {
            return this.data[index];
        }
        throw new Error("Incompatible data bundle type");
    }
    repeat({ from = -1, to = -1, time = -1, area = null }) {
        return this.plotSet.query({
            from: from >= 0 ? from : this.from,
            to: to >= 0 ? to : this.to,
            time: time >= 0 ? time : this.time,
            area: area !== null ? area : this.area
        });
    }
}
class Timeseries {
    constructor(data) {
        this.data = data;
    }
    getData() {
        return this.data;
    }
}
class Snapshot {
    constructor(data) {
        this.data = data;
    }
    getData() {
        return this.data;
    }
}

// 组织或设备名与geo信息对照表
// 各应用根据组织或设备名获取指定的geo
const GeoStructObj = {};
const property = '_config';
const env = global ? global : window;
/**
 * 初始化GeoStructObj
 *
 * @export
 * @param {*} struct
 * @param {string[]} levels
 * @returns {GeoStruct}
 */
function setGeoStruct(struct, levels) {
    let geoLevels = levels.slice();
    // 全局geo信息未初始化，且存在指定层级，且存在对应层级信息
    if (geoLevels && Array.isArray(geoLevels) && geoLevels.length > 0) {
        const level = geoLevels.shift();
        if (Object.prototype.hasOwnProperty.call(struct, level)) {
            const obj = struct[level];
            if (obj) {
                // 循环当前层级的每项组织或设备
                Object.keys(obj).forEach(key => {
                    const tmp = obj[key];
                    const className = tmp.class[0].fqn;
                    GeoStructObj[tmp.name] = {
                        geo: _getGeoByClass(className, tmp.name),
                        class: tmp.class.map(item => item.fqn),
                        level,
                        name: { en: tmp.name, cn: tmp.i18n['zh-CN'] },
                    };
                    // 存在下级则递归
                    setGeoStruct(tmp, geoLevels.slice());
                });
            }
        }
    }
}
/**
*根据指定组织结构层级和类型（组织或设备）拼接geo
*
* @private
* @param {string} className 类名
* @param {string} name 设备名
* @returns
*/
function _getGeoByClass(className, name) {
    if (className && className.length > 0) {
        const arr = env[property].findObjects({ classes: [className] });
        // 查找指定设备
        const geoObj = arr.find(item => item.spec.name === name);
        // 存在设备
        if (geoObj) {
            // 获取完整geo组织层级
            const geoLevels = env[property].getGeoRootLevels();
            // 按照指定组织层级拼接geo
            return geoLevels
                .reduce((geo, level) => {
                if (geoObj.key[level]) {
                    geo.push(geoObj.key[level]);
                }
                return geo;
            }, new Array())
                .join('|');
        }
    }
    return '';
}
/**
 * 获取全局组织或设备名与geo信息对照表
 *
 * @export
 * @returns {GeoStruct}
 */
function getorSetGeoStruct() {
    if (Object.keys(GeoStructObj).length === 0) {
        setGeoStruct(env[property].getMapStruct(), env[property].getGeoSubLevels());
    }
    return _.cloneDeep(GeoStructObj);
}
/**
 * 根据指定的组织或设备的类，获取同类下所有的geo
 *
 * @param {string} className 设备或组织所属的类
 * @returns {string[]} geo数组
 */
function getGeoByClassName(className) {
    if (className && className.length > 0) {
        const arr = env[property].findObjects({ classes: [className] });
        // 存在同类组织或设备信息
        if (arr.length > 0) {
            // 获取完整geo组织层级
            const geoLevels = env[property].getGeoRootLevels();
            return arr.map(item => {
                // 按照指定组织层级拼接geo
                return geoLevels
                    .reduce((geo, level) => {
                    if (item.key[level]) {
                        geo.push(item.key[level]);
                    }
                    return geo;
                }, new Array())
                    .join('|');
            });
        }
    }
    return new Array();
}

var GlobalGeoConfig = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setGeoStruct: setGeoStruct,
  'default': getorSetGeoStruct,
  getGeoByClassName: getGeoByClassName
});

function getLabel$1(label, locale) {
    if (label.i18n) {
        const i18n = label.i18n;
        if (i18n[locale]) {
            return i18n[locale];
        }
        else {
            for (const key of Object.keys(i18n)) {
                return i18n[key];
            }
            return '';
        }
    }
    else {
        return label;
    }
}
function annotateWebConfig(config) {
    // The compile method is deprecated
    // const r = new RegExp(/^(((([a-zA-Z0-9_]+)\$([a-zA-Z0-9_]+))\.)?([a-zA-Z0-9_]+)\.)?([a-zA-Z0-9_]+)$/, 'g')
    // for browser ie11
    const r = /^(((([a-zA-Z0-9_]+)\$([a-zA-Z0-9_]+))\.)?([a-zA-Z0-9_]+)\.)?([a-zA-Z0-9_]+)$/g;
    config.fieldSpecs = {};
    // ["process$boiler.Consumption.purchased_electricity", "process$boiler.Consumption.", "process$boiler.", "process$boiler", "process", "boiler", "Consumption", "purchased_electricity", index: 0, input: "process$boiler.Consumption.purchased_electricity", groups: undefined]
    for (const metricName of Object.keys(config.metricSpecs)) {
        r.lastIndex = 0;
        const components = r.exec(metricName);
        if (components !== null) {
            config.metricSpecs[metricName].axis = components[4] !== '' ? components[4] : null;
            config.metricSpecs[metricName].axisValue = components[5] !== '' ? components[5] : null;
            config.metricSpecs[metricName].domain = components[6] !== '' ? components[6] : null;
            config.metricSpecs[metricName].metric = components[7] !== '' ? components[7] : null;
            const category = config.metricSpecs[metricName].category;
            let categoryString;
            let categoryList;
            if (category !== null && typeof category === 'string') {
                categoryString = category;
                categoryList = [categoryString];
            }
            else if (category !== null && Array.isArray(category)) {
                categoryList = category;
                categoryString = categoryList.length > 0 ? categoryList[0] : null;
            }
            else {
                categoryString = null;
                categoryList = [];
            }
            config.metricSpecs[metricName].categoryList = categoryList;
            if (config.metricSpecs[metricName].domain !== null &&
                config.metricSpecs[metricName].metric !== null &&
                categoryString !== null) {
                const domain = config.metricSpecs[metricName].domain;
                const metric = config.metricSpecs[metricName].metric;
                const domainObj = (config.fieldSpecs[domain] = config.fieldSpecs[domain] || {});
                const categoryObj = categoryString
                    ? (domainObj[categoryString] = domainObj[categoryString] || {})
                    : null;
                if (categoryObj && !(metric in categoryObj)) {
                    categoryObj[metric] = {
                        name: config.metricSpecs[metricName].name,
                        note: config.metricSpecs[metricName].note,
                        decimal: config.metricSpecs[metricName].decimal,
                        unit: config.metricSpecs[metricName].unit,
                    };
                }
            }
        }
    }
}
function annotatedWebConfig(webApiURL = '', config, mapStruct, webApiClient) {
    if (config != null || mapStruct != null) {
        return Promise.resolve(new AnnotatedWebConfig(config, mapStruct, webApiClient));
    }
    if (webApiClient == null) {
        webApiClient = new WebAPIClient(webApiURL);
    }
    return Promise.all([webApiClient.getConfig(), webApiClient.getGeoStruct()]).then(data => {
        const { data: cfg } = data[0];
        const { data: Map } = data[1];
        const webApiConfig = cfg;
        annotateWebConfig(webApiConfig); // add axis,axisValue,domain,metric fields
        return new AnnotatedWebConfig(webApiConfig, Map, webApiClient);
    });
}
// share webConfig in the whole application
let installed;
function globalConfig(webApiURL = '', config = null, mapStruct = null, webApiClient = null) {
    if (installed) {
        return installed;
    }
    installed = annotatedWebConfig(webApiURL, config, mapStruct, webApiClient);
    return installed;
}
/**
 * Check if any of the elements in elementCategories belongs to
 * categories
 * @param elementCategories
 * @param categories
 */
function categoryMatch(elementCategories, categories) {
    return elementCategories.some(elementCategory => categories.indexOf(elementCategory) !== -1);
}
class AnnotatedWebConfig {
    constructor(config, mapStruct, client) {
        this.config = config;
        this.mapStruct = mapStruct;
        this.client = client;
        this.webConfig = new WebConfig(config, mapStruct, client);
        // @ts-ignore
        if (global) {
            // @ts-ignore
            global._config = this;
        }
        else {
            // @ts-ignore
            window._config = this;
        }
        setGeoStruct(mapStruct, this.getGeoSubLevels());
    }
    filterMetrics(metricType, geoLevels, axis, axisValues, domain, categories, metrics, resolution) {
        const result = {};
        if (geoLevels.length === 0) {
            return result;
        }
        // metricName: 'axis$axisValue.domain.metric' ; metric example at the bottom
        for (const metricName of Object.keys(this.config.metricSpecs)) {
            const metric = this.config.metricSpecs[metricName];
            if (axis !== null && metric.axis !== axis) {
                continue;
            }
            if (axisValues !== null && axisValues.indexOf(metric.axisValue) === -1) {
                continue;
            }
            if (domain !== null && metric.domain !== domain) {
                continue;
            }
            if (categories !== null && !categoryMatch(metric.categoryList, categories)) {
                continue;
            }
            if (metrics !== null && metrics.indexOf(metric.metric) === -1) {
                continue;
            }
            if (metricType === 'timeseries') {
                if (metric.querySpecs && metric.querySpecs.timeseries) {
                    let current = metric.querySpecs.timeseries;
                    if (geoLevels.some(level => {
                        if (current[level]) {
                            current = current[level];
                            return false;
                        }
                        else {
                            return true;
                        }
                    })) {
                        continue;
                    }
                    else {
                        if (current.periods) {
                            if (resolution !== null && current.periods.indexOf(resolution) === -1) {
                                continue;
                            }
                            result[metricName] = metric;
                        }
                    }
                }
            }
        }
        return result;
    }
    getGeoSpecFromGeoNotation(notation) {
        return this.webConfig.getGeoSpecFromGeoNotation(notation);
    }
    getGeoNotationFromGeoSpec(geoSpec) {
        return this.webConfig.getGeoNotationFromGeoSpec(geoSpec);
    }
    getGeoLevels(geoSpec) {
        const result = [];
        this.config.geoLevels.some(level => {
            if (!this.webConfig.isGeoFieldEmpty(geoSpec[level])) {
                result.push(level);
                return false;
            }
            else {
                return true;
            }
        });
        return result;
    }
    /**
     * 获取完整的geo层级
     *
     * @returns {string[]}
     * @memberof AnnotatedWebConfig
     */
    getGeoRootLevels() {
        return this.config.geoLevels.slice();
    }
    /**
     * 获取顶级组织下的子geo层级，即不包含enterprise
     *
     * @returns {string[]}
     * @memberof AnnotatedWebConfig
     */
    getGeoSubLevels() {
        return this.config.geoSubLevels.slice();
    }
    // public getAdmGeoList(geoSpec: GeoSpec, level: number): object {
    // 	return this.webConfig.getAdmGeoList(geoSpec, level)
    // }
    getMapStruct() {
        return _.cloneDeep(this.mapStruct);
    }
    json2array() {
        const mapStruct = this.mapStruct;
        const levels = this.config.geoSubLevels;
        // geoSubLevels: ["factory", "workshop", "line", "equipment_product_shift"]
        // 仪表采集，氧气管网，供电公司，供水公司等不在top menu中显示
        const excludeFactory = ['MeterBus', 'MeterCollection', 'OxygenPipeline', 'GasFactory', 'ElectricityProvider', 'WaterProvider'];
        function _json2array(json, level, name) {
            if (level > levels.length) {
                return [];
            }
            let arr = [];
            const currObj = json[levels[level]];
            // remove line level from organization
            if (level === 2) {
                for (const item in currObj) {
                    if (currObj.hasOwnProperty(item)) {
                        const tmpSub = _json2array(currObj[item], level + 1, name + '|' + currObj[item].name);
                        arr = [...arr, ...tmpSub];
                    }
                }
                return arr;
            }
            for (const item in currObj) {
                if (currObj.hasOwnProperty(item) &&
                    !excludeFactory.find(e => currObj[item].class[0].fqn.split('}')[1] === e)
                // !excludeFactory.find(e => currObj[item].class[0].fqn.match(/(?<=\})\w+/g)[0] === e)
                ) {
                    const tmpSub = _json2array(currObj[item], level + 1, name + '|' + currObj[item].name);
                    // remove equipment type at equipment_product_shift level
                    if (level === 3 && currObj[item].class[0].fqn.indexOf('Machine') !== -1) {
                        continue;
                    }
                    arr.push({
                        level: levels[level],
                        geo: name + '|' + currObj[item].name,
                        process: currObj[item].axis ? currObj[item].axis.process : [],
                        class: currObj[item].class,
                        i18n: currObj[item].i18n,
                        sub: tmpSub,
                    });
                }
            }
            return arr;
        }
        const sub = _json2array(mapStruct, 0, mapStruct.name);
        return [
            {
                level: this.config.geoLevels[0],
                geo: mapStruct.name,
                class: mapStruct.class,
                i18n: mapStruct.i18n,
                sub,
                process: mapStruct.axis.process,
            },
        ];
    }
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
    timeseries(queries) {
        return this.client
            .getData(queries)
            .then((queryResult) => {
            const result = [];
            for (const item of queryResult) {
                // @ts-ignore
                const { metricType, id, data } = item.data;
                if (metricType === 'timeseries') {
                    result.push({
                        id,
                        data: data.map(({ name, value }) => ({
                            timestamp: parseFloat(name),
                            value,
                        })),
                    });
                }
            }
            return result;
        });
    }
    /**
     * @param domain
     * @param filter -- a string or an array of strings (for multiple disjuncts)
     * @param id -- an array of strings
     *
     */
    search(domain, filter, id, _options) {
        return this.webConfig.search(domain, filter, id, _options);
    }
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
    createOrUpdateEntity(objectId, scope, domain, data, _options) {
        return this.webConfig.createOrUpdateEntity(objectId, scope, domain, data, _options);
    }
    /**
     * Return the array of tuples (key, value) where X <= key < Y
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param from lower bound of the key 值必须可以计算
     * @param to upper bound of the key
     */
    getMapValues(id, domain, name, from, to, _options) {
        return this.webConfig.getMapValues(id, domain, name, from, to, _options);
    }
    /**
     * Returns key value
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     */
    getMapValue(id, domain, name, key, _options) {
        return this.webConfig.getMapValue(id, domain, name, key, _options);
    }
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
    addValueToMap(id, domain, name, key, value, _options) {
        return this.webConfig.addValueToMap(id, domain, name, key, value, _options);
    }
    /**
     * Edit the value in the map
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     * @param value the value is either a primitive type or a document
     */
    editMapValue(id, domain, name, key, value, _options) {
        return this.webConfig.editMapValue(id, domain, name, key, value, _options);
    }
    /**
     * Delete the map value
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     */
    deleteMapValue(id, domain, name, key, _options) {
        return this.webConfig.deleteMapValue(id, domain, name, key, _options);
    }
    /**
     * Retrieves domain data from object.
     * @param objectId object id，ie:'zb_e|oxygen_p1|oxygen_p1_1552357589'
     * @param domain domain/mixin type, ie:"steel___OxygenPipelineInstruction"
     */
    getObjectDomain(objectId, domain, _options) {
        return this.webConfig.getObjectDomain(objectId, domain, _options);
    }
    /**
     *
     *  @return
     */
    timeseriesBatch(queries, _options) {
        return this.client.getTimeseriesBatch(queries, _options).then(results => {
            const result = [];
            for (const data of results) {
                const item = {};
                for (const metric of Object.keys(data)) {
                    item[metric] = data[metric].map(({ name, value }) => ({
                        timestamp: parseFloat(name),
                        value,
                    }));
                }
                result.push(item);
            }
            return result;
        });
    }
    /**
     *
     *  @return
     */
    timeseriesMultiBatch(queries, noPrune = false, _options) {
        return this.client.getTimeseriesMultiBatch(queries, noPrune, _options).then(data => {
            const result = {};
            for (const metric of Object.keys(data)) {
                result[metric] = data[metric].map(({ name, value }) => ({
                    timestamp: parseFloat(name),
                    value,
                }));
            }
            return result;
        });
    }
    /**
     * Find objects specified by the filter. If filter element is null, skip this element
     *
     */
    findObjects({ classes = null, }) {
        const result = {};
        this._findObjects(this.mapStruct, this.mapStruct.name, {
            [this.config.geoLevels[0]]: this.mapStruct.name,
        }, this.config.geoLevels.slice(1), {
            classes,
        }, result);
        const resultList = [];
        for (const geo of Object.keys(result)) {
            resultList.push(result[geo]);
        }
        return resultList;
    }
    isInstance(obj, cls) {
        const inputObj = this._findObjectByGeoSpec(obj);
        const classes = inputObj.spec.class;
        for (const c of classes) {
            if (cls === c.fqn) {
                return true;
            }
        }
        return false;
    }
    getSources(obj, relationType) {
        const result = {};
        const geoNotation = this.getGeoNotationFromGeoSpec(obj);
        this._findObjectsByRelation(this.mapStruct, this.mapStruct.name, {
            [this.config.geoLevels[0]]: this.mapStruct.name,
        }, this.config.geoLevels.slice(1), {
            relations: [
                {
                    type: relationType,
                    destination: geoNotation,
                },
            ],
        }, result);
        const resultList = [];
        for (const geo of Object.keys(result)) {
            resultList.push(result[geo]);
        }
        return resultList;
    }
    getDestinations(obj, relationType) {
        const inputObj = this._findObjectByGeoSpec(obj);
        const resultList = [];
        const relations = inputObj.spec.related;
        if (relations) {
            for (const relation of relations) {
                if (relation.type === relationType) {
                    const geoNotation = relation.destination;
                    const resultObj = this._findObjectByGeoNotation(geoNotation);
                    if (resultObj) {
                        resultList.push(resultObj);
                    }
                }
            }
        }
        return resultList;
    }
    _findObjects(
    // subtree root spec
    root, 
    // subtree root GeoNotation (a|b|c...)
    geo, 
    // subtree root GeoSpec
    // { leve0: a, level1: b, ... }
    geoSpec, 
    // list of geo levels [level+1, level+2, ...]
    subLevels, 
    // object filter
    filter, 
    // result map
    result) {
        // match root
        let match = true;
        if (filter.classes !== null) {
            let notFound = true;
            for (const aClass of filter.classes) {
                if (root.class !== null && root.class.some(({ fqn }) => fqn === aClass)) {
                    notFound = false;
                    break;
                }
            }
            if (notFound) {
                match = false;
            }
        }
        if (match) {
            result[geo] = {
                key: geoSpec,
                spec: root,
            };
        }
        // walk the subtree recursively
        if (subLevels.length > 0) {
            const children = root[subLevels[0]];
            if (!!children) {
                for (const id of Object.keys(children)) {
                    this._findObjects(children[id], `${geo}|${id}`, {
                        ...geoSpec,
                        [subLevels[0]]: id,
                    }, subLevels.slice(1), filter, result);
                }
            }
        }
    }
    _findObjectsByRelation(
    // todo: this method is copy from _findObjects and change `filter`. should it be merged into _findObjects
    // subtree root spec
    root, 
    // subtree root GeoNotation (a|b|c...)
    geo, 
    // subtree root GeoSpec
    // { leve0: a, level1: b, ... }
    geoSpec, 
    // list of geo levels [level+1, level+2, ...]
    subLevels, 
    // object filter
    filter, 
    // result map
    result) {
        // match root
        // let match = true
        // if (filter.classes !== null) {
        //     let notFound = true
        //     for (const aClass of filter.classes) {
        //         if (root.class !== null && root.class.some(({ fqn }) => fqn === aClass)) {
        //             notFound = false
        //             break
        //         }
        //         if (notFound) {
        //             match = match && false
        //         }
        //     }
        // }
        // match root
        let match = true;
        if (filter.relations !== null) {
            let notFound = true;
            for (const aRelation of filter.relations) {
                if (root.related !== undefined &&
                    root.related !== null &&
                    root.related.some(({ type, destination }) => type === aRelation.type && destination === aRelation.destination)) {
                    notFound = false;
                    break;
                }
            }
            if (notFound) {
                match = false;
            }
        }
        if (match) {
            result[geo] = {
                key: geoSpec,
                spec: root,
            };
        }
        // walk the subtree recursively
        if (subLevels.length > 0) {
            const children = root[subLevels[0]];
            if (!!children) {
                for (const id of Object.keys(children)) {
                    this._findObjectsByRelation(children[id], `${geo}|${id}`, {
                        ...geoSpec,
                        [subLevels[0]]: id,
                    }, subLevels.slice(1), filter, result);
                }
            }
        }
    }
    _findObjectByGeoNotation(geoNotation) {
        let geoDelimiter = this.config.geoDelimiter;
        if (!geoDelimiter) {
            geoDelimiter = '|';
        }
        const geoLevels = this.config.geoLevels;
        const targetGeoFields = geoNotation.split(geoDelimiter);
        const resultKey = {};
        let obj = this.mapStruct;
        if (targetGeoFields.length <= geoLevels.length) {
            for (let i = 0; i < targetGeoFields.length; i++) {
                const level = geoLevels[i];
                const field = targetGeoFields[i];
                resultKey[level] = field;
                if (i === 0) {
                    if (field !== obj.name) {
                        throw new Error(`unexpected geo field ${field} on geo level ${level}`);
                    }
                }
                else {
                    obj = obj[level][field];
                    if (!obj) {
                        throw new Error(`unexpected geo field ${field} on geo level ${level}`);
                    }
                }
            }
        }
        return {
            key: resultKey,
            spec: obj,
        };
    }
    _findObjectByGeoSpec(geoSpec) {
        const geoLevels = this.config.geoLevels;
        let obj = this.mapStruct;
        const geoSpecLength = Object.keys(geoSpec).length;
        if (geoSpecLength <= geoLevels.length) {
            for (let i = 0; i < geoSpecLength; i++) {
                const level = geoLevels[i];
                const field = geoSpec[level];
                if (i === 0) {
                    if (field !== obj.name) {
                        throw new Error(`unexpected geo field ${field} on geo level ${level}`);
                    }
                }
                else {
                    obj = obj[level][field];
                    if (!obj) {
                        throw new Error(`unexpected geo field ${field} on geo level ${level}`);
                    }
                }
            }
        }
        return {
            key: geoSpec,
            spec: obj,
        };
    }
}
//
function aggregateTimeseries(timeseries) {
    const result = [];
    //@ts-ignore
    const indices = timeseries.map(data => -1);
    while (true) {
        let stop = true;
        let minIdx = -1;
        for (let i = 0; i < indices.length; i++) {
            if (indices[i] + 1 < timeseries[i].length) {
                if (minIdx === -1) {
                    minIdx = i;
                }
                else {
                    if (timeseries[i][indices[i] + 1].timestamp < timeseries[minIdx][indices[minIdx] + 1].timestamp) {
                        minIdx = i;
                    }
                }
                stop = false;
            }
        }
        if (stop) {
            break;
        }
        const timestamp = timeseries[minIdx][indices[minIdx] + 1].timestamp;
        const value = {
            sum: 0,
            cnt: 0,
            max: 0,
            min: 0,
            stddev: 0,
        };
        for (let i = 0; i < indices.length; i++) {
            if (indices[i] + 1 < timeseries[i].length) {
                if (timeseries[i][indices[i] + 1].timestamp === timestamp) {
                    value.sum += timeseries[i][indices[i] + 1].value.sum;
                    value.cnt += timeseries[i][indices[i] + 1].value.cnt;
                    if (value.cnt > 0) {
                        value.min = Math.min(value.min, timeseries[i][indices[i] + 1].value.min);
                        value.max = Math.min(value.min, timeseries[i][indices[i] + 1].value.max);
                    }
                    indices[i] += 1;
                }
            }
        }
        result.push({ timestamp, value });
    }
    return result;
}
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

var queries = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getLabel: getLabel$1,
  annotatedWebConfig: annotatedWebConfig,
  globalConfig: globalConfig,
  AnnotatedWebConfig: AnnotatedWebConfig,
  aggregateTimeseries: aggregateTimeseries
});

var index = {
    queries,
    GlobalGeoConfig,
};

module.exports = index;
