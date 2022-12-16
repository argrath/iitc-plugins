// ==UserScript==
// @id             highlight-unvisited
// @name           IITC Plugin: highlight unvisited
// @category       Highlighter
// @version        0.20221217
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @updateURL      https://argrath.github.io/iitc-plugins/highlight-unvisited.user.js
// @downloadURL    https://argrath.github.io/iitc-plugins/highlight-unvisited.user.js
// @description    Highlight unvisited/uncaptured/unscanned portals
// @match          https://intel.ingress.com/*
// @match          https://intel-x.ingress.com/*
// @grant          none
// @author         argrath
// @license        ISC
// ==/UserScript==
// Based on 'hilight-intel-uniques' by LeJeu

function wrapper(plugin_info) {
    // ensure plugin framework is there, even if iitc is not yet loaded
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    // use own namespace for plugin
    let plugin = window.plugin.portalHighlighterUnvisited = function () { };

    let [VISITED, CAPTURED, SCANNED] = [1,2,4];
    let appliedStyle = {opacity: 0.5, fillOpacity: 0};

    plugin.styles = {
        "Unvisited": {
            flag: VISITED,
        },
        "Uncaptured": {
            flag: CAPTURED,
        },
        "Unscanned": {
            flag: SCANNED,
        },
    };

    plugin.highlighter = function (data, style) {
        let visited = data.portal.options.ent[2][18];

        if (visited === undefined) {
            return;
        }

        if (visited & style.flag) {
            data.portal.setStyle(appliedStyle);
        }
    }

    var setup = function () {
        for (let name in plugin.styles) {
            let style = plugin.styles[name];
            window.addPortalHighlighter(name, function (data) {
                return plugin.highlighter(data, style);
            });
        }
    }

    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);

