import React, {
  View,
  Component,
  Text,
} from 'react-native';
import { connect } from 'react-redux';
import { connectStyle, INCLUDE } from 'shoutem/theme';
import { ListItem, AdvancedGridView } from 'shoutem.ui';
import newsMapDispatchToProps from './lib/newsMapDispatchToProps';
import newsMapStateToProps from './lib/newsMapStateToProps';
import ListScreenPropTypes from './lib/ListScreenPropTypes';
import renderCategoriesDropDown from './lib/renderNewsCategoriesDropDownMenu';
import isSearch from './lib/isSearch';
import fetchNews from './lib/fetchNews';
import renderFeaturedItem from './lib/renderFeaturedItem';
import _ from 'lodash';

function renderNewsItem(item, style, extrasSeparator, onPress) {
  if (item.featured) {
    return renderFeaturedItem(item, style, () => { onPress.apply(null, [item]); });
  }

  return (
    <ListItem
      key={item.id}
      description={item.title}
      image={{ uri: _.get(item, 'image.url') }}
      leftExtra={'News'}
      id={item.id}
      style={style.gridColumn}
      onPressItem={item}
      onPressMethod={onPress}
    />
  );
}

class GridScreen extends Component {
  constructor(props, context) {
    super(props, context);
    this.fetch = fetchNews.bind(this);
    props.getNewsCategories(props.parentCategoryId, props.settings);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.categorySelected = this.categorySelected.bind(this);
    this.state = {
      searchTerm: '',
      selectedCategory: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.categories.length > 0 && !nextProps.selectedCategory) {
      this.categorySelected(nextProps.categories[0]);
    }
  }

  onSearchChanged(searchTerm) {
    this.setState({ searchTerm });
  }

  categorySelected(category) {
    this.setState({ selectedCategory: category });
  }
  render() {
    const {
      style,
      setNavBarProps,
      navigateToRoute,
      news,
      searchedNews,
      gridColumns,
      categories,
    } = this.props;
    const { searchTerm, selectedCategory } = this.state;
    const showSearchResults = isSearch(searchTerm);

    setNavBarProps({
      rightComponent:
        renderCategoriesDropDown(
          categories, selectedCategory, this.categorySelected, style.categoriesDropDown
        ),
      centerComponent: (<Text style={style.navBarTitle}>News</Text>),
      style: style.navigationBar,
    });

    function openDetailsScreen(item) {
      const route = { screen: 'shoutem.news.DetailsScreen', props: { item } };
      navigateToRoute(route);
    }

    function renderGridItem(item) {
      return renderNewsItem(item, style, undefined, openDetailsScreen);
    }

    const itemsList = selectedCategory ? (
      <AdvancedGridView
        items={showSearchResults ? searchedNews : news}
        gridColumns={gridColumns}
        search
        infiniteScrolling
        notRefreshable={showSearchResults}
        onSearchTermChanged={this.onSearchChanged}
        queryParams={{ searchTerm, selectedCategory }}
        fetch={this.fetch}
        renderGridItem={renderGridItem}
        style={style.gridView}
      />) : null;

    return (
      <View style={style.screen}>
        {itemsList}
      </View>
    );
  }
}

GridScreen.propTypes = Object.assign({}, ListScreenPropTypes, {
  gridColumns: React.PropTypes.number,
});

const style = {
  gridView: {
    header: {
      container: {
      },
      search: {
        container: {
          backgroundColor: '#2c2c2c',
        },
      },
    },
    list: {
      paginationView: {
        height: 0,
        marginTop: 10,
      },
      actionsLabel: {
        height: 0,
        backgroundColor: 'red',
      },
    },
    listContent: {
    },
    gridItemWrapper: {
      padding: 5,
    },
  },
  navigationBar: {
    backgroundImage: {
      backgroundColor: '#2c2c2c',
    },
  },
  categoriesDropDown: {
    popUpButton: {
      buttonText: {
        [INCLUDE]: ['navBarTitle'],
      },
    },
  },
  navBarTitle: {
    color: '#fff',
  },
  featuredItem: {
    gridBox: {
      container: {
        padding: 5,
        backgroundColor: '#2c2c2c',
      },
      contentWrapper: {
        flexWrap: 'wrap',
        margin: 50,
        alignItems: 'center',
        justifyContent: 'center',
        height: 330,
      },
    },
  },
  screen: {},
  gridColumn: {
    [INCLUDE]: ['shoutem.ui.ListItem.photoCentric'],
  },
};

export default connect(newsMapStateToProps, newsMapDispatchToProps)(
  connectStyle('shoutem.news.GridScreen', style)(GridScreen)
);
