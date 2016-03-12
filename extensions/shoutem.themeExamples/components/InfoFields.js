import React, {
  View,
  Text,
  Component,
  Image,
} from 'react-native';
import { connectStyle } from 'shoutem/theme/ThemeHelpers';

class InfoFields extends Component {
  render() {
    const infoFieldsComponents = [];
    const style = this.props.style;
    if (this.props.infoFields.length > 0) {
      this.props.infoFields.forEach((info, i) => {
        if (i > 0) {
          infoFieldsComponents.push(
            <Image
              style={style.infoSeparator}
              source={this.props.infoSeparator}
              key={i * -1}
            />
          ); // key i * -1 ?
        }
        infoFieldsComponents.push(
          <Text
            style={style.infoText}
            key={i}
          >
            {info}
          </Text>
        );
      });
      return <View style={style.info}>{infoFieldsComponents}</View>;
    }

    return null;
  }
}

InfoFields.propTypes = {
  infoFields: React.PropTypes.array,
  infoSeparator: React.PropTypes.any,
  style: React.PropTypes.object,
};

const style = {
  infoSeparator: {
    marginHorizontal: 10,
    flex: 1,
    width: 3,
    height: 3,
  },
  infoText: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: 'transparent',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
};

export default connectStyle('dev.ext.InfoFields', style)(InfoFields);
