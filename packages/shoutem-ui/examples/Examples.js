import React from 'react';
import {
  ScrollView,
} from 'react-native';

import { Typography } from './Typography';
import { Dividers } from './Dividers';
import { Rows } from './Rows';
import { Cards } from './Cards';
import { Tiles } from './Tiles';
import { Spinners } from './Spinners';
import { Buttons } from './Buttons';
import { Images } from './Images';
import { DropDownMenus } from './DropDownMenu';

export function Examples() {
  return (
    <ScrollView>
      <Typography />
      <DropDownMenus />
      <Dividers />
      <Cards />
      <Rows />
      <Tiles />
      <Spinners />
      <Buttons />
      <Images />
    </ScrollView>
  );
}
