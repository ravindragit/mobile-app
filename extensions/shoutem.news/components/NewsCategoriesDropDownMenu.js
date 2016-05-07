import React from 'react-native';
import { DropDownMenu } from 'shoutem.ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getNewsCategories, SHOUTEM_CATEGORIES_SCHEME } from '../actions';
import { ReduxApiStateDenormalizer } from 'redux-api-state';
import { SHOUTEM_NEWS_EXT_NAME } from '../index';

class NewsCategoriesDropDownMenu extends React.Component {
  constructor(props, context) {
    super(props, context);
    props.getNewsCategories();
  }

  render() {
    const { categories, categorySelected, selectedCategory } = this.props;
    const clearCategoriesFilter = { name: 'All', id: null };

    return (<DropDownMenu
      items={[clearCategoriesFilter].concat(categories)}
      bindings={{ text: 'name', value: 'id' }}
      onItemSelected={categorySelected}
      selectedItem={selectedCategory}
    />);
  }
}

NewsCategoriesDropDownMenu.propTypes = {
  categories: React.PropTypes.array,
  selectedCategory: React.PropTypes.object,
  getNewsCategories: React.PropTypes.func,
  categorySelected: React.PropTypes.func,
};

function mapStateToProps(state) {
  const denormalizer = new ReduxApiStateDenormalizer();
  return {
    categories: denormalizer.denormalizeCollection(
      state[SHOUTEM_NEWS_EXT_NAME].newsCategories,
      SHOUTEM_CATEGORIES_SCHEME,
      { [SHOUTEM_CATEGORIES_SCHEME]: state[SHOUTEM_NEWS_EXT_NAME].categories }
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    getNewsCategories: bindActionCreators(getNewsCategories, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsCategoriesDropDownMenu);
