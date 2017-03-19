# easy-react-native

**easy-react-native** is a framework that solves the store and router problems of creating a react-native app, it is composed of two main independent libraries:
[mini-routerjs](https://github.com/Jimmy-YMJ/mini-routerjs) as router, [jsonstore-js](https://github.com/Jimmy-YMJ/jsonstore-js) as store.


## Installing
```bash
$ npm install easy-react-native --save
```

```javascript
import EasyReactNative from 'easy-react-native';

```

## Example

File: ./index.android.js or ./index.ios.js
```javascript
import React, { PropTypes, Component } from 'react';
import EasyReactNative, { Store } from 'easy-react-native';
import {
  AppRegistry
} from 'react-native';

// Import pages
import PageOne from './PageOne';
import PageTwo from './PageTwo';
import PageThree from './PageThree';

// Create routers
const pageOne = {
    pattern: '/page-one',
    selector: function (request, store) {
      return { name: store.get('currentPage') };
    },
    component: PageOne
};

const pageTwo = {
    pattern: '/page-two',
    selector: function (request, store) {
      return { name: store.get('currentPage') };
    },
    component: PageTwo
};

const pageThree = {
    pattern: '/page-three',
    selector: function (request, store) {
      return { name: store.get('currentPage') };
    },
    component: PageThree
};

// Create the root app

const initialStore = new Store({
    store: {
        tip: 'Hello world!'
    }
});

class AppRoot extends Component {
  render() {
    return <EasyReactNative routes={[pageOne, pageTwo, pageThree]} initialPath="/page-one" initialStore={initialStore}/>;
  }
}

AppRegistry.registerComponent('EasyReactNativeExample', () => AppRoot);

```

File: ./PageOne.js

```javascript
import React, { Component, PropTypes } from 'react';

class

```

## License
MIT
