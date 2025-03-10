// ==UserScript==
// @id             iitc-plugin-custom-tracker
// @name           IITC plugin: Custom Tracker
// @category       Tweaks
// @version        0.20250310
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://argrath.github.io/iitc-plugins/customtracker.user.js
// @downloadURL    https://argrath.github.io/iitc-plugins/customtracker.user.js
// @description    Customize Tracker plugin
// @match          https://intel.ingress.com/*
// @match          https://intel-x.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

/* global IITC, L -- eslint */

// PLUGIN START ////////////////////////////////////////////////////////

window.PLAYER_TRACKER_MAX_TIME = 1*60*60*1000; // in milliseconds

var setup = function() {
  window.plugin.playerTracker.iconEnl = L.Icon.Default.extend({options: {
    iconSize: new L.Point(16, 16),
    iconAnchor: new L.Point(8, 16),
    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABlSURBVDhPpYxBDoAwCMD4/6c1aBlg5jZCuUGLyNWYh7iozoDFCeZSgq/R5kSPMsBhhTkUH/yMnol3igkIM+yG+YNrZC9xj7kAMWI7jA2u51jnGIL0oIRnPmVasdJ+oLRiZftA5AbQm1C+xJyvCwAAAABJRU5ErkJggg==',
    iconRetinaUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABlSURBVDhPpYxBDoAwCMD4/6c1aBlg5jZCuUGLyNWYh7iozoDFCeZSgq/R5kSPMsBhhTkUH/yMnol3igkIM+yG+YNrZC9xj7kAMWI7jA2u51jnGIL0oIRnPmVasdJ+oLRiZftA5AbQm1C+xJyvCwAAAABJRU5ErkJggg=='
  }});
  window.plugin.playerTracker.iconRes = L.Icon.Default.extend({options: {
    iconSize: new L.Point(16, 16),
    iconAnchor: new L.Point(8, 16),
    iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABaSURBVDhPpcxRCsAwCANQ73/pjmwyMwgurQ/8UZOIWOt8burgzutZOEQY6tDhvwyynQKpHhS+Z0BxClr1yHifj52uwFKBbxhjUwVbOHhUAKMwjAtgFIa/gogLefJQvvvxV+MAAAAASUVORK5CYII=',
    iconRetinaUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABaSURBVDhPpcxRCsAwCANQ73/pjmwyMwgurQ/8UZOIWOt8burgzutZOEQY6tDhvwyynQKpHhS+Z0BxClr1yHifj52uwFKBbxhjUwVbOHhUAKMwjAtgFIa/gogLefJQvvvxV+MAAAAASUVORK5CYII='
  }});
};

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
