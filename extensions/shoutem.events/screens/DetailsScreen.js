import React, {
  View,
  ScrollView,
  Text,
  MapView,
  Dimensions,
  Animated,
} from 'react-native';
import { INCLUDE, connectStyle } from 'shoutem/theme';
import { ShoutemIconButton, RichMedia } from 'shoutem.ui';
import Share from 'react-native-share';
import { toMoment, addToCalendar } from './lib/Calendar';

const windowHeight = Dimensions.get('window').height;
const NAV_BAR_INTERPOLATION_INPUT = [windowHeight * 0.05, windowHeight * 0.20 - 40];

function formatDate(date) {
  if (!date) {
    return '';
  }

  return toMoment(date).format('MMMM D • hh:mm');
}

function Details({
    item,
    style,
}) {
  function onButtonPressed() {
    addToCalendar(item);
  }

  // TODO(Vladimir) - determine the source from which to obtain this information
  const markers = [{
    latitude: 48.83367,
    longitude: 2.39423,
    image: require('../assets/images/pin_dark@3x.png'),
  }];

  // TODO(Vladimir) - determine the source from which to obtain this information
  const region = {
    latitude: 48.83367,
    longitude: 2.39423,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const endTime = item.endTime ? (
    <View>
      <View style={style.dateSeparator} />
      <Text style={style.timeText}>{formatDate(item.endTime)}</Text>
    </View>
  ) : null;

  return (
    <View key="details" style={style.detailsContainer}>
      <View style={style.detailsTitleContainer}>
        <Text style={style.detailsTitle}>{item.title.toUpperCase()}</Text>
      </View>
      <Text style={style.timeText}>{formatDate(item.startTime)}</Text>
      {endTime}
      <ShoutemIconButton
        iconName="add-event"
        text="ADD TO CALENDAR"
        style={style.button}
        showIconOnRight={false}
        onPress={onButtonPressed}
      />
      <View style={style.mapContainer}>
        <MapView
          region={region}
          initialRegion={region}
          annotations={markers}
          zoomEnabled={false}
          scrollEnabled={false}
          rotateEnabled={false}
          style={style.map}
        />
      </View>
      <View style={style.sectionSeparator} >
        <Text style={style.sectionTitle}>INFORMATION</Text>
      </View>
      <View style={style.informationContainer}>
        <RichMedia
          body={item.information}
        />
      </View>
    </View>
  );
}

Details.propTypes = {
  item: React.PropTypes.object, // TODO(Vladimir) - use item shape
  style: React.PropTypes.object,
};

function getScrollHandle(scrollY) {
  return Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }]
  );
}

function createScreenTitle(titleStyle, title, scrollY) {
  return (
    <Animated.Text
      numberOfLines={1}
      style={[
        titleStyle,
        {
          color: scrollY.interpolate({
            inputRange: NAV_BAR_INTERPOLATION_INPUT,
            outputRange: ['rgba(255, 255, 255, 0)', titleStyle.color],
            extrapolate: 'clamp',
          }),
        },
      ]}
    >
      {title.toUpperCase()}
    </Animated.Text>
  );
}

function DetailsScreen({
  item,
  style,
  setNavBarProps,
}) {
  function onShare() {
    Share.open({
      title: item.title,
      share_text: item.information,
      share_URL: item.rsvplink,
    }, (sharingError) => {
      console.error(sharingError);
    });
  }

  const shareButton = (<ShoutemIconButton
    iconName="share"
    onPress={onShare}
    style={style.shareButton}
  />);
  const scrollY = new Animated.Value(0);

  const screenTitle = createScreenTitle(style.navBarTitle, item.title, scrollY);

  setNavBarProps({
    rightComponent: shareButton,
    style: {
      container: {
        borderBottomColor: scrollY.interpolate({
          inputRange: [0, 150],
          outputRange: ['rgba(0,0,0,0)', 'rgba(51, 51, 51, 0.2)'],
          extrapolate: 'clamp',
        }),
        borderBottomWidth: 1,
      },
    },
    centerComponent: screenTitle,
  });

  return (
    <View style={style.screen}>
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={style.container}
        scrollEventThrottle={1}
        onScroll={getScrollHandle(scrollY)}
      >
        <Details item={item} style={style} />
      </ScrollView>
    </View>
  );
}

DetailsScreen.propTypes = {
  item: React.PropTypes.object,
  style: React.PropTypes.object,
  bottomContentOffset: React.PropTypes.number,
  setNavBarProps: React.PropTypes.func,
};

const style = {
  headline: {
    headline: {
      backgroundColor: 'transparent',
    },
  },
  screen: {
    position: 'relative',
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  detailsTitle: {
    [INCLUDE]: ['h1'],
    color: '#000',
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: 'transparent',
    marginBottom: 17,
    paddingLeft: 30,
    paddingRight: 30,
  },
  dateSeparator: {
    height: 1,
    width: 54,
    opacity: 0.3,
    alignSelf: 'center',
    backgroundColor: '#333333',
    marginBottom: 12,
  },
  sectionSeparator: {
    height: 45,
    backgroundColor: '#f2f2f2',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sectionTitle: {
    color: '#0099ff',
    paddingLeft: 15,
    paddingBottom: 4,
  },
  button: {
    buttonContainer: {
      backgroundColor: '#333333',
      borderRadius: 2,
      width: 178,
      alignSelf: 'center',
      marginTop: 13,
      marginBottom: 20,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 9,
    },
    buttonIcon: {
      marginRight: 13,
      marginLeft: -10,
      fontSize: 26,
      color: '#fff',
    },
    buttonText: {
      fontSize: 12,
      color: '#fff',
    },
  },
  detailsTitleContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  timeText: {
    color: '#888888',
    textAlign: 'center',
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    position: 'relative',
    flex: 1,
    paddingTop: 100,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: null,
    width: null,
  },
  shareButton: {
    buttonContainer: {
    },
    buttonIcon: {
      fontSize: 24,
      width: 40,
      height: 40,
    },
    button: {
      marginTop: -5,
      marginRight: -12,
    },
  },
  map: {
    height: 160,
    opacity: 0.7,
  },
  mapContainer: {
    backgroundColor: 'black',
  },
  informationContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  navBarTitle: {
    [INCLUDE]: ['baseFont', 'navigationBarTextColor'],
    width: 200,
    fontSize: 15,
    textAlign: 'center',
  },
};

export default connectStyle('shoutem.events.DetailsScreen', style)(DetailsScreen);
