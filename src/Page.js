import React, { Component, PropTypes } from 'react';
import deepEqual from 'deep-equal';
import {
  View
} from 'react-native';

class Page extends Component{
  shouldComponentUpdate(nextProps){
    return (nextProps._pageHide !== true && deepEqual(nextProps, this.props)) || (nextProps._pageHide === true && (this.props._pageHide !== nextProps._pageHide));
  }
  render(){
    return <View {...this.props}>{this.props.children}</View>;
  }
}

export default Page;
