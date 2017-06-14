import Router from 'mini-routerjs';
import JSONStore from 'jsonstore-js';
import React, {Component, PropTypes} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Keyboard
} from 'react-native';
import Page from './Page';

const emptyFunc = () => {};
const SCREEN_HEIGHT = Dimensions.get('window').height;

class EasyReactNative extends Component {
  constructor(props) {
    super(props);
    this.history = [this.props.initialPath];
    this._routes = props.routes;
    this._currentPath = props.initialPath;
    this._prevPath = '';
    this._currentPattern = '';
    this._currentRoute = null;
    this._prevPattern = '';
    this._pageRefs = [];
    this._pageStates = {};
    this._renderedPages = {};
    this._store = props.initialStore;
    this._rootHistoryDic = this._getRootHistoryDict();
    this._router = new Router({
      strict: props.strict !== false
    });
    this._routes.forEach(route => {
      let selector = typeof route.selector === "function" ? route.selector : emptyFunc;
      // Register all routes
      this._router.create(route.pattern, request => {
        this._pageStates[route.pattern] = selector(request, viewStore(this._store));
        if(request.pattern !== this._currentPattern){
          this._prevPattern = this._currentPattern;
        }

        this._currentRoute = route;
        this._currentPattern = request.pattern;

        this._prevPath = this._currentPath;
        this._currentPath = request.url.url;

        route.url = request.url.url;
      });
    });

    this._router.match(this._currentPath);

    this.state = Object.assign({}, this._pageStates);
  }

  _getRootHistoryDict(){
    let dict = {};
    this.props.rootHistorys.forEach(history => {
      dict[history] = true;
    });
    return dict;
  }

  getChildContext() {
    return {
      update: this.update.bind(this),
      updateStore: this.updateStore.bind(this),
      getData: this.getData.bind(this),
      historyPush: this.historyPush.bind(this),
      historyPop: this.historyPop.bind(this),
      historyRemove: this.historyRemove.bind(this),
      historyReplace: this.historyReplace.bind(this),
      loadStoreCache: this._store.loadCache.bind(this._store),
      getCurrentPageName: this.getCurrentPageName.bind(this)
    };
  }

  getCurrentPageName(){
    return this._currentRoute && this._currentRoute.component.displayName || '';
  }

  historyReplace(target, history){
    let targetIndex = this.history.indexOf(target);
    if(targetIndex !== -1){
      this.history.splice(targetIndex, 10000, history);
    }
  }

  historyRemove(target, amount){
    amount = amount || 1;
    let targetIndex = this.history.indexOf(target);
    if(targetIndex !== -1){
      this.history.splice(targetIndex, amount);
    }
  }

  historyPush(url, isRoot){
    let historyLength = this.history.length;
    if(isRoot === true || this._rootHistoryDic[url]){
      this.history = [url];
    }else{
      let duplicate;
      while ((duplicate = this.history.indexOf(url)) !== -1){
        this.history = this.history.slice(0, duplicate)
      }
      this.history.push(url);
    }
  }

  historyPop(){
    let historyIndex = historyLen = this.history.length;
    while (historyIndex){
      if(this.history[historyIndex - 1] === this._currentPath){
        break;
      }
      historyIndex --
    }
    let nextHistory = this.history[historyIndex - 2];
    if(nextHistory){
      this.update(nextHistory);
      return historyIndex - 2;
    }else if(nextHistory = this.history[historyLen - 2]){
      this.update(nextHistory);
      return historyLen - 2;
    }
  }

  update(path, action, a, b, c, d, e, f) {
    let actionReturn;
    if (typeof path === "function") {
      actionReturn = this._store.do(path, action, a, b, c, d, f);
    } else if(typeof path === 'string'){
      this.historyPush(path);
      if (typeof action === "function") {
        actionReturn = this._store.do(action, a, b, c, d, e);
      }
    }
    actionReturn = actionReturn && Object.prototype.hasOwnProperty.call(actionReturn, 'then') && typeof actionReturn.then === 'function' ? actionReturn : Promise.resolve();
    actionReturn.then(() => {
      this._router.match(typeof path === "string" && path.length ? path : this._currentPath);
      let state = {};
      state[this._currentPattern] = this._pageStates[this._currentPattern];
      this.setState(state);
    });
  }

  updateStore(name, action, a, b, c, d, e) {
    return this._store.do(name, action, a, b, c, d, e);
  }

  getData(path, copy) {
    return this._store.get(path, copy);
  }

  _renderPage(route, props) {
    props = props || {};
    let disabledPageStyle = null,
      disabledPagePointerEvents = 'auto',
      pattern = route.pattern;
    if (pattern !== this._currentPattern) {
      disabledPageStyle = styles.disabledPage;
      disabledPagePointerEvents = 'none';
    }
    if(this._currentPath !== this._prevPath){
      if(this._currentPath === route.url){
        props = Object.assign({ _pageShow: true }, props);
      }else{
        Keyboard.dismiss();
        props = Object.assign({ _pageHide: true }, props);
      }
    }
    return props._pageHide && route.cache === false ? null : (
      <Page
        _pageShow={props._pageShow}
        _pageHide={props._pageHide}
        collapsable={false}
        key={`page_${route.pattern}_${route.url || ''}`}
        ref={(page) => {
          this._pageRefs[pattern] = page;
        }}
        pointerEvents={disabledPagePointerEvents}
        style={[styles.basePage, disabledPageStyle]}>
        {React.createElement(route.component, props)}
      </Page>
    );
  }

  render() {
    let pages = this._routes.map(route => {
      if (route.pattern === this._currentPattern || (route.pattern === this._prevPattern && this._prevPath !== this._currentPath)) {
        let renderedPage = this._renderPage(route, this.state[route.pattern]);
        this._renderedPages[route.pattern] = renderedPage;
        return renderedPage;
      } else {
        return this._renderedPages[route.pattern];
      }
    });
    return (
      <View style={[styles.container]}>
        {pages}
      </View>
    );
  }
}

EasyReactNative.Store = JSONStore;

module.exports = EasyReactNative;

EasyReactNative.defaultProps = {
  initialPath: '/',
  dismissKeyboard: true,
  rootHistorys: []
};

EasyReactNative.propTypes = {
  routes: PropTypes.array.isRequired,
  initialPath: PropTypes.string,
  dismissKeyboard: PropTypes.bool,
  rootHistorys: PropTypes.array
};

EasyReactNative.childContextTypes = {
  update: PropTypes.func.isRequired,
  updateStore: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired,
  historyPush: PropTypes.func.isRequired,
  historyPop: PropTypes.func.isRequired,
  historyRemove: PropTypes.func.isRequired,
  historyReplace: PropTypes.func.isRequired,
  loadStoreCache: PropTypes.func.isRequired,
  getCurrentPageName: PropTypes.func.isRequired
};

/**
 * Wrapping the store to make sure that only accessing data copy is allowed when rendering view
 * */
function viewStore(store) {
  return {
    get: function (path) {
      return store.get(path, true);
    }
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  basePage: {
    position: 'absolute',
    overflow: 'hidden',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  disabledPage: {
    top: SCREEN_HEIGHT,
    bottom: -SCREEN_HEIGHT,
  }
});
