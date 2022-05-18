import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Image,
  Linking,
  // Modal
} from "react-native";
import {
  Form,
  Item as FormItem,
  Input,
  Label,
  Textarea,
  ListItem,
  Body,
} from "native-base";
import {
  CreditCardInput,
  LiteCreditCardInput,
} from "react-native-input-credit-card";
import { mainColor } from "../components/helper/colors";
import { CheckBox, Avatar, Button, Icon } from "react-native-elements";
import { moderateScale, scale, verticalScale } from "../components/helper/scaling";
import Modal from "react-native-modal";
import DatePicker from "react-native-date-picker";
import moment from "moment";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ProgressSteps, ProgressStep } from "react-native-progress-steps";
import { setUser } from "../redux/actions/index";
import ModalPickerImage from "../components/common/modalPickerImage";
import PhoneInput from "react-native-phone-number-input";
import CountryPicker from 'react-native-country-picker-modal'
import { StackActions, NavigationActions } from 'react-navigation';

import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon1 from "react-native-vector-icons/AntDesign";

import Geolocation from "@react-native-community/geolocation";
import Geocoder from "react-native-geocoding";
Geocoder.init("AIzaSyC0gFTTXNp535E2IxoCHW13LwLkXxDUybA");
import {
  uploadProfileData,
  addToCategory,
  addProfileImage,
  handleOnlinOffline,
  updateProviderSubscriptionDate
} from "../util/firestoreHandler";
import { v4 as uuidv4 } from "uuid";
import {
  addAddress,
  fetchCategories,
  addProviderToCategory,
} from "../util/firestoreHandler";
import { connect } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import ExpandableComponent from "../components/common/ExpandableComponent";
import { ScrollView } from "react-native-gesture-handler";
import { LayoutAnimation } from "react-native";
import { strings, selection } from '../../locales/i18n';
const options = {
  title: strings("Select_Picture"),
  quality: 1.0, maxWidth: 1000, maxHeight: 1000,
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
};

class PersonalInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renderPersonalInformation: true,
      is_date_modal_visible: false,
      show_bday_picker: false,
      dob: "",
      ssn: "123",
      errorinputDate: false,
      showRegistrationFee: false,
      newCard: null,
      showCreditCardSec: false,
      categories: [],
      serviceDetail: "",
      chatting: true,
      call: true,
      quote: true,
      calendar: true,
      reporting: true,
      total: 25,
      categoryName: strings("Select_Category"),
      categoryId: "",
      activeStep: 0,
      showPicker: false,
      showCountryPicker: false,
      personalInfo: {
        country: "",
        address: "",
        // zipCode:'',
        number: '',
        ssn: "123",
        dob: "",
        profileUrl: "",
      },
      skill: {
        skillName: "",
        categoryId: "",
        detail: "",
        hourlyRate: null,
      },
      creditCardInfo: {
        number: "4242424242424242",
        expiry: "01/25",
        cvc: "123",
        type: "visa",
        name: "test123",
        postalCode: "123456",
      },
      uploading: false,
      Loading: false,
      uploadingPic: false,
      verify: false,
      verifying: false,
      pickerData: null,
      phoneNumber: "",
      countryname: "United States",
      lblAddress: strings("Select_Address"),
      address: null,
      isInternetAvilable: true,
      isInternetAlertOpne: false,
      isPreviousDisable: this.props.navigation.state.params ? false : true,
      Offering: null,
      _date_picker_value:
        Platform.OS == "android"
          ? moment().subtract(18, "years")
          : new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
    };
    this.storeCountryName("United States")
  }
  componentWillUnmount() {
   
  }
  componentDidMount = () => {
    this.getLocation();
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
    // this.setState({
    //   pickerData: this.phone.getPickerData(),
    // });

  }
  //   getting user geolocation method
  getGeoLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude);
        const long = parseFloat(position.coords.longitude);
        this.setState({ latitude: lat, longitude: long }, () => {
          Geocoder.from(lat, long)
            .then((json) => {
              try {
                var arraddress = json.results[0].address_components
                for (let i = 0; i < arraddress.length; i++) {
                  if (arraddress[i].types[0] == 'country') {
                    this.setState({
                      countryname: arraddress[i].long_name,
                    });
                    this.storeCountryName(arraddress[i].long_name)
                  }
                }
              } catch (err) {
                var addressComponent = json.results[0].address_components[0].short_name;
                alert(addressComponent + '')
              }
            })
            .catch((error) => console.warn(error));
        });
      },
      (error) => {
        console.log(error.code, error.message);
      }
    );
  };
  storeCountryName(name) {
    let temp = this.state.personalInfo;
    temp.country = name;
    this.setState({ personalInfo: temp });
  }
  //   async getting user get location method
  async getLocation() {
    try {
      if (Platform.OS === "ios") {
        Geolocation.requestAuthorization();
        this.getGeoLocation();
      } else {
        // ask for PermissionAndroid as written in your code
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: strings("Location_Permission"),
            message: strings("Location_Permission1"),
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.getGeoLocation();
        }
      }
    } catch (err) {
      Alert.alert(strings("Error"), strings("Error_Something_went"));
    }
  }
  // setting state for date of birth
  handleDOB = (text) => {
    this.setState({ dob: text });
  };
  // handling birthday picker modal

  hideBdayPicker = () => {
    this.setState({
      show_bday_picker: false,
    });
  };

  // shwoing date picker modal
  showDatePickerModal = () => {
    let text_info = strings("DATE_OF_BIRTH");

    return (
      <Modal
        style={{
          justifyContent: "flex-end",
          margin: 0,
          marginHorizontal: scale(16),
        }}
        useNativeDriver={true}
        backdropTransitionOutTiming={0}
        animationInTiming={500}
        animationOutTiming={500}
        isVisible={this.state.is_date_modal_visible}
        onBackdropPress={() => {
          this.setState({
            is_date_modal_visible: false,
          });
        }}
      >
        <View
          maxHeight="95%"
          style={{
            justifyContent: "center",
            backgroundColor: "white",
            alignItems: "center",
            paddingTop: verticalScale(4),
          }}
        >
          <Text
            style={{
              marginTop: verticalScale(12),
              marginBottom: verticalScale(8),
              fontSize: scale(14),
              color: "black",
              alignSelf: "center",
              paddingHorizontal: scale(32),
              textAlign: "center",
              fontFamily: "Poppins-Regular"
            }}
          >
            {text_info.toUpperCase()}
          </Text>
          <DatePicker
            customStyles={{
              datePicker: {
                justifyContent: 'center'
              }
            }}
            date={
              Platform.OS === "android"
                ? this.state.personalInfo.dob
                  ? this.state.personalInfo.dob
                  : new Date()
                : this.state.personalInfo.dob
                  ? this.state.personalInfo.dob
                  : ""
            }
            mode={"date"}
            // maximumDate={new Date()}
            maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 10))}
            onDateChange={(date) => {
              if (date) {
                let temp = { ...this.state.personalInfo };
                temp.dob = date;
                this.setState({ personalInfo: temp });
              }
            }}
          />

          <TouchableOpacity
            style={{
              height: verticalScale(35),
              paddingLeft: scale(8),
              paddingRight: scale(8),
              marginTop: verticalScale(12),
              marginBottom: verticalScale(8),
              width: "80%",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: mainColor,
              borderRadius: 5
            }}
            onPress={() => {
              this.setState({
                is_date_modal_visible: false,
              });

              this.pickedDate(this.state._date_picker_value);
            }}>
            <Text
              style={{
                fontSize: scale(14),
                color: "white",
                fontFamily: "Poppins-SemiBold"
              }}>
              {strings("CONFIRM")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              height: verticalScale(35),
              paddingLeft: scale(8),
              paddingRight: scale(8),
              marginBottom: verticalScale(12),
              width: "80%",
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#B5B5B5",
              borderRadius: 5
            }}
            onPress={() => {
              this.setState({
                is_date_modal_visible: false,
              });
            }}>
            <Text
              style={{
                fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#B5B5B5"
              }}>
              {strings("CANCEL")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };
  // Date pick
  pickedDate = (date) => {
    console.log("dateeeee", date);
    var dd = moment(date).date();
    var mm = moment(date).month() + 1;
    var yyyy = moment(date).year();
    // var date_str = dd + '-' + mm + '-' + yyyy;
    var date_str = yyyy + "-" + mm + "-" + dd;
    console.log("date str", date_str);
    // alert(date_str)
    this.setState({
      dateTobeSent: date_str,
    });

    let age = moment().diff(date, "years");

    if (age >= 18) {
      this.handleDOB(date_str);
      this.hideBdayPicker();
      this.setState({
        show_birthday_error: false,
        errorinputDate: false,
      });
    } else {
      console.log("age", age);
      this.setState({
        errorinputDate: true,
      });
      this.hideBdayPicker();
      this.setState({
        show_birthday_error: true,
      });
    }
  };
  // modal Apear when the user uplaod picture
  _renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.uploadingPic}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" size="large" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Uploading_profile_picture")}
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

          this.uploadImage(response.assets[0].uri)
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

          this.uploadImage(response.assets[0].uri)
      })
  }

  uploadImage = (uri) => {
    this.setState({ uploadingPic: true });
    const ext = uri.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.${ext}`;
    addProfileImage(uri, filename, (status, profileUrl) => {
      if (status) {
        let temp = this.state.personalInfo;
        temp.profileUrl = profileUrl;
        this.setState({ personalInfo: temp, uploadingPic: false });
      } else {
        this.setState({ uploadiuploadingPicng: false });
        Alert.alert(strings("Error_Something_went"));
      }
    });
  }

  // Function of uploading picture
  uploadPicture = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    this.setState({ showPicker: true })

  };
  selectCountry = (country) => {
    // this.setState({ phoneNumber: country.callingCode[0] });
    this.setState({ countryname: country.name });
    let temp = this.state.personalInfo;
    temp.country = country.name;
    this.setState({ personalInfo: temp });
  };
  // rendering personal inforamtion
  onPressFlag = () => {
    this.myCountryPicker.open();
  };
  GetAddress(newAddressValue) {
    let address = {
      name: "Work",
      value: newAddressValue
    }
    this.setState({ lblAddress: newAddressValue.name, address });
    let temp = { ...this.state.personalInfo };
    temp.address = newAddressValue.name;
    this.setState({ personalInfo: temp });
  }
  renderPersonalInformation = () => {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 1, padding: scale(20) }}>
          <TouchableOpacity onPress={() => this.uploadPicture()}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                padding: scale(10),
                flex: 1
              }}>
              {this.state.personalInfo.profileUrl == "" ? <View alignItems="center" justifyContent="center" height={verticalScale(100)} width={verticalScale(100)} backgroundColor="#CBCBCB" borderRadius={verticalScale(50)}>
                <Image source={require('../../assets/user.png')} style={{ resizeMode: 'contain', height: verticalScale(45), width: verticalScale(40) }} />
                <View marginTop={0} height={verticalScale(5)} />
                <Text style={{ fontSize: scale(9), color: "#5B5B5B", fontFamily: "Poppins-Regular" }}>{strings("Add_Photo")}</Text>
              </View> : <Image source={{ uri: this.state.personalInfo.profileUrl }} style={{ height: verticalScale(100), width: verticalScale(100), borderRadius: verticalScale(50) }} />}
            </View>
          </TouchableOpacity>
          <View marginTop={0} height={verticalScale(30)} />
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: scale(10),
              flex: 1
            }}>
            <TouchableOpacity
              onPress={() => {
                // this.onPressFlag()
                this.setState({ showCountryPicker: true })
              }}>
              <View style={{ height: verticalScale(35), width: "90%", alignItems: "center", backgroundColor: "white", flexDirection: "row" }}>
                <View height={verticalScale(35)} width={"90%"} justifyContent="center" alignItems="center">
                  <View justifyContent="center" alignItems="center">
                    <CountryPicker
                      {...{
                        // countryCode,
                        withFilter: true,
                        withFlag: true,
                        withCountryNameButton: true,
                        withAlphaFilter: true,
                        withCallingCode: false,
                        withEmoji: true,
                        onSelect: (country) => {
                          console.log("country", country)
                          this.selectCountry(country)
                        },
                        onClose: () => {
                          this.setState({ showCountryPicker: false })
                        }
                      }}
                      visible={this.state.showCountryPicker}
                    />
                    </View>
                  {/* : <TextInput
                      style={{ height: verticalScale(35), color: "#5B5B5B", paddingLeft: scale(5), width: "100%" }}
                      placeholder="Enter country"
                      value={this.state.countryname}
                      onChangeText={(countryname) => this.setState({ countryname: countryname })}
                      fontSize={scale(13)}
                      returnKeyType='done'
                      autoCorrect={false}
                      fontFamily="Poppins-Light"
                    />} */}
                </View>

                {/* {this.state.countryname == "United States" ? */}
                <View backgroundColor="white" position="absolute" height={verticalScale(35)} marginLeft={this.state.countryname == "United States" ? 45 : 6} width={this.state.countryname == "United States" ? "60%" : "85%"} justifyContent="center">
                  <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(13), color: "#5B5B5B", fontFamily: "Poppins-Light" }}>{this.state.countryname}</Text>
                </View>
                {/* : console.log("")} */}

                <View height={verticalScale(35)} width={"10%"} justifyContent="center" alignItems="center">
                  <Image style={{ height: verticalScale(7), width: verticalScale(13), resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/dropdown.png')} />
                </View>
              </View>
            </TouchableOpacity>


            <View backgroundColor="#707070" height={1} width={"90%"}>
            </View>
            <View marginTop={0} height={verticalScale(10)} />
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.push("GoogleAddress", { personalInformation: this })
              }}>
              <View style={{ height: verticalScale(35), width: "90%", alignItems: "center", backgroundColor: "white", flexDirection: "row" }}>
                <View height={verticalScale(35)} width={"90%"} justifyContent="center">
                  {/* <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.push("GoogleAddress", { personalInformation: this })
                  }}> */}
                  <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(13), marginLeft: scale(5), color: "#5B5B5B", fontFamily: "Poppins-Light" }}>{this.state.lblAddress}</Text>
                  {/* </TouchableOpacity> */}
                </View>
                <View height={verticalScale(35)} width={"10%"} justifyContent="center" alignItems="center">
                  <Image style={{ height: verticalScale(13), width: verticalScale(13), resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/address.png')} />
                </View>
              </View>
            </TouchableOpacity>

            <View backgroundColor="#707070" height={1} width={"90%"}>
            </View>
            <View marginTop={0} height={verticalScale(10)} />
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  is_date_modal_visible: true,
                });
              }}>
              <View style={{ height: verticalScale(35), width: "90%", alignItems: "center", backgroundColor: "white", flexDirection: "row" }}>
                <View height={verticalScale(35)} width={"90%"} justifyContent="center">
                  {/* <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      is_date_modal_visible: true,
                    });
                  }}> */}
                  <Text style={{ fontSize: scale(13), color: "#5B5B5B", marginLeft: scale(5), fontFamily: "Poppins-Light" }}>
                    {this.state.personalInfo.dob == "" ||
                      this.state.personalInfo.dob == undefined
                      ? strings("Date_Of_Birth")
                      : moment(this.state.personalInfo.dob, "YYY-M-D").format(
                        "MMM DD yyyy"
                      )}
                  </Text>
                  {/* </TouchableOpacity> */}
                </View>
                <View height={verticalScale(35)} width={"10%"} justifyContent="center" alignItems="center">
                  <Image style={{ height: verticalScale(14), width: verticalScale(13), resizeMode: 'contain', alignSelf: 'center' }} source={require('../../assets/calender.png')} />
                </View>
              </View>
            </TouchableOpacity>
            <View backgroundColor="#707070" height={1} width={"90%"}>
            </View>
          </View>
          <View marginTop={0} height={verticalScale(10)} />
          {this.state.errorinputDate ? (
            <Text
              style={{
                fontSize: scale(12),
                paddingHorizontal: scale(12),
                color: "red",
              }}>{strings("above_18")}</Text>) : null}
        </View>
      </View >
    );
  };
  // // rendering disclaimer screen sec

  // renderDisclaimer = () => {
  //   return (
  //     <View style={{ flex: 1, backgroundColor: "white" }}>
  //       <View
  //         style={{
  //           flex: 0.4,
  //           backgroundColor: "green",
  //           justifyContent: "flex-end",
  //           backgroundColor: mainColor,
  //           paddingBottom: verticalScale(6),
  //         }}>
  //         <Text
  //           style={{
  //             fontSize: scale(14),
  //             fontWeight: "bold",
  //             color: "white",
  //             alignSelf: "center",
  //             paddingHorizontal: scale(32),
  //             textAlign: "center",
  //           }}>
  //           {"DISCLAIMER"}
  //         </Text>
  //       </View>
  //       <View style={{ flex: 3 }}>
  //         <View
  //           style={{
  //             paddingVertical: verticalScale(4),
  //             flexDirection: "row",
  //             alignItems: "center",
  //           }}
  //         >
  //           <CheckBox
  //             left
  //             checkedColor={"green"}
  //             checked={this.state.agree}
  //             onPress={() => {
  //               this.setState({ agree: !this.state.agree });
  //             }}
  //           />
  //           <Text style={{ fontSize: scale(12) }}>
  //             {"I agree to the Term of Service"}
  //           </Text>
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  // render registration fee section

  // renderRegistraionFee = () => {
  //   return (
  //     <View style={{ flex: 1, backgroundColor: "white" }}>
  //       <View
  //         style={{
  //           flex: 0.4,
  //           backgroundColor: "green",
  //           justifyContent: "flex-end",
  //           backgroundColor: mainColor,
  //           paddingBottom: verticalScale(6),
  //         }}
  //       >
  //         <Text
  //           style={{
  //             fontSize: scale(14),
  //             fontWeight: "bold",
  //             color: "white",
  //             alignSelf: "center",
  //             paddingHorizontal: scale(32),
  //             textAlign: "center",
  //           }}
  //         >
  //           {"REGISTRATION FEE"}
  //         </Text>
  //       </View>
  //       <View style={{ flex: 3 }}>
  //         <View
  //           style={{
  //             paddingVertical: verticalScale(4),
  //             flexDirection: "row",
  //             alignItems: "center",
  //           }}
  //         >
  //           <Text style={{ fontSize: scale(12), padding: scale(12) }}>
  //             {"One time registraiton fee to awail safe and trusted service"}
  //           </Text>
  //         </View>
  //         <View style={{}}>
  //           <Text
  //             style={{
  //               color: "black",
  //               fontWeight: "bold",
  //               fontSize: scale(12),
  //               paddingHorizontal: scale(12),
  //             }}
  //           >
  //             {"Registration Fee $25"}
  //           </Text>
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  // render verification sec

  // renderVerification = () => {
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: "center",
  //         alignItems: "center",
  //         paddingHorizontal: 20,
  //       }}
  //     >
  //       <Text
  //         style={{
  //           textAlign: "center",
  //           fontSize: 30,
  //           color: "black",
  //           fontWeight: "bold",
  //           paddingTop: 20,
  //         }}
  //       >
  //         Verification
  //       </Text>
  //       <Text
  //         style={{ fontSize: 17, paddingVertical: 10, textAlign: "center" }}
  //       >
  //         Please Enter your SSN Number to verify yourself
  //       </Text>

  //       <FormItem
  //         floatingLabel
  //         style={{
  //           borderBottomColor: "gray",
  //           width: "50%",
  //           marginVertical: 20,
  //         }}
  //       >
  //         <Label style={{ fontSize: 15, color: "black" }}>Your SSN</Label>
  //         <Input
  //           keyboardType={"number-pad"}
  //           value={this.state.personalInfo.ssn}
  //           onChangeText={(text) => {
  //             let temp = { ...this.state.personalInfo };
  //             temp.ssn = text;
  //             this.setState({ personalInfo: temp });
  //           }}
  //         />
  //       </FormItem>

  //       <View style={{ width: 200, marginTop: 30 }}>
  //         <Button
  //           onPress={() => {
  //             if (this.state.personalInfo.ssn === "") {
  //               Alert.alert("Error", "Please enter a valid ssn");
  //               return;
  //             }
  //             this.setState({ verifying: true }, () => {
  //               setTimeout(() => {
  //                 this.setState({ verify: true, verifying: false });
  //               }, 1000);
  //             });
  //           }}
  //           loading={this.state.verifying}
  //           buttonStyle={{ backgroundColor: mainColor }}
  //           style={{ width: 200 }}
  //           title="Verify"
  //         />
  //       </View>

  //       {this.state.verify && (
  //         <View
  //           style={{
  //             flex: 1,
  //             alignItems: "center",
  //             justifyContent: "center",
  //             marginTop: 20,
  //           }}
  //         >
  //           <Icon
  //             type="antdesign"
  //             name="checkcircleo"
  //             size={40}
  //             color={mainColor}
  //           />
  //         </View>
  //       )}
  //     </View>
  //   );
  // };
  // ----------------------------Card Section--------------------------------------
  // _onChange = (card) => {
  //   if (card.valid) {
  //     this.setState({ creditCardInfo: card.values });
  //   } else {
  //     this.setState({ creditCardInfo: null });
  //   }
  // };
  // renderCreditCard = () => {
  //   const d = {
  //     number: "",
  //     expiry: "",
  //     cvc: "",
  //     type: "visa",
  //     name: "",
  //     postalCode: "",
  //   };
  //   return (
  //     <View style={{ flex: 1, backgroundColor: "white" }}>
  //       <View style={{ flex: 3, marginTop: verticalScale(12), marginRight: 0 }}>
  //         {/* <KeyboardAwareScrollView> */}
  //         <CreditCardInput
  //           onChange={this._onChange}
  //           values={this.state.creditCardInfo ? this.state.creditCardInfo : d}
  //         />
  //         {/* </KeyboardAwareScrollView> */}
  //       </View>
  //     </View>
  //   );
  // };

  // Showing hourly rate section
  _renderHouryRate = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          let temp = this.state.skill;
          temp.hourlyRate = item;
          this.setState({ skill: temp });
        }}
        style={{
          flex: 1,
          marginVertical: verticalScale(5),
          marginLeft: index == 0 ? 0 : scale(10),
          borderRadius: 5,
          borderWidth: 1,
          borderColor: "#707070",
          backgroundColor:
            this.state.skill.hourlyRate !== null &&
              this.state.skill.hourlyRate.id == item.id
              ? mainColor
              : "white",
        }}>
        <View style={{ width: scale(75), alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: scale(10),
              color:
                this.state.skill.hourlyRate !== null &&
                  this.state.skill.hourlyRate.id == item.id
                  ? "white"
                  : "#6A6A6A",
              paddingVertical: 6,
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: scale(10),
              color:
                this.state.skill.hourlyRate !== null &&
                  this.state.skill.hourlyRate.id == item.id
                  ? "white"
                  : "#6A6A6A",
            }}>
            {item.value}
          </Text>
          <Text
            style={{
              fontFamily: "Poppins-Regular",
              fontSize: scale(10),
              color:
                this.state.skill.hourlyRate !== null &&
                  this.state.skill.hourlyRate.id == item.id
                  ? "white"
                  : "#6A6A6A",
              paddingVertical: 6,
            }}>
            {item.type}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  refreshCategories(value) {
    this.setState({ categories: value })
  }
  updateLayout = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const array = [...this.state.categories];
    array[index]['isExpanded'] = !array[index]['isExpanded'];
    this.setState(() => {
      return {
        categories: array,
      };
    });
  };
  renderSkill = () => {
    let hourlyRates = [
      {
        id: 0,
        name: "Range",
        value: "$15 - $25",
        type: "Suggested",
      },
      {
        id: 1,
        name: "Range",
        value: "$26 - $60",
        type: "High",
      },
      {
        id: 2,
        name: "Range",
        value: "$60 - $500",
        type: "Very High",
      },
    ];
    return (
      // <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
      <View style={{ flex: 1 }}>
        <Form style={{ justifyContent: "center" }} >
          {/* <Button
            title={"Select Category"}
            buttonStyle={{ backgroundColor: mainColor }}
            onPress={() => {
              this.props.navigation.navigate('CategorySelection', {
                onGoBack: (value) => this.refreshCategories(value),
                selectedCategories: this.state.categories
              });
            }}
            containerStyle={{ alignSelf: "center", width: "60%", height: verticalScale(35) }} /> */}

          <View height={verticalScale(35)} width={"100%"} alignItems="center" justifyContent="center">
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.push('CategorySelection', {
                  onGoBack: (value) => this.refreshCategories(value),
                  selectedCategories: this.state.categories
                });
              }}
              style={{ width: "100%", justifyContent: "center", alignItems: "center" }}>
              <View height={verticalScale(35)} borderRadius={5} width={"60%"} backgroundColor={mainColor} alignItems="center" justifyContent="center">
                <Text style={{ fontSize: scale(14), color: "white", width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Select_Category")}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View marginTop={0} height={verticalScale(10)} />
          <ScrollView contentContainerStyle={{ flex: 1, marginBottom: scale(20), marginLeft: scale(20), marginRight: scale(20) }}>
            {this.state.categories.map((item, key) => (
              <ExpandableComponent
                key={item.id}
                item={item}
                onClickFunction={this.updateLayout.bind(this, key)}
                editMode={false}
              />
            ))}
          </ScrollView>
          <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
            <Textarea
              style={{ fontSize: scale(14), fontFamily: "Poppins-Light", borderRadius: 5, color: "#6A6A6A", borderColor: "#707070", borderWidth: 1, marginLeft: scale(20), marginRight: scale(20) }}
              maxLength={500}
              rowSpan={6}
              value={this.state.skill.detail}
              bordered
              placeholder={strings("Enter_skills")}
              onChangeText={(name) => {
                let temp = this.state.skill;
                temp.detail = name;
                this.setState({ skill: temp });
              }}
            />
          </KeyboardAwareScrollView>
          {/* </FormItem> */}
          <View marginTop={0} height={verticalScale(20)} />
          <View style={{ marginLeft: scale(20), marginRight: scale(20) }}>
            <Text style={{ fontSize: scale(11), color: "#6A6A6A", fontFamily: "Poppins-SemiBold" }}>{strings("Hourly_rate")}</Text>
            <View marginTop={0} height={verticalScale(10)} />
            <View style={{ alignItems: "center" }}>
              <FlatList
                keyExtractor={(item, index) => index.toString()}
                data={hourlyRates}
                horizontal
                renderItem={this._renderHouryRate} />
            </View>
          </View>
        </Form>
      </View>
      // </KeyboardAwareScrollView>
    );
  };
  _renderTotal = () => {
    let total = 0;
    if (this.state.chatting) {
      total = total + 5;
    }
    if (this.state.call) {
      total = total + 5;
    }
    if (this.state.calendar) {
      total = total + 5;
    }
    if (this.state.quote) {
      total = total + 5;
    }
    if (this.state.reporting) {
      total = total + 5;
    }
    return <Text>{total}</Text>;
  };
  clickTermsandCondition() {
    Linking.canOpenURL("https://yufixit.co/terms-and-conditions-for-yufixit/").then(supported => {
      if (supported) {
        Linking.openURL("https://yufixit.co/terms-and-conditions-for-yufixit/");
      } else {
        console.log("Don't know how to open URI:");
      }
    });
  }
  clickPrivacyPolicy() {
    Linking.canOpenURL("https://yufixit.co/privacy-policy/").then(supported => {
      if (supported) {
        Linking.openURL("https://yufixit.co/privacy-policy/");
      } else {
        console.log("Don't know how to open URI:");
      }
    });
  }

  renderPayment = () => {
    return (
      <View style={{ padding: 5 }}>
        <Text style={{ fontSize: scale(9), textAlign: "center", color: "#242424", fontFamily: "Poppins-Regular" }}>
          {strings("Subscription_Title1")}
        </Text>
        <View marginTop={0} height={scale(20)} />
        <View justifyContent="center" alignItems="center">
          <View height={scale(110)} width={scale(110)} backgroundColor={mainColor} borderRadius={5} justifyContent="center" alignItems="center">
            <Text style={{ fontSize: scale(25), color: "white", fontFamily: "Poppins-SemiBold" }}>
              $10
            </Text>
            {/* <View marginTop={0} height={verticalScale(10)} /> */}
            <Text style={{ fontSize: scale(10), color: "white", fontFamily: "Poppins-Light", textAlign: "center" }}>
              {strings("1_Month")}
            </Text>
            <Text style={{ fontSize: scale(10), color: "white", fontFamily: "Poppins-Light", textAlign: "center" }}>
              {strings("3_days_trial")}
            </Text>
          </View>
        </View>
        <View marginTop={0} height={scale(5)} />
        <View justifyContent="center" alignItems="center">
          <View style={{ flexDirection: "row", justifyContent: "center", width: "80%" }}>
            <View marginLeft={scale(-15)}>
              <CheckBox
                color={mainColor}
                checked={this.state.chatting}
                checkedColor={mainColor}
                onPress={() => {
                  // this.setState({ chatting: !this.state.chatting });
                }}
              />
            </View>
            <View justifyContent="center" alignItems="center">
              <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-Regular" }}>
                {strings("Text_Chatting")}<Text style={{ color: "#242424", fontSize: scale(13), fontFamily: "Poppins-Regular" }}>$10</Text>
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => this.clickTermsandCondition("https://yufixit.co/terms-and-conditions-for-yufixit/")}
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: verticalScale(20),
            }}>
            <Text style={{ textDecorationLine: 'underline', color: "#242424", fontSize: scale(10), fontFamily: "Poppins-Regular" }}>{strings("Term_of_Service")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.clickPrivacyPolicy("https://yufixit.co/privacy-policy/")}
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: verticalScale(20),
            }}>
            <Text style={{ textDecorationLine: 'underline', color: "#242424", fontSize: scale(10), fontFamily: "Poppins-Regular" }}>{strings("Privacy_Policy")}</Text>
          </TouchableOpacity>
          <View marginTop={0} height={verticalScale(20)} />
        </View>
        {/* <View style={{ padding: scale(10), backgroundColor: mainColor, borderRadius: 5 }}>
          <Text style={{ fontWeight: "500", fontSize: scale(14), textAlign: "center", color: "white", fontFamily: "Poppins-Regular" }}>Try 14 days free trial</Text>
        </View> */}
      </View>
    );
  };
  handleFirstStep = () => {

    // this.state.personalInfo.country !== "" &&
    //     this.state.personalInfo.country !== "Select Country" &&
    //     this.state.personalInfo.address !== "" &&
    //     this.state.personalInfo.profileUrl !== "" &&
    //     // this.state.personalInfo.zipCode!==''&&
    //     // this.state.personalInfo.number!==''&&
    //     // this.state.personalInfo.ssn!==''&&
    //     this.state.personalInfo.dob !== ""
    //     ? false
    //     : true

    if (this.state.personalInfo.profileUrl == "") {
      Alert.alert(strings("Error"), strings("Add_profile_photo"));
      this.setState({
        errors: true
      })

    }
    else if (this.state.personalInfo.address == "") {
      Alert.alert(strings("Error"), strings("add_workaddress"));
      this.setState({
        errors: true
      })
    }
    else if (this.state.personalInfo.dob == "") {
      Alert.alert(strings("Error"), strings("Add_BirthDate"));
      this.setState({
        errors: true
      })
    }
    else {
      this.setState({
        errors: false
      })
    }

  };
  handlePreviousStep = () => {
    if (this.state.isPreviousDisable) {
      this.props.navigation.goBack();
    }
  };

  handleSecondStep = () => {
    if (this.state.categories.length == 0) {
      Alert.alert(strings("Error"), strings("select_oneCategory"));
      this.setState({
        errors: true
      })
    }
    else if (this.state.skill.hourlyRate == null) {
      Alert.alert(strings("Error"), strings("select_rate"));
      this.setState({
        errors: true
      })
    }
    else {
      this.setState({
        errors: false
      })
    }
  };
  handleOnline = () => {
    let data = this.props.userData;
    data = { ...data, isActive: true };
    this.props.setUser(data);

    handleOnlinOffline(this.props.userData.id, true)
      .then((res) => {
        new MyStorage().setUserData(JSON.stringify(data));
      })
      .catch((err) => {
        console.log("error in going online is: ", err);
        data = { ...data, isActive: true };
        this.props.setState(data);
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  // PaymentConfirmation = () => {
  //   Alert.alert("Payment",
  //     "Are you sure want to subscribe this plan?",
  //     [
  //       {
  //         text: "Later",
  //         style: "cancel",
  //         onPress: () => {
  //           this.handleDataUpload()
  //         }
  //       },
  //       {
  //         text: "Subscribe",
  //         onPress: () => {
  //           this.MakePayment(this.state.Offering)
  //         }
  //       }
  //     ])
  // }
  // handling data upload to the firebase
  handleDataUpload = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    this.setState({ uploading: true });
    let skills = {
      hourlyRate: this.state.skill.hourlyRate,
      details: this.state.skill.detail
    };

    let d = new Date();

    d.setDate(d.getDate() + 14);
    d.setHours(23, 49, 49);
    // let t = Date.now() + 15 * 24 * 60 * 60 * 1000;
    let t = Date.now();

    const modules = {
      calendar: {
        type: "DEMO",
        expireAt: t,
      },
      call: {
        type: "DEMO",
        expireAt: t,
      },
      chatt: {
        type: "DEMO",
        expireAt: t,
      },
      quote: {
        type: "DEMO",
        expireAt: t,
      },
      statistics: {
        type: "DEMO",
        expireAt: t,
      },
    };


    this.handleOnline()
    let addresses = []
    if (this.state.address)
      addresses.push(this.state.address)
    let services = this.state.categories

    uploadProfileData(
      this.props.userData.id,
      this.state.personalInfo,
      skills,
      this.state.creditCardInfo,
      modules,
      addresses,
      services
    )
      .then((data) => {
        this.props.setUser({
          ...this.props.userData,
          skills,
          personalInfo: this.state.personalInfo,
          creditCardInfo: this.state.creditCardInfo,
          addresses,
          services
        });

        this.state.categories.map((value) => {
          addToCategory(this.props.userData.id, value.categoryId);
        })


        setTimeout(() => {
          this.setState({ uploading: false });
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'routeTwo' })],
          });

          this.props.navigation.dispatch(resetAction);

          // const { dispatch } = this.props.navigation;
          // dispatch({
          //   type: "Navigation/RESET",
          //   actions: [
          //     {
          //       type: "Navigate",
          //       routeName: "routeTwo",
          //     },
          //   ],
          //   index: 0,
          // });
        }, 1000);
      })
      .catch((err) => {
        this.setState({ uploading: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };

  // showing modal for uploading data

  renderUploadDataModal = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.uploading}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Uploading_data")}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  renderLoadingDataModal = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.Loading}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Processing")}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  render() {
    return (
      <View style={{ flex: 1, marginTop: 30, marginLeft: 5, marginRight: 5 }}>
        <ProgressSteps
          activeStep={this.state.activeStep}
          completedProgressBarColor={mainColor}
          completedStepIconColor={mainColor}
          activeStepIconBorderColor={mainColor}
          disabledStepIconColor="#CBCBCB"
          activeLabelColor={mainColor}
          completedLabelColor={mainColor}
          labelFontSize={scale(11)}
          labelFontFamily="Poppins-Light"
          labelColor="#CBCBCB"
          borderWidth={1}
          activeStepNumColor="black"
          completedStepNumColor="white"
          disabledStepNumColor="white">

          <ProgressStep
            nextBtnText={strings("next")}
            previousBtnText={strings("Previous")}
            nextBtnStyle={{
              backgroundColor: mainColor,
              paddingHorizontal: scale(30),
              height: verticalScale(35),
              borderRadius: 5,
              justifyContent: "center",
              marginBottom: -10
            }}
            borderWidth={100}
            onSubmit={() => { }}
            nextBtnTextStyle={{ color: "white", fontFamily: "Poppins-Regular", fontSize: scale(14), }}
            onNext={this.handleFirstStep}
            errors={this.state.errors}
            onPrevious={this.handlePreviousStep}
            previousBtnStyle={{
              borderColor: this.state.isPreviousDisable ? "transparent" : "transparent",
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: scale(15),
              height: verticalScale(35),
              justifyContent: "center",
              marginBottom: -10
            }}
            previousBtnTextStyle={{ color: this.state.isPreviousDisable ? "transparent" : "transparent", fontFamily: "Poppins-Regular", fontSize: scale(14) }}
            // nextBtnDisabled={
            //   this.state.personalInfo.country !== "" &&
            //     this.state.personalInfo.country !== "Select Country" &&
            //     this.state.personalInfo.address !== "" &&
            //     this.state.personalInfo.profileUrl !== "" &&
            //     // this.state.personalInfo.zipCode!==''&&
            //     // this.state.personalInfo.number!==''&&
            //     // this.state.personalInfo.ssn!==''&&
            //     this.state.personalInfo.dob !== ""
            //     ? false
            //     : true
            // }
            label={strings("Account")}>
            {this.renderPersonalInformation()}

          </ProgressStep>


          <ProgressStep
            nextBtnText={strings("next")}
            previousBtnText={strings("Previous")}
            // nextBtnDisabled={
            //   this.state.categories.length !== 0 &&
            //     this.state.skill.hourlyRate !== null
            //     ? false
            //     : true
            // }
            label={strings("Skills")}
            previousBtnStyle={{
              borderColor: mainColor,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: scale(15),
              height: verticalScale(35),
              justifyContent: "center",
              marginBottom: -10
            }}
            onNext={this.handleSecondStep}
            errors={this.state.errors}
            previousBtnTextStyle={{ color: mainColor, fontFamily: "Poppins-Regular", fontSize: scale(14) }}
            nextBtnStyle={{
              backgroundColor: mainColor,
              paddingHorizontal: scale(30),
              height: verticalScale(35),
              borderRadius: 5,
              justifyContent: "center",
              marginBottom: -10
            }}
            nextBtnTextStyle={{ color: "white", fontFamily: "Poppins-Regular", fontSize: scale(14) }}
          >
            {this.renderSkill()}
          </ProgressStep>

          <ProgressStep
            // onSubmit={this.PaymentConfirmation}
            onSubmit={() => this.MakePayment(this.state.Offering)}
            finishBtnText={strings("Finish")}
            previousBtnText={strings("Previous")}
            previousBtnStyle={{
              borderColor: mainColor,
              borderWidth: 1,
              borderRadius: 5,
              paddingHorizontal: scale(15),
              height: verticalScale(35),
              justifyContent: "center",
              marginBottom: -10
            }}
            previousBtnTextStyle={{ color: mainColor, fontFamily: "Poppins-Regular", fontSize: scale(14) }}
            nextBtnStyle={{
              backgroundColor: mainColor,
              paddingHorizontal: scale(30),
              height: verticalScale(35),
              borderRadius: 5,
              justifyContent: "center",
              marginBottom: -10
            }}
            nextBtnTextStyle={{ color: "white", fontFamily: "Poppins-Regular", fontSize: scale(14) }}
            label={strings("Payment")}>
            {this.renderPayment()}
          </ProgressStep>
        </ProgressSteps>
        {this.showDatePickerModal()}
        {this.renderUploadDataModal()}
        {this.renderLoadingDataModal()}
        {this._renderModal()}
        {this._renderImagePicker()}
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};
export default connect(MapStateToProps, { setUser })(PersonalInformation);
