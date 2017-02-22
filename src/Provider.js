import React, { Component, PropTypes } from 'react';
import EasyReactNative from './EasyReactNative';

class Provider extends Component{
  constructor(props){
    super(props);
    props.app.registerViewChangeCallback((view) => {
      this.setState({view: view});
    });
    this.state = {
      view: props.app.getView('/')
    };
  }

  getChildContext() {
    let app = this.props.app;
    return {
      update: app.update.bind(app),
      updateStore: app.updateStore.bind(app),
      getData: app.getData.bind(app),
      getView: app.getView.bind(app)
    };
  }

  render(){
    return this.state.view;
  }
}

export default Provider;

Provider.PropTypes = {
  app: PropTypes.instanceOf(EasyReactNative)
};

Provider.childContextTypes = {
  update: PropTypes.func.isRequired,
  updateStore: PropTypes.func.isRequired,
  getData: PropTypes.func.isRequired,
  getView: PropTypes.func.isRequired
};
