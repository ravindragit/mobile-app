import React, { PropTypes } from 'react-native';
import hoistStatics from 'hoist-non-react-statics';
import { ThemeShape } from './Theme';
import * as _ from 'lodash';

export function isReactStyle(style) {
  const styleFirstProp = Object.keys(style)[0];
  return styleFirstProp && _.isNumber(style[styleFirstProp]);
}

function doesStyleNameContainsNamespace(styleName) {
  return _.isString(styleName) && styleName.match(/\./g).length === 2;
}

/**
 * Merge component style, component custom style and theme style.
 * Updates component style if new style received from parent.
 * @param componentStyle
 * @returns {wrapWithStyledComponent}
 */
export default function connectStyle(componentStyleName, componentStyle) {

  if (!doesStyleNameContainsNamespace(componentStyleName)) {
    throw Error('Component name should contain unique namespace with developer name)');
  }

  if (isReactStyle(componentStyle)) {
    throw Error('Raw style should be passed, do not create style with StyleSheet.create.');
  }

  function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
  }

  return function wrapWithStyledComponent(WrappedComponent) {
    class StyledComponent extends React.Component {
      constructor(props, context) {
        super(props, context);
        const theme = context.theme;
        this.state = {
          style: theme.resolveComponentStyle(componentStyleName, componentStyle, props.style),
        };
      }

      componentWillReceiveProps(nextProps) {
        const theme = this.context.theme;
        if (nextProps.style !== this.props.style) {
          this.setState({
            style: theme.resolveComponentStyle(componentStyleName, componentStyle, nextProps.style),
          });
        }
        return true;
      }

      render() {
        // always passing reference so redux connect can access original component
        return <WrappedComponent {...this.props} style={this.state.style} ref="wrappedInstance"/>;
      }
    }

    StyledComponent.displayName = `Styled(${getDisplayName(WrappedComponent)})`;
    StyledComponent.WrappedComponent = WrappedComponent;
    StyledComponent.contextTypes = {
      theme: ThemeShape,
    };
    StyledComponent.propTypes = {
      style: PropTypes.object,
    };

    return hoistStatics(StyledComponent, WrappedComponent);
  };
}

