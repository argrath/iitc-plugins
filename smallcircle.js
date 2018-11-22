// ==UserScript==
// @id             iitc-plugin-small-circle
// @name           IITC plugin: Small Circle
// @category       Tweaks
// @version        0.20181123
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://argrath.github.io/iitc-plugins/smallcircle.js
// @downloadURL    https://argrath.github.io/iitc-plugins/smallcircle.js
// @description    Render markers smaller
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////


window.plugin.smallCircle = function() {};

window.plugin.smallCircle.setup = function() {
  window.addHook('iitcLoaded', function() {
    window.getMarkerStyleOptions = function(details) {
      var _radius = (details.level < 4 ? 4 : 6);
      var options = {
        radius: _radius,
        stroke: true,
        color: COLORS[details.team],
        weight: 1,
        opacity: 1,
        fill: true,
        fillColor: COLORS[details.team],
        fillOpacity: 1,
        dashArray: null
      };

      return options;
    };
  });
};

var setup = window.plugin.smallCircle.setup;

// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
