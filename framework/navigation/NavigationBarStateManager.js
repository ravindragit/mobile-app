import * as _ from 'lodash';

export default class NavigationBarStateManager {
  constructor() {
    this.setStateChangeListener = this.setStateChangeListener.bind(this);
    this.state = {
      title: 'Initial title',
    };

    this.routeStates = new Map();
  }

  onRouteChange(route) {
    this.currentRoute = route;

    const state = this.routeStates.get(route);
    if (true) {
      // Restore the navigation bar props that
      // are linked to the next route, if they exist.
      // This is necessary so that the navigation bar
      // props are restored when navigating back to
      // the screens that are already rendered, because
      // the navigator will not re-render the screen in
      // that case.
      this.setState(state);
    }
  }

  onRouteRemoved(route) {
    this.routeStates.delete(route);
  }

  setStateChangeListener(listener) {
    this.stateChangeListener = listener;
    this.triggerStateChangeListener(undefined, this.state);
  }

  triggerStateChangeListener(oldState, newState) {
    console.log('triggerStateChange');
    const listener = this.stateChangeListener;
    if (!listener) {
      return;
    }

    _.defer(() => {
      console.log('triggered');
      listener(Object.assign({}, oldState), Object.assign({}, newState));
    });
  }

  setState(state) {
    const oldState = this.state;
    const newState = Object.assign({}, state);

    this.state = newState;
    const route = this.currentRoute;
    this.routeStates.set(route, newState);
    this.triggerStateChangeListener(oldState, newState);
  }
}
