'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));
var _ = require('lodash');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var codeMessage = {
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
var CustomError = /** @class */ (function (_super) {
    __extends(CustomError, _super);
    function CustomError(msg, url, method, status) {
        var _this = _super.call(this, msg) || this;
        _this.url = url;
        _this.method = method;
        _this.status = status;
        Object.setPrototypeOf(_this, CustomError.prototype);
        return _this;
    }
    return CustomError;
}(Error));
/**
 * 封装axios调用
 * @param opts
 */
var request = function (opts) {
    return axios(opts)
        //@ts-ignore
        .then(function (res) {
        if (res.status >= 200 && res.status < 300) {
            return res;
        }
    })
        .catch(function (err) {
        var res = err.response;
        if (!res) {
            var message = err.message;
            console.log("%c *" + opts.method.toUpperCase() + " " + opts.url + "* \u8BF7\u6C42\u672A\u6B63\u786E\u53D1\u9001, \u9519\u8BEF\u5982\u4E0B: ", "background: #222; color: #fff; font-weight: bold;");
            console.log(message);
            throw new CustomError(message, opts.url, opts.method, opts.status);
        }
        else {
            var message = codeMessage[res.status] || res.statusText;
            console.log("%c *" + opts.method.toUpperCase() + " " + opts.url + "* \u8BF7\u6C42\u5931\u8D25, \u54CD\u5E94\u5982\u4E0B:", "background: #222; color: #bada55; font-weight: bold;");
            console.log(res);
            throw new CustomError(message, opts.url, opts.method, opts.status);
        }
    });
};
var Axios = /** @class */ (function () {
    function Axios() {
    }
    Axios.get = function (url, queries, _options) {
        return request(__assign({ method: "get", url: url, params: queries }, _options));
    };
    Axios.post = function (url, data, _options) {
        return request(__assign({ method: "post", url: url,
            data: data }, _options));
    };
    Axios.put = function (url, data, _options) {
        return request(__assign({ method: "put", url: url,
            data: data }, _options));
    };
    Axios.delete = function (url, _options) {
        return request(__assign({ method: "delete", url: url }, _options));
    };
    return Axios;
}());
//# sourceMappingURL=request.js.map

var WebAPIClient = /** @class */ (function () {
    function WebAPIClient(baseURL) {
        this.getConfig = function (_options) {
            var getConfigURI = 'api/config';
            return Axios.get(getConfigURI, null, __assign({ baseURL: this.baseURL }, _options));
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
    WebAPIClient.prototype.getData = function (queries, _options) {
        var _this = this;
        var getDataURI = 'api/view/metric/';
        // return Promise.all(queries.map((q) => {
        //     return Axios.get(getDataURI, {
        //       ...q
        //     }, {
        //       baseURL: this.baseURL,
        //       ..._options
        //     })
        // }))
        return queries.reduce(function (prev, q) {
            return prev.then(function (p) {
                return Axios.get(getDataURI, __assign({}, q), __assign({ baseURL: _this.baseURL }, _options)).then(function (r) {
                    p.push(r);
                    return p;
                });
            });
        }, Promise.resolve([]));
    };
    WebAPIClient.prototype._constructBatchFuture = function (multimetricURI, queryParams, _options) {
        return Axios.post(multimetricURI, __assign({}, queryParams), __assign({ baseURL: this.baseURL }, _options)).then(function (response) {
            var data = response.data.data;
            var result = {};
            for (var mid in data) {
                result[data[mid].name] = data[mid].data;
            }
            return result;
        });
    };
    WebAPIClient.prototype.getTimeseriesBatch = function (queries, _options) {
        var multimetricURI = 'api/view/multimetric/';
        var futures = [];
        for (var _i = 0, queries_1 = queries; _i < queries_1.length; _i++) {
            var query = queries_1[_i];
            var queryParams = {
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
    };
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
    WebAPIClient.prototype.getTimeseriesMultiBatch = function (queries, noPrune, _options) {
        if (noPrune === void 0) { noPrune = false; }
        var multimetricURI = 'api/view/multimetric/';
        return Axios.post(multimetricURI, {
            metricType: 'timeseries',
            batches: queries,
            noPrune: noPrune
        }, __assign({ baseURL: this.baseURL }, _options)).then(function (response) {
            var data = response.data.data;
            var result = {};
            for (var mid in data) {
                result[mid] = data[mid].data;
            }
            return result;
        });
    };
    WebAPIClient.prototype.getGeoStruct = function (_options) {
        var getConfigURI = 'api/geo/struct';
        return Axios.get(getConfigURI, null, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.getDevicesByGeo = function (geoSpec, _options) {
        var getDevicesByGeoURI = 'api/geo/device';
        return Axios.get(getDevicesByGeoURI, geoSpec, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.getDeviceMetadata = function (deviceId, _options) {
        var getDeviceMetadataURI = 'api/device';
        return Axios.get(getDeviceMetadataURI, { deviceId: deviceId }, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.getBinaryObjectURL = function (collection, key) {
        return Promise.resolve(this.baseURL + 'api/store/' + collection + '/' + key);
    };
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
    WebAPIClient.prototype.search = function (domain, filter, id, _options) {
        var searchURI = 'api/search/' + domain;
        return Axios.get(searchURI, {
            filter: filter,
            id: id ? id.join(',') : null,
        }, __assign({ baseURL: this.baseURL }, _options)).then(function (d) { return d.data; });
    };
    WebAPIClient.prototype.createOrUpdateEntity = function (objId, scope, domain, data, _options) {
        var createObjectWithMixinURI = 'api/entity/' + objId;
        return Axios.post(createObjectWithMixinURI, { mixinType: domain, mixin: data, scope: scope }, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.getObjectDomain = function (objId, domain, _options) {
        var getObjectMixinURI = 'api/entity/' + objId + '/' + domain;
        return Axios.get(getObjectMixinURI, null, __assign({ baseURL: this.baseURL }, _options)).then(function (d) { return d.data; });
    };
    WebAPIClient.prototype.getMapValues = function (id, domain, name, from, to, _options) {
        var url = 'api/entity/' + id + '/' + domain + '/map/' + name;
        return Axios.get(url, { from: from, to: to }, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.getMapValue = function (id, domain, name, key, _options) {
        var url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.get(url, null, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.addValueToMap = function (id, domain, name, key, value, _options) {
        var url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.post(url, { value: value }, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.editMapValue = function (id, domain, name, key, value, _options) {
        var url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.put(url, { value: value }, __assign({ baseURL: this.baseURL }, _options));
    };
    WebAPIClient.prototype.deleteMapValue = function (id, domain, name, key, _options) {
        var url = 'api/entity/' + id + '/' + domain + '/map/' + name + '/' + key;
        return Axios.delete(url, __assign({ baseURL: this.baseURL }, _options));
    };
    return WebAPIClient;
}());
//# sourceMappingURL=WebAPIClient.jsx.map

function getLabel(label, locale) {
    if (locale === void 0) { locale = "en-US"; }
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
        var mbLabel = Object.keys(label["i18n"]).find(function (e) { return Boolean(label["i18n"][e]); });
        return mbLabel ? mbLabel : "";
    }
    return "" + label;
}
var WebConfig = /** @class */ (function () {
    function WebConfig(config, mapStruct, webApiClient) {
        this.config = config;
        this.mapStruct = mapStruct;
        this.webApiClient = webApiClient;
    }
    WebConfig.prototype.timeseries = function (plots, locale) {
        if (locale === void 0) { locale = "en-US"; }
        var metricSpecs = this.config.metricSpecs || {};
        var plotConfig = {};
        var viewport = {
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
        var index = 0;
        plots.forEach(function (_a) {
            var plotName = _a.plotName, metricName = _a.metricName, _b = _a.type, type = _b === void 0 ? "y-axis values" : _b;
            var metricSpec = metricSpecs[metricName];
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
                throw new Error("Unknown metric " + metricName);
            }
        });
        return new PlotSet(this, plotConfig, viewport, locale);
    };
    WebConfig.prototype.getData = function (queries, _options) {
        return this.webApiClient.getData(queries, _options);
    };
    WebConfig.prototype.search = function (domain, filter, id, _options) {
        return this.webApiClient.search(domain, filter, id, _options);
    };
    WebConfig.prototype.forPlotType = function (viewport, plotTypes) {
        for (var i = 0; i < plotTypes.length; i++) {
            if (viewport && viewport.plotType === plotTypes[i]) {
                return true;
            }
        }
        return false;
    };
    WebConfig.prototype.getMetricUsage_ = function (viewport) {
        if (this.forPlotType(viewport, ['barchart', 'hbarchart', 'piechart']) &&
            viewport.categories != null && viewport.categories.name === 'metric') {
            return 'asCategory';
        }
        else {
            return 'normal';
        }
    };
    WebConfig.prototype.getValidMetricTypes_ = function (viewport, metric) {
        var metricName = (metric) ? metric.name : (viewport.metrics[0] ? viewport.metrics[0].name : null);
        if (metricName == null) {
            console.error("null metric name");
            return [];
        }
        var metricSpec = this.config.metricSpecs[metricName];
        // new
        if (_.isEmpty(this.config.plotTypes[viewport.plotType]) ||
            _.isEmpty(this.config.plotTypes[viewport.plotType].metricUsage)) {
            console.error("invalid plotType: " + viewport.plotType);
            return [];
        }
        var metricUsage = this.getMetricUsage_(viewport);
        var valueTypes = this.config.plotTypes[viewport.plotType].metricUsage[metricUsage];
        if (_.isEmpty(valueTypes)) {
            console.log('empty value types for: ' + viewport.plotType + '.' + metricUsage);
            return [];
        }
        var metricTypes = this.config.plotTypes[viewport.plotType].metricUsage[metricUsage][metricSpec.valueType];
        if (_.isEmpty(metricTypes)) {
            console.log('empty valueType spec for: ' + viewport.plotType + '.' + metricUsage + '.' + metricSpec.valueType);
            return [];
        }
        var metricTypeArr = [];
        metricTypes.forEach(function (mt) {
            if (!_.isEmpty(metricSpec.querySpecs[mt])) {
                metricTypeArr.push(mt);
            }
        });
        if (_.isEmpty(metricTypeArr)) { // shouldn't happen
            console.log('metric ' + metricName + ' has no matching metric type ' + metricTypes[0]);
        }
        return metricTypeArr;
    };
    WebConfig.prototype.getGeoSpecFromGeoNotation = function (notation) {
        if (_.isEmpty(notation)) {
            throw new Error('unexpected empty geo notation');
        }
        var geoFields = notation.split(this.config.geoDelimiter);
        var fieldLen = geoFields.length;
        var struct = {};
        var that = this;
        this.config.geoLevels.forEach(function (level, index) {
            if (fieldLen > index && !that.isGeoFieldEmpty(geoFields[index])) {
                struct[level] = geoFields[index];
            }
            else {
                struct[level] = '';
            }
        });
        return struct;
    };
    WebConfig.prototype.isGeoFieldEmpty = function (field) {
        return _.isEmpty(field) || field === 'none';
    };
    WebConfig.prototype.getGeoNotationFromGeoSpec = function (geoSpec) {
        if (_.isEmpty(geoSpec)) {
            console.warn('unexpected empty geo spec');
            return "";
        }
        var geoArr = [];
        var that = this;
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
    };
    WebConfig.prototype.createOrUpdateEntity = function (objId, scope, domain, data, _options) {
        return this.webApiClient.createOrUpdateEntity(objId, scope, domain, data, _options);
    };
    WebConfig.prototype.getObjectDomain = function (objId, domain, _options) {
        return this.webApiClient.getObjectDomain(objId, domain, _options);
    };
    WebConfig.prototype.getMapValues = function (id, domain, name, from, to, _options) {
        return this.webApiClient.getMapValues(id, domain, name, from, to, _options);
    };
    WebConfig.prototype.getMapValue = function (id, domain, name, key, _options) {
        return this.webApiClient.getMapValue(id, domain, name, key, _options);
    };
    WebConfig.prototype.addValueToMap = function (id, domain, name, key, value, _options) {
        return this.webApiClient.addValueToMap(id, domain, name, key, value, _options);
    };
    WebConfig.prototype.editMapValue = function (id, domain, name, key, value, _options) {
        return this.webApiClient.editMapValue(id, domain, name, key, value, _options);
    };
    WebConfig.prototype.deleteMapValue = function (id, domain, name, key, _options) {
        return this.webApiClient.deleteMapValue(id, domain, name, key, _options);
    };
    return WebConfig;
}());
var PlotSet = /** @class */ (function () {
    function PlotSet(webConfig, plotConfig, viewport, locale) {
        if (locale === void 0) { locale = "en-US"; }
        this.webConfig = webConfig;
        this.plotConfig = plotConfig;
        this.viewport = viewport;
        this.locale = locale;
        this.lastQuery = null;
    }
    PlotSet.prototype.select = function (plotName, geoSpec, period) {
        var _this = this;
        if (_.isArray(plotName)) {
            var that_1 = this;
            plotName.forEach(function (name) {
                that_1.select(name, geoSpec, period);
            });
            return that_1;
        }
        if (!this.viewport["metrics"].some(function (metric) {
            if (metric["id"] === plotName) {
                metric["periods"] = [period];
                metric["geoSpecs"] = [geoSpec];
                _this.viewport["geoSpecs"] = [geoSpec];
                return true;
            }
            return false;
        })) {
            throw new Error("Unknown plot " + plotName);
        }
        return this;
    };
    PlotSet.prototype.aggregate = function (plotName, aggType) {
        var _this = this;
        if (this.viewport.plotType === "timeseries") {
            for (var type in this.plotConfig) {
                var plot = this.plotConfig[type][plotName];
                if (plot) {
                    plot["__stats"] = aggType;
                    return this;
                }
            }
            throw new Error("Unknown plot " + plotName);
        }
        else if (this.viewport.plotType === "geomap") {
            if (["color", "area"].some(function (type) {
                if (_this.plotConfig[type]["__plot_name"] === plotName) {
                    _this.plotConfig[type]["__stats"] = aggType;
                    return true;
                }
                return false;
            })) {
                return this;
            }
            throw new Error("Unknown plot " + plotName);
        }
        else {
            throw new Error("Unsupported plot type " + this.viewport.plotType);
        }
    };
    PlotSet.prototype._get_aggFunction = function (aggType) {
        var aggFunction;
        if (aggType === "avg" || aggType === "val") {
            aggFunction = function (entry) {
                if (entry.value.cnt === 0) {
                    return 0;
                }
                else {
                    return entry.value.sum / entry.value.cnt;
                }
            };
        }
        else if (aggType === "sum") {
            aggFunction = function (entry) {
                return entry.value.sum;
            };
        }
        else if (aggType === "cnt") {
            aggFunction = function (entry) {
                return entry.value.cnt;
            };
        }
        else if (aggType === "stddev") {
            aggFunction = function (entry) {
                return entry.value.stddev;
            };
        }
        else {
            console.warn("Unknown aggregation type " + aggType);
            aggFunction = null;
        }
        return aggFunction;
    };
    PlotSet.prototype.getValueKey = function (geoNotation) {
        if (this.viewport.plotType === "geomap") {
            // TODO
            throw Error("Not supported" + geoNotation);
        }
        return "";
    };
    PlotSet.prototype.query = function (_a) {
        var _this = this;
        var _b = _a.from, from = _b === void 0 ? 0 : _b, _c = _a.to, to = _c === void 0 ? 0 : _c, _d = _a.time, time = _d === void 0 ? 0 : _d, _e = _a.area, area = _e === void 0 ? null : _e;
        try {
            var queries = this.viewport["metrics"].map(function (m) {
                if (m.geoSpecs.length <= 0) {
                    throw new Error("geo not set for " + m.name);
                }
                if (m.periods.length <= 0) {
                    throw new Error("period not set for " + m.name);
                }
                return {
                    from: from,
                    to: to,
                    time: time,
                    value: area ? _this.getValueKey(area) : _this.getValueKey(m.geoSpecs[0]),
                    geo: area || m.geoSpecs[0],
                    id: m.id,
                    metricType: m.metricType,
                    name: m.name,
                    period: m.periods[0],
                    ref: m.ref
                };
            });
            var that_2 = this;
            return this.webConfig.getData(queries).then(function (dataBundles) {
                _this.lastQuery = { from: from, to: to, time: time, area: area };
                return new QueryResult(that_2, { from: from, to: to, time: time, area: area }, dataBundles.map(function (data) {
                    if (data.metricType === "timeseries") {
                        console.log(data);
                        console.log(that_2.plotConfig);
                        if (that_2.viewport.plotType === "timeseries") {
                            for (var type in that_2.plotConfig) {
                                if (!that_2.plotConfig[type] || !that_2.plotConfig[type][data.id]) {
                                    continue;
                                }
                                var aggType = that_2.plotConfig[type][data.id]["__stats"];
                                var aggFunction = _this._get_aggFunction(aggType);
                                if (aggFunction == null) {
                                    throw new Error("Unknown aggregation type for plot " + data.id);
                                }
                                return new Timeseries(data.data.map(function (entry) {
                                    return {
                                        date: Number(entry.name) * 1000.,
                                        value: aggFunction(entry)
                                    };
                                }));
                            }
                            throw new Error("Unknown plot id " + data.id);
                        }
                        throw new Error("Unsupported viewport type " + that_2.viewport.plotType + " for metric " + data.metricType);
                    }
                    else if (data.metricType === "snapshot") {
                        if (that_2.viewport.plotType === "geomap") {
                            var type_1 = ["area", "color"].find(function (type) {
                                return data.id in that_2.plotConfig[type];
                            });
                            if (type_1) {
                                var aggType = that_2.plotConfig[type_1][data.id]["__stats"];
                                var aggFunction = _this._get_aggFunction(aggType);
                                if (aggFunction == null) {
                                    throw new Error("Unknown aggregation type for plot " + data.id);
                                }
                                return new Snapshot(data.data.map(function (entry) {
                                    return {
                                        name: entry.name,
                                        value: aggFunction(entry)
                                    };
                                }));
                            }
                            throw new Error("Unknown plot id " + data.id);
                        }
                        throw new Error("Unsupported viewport type " + that_2.viewport.plotType + " for metric " + data.metricType);
                    }
                    throw new Error("Metric type " + data.metricType + " not supported");
                }));
            });
        }
        catch (e) {
            return Promise.reject(e);
        }
    };
    return PlotSet;
}());
var QueryResult = /** @class */ (function () {
    function QueryResult(plotSet, _a, data) {
        var _b = _a.from, from = _b === void 0 ? 0 : _b, _c = _a.to, to = _c === void 0 ? 0 : _c, _d = _a.time, time = _d === void 0 ? 0 : _d, _e = _a.area, area = _e === void 0 ? null : _e;
        this.plotSet = plotSet;
        this.from = from;
        this.to = to;
        this.time = time;
        this.area = area;
        this.data = data;
    }
    QueryResult.prototype.timeseries = function (index) {
        if (this.data[index] instanceof Timeseries) {
            return this.data[index];
        }
        throw new Error("Incompatible data bundle type");
    };
    QueryResult.prototype.snapshot = function (index) {
        if (this.data[index] instanceof Snapshot) {
            return this.data[index];
        }
        throw new Error("Incompatible data bundle type");
    };
    QueryResult.prototype.repeat = function (_a) {
        var _b = _a.from, from = _b === void 0 ? -1 : _b, _c = _a.to, to = _c === void 0 ? -1 : _c, _d = _a.time, time = _d === void 0 ? -1 : _d, _e = _a.area, area = _e === void 0 ? null : _e;
        return this.plotSet.query({
            from: from >= 0 ? from : this.from,
            to: to >= 0 ? to : this.to,
            time: time >= 0 ? time : this.time,
            area: area !== null ? area : this.area
        });
    };
    return QueryResult;
}());
var Timeseries = /** @class */ (function () {
    function Timeseries(data) {
        this.data = data;
    }
    Timeseries.prototype.getData = function () {
        return this.data;
    };
    return Timeseries;
}());
var Snapshot = /** @class */ (function () {
    function Snapshot(data) {
        this.data = data;
    }
    Snapshot.prototype.getData = function () {
        return this.data;
    };
    return Snapshot;
}());
//# sourceMappingURL=WebConfig.jsx.map

// 组织或设备名与geo信息对照表
// 各应用根据组织或设备名获取指定的geo
var GeoStructObj = {};
var property = '_config';
var env = global ? global : window;
/**
 * 初始化GeoStructObj
 *
 * @export
 * @param {*} struct
 * @param {string[]} levels
 * @returns {GeoStruct}
 */
function setGeoStruct(struct, levels) {
    var geoLevels = levels.slice();
    // 全局geo信息未初始化，且存在指定层级，且存在对应层级信息
    if (geoLevels && Array.isArray(geoLevels) && geoLevels.length > 0) {
        var level_1 = geoLevels.shift();
        if (Object.prototype.hasOwnProperty.call(struct, level_1)) {
            var obj_1 = struct[level_1];
            if (obj_1) {
                // 循环当前层级的每项组织或设备
                Object.keys(obj_1).forEach(function (key) {
                    var tmp = obj_1[key];
                    var className = tmp.class[0].fqn;
                    GeoStructObj[tmp.name] = {
                        geo: _getGeoByClass(className, tmp.name),
                        class: tmp.class.map(function (item) { return item.fqn; }),
                        level: level_1,
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
        var arr = env[property].findObjects({ classes: [className] });
        // 查找指定设备
        var geoObj_1 = arr.find(function (item) { return item.spec.name === name; });
        // 存在设备
        if (geoObj_1) {
            // 获取完整geo组织层级
            var geoLevels = env[property].getGeoRootLevels();
            // 按照指定组织层级拼接geo
            return geoLevels
                .reduce(function (geo, level) {
                if (geoObj_1.key[level]) {
                    geo.push(geoObj_1.key[level]);
                }
                return geo;
            }, new Array())
                .join('|');
        }
    }
    return '';
}
//# sourceMappingURL=GlobalGeoConfig.js.map

function getLabel$1(label, locale) {
    if (label.i18n) {
        var i18n = label.i18n;
        if (i18n[locale]) {
            return i18n[locale];
        }
        else {
            for (var _i = 0, _a = Object.keys(i18n); _i < _a.length; _i++) {
                var key = _a[_i];
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
    var r = /^(((([a-zA-Z0-9_]+)\$([a-zA-Z0-9_]+))\.)?([a-zA-Z0-9_]+)\.)?([a-zA-Z0-9_]+)$/g;
    config.fieldSpecs = {};
    // ["process$boiler.Consumption.purchased_electricity", "process$boiler.Consumption.", "process$boiler.", "process$boiler", "process", "boiler", "Consumption", "purchased_electricity", index: 0, input: "process$boiler.Consumption.purchased_electricity", groups: undefined]
    for (var _i = 0, _a = Object.keys(config.metricSpecs); _i < _a.length; _i++) {
        var metricName = _a[_i];
        r.lastIndex = 0;
        var components = r.exec(metricName);
        if (components !== null) {
            config.metricSpecs[metricName].axis = components[4] !== '' ? components[4] : null;
            config.metricSpecs[metricName].axisValue = components[5] !== '' ? components[5] : null;
            config.metricSpecs[metricName].domain = components[6] !== '' ? components[6] : null;
            config.metricSpecs[metricName].metric = components[7] !== '' ? components[7] : null;
            var category = config.metricSpecs[metricName].category;
            var categoryString = void 0;
            var categoryList = void 0;
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
                var domain = config.metricSpecs[metricName].domain;
                var metric = config.metricSpecs[metricName].metric;
                var domainObj = (config.fieldSpecs[domain] = config.fieldSpecs[domain] || {});
                var categoryObj = categoryString
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
function annotatedWebConfig(webApiURL, config, mapStruct, webApiClient) {
    if (webApiURL === void 0) { webApiURL = ''; }
    if (config != null || mapStruct != null) {
        return Promise.resolve(new AnnotatedWebConfig(config, mapStruct, webApiClient));
    }
    if (webApiClient == null) {
        webApiClient = new WebAPIClient(webApiURL);
    }
    return Promise.all([webApiClient.getConfig(), webApiClient.getGeoStruct()]).then(function (data) {
        var cfg = data[0].data;
        var Map = data[1].data;
        var webApiConfig = cfg;
        annotateWebConfig(webApiConfig); // add axis,axisValue,domain,metric fields
        return new AnnotatedWebConfig(webApiConfig, Map, webApiClient);
    });
}
// share webConfig in the whole application
var installed;
function globalConfig(webApiURL, config, mapStruct, webApiClient) {
    if (webApiURL === void 0) { webApiURL = ''; }
    if (config === void 0) { config = null; }
    if (mapStruct === void 0) { mapStruct = null; }
    if (webApiClient === void 0) { webApiClient = null; }
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
    return elementCategories.some(function (elementCategory) { return categories.indexOf(elementCategory) !== -1; });
}
var AnnotatedWebConfig = /** @class */ (function () {
    function AnnotatedWebConfig(config, mapStruct, client) {
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
    AnnotatedWebConfig.prototype.filterMetrics = function (metricType, geoLevels, axis, axisValues, domain, categories, metrics, resolution) {
        var result = {};
        if (geoLevels.length === 0) {
            return result;
        }
        var _loop_1 = function (metricName) {
            var metric = this_1.config.metricSpecs[metricName];
            if (axis !== null && metric.axis !== axis) {
                return "continue";
            }
            if (axisValues !== null && axisValues.indexOf(metric.axisValue) === -1) {
                return "continue";
            }
            if (domain !== null && metric.domain !== domain) {
                return "continue";
            }
            if (categories !== null && !categoryMatch(metric.categoryList, categories)) {
                return "continue";
            }
            if (metrics !== null && metrics.indexOf(metric.metric) === -1) {
                return "continue";
            }
            if (metricType === 'timeseries') {
                if (metric.querySpecs && metric.querySpecs.timeseries) {
                    var current_1 = metric.querySpecs.timeseries;
                    if (geoLevels.some(function (level) {
                        if (current_1[level]) {
                            current_1 = current_1[level];
                            return false;
                        }
                        else {
                            return true;
                        }
                    })) {
                        return "continue";
                    }
                    else {
                        if (current_1.periods) {
                            if (resolution !== null && current_1.periods.indexOf(resolution) === -1) {
                                return "continue";
                            }
                            result[metricName] = metric;
                        }
                    }
                }
            }
        };
        var this_1 = this;
        // metricName: 'axis$axisValue.domain.metric' ; metric example at the bottom
        for (var _i = 0, _a = Object.keys(this.config.metricSpecs); _i < _a.length; _i++) {
            var metricName = _a[_i];
            _loop_1(metricName);
        }
        return result;
    };
    AnnotatedWebConfig.prototype.getGeoSpecFromGeoNotation = function (notation) {
        return this.webConfig.getGeoSpecFromGeoNotation(notation);
    };
    AnnotatedWebConfig.prototype.getGeoNotationFromGeoSpec = function (geoSpec) {
        return this.webConfig.getGeoNotationFromGeoSpec(geoSpec);
    };
    AnnotatedWebConfig.prototype.getGeoLevels = function (geoSpec) {
        var _this = this;
        var result = [];
        this.config.geoLevels.some(function (level) {
            if (!_this.webConfig.isGeoFieldEmpty(geoSpec[level])) {
                result.push(level);
                return false;
            }
            else {
                return true;
            }
        });
        return result;
    };
    /**
     * 获取完整的geo层级
     *
     * @returns {string[]}
     * @memberof AnnotatedWebConfig
     */
    AnnotatedWebConfig.prototype.getGeoRootLevels = function () {
        return this.config.geoLevels.slice();
    };
    /**
     * 获取顶级组织下的子geo层级，即不包含enterprise
     *
     * @returns {string[]}
     * @memberof AnnotatedWebConfig
     */
    AnnotatedWebConfig.prototype.getGeoSubLevels = function () {
        return this.config.geoSubLevels.slice();
    };
    // public getAdmGeoList(geoSpec: GeoSpec, level: number): object {
    // 	return this.webConfig.getAdmGeoList(geoSpec, level)
    // }
    AnnotatedWebConfig.prototype.getMapStruct = function () {
        return _.cloneDeep(this.mapStruct);
    };
    AnnotatedWebConfig.prototype.json2array = function () {
        var mapStruct = this.mapStruct;
        var levels = this.config.geoSubLevels;
        // geoSubLevels: ["factory", "workshop", "line", "equipment_product_shift"]
        // 仪表采集，氧气管网，供电公司，供水公司等不在top menu中显示
        var excludeFactory = ['MeterBus', 'MeterCollection', 'OxygenPipeline', 'GasFactory', 'ElectricityProvider', 'WaterProvider'];
        function _json2array(json, level, name) {
            if (level > levels.length) {
                return [];
            }
            var arr = [];
            var currObj = json[levels[level]];
            // remove line level from organization
            if (level === 2) {
                for (var item in currObj) {
                    if (currObj.hasOwnProperty(item)) {
                        var tmpSub = _json2array(currObj[item], level + 1, name + '|' + currObj[item].name);
                        arr = __spreadArrays(arr, tmpSub);
                    }
                }
                return arr;
            }
            var _loop_2 = function (item) {
                if (currObj.hasOwnProperty(item) &&
                    !excludeFactory.find(function (e) { return currObj[item].class[0].fqn.split('}')[1] === e; })
                // !excludeFactory.find(e => currObj[item].class[0].fqn.match(/(?<=\})\w+/g)[0] === e)
                ) {
                    var tmpSub = _json2array(currObj[item], level + 1, name + '|' + currObj[item].name);
                    // remove equipment type at equipment_product_shift level
                    if (level === 3 && currObj[item].class[0].fqn.indexOf('Machine') !== -1) {
                        return "continue";
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
            };
            for (var item in currObj) {
                _loop_2(item);
            }
            return arr;
        }
        var sub = _json2array(mapStruct, 0, mapStruct.name);
        return [
            {
                level: this.config.geoLevels[0],
                geo: mapStruct.name,
                class: mapStruct.class,
                i18n: mapStruct.i18n,
                sub: sub,
                process: mapStruct.axis.process,
            },
        ];
    };
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
    AnnotatedWebConfig.prototype.timeseries = function (queries) {
        return this.client
            .getData(queries)
            .then(function (queryResult) {
            var result = [];
            for (var _i = 0, queryResult_1 = queryResult; _i < queryResult_1.length; _i++) {
                var item = queryResult_1[_i];
                // @ts-ignore
                var _a = item.data, metricType = _a.metricType, id = _a.id, data = _a.data;
                if (metricType === 'timeseries') {
                    result.push({
                        id: id,
                        data: data.map(function (_a) {
                            var name = _a.name, value = _a.value;
                            return ({
                                timestamp: parseFloat(name),
                                value: value,
                            });
                        }),
                    });
                }
            }
            return result;
        });
    };
    /**
     * @param domain
     * @param filter -- a string or an array of strings (for multiple disjuncts)
     * @param id -- an array of strings
     *
     */
    AnnotatedWebConfig.prototype.search = function (domain, filter, id, _options) {
        return this.webConfig.search(domain, filter, id, _options);
    };
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
    AnnotatedWebConfig.prototype.createOrUpdateEntity = function (objectId, scope, domain, data, _options) {
        return this.webConfig.createOrUpdateEntity(objectId, scope, domain, data, _options);
    };
    /**
     * Return the array of tuples (key, value) where X <= key < Y
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param from lower bound of the key 值必须可以计算
     * @param to upper bound of the key
     */
    AnnotatedWebConfig.prototype.getMapValues = function (id, domain, name, from, to, _options) {
        return this.webConfig.getMapValues(id, domain, name, from, to, _options);
    };
    /**
     * Returns key value
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     */
    AnnotatedWebConfig.prototype.getMapValue = function (id, domain, name, key, _options) {
        return this.webConfig.getMapValue(id, domain, name, key, _options);
    };
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
    AnnotatedWebConfig.prototype.addValueToMap = function (id, domain, name, key, value, _options) {
        return this.webConfig.addValueToMap(id, domain, name, key, value, _options);
    };
    /**
     * Edit the value in the map
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     * @param value the value is either a primitive type or a document
     */
    AnnotatedWebConfig.prototype.editMapValue = function (id, domain, name, key, value, _options) {
        return this.webConfig.editMapValue(id, domain, name, key, value, _options);
    };
    /**
     * Delete the map value
     * @param id object id
     * @param domain domain, mixin type, ie "Target"
     * @param name map name
     * @param key
     */
    AnnotatedWebConfig.prototype.deleteMapValue = function (id, domain, name, key, _options) {
        return this.webConfig.deleteMapValue(id, domain, name, key, _options);
    };
    /**
     * Retrieves domain data from object.
     * @param objectId object id，ie:'zb_e|oxygen_p1|oxygen_p1_1552357589'
     * @param domain domain/mixin type, ie:"steel___OxygenPipelineInstruction"
     */
    AnnotatedWebConfig.prototype.getObjectDomain = function (objectId, domain, _options) {
        return this.webConfig.getObjectDomain(objectId, domain, _options);
    };
    /**
     *
     *  @return
     */
    AnnotatedWebConfig.prototype.timeseriesBatch = function (queries, _options) {
        return this.client.getTimeseriesBatch(queries, _options).then(function (results) {
            var result = [];
            for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
                var data = results_1[_i];
                var item = {};
                for (var _a = 0, _b = Object.keys(data); _a < _b.length; _a++) {
                    var metric = _b[_a];
                    item[metric] = data[metric].map(function (_a) {
                        var name = _a.name, value = _a.value;
                        return ({
                            timestamp: parseFloat(name),
                            value: value,
                        });
                    });
                }
                result.push(item);
            }
            return result;
        });
    };
    /**
     *
     *  @return
     */
    AnnotatedWebConfig.prototype.timeseriesMultiBatch = function (queries, noPrune, _options) {
        if (noPrune === void 0) { noPrune = false; }
        return this.client.getTimeseriesMultiBatch(queries, noPrune, _options).then(function (data) {
            var result = {};
            for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                var metric = _a[_i];
                result[metric] = data[metric].map(function (_a) {
                    var name = _a.name, value = _a.value;
                    return ({
                        timestamp: parseFloat(name),
                        value: value,
                    });
                });
            }
            return result;
        });
    };
    /**
     * Find objects specified by the filter. If filter element is null, skip this element
     *
     */
    AnnotatedWebConfig.prototype.findObjects = function (_a) {
        var _b;
        var _c = _a.classes, classes = _c === void 0 ? null : _c;
        var result = {};
        this._findObjects(this.mapStruct, this.mapStruct.name, (_b = {},
            _b[this.config.geoLevels[0]] = this.mapStruct.name,
            _b), this.config.geoLevels.slice(1), {
            classes: classes,
        }, result);
        var resultList = [];
        for (var _i = 0, _d = Object.keys(result); _i < _d.length; _i++) {
            var geo = _d[_i];
            resultList.push(result[geo]);
        }
        return resultList;
    };
    AnnotatedWebConfig.prototype.isInstance = function (obj, cls) {
        var inputObj = this._findObjectByGeoSpec(obj);
        var classes = inputObj.spec.class;
        for (var _i = 0, classes_1 = classes; _i < classes_1.length; _i++) {
            var c = classes_1[_i];
            if (cls === c.fqn) {
                return true;
            }
        }
        return false;
    };
    AnnotatedWebConfig.prototype.getSources = function (obj, relationType) {
        var _a;
        var result = {};
        var geoNotation = this.getGeoNotationFromGeoSpec(obj);
        this._findObjectsByRelation(this.mapStruct, this.mapStruct.name, (_a = {},
            _a[this.config.geoLevels[0]] = this.mapStruct.name,
            _a), this.config.geoLevels.slice(1), {
            relations: [
                {
                    type: relationType,
                    destination: geoNotation,
                },
            ],
        }, result);
        var resultList = [];
        for (var _i = 0, _b = Object.keys(result); _i < _b.length; _i++) {
            var geo = _b[_i];
            resultList.push(result[geo]);
        }
        return resultList;
    };
    AnnotatedWebConfig.prototype.getDestinations = function (obj, relationType) {
        var inputObj = this._findObjectByGeoSpec(obj);
        var resultList = [];
        var relations = inputObj.spec.related;
        if (relations) {
            for (var _i = 0, relations_1 = relations; _i < relations_1.length; _i++) {
                var relation = relations_1[_i];
                if (relation.type === relationType) {
                    var geoNotation = relation.destination;
                    var resultObj = this._findObjectByGeoNotation(geoNotation);
                    if (resultObj) {
                        resultList.push(resultObj);
                    }
                }
            }
        }
        return resultList;
    };
    AnnotatedWebConfig.prototype._findObjects = function (
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
        var _a;
        // match root
        var match = true;
        if (filter.classes !== null) {
            var notFound = true;
            var _loop_3 = function (aClass) {
                if (root.class !== null && root.class.some(function (_a) {
                    var fqn = _a.fqn;
                    return fqn === aClass;
                })) {
                    notFound = false;
                    return "break";
                }
            };
            for (var _i = 0, _b = filter.classes; _i < _b.length; _i++) {
                var aClass = _b[_i];
                var state_1 = _loop_3(aClass);
                if (state_1 === "break")
                    break;
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
            var children = root[subLevels[0]];
            if (!!children) {
                for (var _c = 0, _d = Object.keys(children); _c < _d.length; _c++) {
                    var id = _d[_c];
                    this._findObjects(children[id], geo + "|" + id, __assign(__assign({}, geoSpec), (_a = {}, _a[subLevels[0]] = id, _a)), subLevels.slice(1), filter, result);
                }
            }
        }
    };
    AnnotatedWebConfig.prototype._findObjectsByRelation = function (
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
        var _a;
        // match root
        var match = true;
        if (filter.relations !== null) {
            var notFound = true;
            var _loop_4 = function (aRelation) {
                if (root.related !== undefined &&
                    root.related !== null &&
                    root.related.some(function (_a) {
                        var type = _a.type, destination = _a.destination;
                        return type === aRelation.type && destination === aRelation.destination;
                    })) {
                    notFound = false;
                    return "break";
                }
            };
            for (var _i = 0, _b = filter.relations; _i < _b.length; _i++) {
                var aRelation = _b[_i];
                var state_2 = _loop_4(aRelation);
                if (state_2 === "break")
                    break;
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
            var children = root[subLevels[0]];
            if (!!children) {
                for (var _c = 0, _d = Object.keys(children); _c < _d.length; _c++) {
                    var id = _d[_c];
                    this._findObjectsByRelation(children[id], geo + "|" + id, __assign(__assign({}, geoSpec), (_a = {}, _a[subLevels[0]] = id, _a)), subLevels.slice(1), filter, result);
                }
            }
        }
    };
    AnnotatedWebConfig.prototype._findObjectByGeoNotation = function (geoNotation) {
        var geoDelimiter = this.config.geoDelimiter;
        if (!geoDelimiter) {
            geoDelimiter = '|';
        }
        var geoLevels = this.config.geoLevels;
        var targetGeoFields = geoNotation.split(geoDelimiter);
        var resultKey = {};
        var obj = this.mapStruct;
        if (targetGeoFields.length <= geoLevels.length) {
            for (var i = 0; i < targetGeoFields.length; i++) {
                var level = geoLevels[i];
                var field = targetGeoFields[i];
                resultKey[level] = field;
                if (i === 0) {
                    if (field !== obj.name) {
                        throw new Error("unexpected geo field " + field + " on geo level " + level);
                    }
                }
                else {
                    obj = obj[level][field];
                    if (!obj) {
                        throw new Error("unexpected geo field " + field + " on geo level " + level);
                    }
                }
            }
        }
        return {
            key: resultKey,
            spec: obj,
        };
    };
    AnnotatedWebConfig.prototype._findObjectByGeoSpec = function (geoSpec) {
        var geoLevels = this.config.geoLevels;
        var obj = this.mapStruct;
        var geoSpecLength = Object.keys(geoSpec).length;
        if (geoSpecLength <= geoLevels.length) {
            for (var i = 0; i < geoSpecLength; i++) {
                var level = geoLevels[i];
                var field = geoSpec[level];
                if (i === 0) {
                    if (field !== obj.name) {
                        throw new Error("unexpected geo field " + field + " on geo level " + level);
                    }
                }
                else {
                    obj = obj[level][field];
                    if (!obj) {
                        throw new Error("unexpected geo field " + field + " on geo level " + level);
                    }
                }
            }
        }
        return {
            key: geoSpec,
            spec: obj,
        };
    };
    return AnnotatedWebConfig;
}());
//
function aggregateTimeseries(timeseries) {
    var result = [];
    //@ts-ignore
    var indices = timeseries.map(function (data) { return -1; });
    while (true) {
        var stop = true;
        var minIdx = -1;
        for (var i = 0; i < indices.length; i++) {
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
        var timestamp = timeseries[minIdx][indices[minIdx] + 1].timestamp;
        var value = {
            sum: 0,
            cnt: 0,
            max: 0,
            min: 0,
            stddev: 0,
        };
        for (var i = 0; i < indices.length; i++) {
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
        result.push({ timestamp: timestamp, value: value });
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

exports.AnnotatedWebConfig = AnnotatedWebConfig;
exports.aggregateTimeseries = aggregateTimeseries;
exports.annotatedWebConfig = annotatedWebConfig;
exports.getLabel = getLabel$1;
exports.globalConfig = globalConfig;
//# sourceMappingURL=bundle.js.map
