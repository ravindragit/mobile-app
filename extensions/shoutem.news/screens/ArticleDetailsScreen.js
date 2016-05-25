import React, {
  View,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { INCLUDE, connectStyle } from 'shoutem/theme';
import { NewsGridBox, RichMedia, Button } from 'shoutem.ui';
import * as _ from 'lodash';
import Share from 'react-native-share';

const DEFAULT_BOTTOM_CONTENT_OFFSET = 50;

function getOffsetHeight(offset) {
  return Dimensions.get('window').height - offset;
}

function createDetailsStyle(topOffset, style) {
  return {
    detailsContainer: {
      ...style.detailsContainer,
      marginTop: topOffset,
    },
    detailsTitle: style.detailsTitle,
    detailsTitleContainer: style.detailsTitleContainer,
    detailsText: style.detailsText,
  };
}

function createAnimatedHeaderStyle(headerStyle, animatedValue, headerHeight) {
  return [headerStyle, {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [-headerHeight, 0, headerHeight],
          outputRange: [headerHeight / 2, 0, -headerHeight / 3],
        }),
      },
    ],
  }];
}

function getScrollHandle(scrollY) {
  return Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }]
  );
}

function Details({ item, style }) {
  return (
    <View key="details" style={style.detailsContainer}>
      <RichMedia
        body={item.body}
        attachments={item.attachments}
      />
    </View>
  );
}

Details.propTypes = {
  item: React.PropTypes.object,
  style: React.PropTypes.object,
};

function ArticleDetailsScreen({
  article,
  style,
  bottomContentOffset: bottomContentOffsetProp,
  setNavBarProps,
}) {
  const bottomContentOffset = bottomContentOffsetProp || DEFAULT_BOTTOM_CONTENT_OFFSET;
  const scrollY = new Animated.Value(0);
  const detailsTopOffset = getOffsetHeight(bottomContentOffset);
  const headerStyle = createAnimatedHeaderStyle(style.header, scrollY, detailsTopOffset);
  const detailsStyle = createDetailsStyle(detailsTopOffset, style);

  function onShare() {
    Share.open({
      title: article.title,
      share_text: article.summary,
      share_URL: article.link,
    }, (sharingError) => {
      console.error(sharingError);
    });
  }

  const shareButton = (<Button
    iconType={Button.iconTypes.EVIL_ICON}
    icon="share-apple"
    onPress={onShare}
    style={style.shareButton}
  />);

  setNavBarProps({
    rightComponent: shareButton,
  });

  return (
    <View style={style.screen}>
      <Animated.View
        style={headerStyle}
      >
        <NewsGridBox
          style={style.headline}
          headline={article.title}
          newsDetails={[article.author, 'test']}
          backgroundImage={{ uri: _.get(article, 'image.url'), width: 200, height: 200 }}
        />
      </Animated.View>
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={style.container}
        scrollEventThrottle={16}
        onScroll={getScrollHandle(scrollY)}
      >
        <Details item={article} style={detailsStyle} />
      </ScrollView>
    </View>
  );
}

ArticleDetailsScreen.propTypes = {
  article: React.PropTypes.object,
  style: React.PropTypes.object,
  bottomContentOffset: React.PropTypes.number,
  setNavBarProps: React.PropTypes.func,
};

const style = {
  headline: {
    [INCLUDE]: ['shoutem.ui.NewsGridBox.photoCentric'],
    headline: {
      backgroundColor: 'transparent',
    },
  },
  screen: {
    position: 'relative',
    backgroundColor: '#fff',
  },
  detailsText: {},
  detailsTitle: {
    [INCLUDE]: ['h1'],
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'transparent',
  },
  detailsTitleContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
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
      marginBottom: 3,
    },
  },
};

export default connectStyle('shoutem.news.DetailsScreen', style)(ArticleDetailsScreen);
