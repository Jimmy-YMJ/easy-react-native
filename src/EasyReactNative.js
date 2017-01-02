const Router = require('mini-routerjs');
const JSONStore = require('jsonstore-js');
const Provider = require('./Provider');
const emptyFunc = () => {};

function EasyReactNative(options) {
  this.view = null;
  this.currentPath = '/';
  this.store = new JSONStore({
    store: options.store || {}
  });

  this.router = new Router({
    strict: options.strict !== false
  });

  this.router.createMismatch(function () {
    this.view = null;
  }.bind(this));
}

EasyReactNative.prototype = {
  registerViewChangeCallback: function (cb) {
    cb = typeof cb === 'function' ? cb : emptyFunc;
    this.onViewChange = cb;
  },
  createRoute: function (route, callback) {
    this.router.create(route, function (request) {
      this.view = callback(request, this.store.get());
    }.bind(this));
  },
  createMismatch: function (callback) {
    this.router.createMismatch(function () {
      this.view = callback(this.store.get()) || null;
    }.bind(this));
  },
  updateStore: function (name, action, a, b, c, d, e, f) {
    return this.store.do(name, action, a, b, c, d, e, f);
  },
  update: function (path, action, a, b, c, d, e, f) {
    let result = {};
    if(typeof path === "function"){
      result = this.store.do(path, action, a, b, c, d, e);
    }else{
      this.currentPath = path;
      if(typeof action === "function"){
        result = this.store.do(action, a, b, c, d, e, f);
      }
    }
    this.router.match(this.currentPath);
    this.onViewChange(this.view);
    return result;
  },
  getData: function(path, copy){
    return this.store.get(path, copy);
  },
  getView: function (path) {
    this.router.match(path);
    return this.view;
  },
};

EasyReactNative.Provider = Provider;

module.exports = EasyReactNative;
