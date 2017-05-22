'use strict';

import React from 'react';
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import AppReducer from './js-navigation/reducers';
import AppWithNavigationState from './js-navigation/navigators/AppNavigator';

class ReduxExampleApp extends React.Component {
  store = createStore(AppReducer);

  render() {
    return (
      <Provider store={this.store}>
        <AppWithNavigationState />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('ReduxExample', () => ReduxExampleApp);
