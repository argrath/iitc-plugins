// ==UserScript==
// @id             iitc-plugin-portal-buttons
// @name           IITC plugin: Portal Buttons
// @category       Layer
// @version        0.1
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      none
// @downloadURL    none
// @description    Adds some buttons to show/hide portals on the map
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @include        https://www.ingress.com/mission/*
// @include        http://www.ingress.com/mission/*
// @match          https://www.ingress.com/mission/*
// @match          http://www.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};





// PLUGIN START ////////////////////////////////////////////////////////

window.plugin.PortalButtons = function() {};

window.plugin.PortalButtons.loadExternals = function() {
  console.log('Loading EasyButton JS now');
  (function(){

// This is for grouping buttons into a bar
// takes an array of `L.easyButton`s and
// then the usual `.addTo(map)`
L.Control.EasyBar = L.Control.extend({

  options: {
    position:       'topleft',  // part of leaflet's defaults
    id:             null,       // an id to tag the Bar with
    leafletClasses: true        // use leaflet classes?
  },


  initialize: function(buttons, options){

    if(options){
      L.Util.setOptions( this, options );
    }

    this._buildContainer();
    this._buttons = [];

    for(var i = 0; i < buttons.length; i++){
      buttons[i]._bar = this;
      buttons[i]._container = buttons[i].button;
      this._buttons.push(buttons[i]);
      this.container.appendChild(buttons[i].button);
    }

  },


  _buildContainer: function(){
    this._container = this.container = L.DomUtil.create('div', '');
    this.options.leafletClasses && L.DomUtil.addClass(this.container, 'leaflet-bar easy-button-container leaflet-control');
    this.options.id && (this.container.id = this.options.id);
  },


  enable: function(){
    L.DomUtil.addClass(this.container, 'enabled');
    L.DomUtil.removeClass(this.container, 'disabled');
    this.container.setAttribute('aria-hidden', 'false');
    return this;
  },


  disable: function(){
    L.DomUtil.addClass(this.container, 'disabled');
    L.DomUtil.removeClass(this.container, 'enabled');
    this.container.setAttribute('aria-hidden', 'true');
    return this;
  },


  onAdd: function () {
    return this.container;
  },

  addTo: function (map) {
    this._map = map;

    for(var i = 0; i < this._buttons.length; i++){
      this._buttons[i]._map = map;
    }

    var container = this._container = this.onAdd(map),
        pos = this.getPosition(),
        corner = map._controlCorners[pos];

    L.DomUtil.addClass(container, 'leaflet-control');

    if (pos.indexOf('bottom') !== -1) {
      corner.insertBefore(container, corner.firstChild);
    } else {
      corner.appendChild(container);
    }

    return this;
  }

});

L.easyBar = function(){
  var args = [L.Control.EasyBar];
  for(var i = 0; i < arguments.length; i++){
    args.push( arguments[i] );
  }
  return new (Function.prototype.bind.apply(L.Control.EasyBar, args));
};

// L.EasyButton is the actual buttons
// can be called without being grouped into a bar
L.Control.EasyButton = L.Control.extend({

  options: {
    position:  'topleft',       // part of leaflet's defaults

    id:        null,            // an id to tag the button with

    type:      'replace',       // [(replace|animate)]
                                // replace swaps out elements
                                // animate changes classes with all elements inserted

    states:    [],              // state names look like this
                                // {
                                //   stateName: 'untracked',
                                //   onClick: function(){ handle_nav_manually(); };
                                //   title: 'click to make inactive',
                                //   icon: 'fa-circle',    // wrapped with <a>
                                // }

    leafletClasses:   true      // use leaflet styles for the button
  },



  initialize: function(icon, onClick, title, id){

    // clear the states manually
    this.options.states = [];

    // add id to options
    if(id != null){
      this.options.id = id;
    }

    // storage between state functions
    this.storage = {};

    // is the last item an object?
    if( typeof arguments[arguments.length-1] === 'object' ){

      // if so, it should be the options
      L.Util.setOptions( this, arguments[arguments.length-1] );
    }

    // if there aren't any states in options
    // use the early params
    if( this.options.states.length === 0 &&
        typeof icon  === 'string' &&
        typeof onClick === 'function'){

      // turn the options object into a state
      this.options.states.push({
        icon: icon,
        onClick: onClick,
        title: typeof title === 'string' ? title : ''
      });
    }

    // curate and move user's states into
    // the _states for internal use
    this._states = [];

    for(var i = 0; i < this.options.states.length; i++){
      this._states.push( new State(this.options.states[i], this) );
    }

    this._buildButton();

    this._activateState(this._states[0]);

  },

  _buildButton: function(){

    this.button = L.DomUtil.create('button', '');

    if (this.options.id ){
      this.button.id = this.options.id;
    }

    if (this.options.leafletClasses){
      L.DomUtil.addClass(this.button, 'easy-button-button leaflet-bar-part');
    }

    // don't let double clicks get to the map
    L.DomEvent.addListener(this.button, 'dblclick', L.DomEvent.stop);

    // take care of normal clicks
    L.DomEvent.addListener(this.button,'click', function(e){
      L.DomEvent.stop(e);
      this._currentState.onClick(this, this._map ? this._map : null );
      this._map.getContainer().focus();
    }, this);

    // prep the contents of the control
    if(this.options.type == 'replace'){
      this.button.appendChild(this._currentState.icon);
    } else {
      for(var i=0;i<this._states.length;i++){
        this.button.appendChild(this._states[i].icon);
      }
    }
  },


  _currentState: {
    // placeholder content
    stateName: 'unnamed',
    icon: (function(){ return document.createElement('span'); })()
  },



  _states: null, // populated on init



  state: function(newState){

    // activate by name
    if(typeof newState == 'string'){

      this._activateStateNamed(newState);

    // activate by index
    } else if (typeof newState == 'number'){

      this._activateState(this._states[newState]);
    }

    return this;
  },


  _activateStateNamed: function(stateName){
    for(var i = 0; i < this._states.length; i++){
      if( this._states[i].stateName == stateName ){
        this._activateState( this._states[i] );
      }
    }
  },

  _activateState: function(newState){

    if( newState === this._currentState ){

      // don't touch the dom if it'll just be the same after
      return;

    } else {

      // swap out elements... if you're into that kind of thing
      if( this.options.type == 'replace' ){
        this.button.appendChild(newState.icon);
        this.button.removeChild(this._currentState.icon);
      }

      if( newState.title ){
        this.button.title = newState.title;
      } else {
        this.button.removeAttribute('title');
      }

      // update classes for animations
      for(var i=0;i<this._states.length;i++){
        L.DomUtil.removeClass(this._states[i].icon, this._currentState.stateName + '-active');
        L.DomUtil.addClass(this._states[i].icon, newState.stateName + '-active');
      }

      // update classes for animations
      L.DomUtil.removeClass(this.button, this._currentState.stateName + '-active');
      L.DomUtil.addClass(this.button, newState.stateName + '-active');

      // update the record
      this._currentState = newState;

    }
  },



  enable: function(){
    L.DomUtil.addClass(this.button, 'enabled');
    L.DomUtil.removeClass(this.button, 'disabled');
    this.button.setAttribute('aria-hidden', 'false');
    return this;
  },



  disable: function(){
    L.DomUtil.addClass(this.button, 'disabled');
    L.DomUtil.removeClass(this.button, 'enabled');
    this.button.setAttribute('aria-hidden', 'true');
    return this;
  },


  removeFrom: function (map) {

    this._container.parentNode.removeChild(this._container);
    this._map = null;

    return this;
  },

  onAdd: function(){
    var containerObj = L.easyBar([this], {
      position: this.options.position,
      leafletClasses: this.options.leafletClasses
    });
    this._container = containerObj.container;
    return this._container;
  }


});

L.easyButton = function(/* args will pass automatically */){
  var args = Array.prototype.concat.apply([L.Control.EasyButton],arguments);
  return new (Function.prototype.bind.apply(L.Control.EasyButton, args));
};

/*************************
 *
 * util functions
 *
 *************************/

// constructor for states so only curated
// states end up getting called
function State(template, easyButton){

  this.title = template.title;
  this.stateName = template.stateName ? template.stateName : 'unnamed-state';

  // build the wrapper
  this.icon = L.DomUtil.create('span', '');

  L.DomUtil.addClass(this.icon, 'button-state state-' + this.stateName.replace(/(^\s*|\s*$)/g,''));
  this.icon.innerHTML = buildIcon(template.icon);
  this.onClick = L.Util.bind(template.onClick?template.onClick:function(){}, easyButton);
}

function buildIcon(ambiguousIconString) {

  var tmpIcon;

  // does this look like html? (i.e. not a class)
  if( ambiguousIconString.match(/[&;=<>"']/) ){

    // if so, the user should have put in html
    // so move forward as such
    tmpIcon = ambiguousIconString;

  // then it wasn't html, so
  // it's a class list, figure out what kind
  } else {
      ambiguousIconString = ambiguousIconString.replace(/(^\s*|\s*$)/g,'');
      tmpIcon = L.DomUtil.create('span', '');

      if( ambiguousIconString.indexOf('fa-') === 0 ){
        L.DomUtil.addClass(tmpIcon, 'fa '  + ambiguousIconString)
      } else if ( ambiguousIconString.indexOf('glyphicon-') === 0 ) {
        L.DomUtil.addClass(tmpIcon, 'glyphicon ' + ambiguousIconString)
      } else {
        L.DomUtil.addClass(tmpIcon, /*rollwithit*/ ambiguousIconString)
      }

      // make this a string so that it's easy to set innerHTML below
      tmpIcon = tmpIcon.outerHTML;
  }

  return tmpIcon;
}

})();

  console.log('done loading EasyButton JS');

  window.plugin.PortalButtons.boot();

  $('head').append('<style>.leaflet-bar button,\n.leaflet-bar button:hover {\n  background-color: #fff;\n  border: none;\n  border-bottom: 1px solid #ccc;\n  width: 26px;\n  height: 26px;\n  line-height: 26px;\n  display: block;\n  text-align: center;\n  text-decoration: none;\n  color: black;\n}\n\n.leaflet-bar button {\n  background-position: 50% 50%;\n  background-repeat: no-repeat;\n  overflow: hidden;\n  display: block;\n}\n\n.leaflet-bar button:hover {\n  background-color: #f4f4f4;\n}\n\n.leaflet-bar button:first-of-type {\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n}\n\n.leaflet-bar button:last-of-type {\n  border-bottom-left-radius: 4px;\n  border-bottom-right-radius: 4px;\n  border-bottom: none;\n}\n\n.leaflet-bar.disabled,\n.leaflet-bar button.disabled {\n  cursor: default;\n  pointer-events: none;\n  opacity: .4;\n}\n\n.easy-button-button .button-state{\n  display: block;\n  width: 100%;\n  height: 100%;\n  position: relative;\n}\n\n.easy-button-button{\n  padding: 1px;\n}\n\n\n.leaflet-touch .leaflet-bar button {\n  width: 30px;\n  height: 30px;\n  line-height: 30px;\n}\n</style>');
};

window.plugin.PortalButtons.boot = function() {

    var showLayer = function (name, show) {

        for (i in window.layerChooser._layers) {

            // layer has .layer, .name and .overlay
            var layer = window.layerChooser._layers[i];
            
            if (layer.name === name) {
                if (show) {
                    if (!window.map.hasLayer(layer.layer)) {
                        window.map.addLayer(layer.layer);
                    }
                }
                else {
                    if (window.map.hasLayer(layer.layer)) {
                        window.map.removeLayer(layer.layer);
                    }     
                }           
            }
        }
    }

    var showNone = function () {
        showLayer("Unclaimed Portals", false);
        showLayer("Level 1 Portals",   false);
        showLayer("Level 2 Portals",   false);
        showLayer("Level 3 Portals",   false);
        showLayer("Level 4 Portals",   false);
        showLayer("Level 5 Portals",   false);
        showLayer("Level 6 Portals",   false);
        showLayer("Level 7 Portals",   false);
        showLayer("Level 8 Portals",   false);
    };

    var showAll = function () {
        showLayer("Unclaimed Portals", true);
        showLayer("Level 1 Portals",   true);
        showLayer("Level 2 Portals",   true);
        showLayer("Level 3 Portals",   true);
        showLayer("Level 4 Portals",   true);
        showLayer("Level 5 Portals",   true);
        showLayer("Level 6 Portals",   true);
        showLayer("Level 7 Portals",   true);
        showLayer("Level 8 Portals",   true);
    };

    var show78 = function () {
        showLayer("Unclaimed Portals", false);
        showLayer("Level 1 Portals",   false);
        showLayer("Level 2 Portals",   false);
        showLayer("Level 3 Portals",   false);
        showLayer("Level 4 Portals",   false);
        showLayer("Level 5 Portals",   false);
        showLayer("Level 6 Portals",   false);
        showLayer("Level 7 Portals",   true);
        showLayer("Level 8 Portals",   true);
    };

    var show8 = function () {
        showLayer("Unclaimed Portals", false);
        showLayer("Level 1 Portals",   false);
        showLayer("Level 2 Portals",   false);
        showLayer("Level 3 Portals",   false);
        showLayer("Level 4 Portals",   false);
        showLayer("Level 5 Portals",   false);
        showLayer("Level 6 Portals",   false);
        showLayer("Level 7 Portals",   false);
        showLayer("Level 8 Portals",   true);
    };

    var optionsNone = {
        id: 'portal-buttons-none',
        position: 'topleft',
        type: 'replace',
        leafletClasses: true,
        states:[{
            stateName: 'default',
            onClick: showNone,
            title: 'Hide all portals',
            icon: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQSCycrrywsMgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAADMSURBVEjH7dQxakJBGATgz4CaIr4mta1CJE0sPYRgF0hpaZEDeAAhSZ8DeAc7sUjhFbTQysZAQAiEJIakWeEVFnm4r3vT7Qz7D//MshQokDdq2OD5iDYKWu1Uk1v8oJ3iGvgMWhRMMUcpnCeYxYzqCl/oo4tvtGL38YBXrPCUR+EXeMN7lmLPMhhcI8E5Ov+9VMpg8IIFqiH/G/zGiqeHD9TRxB53sYaXscRjihtjjUoMgwF2uExxhy3uTx2eYIvhEW0cnm1S/KgF8sUf38sgS0tulTkAAAAASUVORK5CYII=">'
        }]
    };

    var optionsAll = {
        id: 'portal-buttons-all',
        position: 'topleft',
        type: 'replace',
        leafletClasses: true,
        states:[{
            stateName: 'default',
            onClick: showAll,
            title: 'Show all portals',
            icon: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQSCycFc/oh/QAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAADVSURBVEjH7dQxTgJREIDhL5JgoSUHMCHQ26rxAsTOQEexNccx9oDNEns9gQROYOAKegZohoSs6xrZlcLsJJO8eTNv/nmTN49a/r00Sp7f4BPLb2wnPyR4x7pMBUWAa7Rxgdu/ACR4wzzWlQLO0McMKe5xXiWgj9NInqKJQZWABK/4CH05tE15gA5u8LS3N8EVulUAdpWm8a43eM74DgY0MMQjLjP6EL5Sw9mLivNa0Q1fLzPJowL7yw2SePerHMAKi9+2aR/Qwh3GBfHTiGnV33gtx5MtlPonAzxqmcMAAAAASUVORK5CYII=">'
        }]
    };

    var options78 = {
        id: 'portal-buttons-78',  
        position: 'topleft',
        type: 'replace',
        leafletClasses: true,
        states:[{
            stateName: 'default',
            onClick: show78,
            title: 'Show L7 and L8 portals',
            icon: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQSCygR7rjpTwAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAACwSURBVEjH7dQhCgJREMbxn6igwWDWZjVYBa8gmAwewCiYPYAX8BA2z+EtLEbBYBN5lg0b3q7ryoJh/zDhfTNvPmZ4PGpqfqUR0cKX9bm0Ito8om0wqGrKHu5YZ+Q7ZSZLs8UN3Yx8wLhs8yYu2OfU/GSwxBPDqgzOOEZ2HnJiUrT5LLkwjTzVcSoCFqlzp6jBKZngE6VWNMILq6oMDriiXaB28s1aoI8HdvVPWvMfvAGWXR/Pp/hEnQAAAABJRU5ErkJggg==">'
        }]
    };

    var options8 = {
        id: 'portal-buttons-8',
        position: 'topleft',
        type: 'replace',
        leafletClasses: true,
        states:[{
            stateName: 'default',
            onClick: show8,
            title: 'Show L8 portals',
            icon: '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AQSCyguWN7EcgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAADSSURBVEjH7dQxSkNBEMbxnz4whU0ahUDIETyDfco09hbaiBYRUgRiod4ikBOktLOTHCEIKghWgopIUCQEbaZ6TVIMqd4flmU+hv2Y2dmlomId1HCJJ/zEfhV6CiO84Qj7OMY7hlkG3+iWtPPQl7K5Qs4rGiWthZesCg4xRx9NXOAXncyL7uEv1gLtzMP38IkbHOARz9GmFG5xhyLiOqYYZxnMcFLSzvCVNUUf2ClpjTBeSrFCzm5UMMN2TE8P15hktGgLAzzE47rHKTaqX7RiPfwDYsMndVX6ZHAAAAAASUVORK5CYII=">'
        }]
    };

    var buttons = [L.easyButton(optionsNone), L.easyButton(optionsAll), L.easyButton(options78), L.easyButton(options8)];

    L.easyBar(buttons).addTo(window.map);
};

var setup = window.plugin.PortalButtons.loadExternals;

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


