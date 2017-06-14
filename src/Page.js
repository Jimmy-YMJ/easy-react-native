import React, { PureComponent, PropTypes } from 'react';
import deepEqual from 'deep-equal';
import {
  View
} from 'react-native';

export default class Page extends PureComponent{
  shouldComponentUpdate(nextProps){
    return (nextProps._pageHide === true && (this.props._pageHide !== nextProps._pageHide)) || (nextProps._pageHide !== true && !deepEqual(nextProps, this.props));
  }
  render(){
    return <View {...this.props}>{this.props.children}</View>;
  }
}
