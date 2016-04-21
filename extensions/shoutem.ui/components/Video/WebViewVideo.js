import React, {
  View,
  StyleSheet,
  PropTypes,
  WebView,
} from 'react-native';

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  source: PropTypes.shape({
    uri: PropTypes.string,
  }),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

/**
 * Displays a HTML Video player from the specified source
 * in a WebView
 *
 * @returns {*}
 */
export default function WebViewVideo({
  width,
  height,
  source,
}) {
  return (
    <View style={[styles.container, { width, height }]}>
      <WebView
        source={source}
      />
    </View>
  );
}

WebViewVideo.propTypes = propTypes;

