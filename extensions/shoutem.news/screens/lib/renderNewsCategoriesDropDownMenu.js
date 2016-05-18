import React from 'react-native';
import { DropDownMenu } from 'shoutem.ui';

export default (categories, selectedCategory, onCategorySelect, style) => (categories.length > 1 ? (
  <DropDownMenu
    items={categories}
    bindings={{ text: 'name', value: 'id' }}
    onItemSelected={onCategorySelect}
    selectedItem={selectedCategory}
    style={style}
  />
) : null);