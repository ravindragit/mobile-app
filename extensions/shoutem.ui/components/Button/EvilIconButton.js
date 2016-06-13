import React, { Animated } from 'react-native';
import Button from './Button';
import Icon from 'react-native-vector-icons/EvilIcons';
import { connectStyle, INCLUDE } from '@shoutem/theme';

function EvilIconButton({
  style,
  iconName,
  showIconOnRight,
  text,
  onPress,
}) {
  const AnimatedIcon = Animated.createAnimatedComponent(Icon);
  const renderIcon = () =>
    <AnimatedIcon name={iconName} style={style.buttonIcon} size={style.fontSize} key="icon" />
  ;

  return (
    <Button
      renderIcon={renderIcon}
      showIconOnRight={showIconOnRight}
      text={text}
      onPress={onPress}
      style={style}
    />
  );
}

EvilIconButton.propTypes = {
  iconName: React.PropTypes.string,
  showIconOnRight: React.PropTypes.boolean,
  text: React.PropTypes.string,
  style: React.PropTypes.object,
  onPress: React.PropTypes.func,
};


const style = {
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    [INCLUDE]: ['baseFont'],
  },
};

export default connectStyle('shoutem.ui.EvilIconButton', style)(EvilIconButton);

