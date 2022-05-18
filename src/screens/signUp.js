import React, { Component } from "react";
import {
  View,
  Text,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  StyleSheet,
  TextInput,
  Dimensions,
  ImageBackground,
  Image,
  ScrollView,
  PermissionsAndroid
} from "react-native";
import { moderateScale, scale, verticalScale } from "../components/helper/scaling";
import { SocialIcon, CheckBox, Avatar } from "react-native-elements";
import { Button, Form, Item as FormItem, Input, Label } from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import auth from "@react-native-firebase/auth";
import { NavigationActions } from "react-navigation";
import NetInfo from "@react-native-community/netinfo";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { v4 as uuidv4 } from "uuid";
import Modal from "react-native-modal";
import {
  registerCustomer,
  addProfileImage,
  addProfileUrl,
  getUserData
} from "../components/helper/firestoreHandler";
import { connect } from "react-redux";
import { setUser, setUserFromLocal } from "../redux/actions/index";
import { GoogleSignin } from "@react-native-community/google-signin";
import MyStorage from "../components/helper/MyStorage";
import { mainColor } from "../components/helper/colors";
import { AccessToken, LoginManager, GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import { strings, selection } from '../../locales/i18n';
import Icon1 from "react-native-vector-icons/AntDesign";
const options = {
  title: strings("Select_Picture"),
  // quality: 1.0, maxWidth: 100, maxHeight: 100,
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
};

class SignUp extends React.Component {
  // export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      name: "",
      agree: false,
      processing: false,
      showPicker: false,
      uploading: false,
      profileUrl: "",
      profileUrlNew: "",
      isInternetAvilable: true,
      isInternetAlertOpne: true
    };
  }
  componentDidMount() {
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

    if (auth().currentUser != null) {
      auth().signOut()
    }
  }
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
          email: res.user.email ? res.user.email.toLowerCase() : res.user.phoneNumber,
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
                      email: result.email.toLowerCase(),
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
  // _renderModal = () => {
  //   return (
  //     <Modal
  //       animationType="slide"
  //       transparent={true}
  //       isVisible={this.state.uploading}
  //     >
  //       <View
  //         style={{
  //           flex: 1,
  //           justifyContent: "center",
  //           alignItems: "center",
  //           // backgroundColor: "rgba(0,0,0,0.5)",
  //         }}
  //       >
  //         <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
  //           <ActivityIndicator color="white" size="large" />
  //           <Text style={{ color: "white", textAlign: "center" }}>
  //             Uploading profile picture
  //           </Text>
  //         </View>
  //       </View>
  //     </Modal>
  //   );
  // };

  // Appear modal when the user upload image
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
            // backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
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

  closePicker = () => {
    this.setState({ showPicker: false })
  }

  _renderImagePicker = () => {
    return (
      <Modal
          visible={this.state.showPicker}
          style={{ margin: 0 }}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.closePicker()} >
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: "rgba(10, 10, 10, 0.7)" }}>
              <View style={{ backgroundColor: "white", height: 200, width: Dimensions.get("window").width / 1.3, alignSelf: "center", borderRadius: moderateScale(10) }}>
                  <View style={{ backgroundColor: "black", padding: moderateScale(12), borderTopEndRadius: moderateScale(10), borderTopStartRadius: moderateScale(10) }}>
                      <Text style={{ color: "white", alignSelf: "center", fontSize: moderateScale(16) }}>Choose Option</Text>
                      <Icon1
                          name="closecircle"
                          size={moderateScale(25)}
                          color={"white"}
                          onPress={() => {
                              this.closePicker()
                          }}
                          style={{ position: "absolute", end: 6, top: 6, bottom: 0, alignItems: "center", justifyContent: "center" }}
                      />
                  </View>
                  <View style={{ padding: moderateScale(20), flex: 1 }}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(1)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          Take Photo
                        </Text>
                      </TouchableOpacity>
                      <View height={verticalScale(18)} />
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(2)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          Choose from gallery
                        </Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    )
  }

  
  showCamera = (value) => {
    if (Platform.OS == "android") {
        PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]).then((result) => {
            console.log("result", result)
            if (result['android.permission.CAMERA'] == "granted" &&
                result['android.permission.WRITE_EXTERNAL_STORAGE'] == "granted") {
                if (value == 1) {
                    this.openCamera()
                } else {
                    this.openGallery()
                }
            } else {
                Alert.alert("Please grant all permission to access this feature")
            }
        }).catch((reason) => {
            console.log("reason", reason)
        })
    } else {
        if (value == 1) {
            this.openCamera()
        } else {
            this.openGallery()
        }
    }
  }

  openCamera = () => {
      launchCamera({
          mediaType: "photo",
          maxHeight: 300,
          maxWidth: 300,
          quality: 0.5,
      }, (response) => {
          console.log("response", response)
          if (response.errorCode) return
          if (response.didCancel) return

          // this.setState({ uploading: true });
          // let path = Platform.OS == "android" ? "file://" + response.path : response.uri
          this.setState({ profileUrl: response.assets[0].uri });
      })
  }

  openGallery = () => {
      launchImageLibrary({
          mediaType: "photo",
          maxHeight: 300,
          maxWidth: 300,
          quality: 0.5,
          selectionLimit: 1
      }, (response) => {
          console.log("response", response)
          if (response.errorCode) return
          if (response.didCancel) return

          // this.setState({ uploading: true });
          // let path = Platform.OS == "android" ? "file://" + response.path : response.uri
          this.setState({ profileUrl: response.assets[0].uri });
      })
  }

  validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  uploadPictureFirst() {
    this.setState({ processing: true });
    const ext = this.state.profileUrl.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.${ext}`;
    addProfileImage(this.state.profileUrl, filename, (status, profileUrl) => {
      if (status) {
        this.setState({ profileUrlNew: profileUrl });
        this.signupNew()
      } else {
        // this.setState({ uploading: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }
  handleSignup = () => {

    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    // var reg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (this.state.name == "") {
      Alert.alert(strings("Name_Error"), strings("Enter_name"));
      return;
    }
    if (this.state.email === "") {
      Alert.alert(strings("Email_Error"), strings("Enter_correct_email"));
      return;
    }
    if (!this.validateEmail(this.state.email)) {
      Alert.alert(strings("Invalid_Email"), strings("Enter_correct_email"));
      return;
    }
    if (this.state.password === "") {
      Alert.alert(strings("Password_Error"), strings("Correct_Password"));
      return;
    }
    if (this.state.password.length < 6) {
      Alert.alert(strings("Password_Error"),strings("Password_digit"));
      return;
    }
    if (this.state.profileUrl == "") {
      Alert.alert(strings("Profile_Picture"), strings("Add_profile_photo"));
      return;
    }
    this.uploadPictureFirst()
  };


  signupNew() {
    this.setState({ processing: true });
    auth()
      .createUserWithEmailAndPassword(this.state.email.toLowerCase(), this.state.password)
      .then(() => {

        let _data = {
          name: this.state.name,
          email: this.state.email.toLowerCase(),
        };
        registerCustomer(_data).then((res) => {
          var newid = res.id
          addProfileUrl(res.id, this.state.profileUrlNew)
            .then((res) => {
              // console.log('res is: ',res.id)
              const { dispatch } = this.props.navigation;
              this.props.navigation.navigate("MobileNo", {
                id: newid,
                email: this.state.email.toLowerCase(),
              });
              this.setState({
                processing: false,
                name: "",
                email: "",
                password: "",
              });
            })
            .catch((err) => {
              // this.setState({ uploading: false });
              Alert.alert(strings("Error"), strings("Error_Something_went"));
            });
        });
        
      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use") {
          Alert.alert("Error", "Email already in use");
        } else if (error.code === "auth/invalid-email") {
          Alert.alert(strings("Error"), strings("Enter_correct_email"));
        } else {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        }
        this.setState({ processing: false });
      });
  }
  uploadPicture = () => {
    this.setState({ showPicker: true })
  };
  clickTermsandCondition() {
    Linking.canOpenURL("https://yufixit.co/terms-and-conditions-for-yufixit-tech-finder/").then(supported => {
      if (supported) {
        Linking.openURL("https://yufixit.co/terms-and-conditions-for-yufixit-tech-finder/");
      } else {
        console.log("Don't know how to open URI: " + "https://yufixit.co/terms-and-conditions-for-yufixit-tech-finder/");
      }
    });
  }
  render() {
    return (
      <View style={styles.MainContainer} >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
          < ImageBackground style={{ width: "100%", height: "100%", position: "absolute" }
          } resizeMode={"cover"} source={require("../../assets/mainbg.png")} />
          {/* <KeyboardAvoidingView behavior="padding" enabled keyboardVerticalOffset={Platform.select({ ios: Dimensions.get('window').height == 812 || Dimensions.get('window').width == 812 ? 85 : 64, android: -500 })}> */}
          {/* ------------------CenterView ----------------- */}
          <View style={styles.CenterView} >
            <View style={styles.cardView}>
              {/* <Image style={{ height: verticalScale(120), width: verticalScale(120), resizeMode: 'contain', alignSelf: 'center', marginTop: verticalScale(-10) }} source={require('../../assets/logo.png')} /> */}

              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => {
                    this.uploadPicture();
                  }}>
                  <View>
                    <Image defaultSource={require('../../assets/icon.png')} source={this.state.profileUrl != "" ? { uri: this.state.profileUrl } : require('../../assets/icon.png')} style={{ height: verticalScale(100), width: verticalScale(100), borderRadius: verticalScale(50), borderColor: "white", borderWidth: verticalScale(2) }} />
                    <View position="absolute" justifyContent="flex-end" alignItems="flex-end" height={"100%"} width={"100%"}>
                      <View height={verticalScale(30)} width={verticalScale(30)} borderRadius={verticalScale(15)} backgroundColor="white" justifyContent="center" alignItems="center">
                        <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(15), width: verticalScale(15) }} />
                      </View>
                    </View>
                  </View></TouchableOpacity>
              </View>
              <View marginTop={0} height={verticalScale(50)} />
              <View style={{ height: verticalScale(35), alignItems: "center", backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15), marginTop: verticalScale(-10) }}>
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
                  placeholder={strings("Name")}
                  onChangeText={(name) => this.setState({ name: name })}
                  fontSize={scale(13)}
                  returnKeyType='done'
                  autoCorrect={false}
                  fontFamily={"Poppins-Light"}
                />
              </View>

              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ height: verticalScale(35), alignItems: "center", backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
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
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ height: verticalScale(35), backgroundColor: "white", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
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




              {/* //Check Box Container */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center"
                }}>
                <CheckBox
                  left
                  checkedColor={"white"}
                  checked={this.state.agree}
                  onPress={() => {
                    this.setState({ agree: !this.state.agree });
                  }}
                />
                <Text style={{ marginLeft:scale(-15),fontSize: scale(12), color: "white", fontFamily: "Poppins-Medium" }}>
                  {strings("i_agree")}
                </Text>
                <TouchableOpacity
                  onPress={() => this.clickTermsandCondition()}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Text style={{ textDecorationLine: 'underline', fontSize: scale(12), color: "white", fontFamily: "Poppins-Medium" }}>{strings("Term_of_Service")}</Text>
                </TouchableOpacity>
              </View>
            </View>


            <View marginTop={0} height={verticalScale(15)} />
            <View width={"100%"} height={"14%"} justifyContent="center" alignItems="center">
              <View width={"25%"} height={"100%"} justifyContent="center" alignItems="center">
                <Button
                  full
                  disabled={this.state.processing}
                  style={{ backgroundColor: "transparent", elevation: 0, height: "100%" }}
                  onPress={() => {
                    this.handleSignup();
                  }}
                >
                </Button>
              </View>
            </View>
            <View marginTop={0} height={verticalScale(15)} />


            {/* //Sociale media container */}
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


            {/* //Bottom container */}
            <View flex={1.5} justifyContent="center">
              <View style={styles.ViewContainer1}>
                <TouchableOpacity
                  onPress={() => this.props.navigation.navigate("Login")}
                  style={{ alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: scale(12), color: "#1A1A1A", fontFamily: "Poppins-Medium" }}>{strings("have_account")}
                    <Text style={{ fontSize: scale(12), color: mainColor, fontFamily: "Poppins-SemiBold" }}>{strings("Sign_In")}</Text>
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
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

          </View>
          {/* <View marginTop={0} height={verticalScale(20)} /> */}
          {this._renderModal()}
          {this._renderImagePicker()}
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
    flex: 1,
    padding: scale(10),
    justifyContent: "center",
    // backgroundColor: "red",
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
    margin: scale(8),
    color: "white",
    fontSize: scale(12),
    textAlign: 'center'
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

export default connect(MapStateToProps, { setUser, setUserFromLocal })(SignUp);
