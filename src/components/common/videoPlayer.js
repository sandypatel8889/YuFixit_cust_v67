import React, { Component } from "react";
import Video from "react-native-video";
import ProgressBar from "react-native-progress/Bar";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableWithoutFeedback,
  ActivityIndicator
} from "react-native";
import Iconn from "react-native-vector-icons/FontAwesome";
import {
  Container,
  Header,
  Body,
  Input,
  Title,
  Button,
  Icon,
  Item as FormItem,
  Form,
  Label,
  Left,
} from "native-base";
import { mainColor } from "../helper/colors";
import { scale } from "../helper/scaling";

function secondsToTime(time) {
  return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + (time % 60);
}
export default class VideoPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: false,
      progress: 0,
      duration: 0,
      // videoTitle: this.props.navigation.state.params.videoTitle,
      videoUrl: "https://www.youtube.com/watch?v=EngW7tLk6R8",
      loading: false
      // https://firebasestorage.googleapis.com/v0/b/citibee.appspot.com/o/videos%2F25919363-4a49-439e-9153-7f98c98fdebd?alt=media&token=f722d6a0-e7c4-4fb8-b552-ffb0eb8d771e
    };
  }
  componentDidMount = () => {
    if (this.props.audioOnly) {
      this.setState({ paused: true });
    }
    //    console.log('here ',this.props.navigation.state.params.videoUrl)
  };

  handleMainButtonTouch = () => {
    if (this.state.progress > 1) {
      this.player.seek(0);
    }
    this.setState((state) => {
      return {
        paused: !state.paused,
      };
    });
  };

  handleProgressPress = (e) => {
    const position = e.nativeEvent.locationX;
    const progress = (position / 250) * this.state.duration;
    this.player.seek(progress);
  };

  handleEnd = () => {
    this.setState({
      paused: true,
    });
  };

  handleLoad = (meta) => {
    this.setState({
      duration: meta.duration,
      loading: false
    });
  };
  handleLoadStart = () => {
    this.setState({
      loading: true
    })
  }
  handleProgress = (progress) => {
    this.setState({
      progress: progress.currentTime / this.state.duration,
    });
  };

  videoError = () => { };
  onBuffer = () => { };
  render() {
    const { width } = Dimensions.get("window");
    const height = "100%";
    return (
      // <Container>

      <View style={{ flex: 1 }}>
        <View>
          <Video
            onReadyForDisplay={() => {
              this.setState({ paused: true });
            }}
            paused={this.state.paused}
            style={{
              width: this.props.playerWidth,
              height: this.props.playerHeight,
            }}
            resizeMode={"stretch"}
            onLoad={this.handleLoad}
            onLoadStart={this.handleLoadStart}
            onProgress={this.handleProgress}
            onEnd={this.handleEnd}
            audioOnly={this.props.audioOnly}
            source={{ uri: this.props.videoUrl }} // Can be a URL or a local file.
            ref={(ref) => {
              this.player = ref;
            }} // Store reference
            onBuffer={this.onBuffer} // Callback when remote video is buffering
            onError={this.videoError} // Callback when video cannot be loaded
          // style={styles.backgroundVideo}
          />
          <View style={styles.controls}>
            <TouchableWithoutFeedback onPress={this.handleMainButtonTouch}>
              <Iconn
                style={{ color: mainColor }}
                style={{ paddingRight: 6 }}
                name={!this.state.paused ? "pause" : "play"}
                size={25}
                color={mainColor}
              />
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={this.handleProgressPress}>
              <View>
                <ProgressBar
                  progress={this.state.progress}
                  color={mainColor}
                  unfilledColor="rgba(255, 255, 255, .5)"
                  borderColor="#fff"
                  width={120}
                  height={20}
                />
              </View>
            </TouchableWithoutFeedback>
            <Text style={styles.duration}>
              {secondsToTime(
                Math.floor(this.state.progress * this.state.duration)
              )}
            </Text>
          </View>
          {this.state.loading && !this.props.audioOnly ? <View backgroundColor="black" flex={1} alignItems="center" justifyContent="center" height={"100%"} width={"100%"} position='absolute'>
            <ActivityIndicator size={"large"} color={"white"} />
          </View> : <View />}
        </View>

      </View>
      // </Container >
    );
  }
}
var styles = StyleSheet.create({
  backgroundVideo: {
    // position: 'absolute',
    top: 0,
    // left: 0,
    // bottom: 0,
    // right: 0,
    width: "100%",
    flex: 1,
  },
  controls: {
    position: 'absolute',
    backgroundColor: "lightgray",
    height: 48,
    left: 0,
    bottom: 0,
    right: 0,
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderRadius: 5
  },
  mainButton: {
    marginRight: 15,
  },
  duration: {
    color: mainColor,
    marginLeft: scale(6),
  },
});

VideoPlayer.defaultProps = {
  playerWidth: "100%",
  playerHeight: "100%",
  audioOnly: false,
  videoUrl: "http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
};
