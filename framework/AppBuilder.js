import React, {
  Component,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Creates an application class that represents a root
 * react native component, and uses the context initialized
 * through the AppBuilder API. Each call to this method will
 * return a new class.
 * @param appContext The context configured through the builder API.
 * @returns {App} The App class.
 */
function createApplication(appContext) {
  const App = class App extends Component {
    getContext() {
      return appContext;
    }

    render() {
      const content = this.props.children ||
        (
          <View style={styles.content}>
            <Text>Waiting for the initial screen...</Text>
          </View>
        );

      return (
        <Provider store={appContext.store}>
            {content}
        </Provider>
      );
    }
  };

  App.propTypes = {
    children: React.PropTypes.node,
  };

  return App;
}

function assertNotEmpty(target, errorMessage) {
  if (Object.keys(target).length <= 0) {
    throw new Error(errorMessage);
  }
}

function assertExtensionsExist(extensions) {
  assertNotEmpty(extensions, 'The app without any extensions cannot be created. ' +
    'You must supply at least one extensions using the setExtensions method');
}

function assertScreensExist(screens) {
  assertNotEmpty(screens, 'The app without any screens cannot be created. ' +
    'You must supply at least one screen using the setScreens method');
}

function assertReducersExist(reducers) {
  assertNotEmpty(reducers, 'The app without any reducers cannot be created. ' +
    'You must supply at least one extension that has a reducer defined.');
}

/**
 * Extracts all of the reducers from extensions. This function will
 * return an object that is compatible with the combineReducers from
 * redux. It will return an object that has a reducer function assigned
 * to extension names, e.g.:
 * {
 *  extension1: extension1.reducer,
 *  extension2: extension2.reducer,
 *  ...
 * }
 * @param extensions The extensions configured through the builder API.
 * @returns {*} The extension reducers object.
 */
function extractExtensionReducers(extensions) {
  return Object.keys(extensions).reduce((prevResult, key) => {
    const extension = extensions[key];
    let result = prevResult;
    if (extension.reducer) {
      result = {
        ...prevResult,
        [key]: extension.reducer,
      };
    }

    return result;
  }, {});
}

/**
 * Creates a redux store using the reducers from the extensions.
 * The store will contain the extension keys on the root level,
 * where each of those keys will be handled by the extensions
 * reducer, e.g.:
 * {
 *  extension1: extension1.reducer,
 *  extension2: extension2.reducer,
 *  ...
 * }
 * @param appContext The context configured through the builder API
 * @returns {*} The created redux store.
 */
function createApplicationStore(appContext) {
  const extensionReducers = extractExtensionReducers(appContext.extensions);
  assertReducersExist(extensionReducers);

  const reducer = combineReducers(extensionReducers);
  const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
  return createStoreWithMiddleware(reducer);
}

/**
 * Builds and initializes an App class that represents a root
 * react native component. Every call to the build method will
 * return a new App class that will use the data from the context
 * initialized through the AppBuilder.
 */
export default class AppBuilder {

  constructor() {
    this.appContext = {
      store: {},
      extensions: {},
      screens: {},
    };
  }

  setExtensions(extensions) {
    this.appContext.extensions = extensions;
    return this;
  }

  setScreens(screens) {
    this.appContext.screens = screens;
    return this;
  }

  build() {
    const appContext = Object.assign({}, this.appContext);
    assertExtensionsExist(appContext.extensions);
    assertScreensExist(appContext.screens);

    appContext.store = createApplicationStore(appContext);
    return createApplication(appContext);
  }
}
