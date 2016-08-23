import React, { Component } from 'react';

import { Button } from '../Button';
import { Animated } from '../Animated';

import Share from 'react-native-share';
import * as _ from 'lodash';

const composers = {
  title: (value, props) => ({
    centerComponent: (
      <Animated.Title style={{ color: _.get(props, 'animation.style.color') }} numberOfLines={1}>
        {value || ''}
      </Animated.Title>
    ),
  }),
  share: (value, props) => {
    const onShare = () =>
      Share.open({
        title: value.title || props.title,
        message: value.text,
        url: value.link,
      }, (sharingError) => {
        console.error(sharingError);
      });

    return {
      rightComponent: (
        <Button onPress={onShare}>
          <Animated.Icon name="share" />
        </Button>
      ),
    };
  },
  hasHistory: (value, props) => {
    const { navigateBack } = props;

    /**
     * onPress sets `event` as first param, which leads to ignoring default navigateBack
     * first argument (navigator) so we have to wrap navigateBack into function to leave first
     * argument empty, default
     */
    function navigateBackWithoutEventParameter() {
      navigateBack();
    }

    const leftComponent = value ? (
      <Button
        styleName="clear"
        onPress={navigateBackWithoutEventParameter}
      >
        <Animated.Icon style={{ color: _.get(props, 'animation.style.color') }} name="back" />
      </Button>
    ) :
      null;

    return { leftComponent };
  },
  animation: (value, props) => {
    const animation = value;
    const { style } = props;
    const backgroundColor = _.get(style, 'container.backgroundColor');
    const textColor = _.get(style, 'textColor.color');

    animation.setColors(backgroundColor, textColor);

    const containerStyle = {
      backgroundColor: animation.style.backgroundColor,
      borderBottomColor: animation.style.borderBottomColor,
    };
    return {
      style: {
        container: { ...containerStyle },
      },
    };
  },
};

/**
 * If source (usually state set by component) has undefined
 * property values, ignore those properties.
 * @param objValue
 * @param srcValue
 * @returns {*}
 */
function skipUndefined(objValue, srcValue) {
  return _.isUndefined(srcValue) ? objValue : srcValue;
}

const composeChildren = NavigationBarComponent => class extends Component {
  static propTypes = {
    id: React.PropTypes.any,
    style: React.PropTypes.object,
  };

  render() {
    const newProps = {};
    const { id, style } = this.props;

    if (!id) {
      return null;
    }

    _.forEach(this.props, (value, key) => {
      if (_.isFunction(composers[key])) {
        _.assign(newProps, composers[key](value, this.props));
      }
    });

    if (newProps.style) {
      newProps.style = _.merge(style, newProps.style);
    }

    return <NavigationBarComponent {..._.assignWith(newProps, this.props, skipUndefined)} />;
  }
};

export default composeChildren;
