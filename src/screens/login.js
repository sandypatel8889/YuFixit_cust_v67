import React, { Component } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  TextInput,
  ScrollView
} from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import { registerCustomIconType, SocialIcon } from "react-native-elements";
import { Button, Form, Item as FormItem, Input, Label } from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import auth from "@react-native-firebase/auth";
import ErrorComponent from "../components/helper/errorComp";
import { connect } from "react-redux";
import { setUser, setUserFromLocal } from "../redux/actions/index";
import { GoogleSignin } from "@react-native-community/google-signin";
import { Alert, Platform } from "react-native";
import { mainColor } from "../components/helper/colors";
import Modal from "react-native-modal";
import {
  getUserData,
  registerCustomer,
  getProviderbyEmail
} from "../components/helper/firestoreHandler";
import MyStorage from "../components/helper/MyStorage";
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import NetInfo from "@react-native-community/netinfo";
// import { LoginManager, AccessToken } from "react-native-fbsdk";
import { strings, selection } from '../../locales/i18n';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      processing: false,
      signInCompHasError: false,
      signInCompHasErrorValue: "",
      isInternetAvilable: true,
      isInternetAlertOpne: true
    };
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
          // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
        }

      }
    });
    GoogleSignin.configure({
      webClientId:
        "51864905969-vpnmvi4378659ugm3etiqm1otedmu9k8.apps.googleusercontent.com",
    });
  };
  // if the user login with google then after that this method will run for further procedings
  handleFurtherLogin = (data) => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    this.setState({ processing: true });
    getUserData(data.email)
      .then((res) => {
        if (res.docs.length > 0) {
          let data = { ...res.docs[0].data(), id: res.docs[0].id };
          this.props.setUserFromLocal(data);
          new MyStorage().setUserData(JSON.stringify(data));
          const { dispatch } = this.props.navigation;
          this.setState({ processing: false });
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
        } else {
          registerCustomer(data)
            .then((res) => {
              let _data = { ...data, id: res.id };
              this.props.setUserFromLocal(_data);
              new MyStorage().setUserData(JSON.stringify(_data));
              const { dispatch } = this.props.navigation;
              this.setState({ processing: false });
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
            })
            .catch((err) => {
              this.setState({ processing: false });
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
        }
      })
      .catch((err) => {
        this.setState({ processing: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  handleFacebookSignin = async () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    const that = this;
    LoginManager.logInWithPermissions(['public_profile', 'email']).then(
      function (result) {
        console.log('result: ' + JSON.stringify(result))
        if (result.isCancelled) {
          // console.log('Login was cancelled');
          // that.setState({ isLoading: false })

        } else {
          AccessToken.getCurrentAccessToken()
            .then((data) => {
              console.log(data)
              // Create a graph request asking for user information with a callback to handle the response.
              const infoRequest = new GraphRequest(
                '/me',
                {
                  httpMethod: 'GET',
                  version: 'v2.9',
                  parameters: {
                    'fields': {
                      'string': 'id,name,email,picture.type(large)'
                    }
                  }
                },
                (error, result) => {
                  if (error) {
                    console.log("error:", error)
                    // that.setState({ isLoading: false })
                  }
                  else {
                    console.log("result:", result)
                    let data = {
                      name: result.name,
                      email: result.email,
                      phoneNumber: "",
                      profileUrl: result.picture.data.url,
                      auth: "facebook",
                    };
                    that.handleFurtherLogin(data);

                  }
                },
              );
              // Start the graph request.
              new GraphRequestManager().addRequest(infoRequest).start();
            })
        }
      },
      function (error) {
        // console.log("error: " + error)
        that.setState({ isLoading: false })
        alert('Login failed : ' + error);
      })

  };
  handleGoogleSignin = async () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    auth()
      .signInWithCredential(googleCredential)
      .then((res) => {
        console.log("google sign is successfull with res is: ", res);
        let data = {
          name: res.user.displayName,
          email: res.user.email ? res.user.email : res.user.phoneNumber,
          phoneNumber: res.user.phoneNumber,
          profileUrl: res.user.photoURL,
          auth: "google",
        };
        this.handleFurtherLogin(data);
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  // handling login with email and password
  handleLogin = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    if (this.state.email == "" || this.state.password == "") {
      Alert.alert(strings("Error"), strings("Please_provide_credentials"));
      return;
    }
    this.setState({ processing: true });
    auth()
      .signInWithEmailAndPassword(this.state.email.toLowerCase(), this.state.password)
      .then((res) => {

        getUserData(this.state.email.toLowerCase())
          .then((res) => {
            if (res.docs.length > 0) {
              let data = { ...res.docs[0].data(), id: res.docs[0].id };
              this.props.setUserFromLocal(data);
              new MyStorage().setUserData(JSON.stringify(data));
              if (data.phoneNumber) {
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
              }
              else {
                var newid = data.id
                const { dispatch } = this.props.navigation;
                this.props.navigation.navigate("MobileNo", {
                  id: newid,
                  email: this.state.email.toLowerCase(),
                });
              }
              this.setState({ processing: false, email: "", password: "" });
            } else {
              // if authentication success and customer profile not created 
              this.setState({ processing: false });
              getProviderbyEmail(this.state.email.toLowerCase())
                .then((res) => {
                  if (res.docs.length > 0) {
                    let data = { ...res.docs[0].data(), id: res.docs[0].id };
                    this.CreateProviderLogin(data.name, data.email)
                  } else {
                    Alert.alert(strings("Error"), strings("User_not_exists"));
                  }
                })
            }
          })
          .catch((err) => {
            this.setState({ processing: false });
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          });
      })
      .catch((err) => {
        this.setState({ processing: false });
        Alert.alert(strings("Invalid_User"), strings("Invalid_username"));
      });
  };
  CreateProviderLogin(name, Email) {
    let _data = {
      name: name,
      email: Email,
    };
    registerCustomer(_data).then((res) => {
      var newid = res.id
      const { dispatch } = this.props.navigation;
      this.props.navigation.navigate("MobileNo", {
        id: newid,
        email: this.state.email.toLowerCase(),
      });
    });
  }
  // modal Apear when the user uplaod picture
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
            <View height={verticalScale(30)} />
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
              <View marginTop={0} height={verticalScale(15)} />
              <View style={{ height: verticalScale(35), backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
                <Image style={{ height: verticalScale(14), width: verticalScale(13), resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/pass_icon.png')} />
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
                  placeholder={strings("Password")}
                  onChangeText={(password) => this.setState({ password: password })}
                  returnKeyType='done'
                  autoCorrect={false}
                  secureTextEntry={true}
                  fontSize={scale(13)}
                  fontFamily={"Poppins-Light"}
                />
              </View>

              {/* ------------------ Forgot Password ----------------- */}
              <View style={{ alignSelf: "flex-end" }}>
                <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgetPassword")}>
                  <Text style={[styles.TextBlack1]}>{strings("Forgot_password")}</Text>
                </TouchableOpacity>
              </View>
            </View>


            <View marginTop={0} height={verticalScale(15)} />
            <View width={"100%"} height={"12%"} justifyContent="center" alignItems="center">
              <View width={"25%"} height={"100%"} justifyContent="center" alignItems="center">
                <Button
                  full
                  disabled={this.state.processing}
                  style={{ backgroundColor: "transparent", elevation: 0, height: "100%" }}
                  onPress={() => {
                    this.handleLogin();
                  }}
                >
                </Button>
              </View>
            </View>

            <View marginTop={0} height={verticalScale(15)} />
            <View style={styles.HorizontalContainer}>
              <View style={styles.imageContainerview} />
              <View style={styles.imageContainerview} />
              {/* <TouchableOpacity onPress={() => this.handleFacebookSignin()} > */}
              {/* <Image style={styles.imageContainer} source={require('../../assets/fb.png')} /> */}
              {/* </TouchableOpacity> */}

              {/* ------------------ Google ----------------- */}
              {/* <TouchableOpacity onPress={() => this.handleGoogleSignin()} > */}
              {/* <Image style={styles.imageContainer} source={require('../../assets/gmail.png')} /> */}
              {/* </TouchableOpacity> */}
            </View>





            <View flex={1.5} justifyContent="center">
              <View style={styles.ViewContainer1}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("SignUp")}
                  style={{ alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: scale(12), color: "#1A1A1A", fontFamily: "Poppins-Medium" }}>{strings("Not_account")}
                    <Text style={{ fontSize: scale(12), color: mainColor, fontFamily: "Poppins-SemiBold" }}>{strings("Sign_Up")}</Text>
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.ViewContainer2}>
                <TouchableOpacity
                  onPress={() => {
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
                  }}
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ fontSize: scale(14), color: "#1A1A1A", fontFamily: "Poppins-Medium" }}>
                    {strings("skip")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {this._renderModal()}
          {/* </KeyboardAvoidingView> */}
        </ScrollView>
      </View >
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
    paddingLeft: scale(20),
    paddingRight: scale(20),
    paddingTop: scale(20),
    paddingBottom: scale(5),
  },
  cardView: {
    margin: scale(6),
    // borderRadius: scale(16),
    // backgroundColor: "white",
    padding: scale(10),
  },
  ViewContainer1: {
    alignItems: 'center',
    justifyContent: "center",
    flexDirection: "row",
    // marginTop: scale(5),
    // marginBottom: scale(5),
    // backgroundColor: "green",
    // flex: 0.7
  },
  ViewContainer2: {
    alignItems: 'center',
    justifyContent: "center",
    flexDirection: "row",
    // backgroundColor: "green",
    // flex: 0.5
  },
  TextBlack1: {
    margin: scale(10),
    color: "white",
    fontSize: scale(12),
    textAlign: 'center',
    fontFamily: "Poppins-Regular"
  },
  HorizontalContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    // backgroundColor:"red"
  },
  imageContainer: {
    height: verticalScale(26),
    width: verticalScale(26),
    resizeMode: 'contain',
    alignSelf: 'center',
    margin: scale(10),
    padding: scale(15),
    // borderRadius: verticalScale(13),
  },
  imageContainerview: {
    height: verticalScale(26),
    width: verticalScale(26),
    margin: scale(10),
    padding: scale(15),
    // borderRadius: verticalScale(13),
  },
  appleBtn: { height: verticalScale(60), width: scale(60), margin: scale(10) }
});
const MapStateToProps = (state) => {
  return {};
};
export default connect(MapStateToProps, { setUser, setUserFromLocal })(Login);
