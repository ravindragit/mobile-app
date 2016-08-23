import React, { PropTypes } from 'react';
import hoistStatics from 'hoist-non-react-statics';
import * as _ from 'lodash';

import Theme, { ThemeShape } from './Theme';
import { resolveComponentStyle } from './resolveComponentStyle';

/**
 * Formats and throws an error when connecting component style with the theme.
 *
 * @param errorMessage The error message.
 * @param componentDisplayName The name of the component that is being connected.
 */
function throwConnectStyleError(errorMessage, componentDisplayName) {
  throw Error(`${errorMessage} - when connecting ${componentDisplayName} component to style.`);
}

/**
 * Returns the theme object from the provided context,
 * or an empty theme if the context doesn't contain a theme.
 *
 * @param context The React component context.
 * @returns {Theme} The Theme object.
 */
function getTheme(context) {
  // Fallback to an empty theme if the component isn't
  // rendered in a StyleProvider.
  return context.theme || new Theme({});
}

/**
 * Resolves the final component style by using the theme style, if available and
 * merging it with the style provided directly through the style prop, and style
 * variants applied through the styleName prop.
 *
 * @param componentStyleName The component name that will be used
 * to target this component in style rules.
 * @param componentStyle The default component style.
 * @param mapPropsToStyleNames Pure function to customize styleNames depending on props.
 * @returns {StyledComponent} The new component that will handle
 * the styling of the wrapped component.
 */
export default (componentStyleName, componentStyle = {}, mapPropsToStyleNames) => {
  function getComponentDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
  }

  return function wrapWithStyledComponent(WrappedComponent) {
    const componentDisplayName = getComponentDisplayName(WrappedComponent);

    if (!_.isPlainObject(componentStyle)) {
      throwConnectStyleError(
        'Component style must be plain object',
        componentDisplayName
      );
    }

    if (!_.isString(componentStyleName)) {
      throwConnectStyleError(
        'Component Style Name must be string',
        componentDisplayName
      );
    }

    class StyledComponent extends React.Component {
      static contextTypes = {
        theme: ThemeShape,
        // The style inherited from the parent
        parentStyle: PropTypes.object,
      };

      static childContextTypes = {
        // Provide the parent style to child components
        parentStyle: PropTypes.object,
      };

      static propTypes = {
        // Element style that overrides any other style of the component
        style: PropTypes.object,
        // The style variant names to apply to this component,
        // multiple variants may be separated with a space character
        styleName: PropTypes.string,
      };

      static displayName = `Styled(${componentDisplayName})`;
      static WrappedComponent = WrappedComponent;

      constructor(props, context) {
        super(props, context);
        const resolvedStyle = this.resolveStyle(context, props);
        this.state = {
          style: resolvedStyle.componentStyle,
          childrenStyle: resolvedStyle.childrenStyle,
        };
      }

      getChildContext() {
        return {
          parentStyle: this.state.childrenStyle,
        };
      }

      componentWillReceiveProps(nextProps, nextContext) {
        if (this.shouldRebuildStyle(nextProps, nextContext)) {
          const resolvedStyle = this.resolveStyle(nextContext, nextProps);
          this.setState({
            style: resolvedStyle.componentStyle,
            childrenStyle: resolvedStyle.childrenStyle,
          });
        }
      }

      shouldRebuildStyle(nextProps, nextContext) {
        return (nextProps.style !== this.props.style) ||
          (nextProps.styleName !== this.props.styleName) ||
          (nextContext.theme !== this.context.theme) ||
          (nextContext.parentStyle !== this.context.parentStyle);
      }

      resolveStyleNames() {
        const { styleName } = this.props;

        if (!mapPropsToStyleNames) {
          return styleName;
        }

        const styleNames = styleName ? styleName.split(' ') : [];

        // We want style names "Set" (unique values) but as array
        // because resolveComponentStyle uses map on styleNames
        return _.uniq(mapPropsToStyleNames(styleNames, this.props) || []);
      }

      resolveStyle(context, props) {
        const { parentStyle } = context;
        const { style } = props;

        const theme = getTheme(context);
        const themeStyle = theme.createComponentStyle(componentStyleName, componentStyle);

        const styleNames = this.resolveStyleNames();

        return resolveComponentStyle(
          componentStyleName,
          styleNames,
          themeStyle,
          parentStyle,
          style
        );
      }

      render() {
        return <WrappedComponent {...this.props} style={this.state.style} />;
      }
    }

    return hoistStatics(StyledComponent, WrappedComponent);
  };
};
