import {
  navigateTo,
} from 'shoutem/navigation';
import { find, storage, collection } from '@shoutem/redux-api-state';

export const SHOUTEM_NEWS_SCHEME = 'shoutem.news.articles';
export const SHOUTEM_IMAGES_SCHEME = 'shoutem.core.image-attachments';
export const SHOUTEM_CATEGORIES_SCHEME = 'shoutem.core.categories';
export const CATEGORY_SELECTED = Symbol('categorySelected');

export const reducers = {
  news: storage(SHOUTEM_NEWS_SCHEME),
  categories: storage(SHOUTEM_CATEGORIES_SCHEME),
  newsImages: storage(SHOUTEM_IMAGES_SCHEME),
  newsCategories: collection(SHOUTEM_CATEGORIES_SCHEME, 'newsCategories'),
  latestNews: collection(SHOUTEM_NEWS_SCHEME, 'latestNews'),
  searchedNews: collection(SHOUTEM_NEWS_SCHEME, 'searchedNews'),
};

export function openListScreen(settings = {
  photoCentric: false,
  endpoint: 'http://10.5.1.160',
  appId: '5734177',
  parentCategoryId: '92102',
}) {
  const nextScreenName = `shoutem.news.${settings.photoCentric ? 'GridScreen' : 'ListScreen'}`;

  const route = {
    screen: nextScreenName,
    props: {
      settings: {
        appId: settings.appId,
        endpoint: settings.endpoint,
        parentCategoryId: settings.parentCategoryId,
      },
    },
  };

  return navigateTo(route);
}

export function findNews(searchTerm, category, pageOffset = 0, settings) {
  let query = '';
  let collectionName = 'latestNews';
  const offset = `&page[offset]=${pageOffset}`;

  if (searchTerm) {
    query += `&query=${searchTerm}`;
    collectionName = 'searchedNews';
  }

  if (category) {
    query += `&filter[categories]=${category.id}`;
  }

  return find(
    {
      // TODO(Braco) - use appID dynamically (the right way)
      endpoint: `${settings.endpoint}/v1/apps/${settings.appId}/resources/${SHOUTEM_NEWS_SCHEME}?` +
      `include=image${query}${offset}&page[limit]=8`,
      headers: { 'Content-Type': 'application/json' },
    },
    SHOUTEM_NEWS_SCHEME,
    collectionName
  );
}

export function getNewsCategories(parent = 'null', settings) {
  return find(
    {
      // TODO(Braco) - use appID dynamically (the right way)
      endpoint: `${settings.endpoint}/v1/apps/${settings.appId}/categories` +
      `?filter[parent]=${parent}&filter[schema]=${SHOUTEM_NEWS_SCHEME}`,
      headers: { 'Content-Type': 'application/json' },
    },
    SHOUTEM_CATEGORIES_SCHEME,
    'newsCategories'
  );
}