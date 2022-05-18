/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react";
import NetInfo from "@react-native-community/netinfo";

import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert
} from "react-native";
import Swiper from "react-native-swiper";
import { scale, verticalScale } from "../components/helper/scaling";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import { Platform } from "react-native";
var PushNotification = require("react-native-push-notification");
import { strings, selection } from '../../locales/i18n';
const styles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  slide2: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  slide3: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default class SwiperScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isInternetAvilable: true,
      isInternetAlertOpne: false
    }
    if (Platform.OS === 'ios') {
      this.ConfigureNotification()
    }


  }
  ConfigureNotification() {
    const that = this;
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        // debugger
        console.log("token", token.token)

      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        // console.log("NOTIFICATION:", notification);
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);
        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,



      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });

  }
  componentDidMount = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        this.setState({ isInternetAlertOpne: true });
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
          Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
        }

      }
    });
  };
  _jumpSlide = () => {
    this._swiper.scrollBy(1); // where n is the number of slides to move
  };
  _jumpSlideMain = () => {
    this._swiper.scrollBy(2)// where n is the number of slides to move
  };
  _jumpHome = () => {
    const { dispatch } = this.props.navigation;
    dispatch({
      type: "Navigation/RESET",
      actions: [
        {
          type: "Navigate",
          routeName: "routeTwo",
        },
      ],
      index: 0,
    });
  };
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Swiper dotColor={'transparent'} activeDotColor={'transparent'} scrollEnabled={true} loop={false} ref={(swiper) => { this._swiper = swiper; }} paginationStyle={{ justifyContent: 'center', alignItems: 'flex-end', bottom: verticalScale(80), left: 0, top: 0, right: 0, }} style={styles.wrapper} >
          <View style={styles.slide1}>
            <ImageBackground source={require('../../assets/slide1.png')} resizeMode={'cover'} style={styles.slide1}>
              <View backgroundColor="transparent" flex={1}>
              </View>
              <View flex={0.7} backgroundColor="transparent">
                <View flex={0.8} alignItems="center" justifyContent="center">
                  <Text style={{ color: "black", fontSize: scale(20), fontFamily: "Poppins-Bold" }}>{strings("WelcomeTo")}</Text>
                  <Image source={require('../../assets/iconNew.png')} defaultSource={require('../../assets/iconNew.png')} style={{ height: verticalScale(34), width: verticalScale(160) }} />
                </View>
                <View flex={1} alignItems="center" justifyContent="center">
                  <Text style={{
                    color: 'black',
                    fontSize: scale(15),
                    marginLeft: scale(10),
                    marginRight: scale(10),
                    alignSelf: 'center',
                    textAlign: 'center',
                    padding: scale(5),
                    fontFamily: "Poppins-Regular"
                  }}>{strings("intro_slider_title")}</Text>
                </View>
                <View flexDirection="row" justifyContent="center" flex={1.1} alignItems="center" marginLeft={scale(20)} marginRight={scale(20)}>
                  <TouchableOpacity style={{ width: "40%", borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={this._jumpSlide}>
                    <View justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/blank.png')} defaultSource={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65), }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: "white", position: "absolute", fontSize: scale(14), fontFamily: "Poppins-Regular" }}>{strings("next")}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: "40%", borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={this._jumpSlideMain}>
                    <View justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/blank.png')} defaultSource={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65), }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: "white", position: "absolute", fontSize: scale(14), fontFamily: "Poppins-Regular" }}>{strings("skip")}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
          <View style={styles.slide2} >
            <ImageBackground source={require('../../assets/slide2.png')} resizeMode={'cover'} style={styles.slide2}>
              <View backgroundColor="transparent" flex={1}>
              </View>
              <View flex={0.7}>
                <View flex={0.6} alignItems="center" justifyContent="center">
                  <Text style={{ color: "black", fontSize: scale(25), fontFamily: "Poppins-Bold" }}>{strings("Connect")}</Text>
                </View>
                <View alignItems="center" flex={1.40} justifyContent="center">
                  <Text style={{
                    color: 'black',
                    fontSize: scale(15),
                    marginLeft: scale(10),
                    marginRight: scale(10),
                    alignSelf: 'center',
                    textAlign: 'center',
                    // padding: scale(5),
                    fontFamily: "Poppins-Regular"
                  }}>{strings("intro_slider_title1")}</Text>
                </View>
                <View flexDirection="row" justifyContent="center" flex={1.1} alignItems="center">
                  <TouchableOpacity style={{ borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={this._jumpSlide}>
                    <View justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/blank.png')} defaultSource={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65) }} />
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: "white", position: "absolute", fontSize: scale(14), fontFamily: "Poppins-Regular" }}>{strings("next")}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
          <View style={styles.slide3} >
            <ImageBackground source={require('../../assets/slide3.png')} resizeMode={'cover'} style={styles.slide2}>
              <View backgroundColor="transparent" flex={1}>
              </View>
              <View flex={0.7}>
                <View flex={0.6} alignItems="center" justifyContent="center">
                  <Text style={{ color: "black", fontSize: scale(25), fontFamily: "Poppins-Bold", textAlign: "center" }}>{strings("intro_slider_title2")}</Text>
                </View>
                <View flex={1.40} alignItems="center" justifyContent="center">
                  <Text style={{
                    color: 'black',
                    fontSize: scale(15),
                    marginLeft: scale(10),
                    marginRight: scale(10),
                    alignSelf: 'center',
                    textAlign: 'center',
                    padding: scale(5),
                    fontFamily: "Poppins-Regular"
                  }}>{strings("intro_slider_title3")}</Text>
                </View>
                <View flexDirection="row" justifyContent="space-between" flex={1.1} alignItems="center" marginLeft={scale(20)} marginRight={scale(20)}>
                  <TouchableOpacity style={{ borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={() => this.props.navigation.navigate('SignUp')}>
                    <View justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/blank.png')} defaultSource={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65), }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: "white", position: "absolute", fontSize: scale(14), fontFamily: "Poppins-Regular" }}>{strings("btnsignup")}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={() => this.props.navigation.navigate('Login')}>
                    <View justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/blank.png')} defaultSource={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65), }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: "white", position: "absolute", fontSize: scale(14), fontFamily: "Poppins-Regular" }}>{strings("btnlogin")}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ borderRadius: 5, justifyContent: "center", alignItems: "center" }} onPress={this._jumpHome}>
                    <View justifyContent="center" alignItems="center">
                      <Image source={require('../../assets/blank.png')} defaultSource={require('../../assets/blank.png')} style={{ height: verticalScale(65), width: verticalScale(65), }} />{/* <Text style={{ color: "#6B6C6D", fontSize: scale(14) }}>{'Next'}</Text> */}
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: "white", position: "absolute", fontSize: scale(14), fontFamily: "Poppins-Regular" }}>{strings("skip")}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </ImageBackground>
          </View>
        </Swiper>
      </View>
    );
  }
}
