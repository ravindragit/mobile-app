import React, {
  Component,
  PropTypes,
} from 'react';
import { View } from '../View';
import * as _ from 'lodash';

import { connectStyle } from '@shoutem/theme';
import HypermediaComposer from './lib/HypermediaComposer';

const propTypes = {
  body: PropTypes.string,
  onError: PropTypes.func,
  attachments: PropTypes.object,
  style: PropTypes.object,
  elementTransformers: PropTypes.arrayOf(PropTypes.shape({
    canTransform: PropTypes.func,
    transform: PropTypes.func,
  })),
};

function getMediaElementMargin(mediaElementStyle) {
  const { marginHorizontal, margin, marginLeft, marginRight } = mediaElementStyle;

  const left = marginLeft || marginHorizontal / 2 || margin;
  const right = marginRight || marginHorizontal / 2 || margin;

  return {
    marginLeft: left,
    marginRight: right,
  };
}

function getStyleWithUpdatedMediaElementMargins(oldStyle) {
  const videoStyle = oldStyle.video;
  const videoWithMargins = getMediaElementMargin(videoStyle);

  const imageStyle = oldStyle.img;
  const imageWithMargins = getMediaElementMargin(imageStyle);

  const galleryStyle = oldStyle.gallery;
  const galleryWithMargins = getMediaElementMargin(galleryStyle);

  return _.merge({}, oldStyle, {
    img: imageWithMargins,
    video: videoWithMargins,
    gallery: galleryWithMargins,
  });
}

/**
 * Displays content in the html body as a composition of
 * react native components.
 */
class RichMedia extends Component {
  state = {
    content: null,
  };

  componentDidMount() {
    const { body, attachments, elementTransformers } = this.props;
    this.startHtmlRender(body, attachments, elementTransformers);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.body !== nextProps.body) {
      this.startHtmlRender(nextProps.body, nextProps.attachments, nextProps.elementTransformers);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.body !== nextProps.body || this.state.content !== nextState.content;
  }

  startHtmlRender(body, attachments, elementTransformers) {
    if (body) {
      const customStyle = getStyleWithUpdatedMediaElementMargins(this.props.style);
      const hypermediaComposer = new HypermediaComposer(elementTransformers, customStyle);

      hypermediaComposer.compose(body, (err, content) => {
        if (err) {
          this.props.onError(err);
        }

        this.setState({ content });
      });
    } else {
      this.setState({ content: null });
    }
  }

  render() {
    return (
      <View
        style={
          { flex: 0 } // Prevent RichMedia from overlapping with other components
        }
      >
        <View style={this.props.style.container}>
          {this.state.content}
        </View>
      </View>
    );
  }
}

RichMedia.propTypes = propTypes;
RichMedia.defaultProps = {
  onError: console.error.bind(console),
};

const StyledRichMedia = connectStyle('shoutem.ui.RichMedia', {})(RichMedia);
export {
  StyledRichMedia as RichMedia,
};
