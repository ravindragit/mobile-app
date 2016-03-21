import React, {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { connect } from 'react-redux';

import {
  navigateBack,
} from 'shoutem/navigation';

const styles = StyleSheet.create({
  backgroundImage: {
    padding: 15,
    backgroundColor: 'transparent',
    height: 70,
  },
  container: {
    height: 70,
    top: 0,
    left: 0,
    right: 0,
    position: 'absolute',
  },
  componentsContainer: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  component: {
    height: 24,
  },
});

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      style: {},
      leftComponent: false,
      centerComponent: false,
      rightComponent: false,
    };
  }

  navigateBack() {
    const { dispatch } = this.props;
    dispatch(navigateBack());
  }

  render() {
    const backButton = <TouchableOpacity onPress={() => this.navigateBack()}>
      <Text>Back</Text>
    </TouchableOpacity>;
    const leftComponent = this.props.hasHistory ? backButton : this.props.leftComponent;

    return (
      <View style={[styles.container, this.props.style]}>
        <Image source={this.backgroundImage} style={[styles.backgroundImage, this.props.style]}>
          <View style={styles.componentsContainer}>
            <View style={styles.component}>{leftComponent}</View>
            <View style={styles.component}>{this.props.centerComponent}</View>
            <View style={styles.component}>{this.props.rightComponent}</View>
          </View>
        </Image>
      </View>
    );
  }
}

export default connect()(NavigationBar);
