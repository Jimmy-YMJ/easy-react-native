const EasyReactNative = require('./EasyReactNative');
const React = require('react');

const Provider = React.createClass({
  getChildContext() {
    let app = this.props.app;
    return {
      update: app.update.bind(app),
      updateStore: app.updateStore.bind(app),
      getData: app.getData.bind(app),
      getView: app.getView.bind(app)
    };
  },
  render: function(){
    return this.props.children;
  }
});

Provider.PropTypes = {
  app: React.PropTypes.instanceOf(EasyReactNative)
};

Provider.childContextTypes = {
  update: React.PropTypes.func.isRequired,
  updateStore: React.PropTypes.func.isRequired,
  getData: React.PropTypes.func.isRequired,
  getView: React.PropTypes.func.isRequired
};

module.exports = Provider;
