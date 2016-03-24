import React, {
  View,
  Text,
  Component,
  Image,
  TouchableOpacity,
} from 'react-native';
import connectStyle from 'shoutem/theme/StyleConnector';
import Button from './Button';

class MediumListItem extends Component {
  render() {
    const {
      style,
      id,
      description,
      leftExtra,
      rightExtra,
      image,
      extrasSeparatorImage,
      buttonIcon,
      onPress,
    } = this.props;
    let separatorImage = null;
    if (extrasSeparatorImage) {
      separatorImage = (
        <Image
          style={style.extrasSeparator}
          source={extrasSeparatorImage}
        />
      );
    }
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={style.container} key={id}>
          <Image style={style.itemImage} source={image} />
          <View style={style.itemInfo}>
            <Text style={[style.baseFont, style.itemDescription]}>
              {description}
            </Text>
            <View style={style.itemExtras}>
              <Text style={[style.baseFont, style.leftExtra]}>{leftExtra}</Text>
              {separatorImage}
              <Text style={style.rightExtra}>{rightExtra}</Text>
            </View>
          </View>
          <Button style={style.mediumListItemButton} icon={buttonIcon} />
        </View>
      </TouchableOpacity>
    );
  }
}

MediumListItem.propTypes = {
  style: React.PropTypes.object,
  id: React.PropTypes.number,
  description: React.PropTypes.string,
  leftExtra: React.PropTypes.string,
  rightExtra: React.PropTypes.string,
  image: React.PropTypes.any,
  extrasSeparatorImage: React.PropTypes.any,
  buttonIcon: React.PropTypes.any,
};

const style = {
  container: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    height: 95,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  itemImage: {
    width: 65,
    height: null,
    borderRadius: 2,
    marginRight: 15,
    resizeMode: 'cover',
  },
  itemInfo: {
    flexDirection: 'column',
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  itemExtras: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    bottom: 0,
    alignItems: 'center',
  },
  itemDescription: {
    flex: 1,
    fontSize: 15,
    color: '#222',
  },
  extrasSeparator: {
    width: 3,
    height: 3,
  },
  leftExtra: {
    fontSize: 15,
  },
  rightExtra: {
    fontSize: 15,
  },
  mediumListItemButton: {
    buttonContainer: {
      alignSelf: 'stretch',
    },
  },
};

export default connectStyle('dev.ext.MediumListItem', style)(MediumListItem);
