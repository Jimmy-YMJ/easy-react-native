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
    this.history = [];
    this._routes = props.routes;
    this._currentPath = props.initialPath;
    this._prevPath = '';
    this._currentPattern = '';
    this._prevPattern = '';
    this._pageRefs = [];
    this._pageStates = {};
    this._renderedPages = {};
    this._store = props.initialStore;
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
        this._currentPattern = request.pattern;

        this._prevPath = this._currentPath;
        this._currentPath = request.url.url;

        route.url = request.url.url;
      });
    });

    this._router.match(this._currentPath);

    this.state = Object.assign({}, this._pageStates);
  }

  getChildContext() {
    return {
      update: this.update.bind(this),
      updateStore: this.updateStore.bind(this),
      getData: this.getData.bind(this),
      historyPush: this.historyPush.bind(this),
      historyPop: this.historyPop.bind(this)
    };
  }

  historyPush(url){
    if(url === true){
      this.history = [];
    }
    this.history.push(url);
  }

  historyPop(){
    let history = this.history.pop();
    if(history && history !== this._currentPath){
      this.update(history)
    }
  }

  update(pushHistory, path, action, a, b, c, d, e, f) {
    if(typeof pushHistory !== 'boolean'){
      pushHistory = true;
      path = pushHistory;
      action = path;
      a = action;
      b = a;
      c = b;
      d = c;
      e = d;
      f = e;
    }
    if(pushHistory === true && typeof path === 'string'){
      this.historyPush(path);
    }
    let actionReturn;
    if (typeof path === "function") {
      actionReturn = this._store.do(path, action, a, b, c, d, f);
    } else {
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
  dismissKeyboard: true
};

EasyReactNative.propTypes = {
  routes: PropTypes.array.isRequired,
  initialPath: PropTypes.string,
  dismissKeyboard: PropTypes.bool
};

EasyReactNative.childContextTypes = {
  update: PropTypes.func.isRequired,
  updateStore: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired,
  historyPush: PropTypes.func.isRequired,
  historyPop: PropTypes.func.isRequired
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
