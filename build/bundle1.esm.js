import axios from 'axios';

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

export { Axios };
//# sourceMappingURL=bundle1.esm.js.map
