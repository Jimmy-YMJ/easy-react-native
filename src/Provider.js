const EasyReactNative = require('./EasyReactNative');
const React = require('react');

const Provider = React.createClass({
  getChildContext() {
    let app = this.props.app;
    return {
      update: app.update.bind(app)
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
  update: React.PropTypes.func.isRequired
};

module.exports = Provider;
