import React, { Children, PropTypes } from 'react-native';
import Theme, { ThemeShape } from './Theme';
import { connect } from 'react-redux';

// Privates
const THEME = Symbol('theme');

/**
 *  Provides Theme instance trough context.
 *  Constructor props expect theme instance!
 */
class StyleProvider extends React.Component {
  static propTypes = {
    getTheme: React.PropTypes.func,
    children: PropTypes.element.isRequired,
    themeVariables: React.PropTypes.object,
  };
  static childContextTypes = {
    theme: ThemeShape.isRequired,
  };
  constructor(props, context) {
    super(props, context);
    this[THEME] = new Theme(props.getTheme(props.themeVariables));
  }
  getChildContext() {
    return {
      theme: this[THEME],
    };
  }
  render() {
    const { children } = this.props;

    return Children.only(children);
  }
}

function mapStateToProps(state) {
  return {
    themeVariables: state.configuration.theme.variables,
  };
}

export default connect(mapStateToProps)(StyleProvider);
