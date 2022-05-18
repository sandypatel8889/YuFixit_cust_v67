import React, { Component } from "react";
import { View, Text, Dimensions, Image, TextInput, StyleSheet, ImageBackground, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import { Header } from "react-native-elements";
import { Button, Form, Item as FormItem, Input, Label } from "native-base";
import { Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import NetInfo from "@react-native-community/netinfo";
import auth from "@react-native-firebase/auth";
import { mainColor } from "../components/helper/colors";
import Modal from "react-native-modal";
import { strings, selection } from '../../locales/i18n';

const { height, width } = Dimensions.get("window");
export default class ForgetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      isInternetAvilable: true,
      processing: false,
    };
  }
  componentDidMount() {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
    });
  }
  validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  callmethod = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    if (this.state.email === "") {
      Alert.alert(strings("Email_Error"), strings("Enter_email"));
      return;
    }
    if (!this.validateEmail(this.state.email)) {
      Alert.alert(strings("Invalid_Email"), strings("Enter_correct_email"));
      return;
    }
    else {
      this.setState({ processing: true });
      auth().sendPasswordResetEmail(this.state.email)
        .then((data) => {
          this.setState({ processing: false });
          setTimeout(() => {
            Alert.alert("", strings("Reset_Password_link"),
              [
                {
                  text: strings("OK"),
                  onPress: () => {
                    this.props.navigation.goBack();
                  }
                }
              ])
          }, 500);
        }).catch((e) => {
          this.setState({ processing: false });
          setTimeout(() => {
            Alert.alert("",
              strings("email_notFound"),
              [
                {
                  text: strings("OK"),
                  onPress: () => {
                    this.props.navigation.goBack();
                  }
                }
              ])
          }, 500);
        })
    }
  }
  _renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.processing}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" size="large" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Loading")}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  render() {
    return (
      <View style={styles.MainContainer} >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          < ImageBackground style={{ width: "100%", height: "100%", position: "absolute" }
          } resizeMode={"cover"} source={require("../../assets/mainbg.png")} />
          {/* <KeyboardAvoidingView behavior="padding" enabled keyboardVerticalOffset={Platform.select({ ios: Dimensions.get('window').height == 812 || Dimensions.get('window').width == 812 ? 85 : 64, android: -500 })}> */}
          {/* ------------------CenterView ----------------- */}
          <View style={styles.CenterView} >
            <View height={verticalScale(50)} />
            <Image style={{ height: verticalScale(120), width: verticalScale(120), resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/logo.png')} />
            <View height={verticalScale(40)} />
            <Text style={{ fontSize: scale(15), color: "white", textAlign: "center", fontFamily: "Poppins-SemiBold", marginLeft: scale(10), marginRight: scale(10) }}>{strings("forgot_title")}</Text>
            {/* <Text style={{ fontSize: scale(16), color: "white",textAlign: "center",fontFamily:"Poppins-SemiBold" }}>The instructions on how to reset it</Text> */}
            <View height={verticalScale(20)} />
            <View style={styles.cardView}>
              <View style={{ height: verticalScale(35), alignItems: "center", backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
                <Image style={{ height: verticalScale(14), width: verticalScale(13), resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/email_icon.png')} />
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
                  placeholder={strings("Email_Address")}
                  onChangeText={(email) => this.setState({ email: email })}
                  fontSize={scale(13)}
                  returnKeyType='done'
                  autoCorrect={false}
                  fontFamily={"Poppins-Light"}
                />
              </View>
            </View>
            {/* <View marginTop={0} height={verticalScale(15)} /> */}
            <View width={"100%"} height={"14%"} justifyContent="center" alignItems="center">
              <View width={"25%"} height={"100%"} justifyContent="center" alignItems="center">
                <Button
                  full
                  disabled={this.state.processing}
                  style={{ backgroundColor: "transparent", elevation: 0, height: "100%" }}
                  onPress={() => {
                    this.callmethod();
                  }}>
                </Button>
              </View>
            </View>
            <View marginTop={0} height={verticalScale(15)} />
            <View style={styles.HorizontalContainer}>
            </View>
            <View style={styles.ViewContainer1}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate("SignUp")}
                style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: scale(12), color: "#1A1A1A", fontFamily: "Poppins-Medium" }}>{strings("Not_account")}
                  <Text style={{ fontSize: scale(12), color: mainColor, fontFamily: "Poppins-SemiBold" }}>{strings("Sign_Up")}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {this._renderModal()}
          {/* </KeyboardAvoidingView> */}
        </ScrollView>
      </View>
    );
  }
}
var styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  CenterView: {
    width: Dimensions.get('window').width,
    flex: 1,
    // padding: scale(20)
  },
  cardView: {
    margin: scale(6),
    flex: 1,
    paddingLeft: scale(30),
    paddingRight: scale(30),
  },
  ViewContainer1: {
    alignItems: 'center',
    justifyContent: "center",
    flexDirection: "row",
    marginTop: scale(5),
    marginBottom: scale(5),
    flex: 0.75,
    // backgroundColor: "red"
  },
  TextBlack1: {
    margin: scale(8),
    color: "white",
    fontSize: scale(12),
    textAlign: 'center'
  },
  imageContainer: {
    height: verticalScale(26),
    width: verticalScale(26),
    // resizeMode: 'contain',
    alignSelf: 'center',
    margin: scale(10),
    padding: scale(15),
    borderRadius: verticalScale(13),

  },
  HorizontalContainer: {
    flex: 0.5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
  },
  appleBtn: { height: verticalScale(60), width: scale(60), margin: scale(10) }
});
