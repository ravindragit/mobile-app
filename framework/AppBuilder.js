import React, {
  Component,
} from 'react-native';

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, connect } from 'react-redux';
import thunk from 'redux-thunk';

import { ScreenNavigator, ROOT_NAVIGATOR_NAME } from './navigation';
import coreExtensions from './coreExtensions';

import StyleProvider from './theme/StyleProvider';
const ConnectedStyleProvider = connect(state => {
  const shoutemAppState = state['shoutem.application'];
  const themeVariables =
    shoutemAppState && shoutemAppState.configuration && shoutemAppState.configuration.theme ?
    state['shoutem.application'].configuration.theme.variables : {};

  return {
    themeVariables,
  };
})(StyleProvider);

/**
 * Calls the lifecycle function with the given name on all
 * extensions that export this function.
 * @param app The app that will be passed to the lifecycle functions.
 * @param extensions The extensions of the app.
 * @param functionName The lifecycle function to call.
 */
function callLifecycleFunction(app, extensions, functionName) {
  for (const extensionName of Object.keys(extensions)) {
    const extension = extensions[extensionName];
    const lifecycleFunction = extension[functionName];
    if (typeof lifecycleFunction === 'function') {
      lifecycleFunction(app);
    }
  }
}

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
    /**
     * Returns the redux store of the app.
     * @returns {*} The redux store.
     */
    getStore() {
      return appContext.store;
    }

    /**
     * Returns the extensions used to initialize the app.
     * @returns {*} The extensions.
     */
    getExtensions() {
      return Object.assign({}, appContext.extensions);
    }

    /**
     * Returns the screens used to initialize the app.
     * @returns {*} The screens.
     */
    getScreens() {
      return Object.assign({}, appContext.screens);
    }

    componentWillMount() {
      callLifecycleFunction(this, appContext.extensions, 'appWillMount');
    }

    componentDidMount() {
      callLifecycleFunction(this, appContext.extensions, 'appDidMount');
    }

    componentWillUnmount() {
      callLifecycleFunction(this, appContext.extensions, 'appWillUnmount');
    }

    getChildContext() {
      return { screens: appContext.screens };
    }

    render() {
      const content = this.props.children || (
        <ScreenNavigator
          name={ROOT_NAVIGATOR_NAME}
          navigationBarComponent={appContext.navigationBarComponent}
        />
      );
      return (
        <Provider store={appContext.store}>
          <ConnectedStyleProvider themeInit={appContext.themeInit}>
            {content}
          </ConnectedStyleProvider>
        </Provider>
      );
    }
  };

  App.propTypes = {
    children: React.PropTypes.node,
  };

  App.childContextTypes = {
    screens: React.PropTypes.object,
  };

  return App;
}

function assertNotEmpty(target, errorMessage) {
  if (Object.keys(target).length <= 0) {
    throw new Error(errorMessage);
  }
}

function assertExtensionsExist(extensions) {
  assertNotEmpty(extensions, `The app without any extensions cannot be created.
    You must supply at least one extensions using the setExtensions method`);
}

function assertScreensExist(screens) {
  assertNotEmpty(screens, `The app without any screens cannot be created.
    You must set at least one extension that exports screens`);
}

function assertReducersExist(reducers) {
  assertNotEmpty(reducers, `The app without any reducers cannot be created.
    You must supply at least one extension that has a reducer defined.`);
}

function assertInitialRouteExists(initialRoute, screens) {
  assertNotEmpty(initialRoute, `The app without an initial route cannot be created.
    You must define an initial route using the setInitialRoute method.`);

  if (!screens[initialRoute.screen]) {
    throw new Error('The initial route points to a screen that does not exist.');
  }
}

function assertThemeInitExist(themeInit) {
  if (!themeInit || (themeInit && typeof themeInit !== 'function')) {
    throw Error('The app without an theme initial function cannot be created, ' +
      'ThemeInit doesn\'t exists or is wrong type, it must be function!');
  }
}

/**
 * Adds a core extension to the app extensions configured
 * through the builder API. This extension needs to be included
 * so that core framework components can use the application state
 * to store their state, and expose this state to other extensions.
 * @param appExtensions The extensions configured through the builder API.
 * @returns {*} The extensions object that includes the core extension.
 */
function includeCoreExtension(appExtensions) {
  return {
    ...appExtensions,
    ...coreExtensions,
  };
}

/**
 * Helper function for extraction of registered type from extensions
 * returns an object where keys are names of all registered object types
 * @param extensions {Object} The extensions registered through App builder API
 * @param objectType {String} what to extract from extensions
 * @returns {Object}
 */
function extractObjectFromExtensions(extensions, objectType) {
  return Object.keys(extensions).reduce((prevResult, key) => {
    const extension = extensions[key];
    let result = prevResult;
    if (extension[objectType]) {
      result = {
        ...prevResult,
        [key]: extension[objectType],
      };
    }

    return result;
  }, {});
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
  return extractObjectFromExtensions(extensions, 'reducer');
}

/**
 * Extracts all middleware registered by extensions. This function will
 * return an array that is compatible with the applyMiddleware from redux.
 * @param extensions  The extensions configured through the builder API.
 * @returns {Array} The array of all middlewares provided by extensions.
 */
function extractExtensionMiddleware(extensions) {
  const middleware = extractObjectFromExtensions(extensions, 'middleware');
  return Object.keys(middleware).reduce((prevResult, key) => prevResult.concat(middleware[key]),
    []);
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
  let middleware = [thunk];

  middleware = middleware.concat(extractExtensionMiddleware(appContext.extensions));

  return createStore(reducer, applyMiddleware(...middleware));
}

/**
 * Extracts all of the screens from provided extension. This function will
 * return an object that has React Component assigned to screen name
 * prefixed with extension name e.g.
 * {
 *  extension1.screenName1: ScreenComponent1,
 *  extension1.screenName2: ScreenComponent2,
 *  ...
 * }
 * @param extension The extension installed in app,
 * @param extensionName The name of installed extension
 * @returns {*} The screens object.
 */
function extractExtensionScreens(extension, extensionName) {
  const screens = {};

  if (extension.screens) {
    for (const screenName of Object.keys(extension.screens)) {
      screens[`${extensionName}.${screenName}`] = extension.screens[screenName];
    }
  }

  return screens;
}

/**
 * Extracts all of the screens from provided extensions. This function will
 * return an object that has React Component assigned to screen name
 * prefixed with extension name e.g.
 * {
 *  extension1.screenName1: ScreenComponent1,
 *  extension1.screenName2: ScreenComponent2,
 *  extension2.screenName3: ScreenComponent3,
 *  ...
 * }
 * @param appContext The context configured through the builder API
 * @returns {*} The screens object.
 */
function getApplicationScreens(appContext) {
  return Object.keys(appContext.extensions).reduce((prevResult, extensionName) => {
    const extension = appContext.extensions[extensionName];
    const extensionScreens = extractExtensionScreens(extension, extensionName);
    return Object.assign(prevResult, extensionScreens);
  }, {});
}

const APP_CONTEXT = Symbol('appContext');

/**
 * Builds and initializes an App class that represents a root
 * react native component. Every call to the build method will
 * return a new App class that will use the data from the context
 * initialized through the AppBuilder.
 */
export default class AppBuilder {

  constructor() {
    this[APP_CONTEXT] = {
      store: {},
      extensions: {},
      screens: {},
      initialRoute: {},
      themeInit: null,
    };
  }

  setExtensions(extensions) {
    this[APP_CONTEXT].extensions = Object.assign({}, extensions);
    return this;
  }

  setInitialRoute(route) {
    this[APP_CONTEXT].initialRoute = Object.assign({}, route);
    return this;
  }

  setNavigationBarComponent(component) {
    this[APP_CONTEXT].navigationBarComponent = component;
    return this;
  }

  setThemeInit(themeInit) {
    this[APP_CONTEXT].themeInit = themeInit;
    return this;
  }

  /**
   * Save only static content in app context, do not resolve dynamic content
   * which depends on state or it can be changed without new configuration.
   * We want everything to propagate through components properties and
   * automatically refreshes on update.
   */
  build() {
    // Capture the cloned appContext here, so that
    // each app gets its own context.
    const appContext = Object.assign({}, this[APP_CONTEXT]);

    assertExtensionsExist(appContext.extensions);
    appContext.extensions = includeCoreExtension(appContext.extensions);

    appContext.screens = getApplicationScreens(appContext);
    assertScreensExist(appContext.screens);
    if (Object.keys(appContext.initialRoute).length) {
      assertInitialRouteExists(appContext.initialRoute, appContext.screens);
    }

    assertThemeInitExist(appContext.themeInit);

    appContext.store = createApplicationStore(appContext);

    return createApplication(appContext);
  }
}
