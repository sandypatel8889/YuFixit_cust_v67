import React, { Component } from 'react';
import Video from 'react-native-video';
import ProgressBar from 'react-native-progress/Bar'
import { StyleSheet, View, Text, Dimensions, TouchableWithoutFeedback, ActivityIndicator } from 'react-native'
import Iconn from "react-native-vector-icons/FontAwesome";
import {
    Container,
    Header,
    Body,
    Input,
    Title,
    Button,
    Icon,
    Item as FormItem, Form,
    Label,
    Left,
} from 'native-base'
import { mainColor } from '../helper/colors';


function secondsToTime(time) {
    return ~~(time / 60) + ":" + (time % 60 < 10 ? "0" : "") + time % 60;
}
const bufferConfig = {
    minBufferMs: 1000,
    maxBufferMs: 2000,
    bufferForPlaybackMs: 500,
    bufferForPlaybackAfterRebufferMs: 1500
}
export default class VideoPlayerNew extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            paused: false,
            progress: 0,
            duration: 0,
            // videoTitle: this.props.navigation.state.params.videoTitle,
            videoUrl: 'https://www.youtube.com/watch?v=EngW7tLk6R8',
            loading: false
            // https://firebasestorage.googleapis.com/v0/b/citibee.appspot.com/o/videos%2F25919363-4a49-439e-9153-7f98c98fdebd?alt=media&token=f722d6a0-e7c4-4fb8-b552-ffb0eb8d771e
        }
    }
    componentDidMount = () => {
        //    console.log('here ',this.props.navigation.state.params.videoUrl)
        if (this.props.audioOnly) {
            this.setState({ paused: true })
        }
    };


    handleMainButtonTouch = () => {

        if (this.state.progress > 1) {
            this.player.seek(0);
        }
        this.setState(state => {
            return {
                paused: !state.paused
            }
        })
    }

    handleProgressPress = (e) => {
        const position = e.nativeEvent.locationX;
        const progress = (position / 250) * this.state.duration;
        this.player.seek(progress);
    }

    handleEnd = () => {
        this.setState({
            paused: true
        })
    }

    handleLoad = (meta) => {
        this.setState({
            duration: meta.duration,
            loading: false
        })
    }
    handleLoadStart = () => {
        this.setState({
            loading: true
        })
    }

    handleProgress = (progress) => {
        this.setState({
            progress: progress.currentTime / this.state.duration
        })
    }


    videoError = () => {

    }
    onBuffer = () => {

    }
    render() {
        const { width } = Dimensions.get('window');
        const height = '100%';
        return (
            // <Container>

            <View style={{ flex: 1 }}>
                <View>
                    <Video
                        onReadyForDisplay={() => {

                            this.setState({ paused: true })
                        }}
                        paused={this.state.paused}
                        style={{ width: this.props.playerWidth, height: this.props.playerHeight }}
                        resizeMode={'cover'}
                        onLoad={this.handleLoad}
                        onLoadStart={this.handleLoadStart}
                        onProgress={this.handleProgress}
                        onEnd={this.handleEnd}
                        audioOnly={this.props.audioOnly}
                        muted={false}
                        controls={true}
                        source={{ uri: this.props.videoUrl }}   // Can be a URL or a local file.
                        ref={(ref) => {
                            this.player = ref
                        }}                                      // Store reference
                        onBuffer={this.onBuffer}                // Callback when remote video is buffering
                        onError={this.videoError}               // Callback when video cannot be loaded
                        bufferConfig={bufferConfig}
                        progressUpdateInterval={250.0}
                        maxBitRate={1000000}
                        rate={1.0}
                        volume={1.0}
                        playInBackground={false}
                        playWhenInactive={false}
                        ignoreSilentSwitch={null}
                    // style={styles.backgroundVideo}
                    />
                    {/* <View style={styles.controls}>
                        <TouchableWithoutFeedback onPress={this.handleMainButtonTouch}>
                            <Iconn style={{color:mainColor}} name={!this.state.paused ? "pause" : "play"} size={25} color={'fff'} />
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.handleProgressPress}>
                            <View>
                                <ProgressBar
                                    progress={this.state.progress}
                                    color={mainColor}
                                    unfilledColor="rgba(255, 255, 255, .5)"
                                    borderColor="#fff"
                                    width={110}
                                    height={20}

                                />

                            </View>

                        </TouchableWithoutFeedback>
                        <Text style={styles.duration}>
                            {secondsToTime(Math.floor(this.state.progress * this.state.duration))}

                        </Text>
                    </View> */}
                    {this.state.loading ? <View backgroundColor="black" flex={1} alignItems="center" justifyContent="center" height={"100%"} width={"100%"} position='absolute'>
                        <ActivityIndicator size={"large"} color={"white"} />
                    </View> : <View />}
                </View>

            </View>
            // </Container >
        )
    }
}
var styles = StyleSheet.create({
    backgroundVideo: {
        // position: 'absolute',
        top: 0,
        // left: 0,
        // bottom: 0,
        // right: 0,
        width: '100%',
        flex: 1

    },
    controls: {
        position: 'absolute',
        backgroundColor: "rgba(0,0,0,0.5)",
        height: 48,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,

    },
    mainButton: {
        marginRight: 15
    },
    duration: {
        color: mainColor,
        // marginLeft: 15
    }
});

VideoPlayerNew.defaultProps = {
    playerWidth: '100%',
    playerHeight: '100%',
    audioOnly: false
}