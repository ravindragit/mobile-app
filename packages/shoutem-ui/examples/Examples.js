import React from 'react';
import {
  ScrollView,
} from 'react-native';

import { Typography } from './Typography';
import { Images } from './Images';
import { Cards } from './Cards';
import { Tiles } from './Tiles';
import { Spinners } from './Spinners';
import { Buttons } from './Buttons';

export function Examples() {
  return (
    <ScrollView>
      <Typography />
      <Cards />
      <Tiles />
      <Spinners />
      <Buttons />
      <Images />
    </ScrollView>
  );
}
