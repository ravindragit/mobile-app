import React, {
  View,
  ScrollView,
  Text,
} from 'react-native';
import { INCLUDE, connectStyle } from 'shoutem/theme';
import { Button, EvilIconButton } from 'shoutem.ui';
import moment from 'moment';
import Share from 'react-native-share';

function createDetailsStyle(style) {
  return {
    detailsContainer: {
      ...style.detailsContainer,
    },
    detailsTitle: style.detailsTitle,
    detailsTitleContainer: style.detailsTitleContainer,
    detailsText: style.detailsText,
    timeText: style.timeText,
    button: style.button,
    dateSeparator: style.dateSeparator,
    sectionSeparator: style.sectionSeparator,
    sectionTitle: style.sectionTitle,
  };
}

function toMoment(date) {
  return moment(date, 'YYYY-MM-DDThh:mm:ss');
}

function formatDate(date) {
  if (!date) {
    return '';
  }

  return moment(date, 'YYYY-MM-DDThh:mm:ss').format('MMMM D • hh:mm');
}

function Details({
    item,
    style,
}) {
  function onButtonPressed() {
    const fromDate = toMoment(item.startTime);
    const toDate = item.endtime ? toMoment(item.endtime)
                                : fromDate.clone().add(1, 'hours');
    console.warn(item.title, fromDate.valueOf(), toDate.valueOf());
  }

  return (
    <View key="details" style={style.detailsContainer}>
      <View style={style.detailsTitleContainer}>
        <Text style={style.detailsTitle}>{item.title}</Text>
      </View>
      <Text style={style.timeText}>{formatDate(item.startTime)}</Text>
      <View style={style.dateSeparator} />
      <Text style={style.timeText}>{formatDate(item.endTime)}</Text>
      <Button
        icon="event-note"
        iconSize={24}
        text="ADD TO CALENDAR"
        style={style.button}
        onPress={onButtonPressed}
      />
      <View style={style.sectionSeparator} >
        <Text style={style.sectionTitle}>INFORMATION</Text>
      </View>
      <Text style={style.detailsText}>{item.information}</Text>
    </View>
  );
}

Details.propTypes = {
  item: React.PropTypes.object,
  style: React.PropTypes.object,
};

function DetailsScreen({
  item,
  style,
  setNavBarProps,
}) {
  const detailsStyle = createDetailsStyle(style);

  function onShare() {
    Share.open({
      title: item.title,
      share_text: item.information,
      share_URL: item.rsvplink,
    }, (sharingError) => {
      console.error(sharingError);
    });
  }

  const shareButton = (<EvilIconButton
    iconName="share-apple"
    onPress={onShare}
    style={style.shareButton}
  />);

  setNavBarProps({
    rightComponent: shareButton,
  });


  return (
    <View style={style.screen}>
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={style.container}
        scrollEventThrottle={16}
      >
        <Details item={item} style={detailsStyle} />
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
  },
  detailsText: {
    color: '#666666',
    padding: 15,
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
    color: '#888888',
    paddingLeft: 15,
    paddingBottom: 4,
  },
  button: {
    buttonContainer: {
      backgroundColor: '#333333',
      borderRadius: 2,
      width: 180,
      alignSelf: 'center',
      marginTop: 13,
      marginBottom: 20,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 9,
    },
    buttonIcon: {
      marginRight: 10,
      marginLeft: 10,
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
    buttonIcon: {
      fontSize: 24,
      width: 40,
      height: 40,
    },
  },
};

export default connectStyle('shoutem.events.DetailsScreen', style)(DetailsScreen);
