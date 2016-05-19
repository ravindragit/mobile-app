import GridScreen from './screens/GridScreen';
import DetailsScreen from './screens/DetailsScreen';
import ListScreen from './screens/ListScreen';
import { combineReducers } from 'redux';
import { openListScreen, reducers, findNews } from './actions';

export const reducer = combineReducers({ ...reducers });

export const actions = {
  openListScreen,
  findNews,
};

export const screens = {
  ListScreen,
  GridScreen,
  DetailsScreen,
};

