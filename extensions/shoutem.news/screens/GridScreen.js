import React, {
  View,
  Component,
} from 'react-native';
import { connect } from 'react-redux';
import { connectStyle, INCLUDE } from 'shoutem/theme';
import { ListItem, AdvancedGridView, DropDownMenu } from 'shoutem.ui';
import newsMapDispatchToProps from './lib/newsMapDispatchToProps';
import newsMapStateToProps from './lib/newsMapStateToProps';
import ListScreenPropTypes from './lib/ListScreenPropTypes';

function renderNewsItem(item, style, extrasSeparator, onPress) {
  return (
    <ListItem
      key={item.id}
      description={item.title}
      image={{ uri: item.image.url }}
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
    this.fetch = this.fetch.bind(this);
    this.onSearchCleared = this.onSearchCleared.bind(this);
  }

  onSearchCleared() {
    this.props.clearSearch();
  }

  fetch(searchTerm) {
    this.props.findNews(searchTerm);
  }

  render() {
    const {
      style,
      setNavBarProps,
      navigateToRoute,
      news,
      searchedNews,
      gridColumns,
    } = this.props;


    const categoryDropDown = (
      <DropDownMenu
        items={[{ name: 'World', id: 1 }, { name: 'Sport', id: 2 }, { name: 'Music', id: 3 }]}
        bindings={{ text: 'name', value: 'id' }}
      />
    );
    setNavBarProps({
      rightComponent: categoryDropDown,
    });

    function openDetailsScreen(item) {
      const route = { screen: 'shoutem.news.DetailsScreen', props: { item } };
      navigateToRoute(route);
    }

    function renderGridItem(item) {
      return renderNewsItem(item, style, undefined, openDetailsScreen);
    }

    return (
      <View style={style.screen}>
        <AdvancedGridView
          items={searchedNews.length > 0 ? searchedNews : news}
          gridColumns={gridColumns}
          search
          onSearchCleared={this.onSearchCleared}
          fetch={this.fetch}
          renderGridItem={renderGridItem}
          style={style.gridView}
        />
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
      },
    },
    list: {
      paginationView: {
        paddingTop: 10,
        marginTop: 10,
      },
      actionsLabel: {
        background: 'red',
      },
    },
    listContent: {
    },
    gridRow: {
      paddingRight: 5,
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
