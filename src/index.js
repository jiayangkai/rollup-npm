/* !
  * library v0.0.1
  * http://www.yo-i.com.cn/
  * (c) 2019 Yo-I
  */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
  typeof define === 'function' && define.amd ? define(['react'], factory) :
  (global = global || self, global.yoicharts = factory(global.react));
}(this, (function (React) { 'use strict';

  React = React && React.hasOwnProperty('default') ? React['default'] : React;

  const styles = require('./index.css');
  function index () {
      return (React.createElement("div", { className: styles.normal },
          React.createElement("div", { className: styles.welcome }),
          React.createElement("ul", { className: styles.list },
              React.createElement("li", null,
                  "To get started, edit ",
                  React.createElement("code", null, "src/pages/index.js"),
                  " and save to reload."),
              React.createElement("li", null,
                  React.createElement("a", { href: "https://umijs.org/guide/getting-started.html" }, "hello world")))));
  }

  return index;

})));
/* powered by Yo-i, copyright 2019 */
