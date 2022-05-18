import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Linking,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput
} from "react-native";
import { Button, Form, Item as FormItem, Input, Label } from "native-base";
import PhoneInput from "react-native-phone-number-input";
import ModalPickerImage from "../components/common/modalPickerImage";
import { moderateScale, scale, verticalScale } from "../components/helper/scaling";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Icon from "react-native-vector-icons/FontAwesome5";
import auth from "@react-native-firebase/auth";
import { addPhoneNumber, getUserData } from "../components/helper/firestoreHandler";
import { connect } from "react-redux";
import { setUser, setUserFromLocal } from "../redux/actions/index";
import NetInfo from "@react-native-community/netinfo";
import MyStorage from "../components/helper/MyStorage";
import { mainColor } from "../components/helper/colors";
import { strings, selection } from '../../locales/i18n';
class MobileNo extends Component {
  constructor() {
    super();
    this.state = {
      pickerData: null,
      phone: "",
      verifyCodeScreen: false,
      locationView: false,
      confirmation: null,
      verifyCode: "",
      processing: false,
      isInternetAvilable: true,
      timer: 60,
      isInternetAlertOpne: true
    };
  }
  componentDidMount() {
    // this.setState({
    //   pickerData: this.phone.getPickerData(),
    // });

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

  }
  componentDidUpdate() {
    if (this.state.timer === 1) {
      clearInterval(this.interval);
    }
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  onPressFlag = () => {
    this.setState({
      processing: true,
    });

    setTimeout(() => {
      this.setState({ processing: false });
    }, 2000);

    this.myCountryPicker.open();
  };
  selectCountry = (country) => {
    this.setState({ phone: country.callingCode[0] });
    this.phone.selectCountry(country.iso2);
  };
  ResendCode = async () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    clearInterval(this.interval);
    this.setState({ processing: true });
    try {
      const confirmation = await auth().verifyPhoneNumber(this.state.phone);
      if (confirmation) {
        this.setState({ timer: 60 });
        this.interval = setInterval(
          () => this.setState((prevState) => ({ timer: prevState.timer - 1 })),
          1000
        );
        this.setState({
          confirmation: confirmation,
          processing: false,
        });
      }
    } catch (err) {
      this.setState({
        processing: false,
      });
      Alert.alert(strings("Error"), strings("Error_Something_went"));
      setErrorOccured(true);
      if (err.code === 'missing-phone-number') {
        console.log('Missing Phone Number.');
        setErrorMsg('Missing Phone Number.');
      } else if (err.code === 'auth/invalid-phone-number') {
        console.log('Invalid Phone Number.');
        setErrorMsg('Invalid Phone Number.');
      } else if (err.code === 'auth/quota-exceeded') {
        console.log('SMS quota exceeded.');
        setErrorMsg('SMS quota exceeded.Please try again later.');
      } else if (err.code === 'auth/user-disabled') {
        console.log('User disabled.');
        setErrorMsg('Phone Number disabled. Please contact support.');
      } else {
        console.log('Unexpected Error.' + err.code);
        axios.post(`https://myapi/error`, err);
        setErrorMsg('Unexpected Error Occured. Please contact support.');
      }
    }
  }
  sendCode = async () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    if (this.state.phone.length > 10) {
      this.setState({ processing: true });
      try {
        const confirmation = await auth().verifyPhoneNumber(this.state.phone);
        if (confirmation) {

          this.interval = setInterval(
            () => this.setState((prevState) => ({ timer: prevState.timer - 1 })),
            1000
          );

          this.setState({
            confirmation: confirmation,
            verifyCodeScreen: true,
            processing: false,
          });
        }
      } catch (err) {
        this.setState({
          processing: false,
        });

        Alert.alert(strings("Error"), strings("Error_Something_went"));
        setErrorOccured(true);
        if (err.code === 'missing-phone-number') {
          console.log('Missing Phone Number.');
          setErrorMsg('Missing Phone Number.');
        } else if (err.code === 'auth/invalid-phone-number') {
          console.log('Invalid Phone Number.');
          setErrorMsg('Invalid Phone Number.');
        } else if (err.code === 'auth/quota-exceeded') {
          console.log('SMS quota exceeded.');
          setErrorMsg('SMS quota exceeded.Please try again later.');
        } else if (err.code === 'auth/user-disabled') {
          console.log('User disabled.');
          setErrorMsg('Phone Number disabled. Please contact support.');
        } else {
          console.log('Unexpected Error.' + err.code);
          axios.post(`https://myapi/error`, err);
          setErrorMsg('Unexpected Error Occured. Please contact support.');
        }
      }
    }
    else {
      Alert.alert(strings("Error"), strings("valid_number"))
      return
    }
  };

  handleVerifyCode = async () => {
    // this.setState({ locationView: true })
    // handle verify code that sent to the user sec
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    this.setState({ processing: true });
    if (this.state.confirmation) {
      try {
        const credential = auth.PhoneAuthProvider.credential(
          this.state.confirmation.verificationId,
          this.state.verifyCode,
        );
        let userData = await auth().signInWithCredential(credential)
        // await this.state.confirmation.confirm(this.state.verifyCode);
        console.log("userData:", userData)
        this.proceed();
      } catch (error) {
        Alert.alert(strings("Invalid_Code"));
        this.setState({ processing: false });
      }
    } else {
      Alert.alert(strings("Invalid_Code"));
      this.setState({ processing: false });
    }
  };

  proceed = () => {
    // console.log(this.props.navigation.state.params)
    // when the user add code and then if the code is right he will navigate to the home dashboard
    addPhoneNumber(this.props.navigation.state.params.id, this.state.phone)
      .then((res) => {
        getUserData(this.props.navigation.state.params.email)
          .then((res) => {
            if (res.docs.length > 0) {
              let data = { ...res.docs[0].data(), id: res.docs[0].id };
              this.props.setUserFromLocal(data);
              new MyStorage().setUserData(JSON.stringify(data));

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
              this.setState({ processing: false, email: "", password: "" });
            } else {
              this.setState({ processing: false });
              Alert.alert(strings("Error"), strings("User_not_exists"));
            }
          })
          .catch((err) => {
            this.setState({ processing: false });
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          });
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };

  //   render location view
  renderLocationView = () => {
    return (
      <View style={{ flex: 1, paddingHorizontal: scale(12) }}>
        {/* <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            flexDirection: "column",
            marginTop: verticalScale(50),
          }}
        >
          <View style={{ flex: 0.5 }}>
            <Icon
              type="FontAwesome5"
              name="map-marker"
              size={100}
              style={{ color: "#01999C" }}
            />
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", color: "black" }}>
              {"Hello nice to \nmeet you!"}
            </Text>
            <Text style={{ color: "gray", fontSize: 20, marginTop: scale(12) }}>
              {`Set your location to start find worker around you`}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Button
            full
            style={{
              backgroundColor: "#01999C",
              borderRadius: scale(5),
              marginBottom: verticalScale(12),
            }}
            onPress={() => {
              this.props.navigation.navigate("routeTwo");
            }}
          >
            <Icon
              type="EvilIcons"
              name="location-arrow"
              size={20}
              style={{ color: "white", paddingRight: scale(6) }}
            />
            <Text
              style={{
                fontSize: 15,
                color: "white",
                fontWeight: "bold",
                paddingLeft: scale(6),
              }}
            >
              {" "}
              Use current location{" "}
            </Text>
          </Button>

          <Text style={{ color: "gray" }}>
            {
              "We only access your location while you are using this incredible app"
            }
          </Text>
        </View> */}
      </View>
    );
  };
  // section of verify code screen
  verifyCodeScreen = () => {
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: scale(12),
          marginTop: verticalScale(50),
        }}>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: scale(18), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
            {strings("verify_number")}
          </Text>
          <Text style={{
            fontSize: scale(14), color: "#A7A8AB", fontFamily: "Poppins-Light", marginTop: scale(5),
          }}>
            {strings("Sent_code") + this.state.phone}
          </Text>
        </View>

        <View marginTop={0} height={verticalScale(40)} />
        <View style={{}}>
          <View style={{ height: verticalScale(35), alignItems: "center", backgroundColor: "#F4F4F4", borderRadius: scale(20), flexDirection: "row", paddingLeft: scale(15), paddingRight: scale(15) }}>
            <TextInput
              style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5), width: "90%" }}
              placeholder={strings("Enter_Code")}
              onChangeText={(verifyCode) => this.setState({ verifyCode: verifyCode })}
              fontSize={scale(13)}
              returnKeyType='done'
              autoCorrect={false}
              fontFamily={"Poppins-Light"}
            />
          </View>
          {/* <Form>
            <FormItem floatingLabel last style={{ borderBottomColor: "gray" }}>
              <Label style={{ fontSize: 15, color: "black" }}>Enter Code</Label>
              <Input
                onChangeText={(code) => this.setState({ verifyCode: code })}
              />
            </FormItem>
          </Form> */}
          <View marginTop={0} height={verticalScale(20)} />
          <Button
            full
            style={{
              backgroundColor: mainColor,
              borderRadius: scale(5),
              height: verticalScale(35)
              // marginVertical: scale(20),
            }}
            onPress={() => {
              this.handleVerifyCode();
            }}>
            {this.state.processing ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                style={{ fontSize: scale(16), color: "white", fontFamily: "Poppins-SemiBold" }}>
                {" "}
                Verify{" "}
              </Text>
            )}
          </Button>
          <View marginTop={0} height={verticalScale(20)} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TouchableOpacity
              onPress={() => this.state.timer === 1 ? this.ResendCode() : console.log("")}
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}>
              {this.state.timer === 1 ? <Text style={{ textDecorationLine: 'underline', fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#161F39" }}>{strings("Resend_Code")}</Text> : <Text style={{ fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#B5B5B5" }}>{strings("Resend_Code")}</Text>}
            </TouchableOpacity>
            <Text style={{ fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#161F39" }}> {this.state.timer + strings("Sec_Left")} </Text>
          </View>
        </View>
      </View>
    );
  };
  // phone picker
  _renderPhoneNumber = () => {
    return (
      <View>
        <View style={{ alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
          <View style={{ width: "100%", alignSelf: "center" }}>
            <PhoneInput
              defaultValue={this.state.phone}
              defaultCode={"CA"}
              onChangeFormattedText={(value) => {
                console.log("value", value)
                this.setState({ phone: value });
              }}
              ref={(ref) => {
                this.phone = ref;
              }}
              layout="second"
              containerStyle={{ backgroundColor: "white", alignSelf: "center", width: "96%" }}
              textContainerStyle={{ paddingVertical: moderateScale(5), backgroundColor: "#F4F4F4" }}
              textInputStyle={{ paddingVertical: moderateScale(5) }}
              withDarkTheme
              withShadow
              autoFocus
            />
            {/* <ModalPickerImage
              ref={(ref) => {
                this.myCountryPicker = ref;
              }}
              data={this.state.pickerData}
              onChange={(country) => {
                this.selectCountry(country);
              }}
              cancelText="Cancel"
            /> */}
          </View>
        </View>
      </View>
    );
  };

  render() {
    return (
      <>
        {this.state.locationView ? (
          this.renderLocationView()
        ) : (
          <KeyboardAwareScrollView>
            {this.state.verifyCodeScreen ? (
              this.verifyCodeScreen()
            ) : (
              <View
                style={{
                  flex: 1,
                  paddingHorizontal: scale(12),
                  marginTop: verticalScale(50),
                }}>
                <View style={{ flex: 1, justifyContent: "flex-end" }}>
                  <Text
                    style={{ fontSize: scale(18), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                    {strings("verify_number")}
                  </Text>
                  <Text
                    style={{
                      fontSize: scale(14), color: "#A7A8AB", fontFamily: "Poppins-Light", marginTop: scale(5),
                    }}>
                    {strings("enter_phone")}
                  </Text>
                </View>
                <View marginTop={0} height={verticalScale(40)} />
                <View style={{}}>
                  {this._renderPhoneNumber()}
                  <View marginTop={0} height={verticalScale(20)} />
                  <Button
                    full
                    style={{
                      backgroundColor: mainColor,
                      borderRadius: scale(5),
                      height: verticalScale(35)
                    }}
                    onPress={() => {
                      this.sendCode();
                    }}>
                    {this.state.processing ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text
                        style={{
                          fontSize: scale(16),
                          color: "white",
                          fontFamily: "Poppins-SemiBold",
                        }}>{strings("Send_Code")}</Text>
                    )}
                  </Button>
                </View>
              </View>
            )}
          </KeyboardAwareScrollView>
        )}
      </>
    );
  }
}

const MapStateToProps = (state) => {
  return {};
};
export default connect(MapStateToProps, { setUser, setUserFromLocal })(MobileNo);
