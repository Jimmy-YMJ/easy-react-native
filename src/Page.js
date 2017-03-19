import React, { Component, PropTypes } from 'react';
import {
  View
} from 'react-native';

class Page extends Component{
  shouldComponentUpdate(nextProps){
    return nextProps._pageHide !== true || (nextProps._pageHide === true && (this.props._pageHide !== nextProps._pageHide));
  }
  render(){
    return <View {...this.props}>{this.props.children}</View>;
  }
}

export default Page;
