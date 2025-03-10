// ==UserScript==
// @name           IITC plugin: Refresh portal button
// @id             iitc-plugin-reload-portal-details
// @category       Info
// @version        1.20250310
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://argrath.github.io/iitc-plugins/reload-portal-details.user.js
// @downloadURL    https://argrath.github.io/iitc-plugins/reload-portal-details.user.js
// @description    Add a button so that quickly refresh portal details data.
// @match          https://intel.ingress.com/*
// @match          https://intel-x.ingress.com/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// PLUGIN START ////////////////////////////////////////////////////////

// use own namespace for plugin
window.plugin.reloadDetails = function() {};

window.plugin.reloadDetails.setupCallback = function() {
    IITC.toolbox.addButton({
      label: 'Refresh portal',
      title: 'Refresh portal',
      action: window.plugin.reloadDetails.reloadPortalDetails,
    });
}

window.plugin.reloadDetails.reloadPortalDetails = function() {
  window.portalDetail.request(window.selectedPortal);
}

var setup = function () {
  window.plugin.reloadDetails.setupCallback();
}


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
