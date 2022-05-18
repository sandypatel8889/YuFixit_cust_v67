import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TextInput,
  Image,
  ImageBackground,
  PermissionsAndroid
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { Header, Avatar } from "react-native-elements";
const { height, width } = Dimensions.get("window");
import { moderateScale, scale, verticalScale } from "../components/helper/scaling";
import CommonComponent from "../components/common/commonComp";
import Modal from "react-native-modal";
import { connect } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
import { StackActions, NavigationActions } from 'react-navigation';
import {
  List,
  ListItem,
  Left,
  Form,
  Label,
  Item as FormItem,
  Body,
  Input,
  Right,
  Button,
  Thumbnail,
  Textarea,
} from "native-base";
import {
  CreditCardInput,
  LiteCreditCardInput,
} from "react-native-input-credit-card";
import { setUserFromLocal, setUser } from "../redux/actions/index";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon1 from "react-native-vector-icons/AntDesign";
import {
  addProfileImage,
  addProfileUrl,
  updateCustomerName,
  _addNewAddress,
  addCard,
} from "../components/helper/firestoreHandler";
import MyStorage from "../components/helper/MyStorage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { mainColor } from "../components/helper/colors";
import auth from "@react-native-firebase/auth";
import { strings } from "../../locales/i18n";
const options = {
  title: strings("Select_Picture1"),
  quality: 1.0, maxWidth: 250, maxHeight: 250,
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
};
class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAddressModal: false,
      uploading: false,
      deleting: false,
      newAddressName: "",
      newAddressValue: {
        latitude: 0,
        longitude: 0,
        name: "",
      },
      editNameDialog: false,
      showPicker: false,
      newName: "",
      isEditAddress: false,
      addressIndex: -1,
      longitude: 0,
      latitude: 0,
      initialRegion: {},
      isInternetAvilable: true,
      isInternetAlertOpne: true,
      ischangePassword: false,
      Password: "",
      ConfirmPassword: "",
      processing: false
    };
  }
  componentDidMount() {
    this.setState({ newName: this.props.userData ? this.props.userData.name : "" });
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
        }
      }
    });
  }
  componentWillUnmount() {
    // removing listner
    this.subs.forEach((sub) => sub.remove());
  }
  componentWillMount() {
    // listner for did focus
    this.subs = [
      this.props.navigation.addListener("didFocus", this.componentDidFocus),
    ];
  }
  componentDidFocus = () => {
    if (!this.props.userData.id) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Login' })],
      });
      this.props.navigation.dispatch(resetAction)
    }
  }
  //   render loading modal
  _renderLoadingModal = () => {
    return (
      <Modal
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
    this.setState({ uploading: true });
    const ext = uri.split(".").pop(); // Extract image extension
    // const filename = `${uuid()}.${ext}`;
    const filename = `${this.props.userData.id}.${ext}`;
    addProfileImage(uri, filename, (status, profileUrl) => {
      if (status) {
        addProfileUrl(this.props.userData.id, profileUrl)
          .then((res) => {
            let _data = { ...this.props.userData, profileUrl: profileUrl };
            this.props.setUserFromLocal(_data);
            new MyStorage().setUserData(JSON.stringify(_data));
            setTimeout(() => {
              this.setState({ uploading: false });
            }, 200);
          })
          .catch((err) => {
            this.setState({ uploading: false });
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          });
      } else {
        this.setState({ uploading: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }

  showRemoveAddressAlert(index) {
    Alert.alert(strings("Delete_Address"), strings("delete_address"),
      [
        {
          text: strings("No"),
          style: "cancel"
        },
        {
          text: strings("Yes"),
          onPress: () => {
            this.removeAddress(index)
          }
        }
      ])
  }
  removeAddress(index) {
    this.setState({ deleting: true })
    let addresses = this.props.userData.addresses
    if (addresses) {
      addresses.splice(index, 1);
    } else {
      addresses = []
    }
    _addNewAddress(this.props.userData.id, addresses)
      .then((res) => {
        let data = { ...this.props.userData, addresses: addresses };
        this.props.setUserFromLocal(data);
        new MyStorage().setUserData(JSON.stringify(data));
        this.setState({ deleting: false })
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
        this.setState({ deleting: false });
      });
  }

  // adding new address in profile screen method
  handleAddNewAddress = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    if (this.state.newAddressName === "") {
      Alert.alert(strings("Mising_Data"), strings("please_add_name"));
      return;
    }
    if (this.state.newAddressValue.name === "") {
      Alert.alert(strings("Mising_Data"), strings("Plese_add_address"));
      return;
    }
    let addresses = this.props.userData.addresses
      ? this.props.userData.addresses
      : [];

    if (this.state.isEditAddress) {
      addresses[this.state.addressIndex] = { name: this.state.newAddressName, value: this.state.newAddressValue }
    } else {
      addresses = [
        ...addresses,
        { name: this.state.newAddressName, value: this.state.newAddressValue },
      ];
    }
    _addNewAddress(this.props.userData.id, addresses)
      .then((res) => {
        let _data = { ...this.props.userData, addresses: addresses };
        this.props.setUserFromLocal(_data);
        new MyStorage().setUserData(JSON.stringify(_data));
        this.setState({
          showAddressModal: false,
          newAddressName: "",
          newAddressValue: "",
        });
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  //   show modal for adding address
  showModal = () => {
    return (
      <Modal
        isVisible={this.state.showAddressModal}
        style={{
          justifyContent: "flex-end",
          margin: 0,
          // marginHorizontal: scale(16)
        }}
        width="auto"
        height="auto"
        transparent={true}
        animationInTiming={500}
        animationOutTiming={500}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: "white" }}>
            <View
              style={{
                flex: 0.4,
                justifyContent: "flex-end",
                // backgroundColor: "red",
                // paddingBottom: verticalScale(6),
              }}>
              <Text
                style={{
                  fontSize: scale(18),
                  fontFamily: "Poppins-SemiBold",
                  color: mainColor,
                  alignSelf: "center",
                  textAlign: "center",
                }}
              >
                {!this.state.isEditAddress ? strings("Add_Address") : strings("Edit_Address")}
              </Text>
            </View>
            <View style={{ flex: 3, justifyContent: "center" }}>
              <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                {/* <Form> */}
                <View margin={scale(10)}>
                  <View marginTop={0} height={verticalScale(5)} />
                  <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Name")}
                  </Text>
                  <View marginTop={0} height={verticalScale(5)} />
                  <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                    <TextInput
                      style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                      placeholder={strings("Name")}
                      value={this.state.newAddressName}
                      onChangeText={(addressName) => this.setState({ newAddressName: addressName })}
                      fontSize={scale(13)}
                      returnKeyType='done'
                      autoCorrect={false}
                      fontFamily="Poppins-SemiBold"
                    />
                  </View>
                </View>
                <View margin={scale(10)}>
                  <View marginTop={0} height={verticalScale(5)} />
                  <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Address")}
                  </Text>
                  <View marginTop={0} height={verticalScale(5)} />
                  <View backgroundColor="#F4F4F4" borderRadius={5}>
                    <GooglePlacesAutocomplete
                      placeholder={!this.state.isEditAddress ? "Search Location" : this.state.newAddressValue.name}
                      onPress={(data, details = null) => {
                        console.log("details", details.formatted_address);
                        let newAddressData = {
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                          name: details.formatted_address
                        };

                        let initialRegion = {
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                          latitudeDelta: 0.0922,
                          longitudeDelta: 0.0421,
                        };
                        this.setState({
                          newAddressValue: newAddressData,
                          latitude: details.geometry.location.lat,
                          longitude: details.geometry.location.lng,
                          name: details.name,
                          initialRegion: initialRegion,
                        });
                      }}
                      autoFocus={false}
                      returnKeyType={"default"}
                      fetchDetails={true}
                      query={{
                        key: "AIzaSyC0gFTTXNp535E2IxoCHW13LwLkXxDUybA",
                        language: "en",
                      }}
                      styles={{
                        textInputContainer: {
                          backgroundColor: "rgba(0,0,0,0)",
                          borderTopWidth: 0,
                          borderBottomWidth: 0,
                          margin: (Dimensions.get('window').width) > 375 || (Dimensions.get('window').height) > 675 ? verticalScale(4) : 0,
                        },
                        textInput: {
                          marginTop: 5,
                          marginBottom: 5,
                          includeFontPadding: false,
                          marginLeft: -5,
                          color: "#242424",
                          fontSize: scale(14),
                          borderColor: "transparent",
                          borderWidth: 0.5,
                          backgroundColor: "transparent",
                          fontFamily: "Poppins-SemiBold",
                          height: 35,
                          // backgroundColor: "red"
                        },
                        listView: {
                          backgroundColor: "lightgray",
                        },
                      }}
                    />
                  </View>
                  <View marginTop={0} height={verticalScale(5)} />
                </View>
                {/* </Form> */}
              </KeyboardAwareScrollView>
            </View>

            <View
              style={{
                flex: 1,
                marginHorizontal: scale(12),
                justifyContent: "center",
              }}>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ justifyContent: "center" }}>
                <Button
                  full
                  onPress={() => {
                    this.handleAddNewAddress();
                  }}
                  disabled={this.state.addingAddress}
                  style={{ backgroundColor: mainColor, borderRadius: 5, height: verticalScale(35) }}>
                  {this.state.addingAddress ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      style={{
                        fontSize: scale(16),
                        color: "white",
                        fontFamily: "Poppins-SemiBold"
                      }}>
                      {!this.state.isEditAddress ? strings("Add_Address") : strings("Edit_Address")}
                    </Text>
                  )}
                </Button>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ justifyContent: "center" }}>
                <Button
                  full
                  onPress={() => {
                    this.setState({
                      showAddressModal: false,
                      newAddressValue: {},
                      newAdd: "",
                      isEditAddress: false
                    });
                  }}
                  disabled={this.state.addingAddress}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#B5B5B5",
                    height: verticalScale(35)
                  }}>
                  <Text
                    style={{ fontSize: scale(14), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Cancel")}
                  </Text>
                </Button>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal >
    );
  };
  // showing address render on profile screen
  renderProfileAddressData = () => {
    const data = this.props.userData.addresses
      ? this.props.userData.addresses
      : [];
    return <CommonComponent title={"Address"} data={data}
      onEditAddress={(item, index) => () => {
        console.log("index", index)
        this.setState({
          newAddressName: item.name,
          newAddressValue: item.value,
          isEditAddress: true,
          addressIndex: index,
          showAddressModal: true
        })
      }}
      onRemove={(item, index) => () => {
        console.log("index", index)
        this.showRemoveAddressAlert(index)
      }}
    />;
  };
  _renderDeleteModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.deleting}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
            <ActivityIndicator color="white" size="large" />
            <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
              {strings("Deleting")}
            </Text>
          </View>
        </View>
      </Modal>
    );
  };
  // image uploading from library or from camera
  handleImageSelection = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    
    this.setState({ showPicker: true })

  };
  showLogoutAlert(index) {
    Alert.alert(strings("Logout"),
      strings("logout_title"),
      [
        {
          text: strings("No"),
          style: "cancel"
        },
        {
          text: strings("Yes"),
          onPress: () => {
            this.handleLogout()
          }
        }
      ])
  }
  //   user logout method
  handleLogout = () => {
    if (auth().currentUser != null) {
      auth().signOut()
    }
    new MyStorage().setUserData(JSON.stringify(null));
    new MyStorage().clearStorage();
    this.props.setUserFromLocal([]);
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Login' })],
    });
    this.props.navigation.dispatch(resetAction)
  };
  showEditNameDialog = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        isVisible={this.state.editNameDialog}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
          }}>
          <Form style={{ backgroundColor: "white", padding: 15, borderRadius: 10 }}>
            <Text style={{ fontSize: scale(18), color: mainColor, fontFamily: "Poppins-SemiBold", textAlign: "center" }}>Enter your name</Text>
            <View marginTop={0} height={verticalScale(10)} />
            <View>
              <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                <TextInput
                  style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                  placeholder={strings("Enter_your_name")}
                  value={this.state.newName}
                  onChangeText={(name) => this.setState({ newName: name })}
                  fontSize={scale(13)}
                  returnKeyType='done'
                  autoCorrect={false}
                  fontFamily="Poppins-SemiBold"
                />
              </View>
              <View marginTop={0} height={verticalScale(10)} />
            </View>
            <View
              style={{
                height: verticalScale(90),
                marginTop: 10,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Button
                full
                style={{ backgroundColor: mainColor, borderRadius: 5, height: verticalScale(35) }}
                onPress={() => {
                  if (this.state.newName !== "") {
                    this.setState({
                      editNameDialog: false
                    }, () => this.editCustomerName());
                  } else {
                    Alert.alert(strings("enter_name"))
                  }
                }}>
                <Text style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: "white" }}>
                  {strings("Submit")}
                </Text>
              </Button>
              <View height={verticalScale(10)} />
              <Button
                full
                style={{
                  backgroundColor: "white",
                  borderRadius: 5,
                  borderWidth: 1,
                  borderColor: "#B5B5B5",
                  height: verticalScale(35)
                }}
                onPress={() => {
                  this.setState({
                    // newName: "",
                    editNameDialog: false
                  });
                }}>
                <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>{strings("Cancel")}</Text>
              </Button>
            </View>
          </Form>
        </View>
      </Modal>
    )
  }
  editCustomerName() {
    updateCustomerName(this.props.userData.id, this.state.newName)
      .then((res) => {
        let _data = { ...this.props.userData, name: this.state.newName };
        this.props.setUserFromLocal(_data);
        new MyStorage().setUserData(JSON.stringify(_data));
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
  handlePassword = () => {
    if (this.state.Password === "") {
      Alert.alert(strings("Password_Error"), strings("enter_Password"));
      return;
    }
    if (this.state.ConfirmPassword === "") {
      Alert.alert(strings("Password_Error"), strings("enter_confirmPassword"));
      return;
    }
    if (this.state.ConfirmPassword != this.state.Password) {
      Alert.alert(strings("Password_Error"), strings("password_diff"));
      return;
    }
    if (this.state.Password.length < 6) {
      Alert.alert(
        strings("Password_Error"),
        strings("Password_digit")
      );
      return;
    }
    this.setState({ processing: true });
    this.changePassword("", this.state.Password)
  }
  ChangePassword = () => {
    this.setState({
      ischangePassword: true,
    });
  };
  setPasswordsucess() {
    this.handleLogout()
    this.setState({ processing: false, ischangePassword: false, Password: "", ConfirmPassword: "" });
  }
  changePassword = (currentPassword, newPassword) => {
    var user = auth().currentUser;
    user.updatePassword(newPassword).then(() => {
      Alert.alert(
        strings("Set_Password"),
        strings("Password_reset"),
        [
          { text: strings("OK"), onPress: () => this.setPasswordsucess() },
        ],
        { cancelable: false })
    }).catch((error) => {
      this.setState({ processing: false, Password: "", ConfirmPassword: "" });
      Alert.alert(strings("Error"), strings("Error_Something_went"));
    });
  }
  render_CHANGEPASSWORD = () => {
    return (
      <Modal
        style={{ margin: 0 }}
        animationType="slide"
        transparent={true}
        isVisible={this.state.ischangePassword}
        onRequestClose={() => {
          this.setState({ ischangePassword: !this.state.ischangePassword });
        }}>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={{ flex: 1, backgroundColor: "white" }}>
            <View
              style={{
                flex: 0.4,
                justifyContent: "flex-end",
                // backgroundColor: "red",
                // paddingBottom: verticalScale(6),
              }}>
              <Text
                style={{
                  fontSize: scale(18),
                  color: mainColor,
                  alignSelf: "center",
                  textAlign: "center",
                  fontFamily: "Poppins-SemiBold"
                }}>
                {strings("Password")}
              </Text>
            </View>
            <View style={{ flex: 3, justifyContent: "center" }}>
              <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                <View margin={scale(10)}>
                  <View marginTop={0} height={verticalScale(5)} />
                  <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("New_password")}
                  </Text>
                  <View marginTop={0} height={verticalScale(5)} />
                  <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                    <TextInput
                      style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                      placeholder={strings("Enter_New_password")}
                      value={this.state.Password}
                      onChangeText={(Password) => this.setState({ Password: Password })}
                      fontSize={scale(13)}
                      returnKeyType='done'
                      autoCorrect={false}
                      secureTextEntry={true}
                      fontFamily="Poppins-SemiBold"
                    />
                  </View>
                </View>

                <View margin={scale(10)}>
                  <View marginTop={0} height={verticalScale(5)} />
                  <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Repeat_New_password")}
                  </Text>
                  <View marginTop={0} height={verticalScale(5)} />
                  <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                    <TextInput
                      style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                      placeholder={strings("enter_repeat_pass")}
                      value={this.state.ConfirmPassword}
                      onChangeText={(ConfirmPassword) => this.setState({ ConfirmPassword: ConfirmPassword })}
                      fontSize={scale(13)}
                      returnKeyType='done'
                      autoCorrect={false}
                      secureTextEntry={true}
                      fontFamily="Poppins-SemiBold"
                    />
                  </View>
                </View>
              </KeyboardAwareScrollView>
            </View>
            <View
              style={{
                flex: 1,
                marginHorizontal: scale(12),
                justifyContent: "center",
              }}>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ justifyContent: "center" }}>
                <Button
                  full
                  onPress={() => {
                    this.handlePassword();
                  }}
                  style={{
                    backgroundColor: mainColor,
                    borderRadius: 5,
                    height: verticalScale(35)
                  }}>
                  {this.state.processing ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      style={{
                        fontSize: scale(16),
                        color: "white",
                        fontFamily: "Poppins-SemiBold"
                      }}>
                      {strings("Change_password")}
                    </Text>
                  )}
                </Button>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
              <View style={{ justifyContent: "center" }}>
                <Button
                  full
                  onPress={() => {
                    this.setState({
                      ischangePassword: false,
                    })
                  }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 5,
                    borderWidth: 1,
                    borderColor: "#B5B5B5",
                    height: verticalScale(35)
                  }}>
                  <Text
                    style={{ fontSize: scale(16), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                    {strings("Cancel")}
                  </Text>
                </Button>
              </View>
              <View marginTop={0} height={verticalScale(10)} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };
  render() {
    return (
      <View style={{ flex: 1, paddingBottom: verticalScale(12) }}>
        <Header
          containerStyle={[{
            alignItems: "center",
            backgroundColor: "white",
            borderBottomColor: "white",
            borderBottomWidth: 1,
            height: verticalScale(50)
          }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
          screenOptions={{
            headerStyle: { elevation: 0 }
          }}
          rightComponent={
            <View flexDirection="row">
              {this.props.userData.auth == "facebook" || this.props.userData.auth == "google" ? console.log("") :
                <Icon
                  onPress={() => {
                    this.ChangePassword();
                  }}
                  type="Feather"
                  size={scale(20)}
                  name="key"
                  style={{ color: mainColor }}
                />}
              <Icon
                onPress={() => {
                  this.showLogoutAlert()
                }}
                type="Feather"
                size={scale(20)}
                name="log-out"
                style={{ color: mainColor, marginLeft: 20 }}
              />
            </View>
          } />
        {this.showModal()}
        <View
          style={{
            flex: 0.5,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}>

          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                this.handleImageSelection();
              }}>
              <View>
                <ImageBackground
                  style={{
                    height: verticalScale(90), width: verticalScale(90),
                    ...Platform.select({
                      ios: {
                        shadowColor: 'gray',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.8,
                        shadowRadius: 1,

                      },
                      android: {
                        elevation: 5,
                      },
                    })
                  }}
                  imageStyle={{ borderRadius: verticalScale(45), borderColor: "white", borderWidth: verticalScale(2) }}
                  source={
                    require('../../assets/icon.png')
                  }>
                  {this.props.userData.profileUrl ? <Image
                    style={{
                      height: verticalScale(90), width: verticalScale(90), borderRadius: verticalScale(45), borderColor: mainColor, borderWidth: verticalScale(2)
                    }}
                    source={{ uri: this.props.userData.profileUrl }}
                  /> : <View></View>}
                </ImageBackground>
                <View position="absolute" justifyContent="flex-end" alignItems="flex-end" height={"100%"} width={"100%"}>
                  <View height={verticalScale(20)} width={verticalScale(20)} borderRadius={verticalScale(10)} backgroundColor="white" justifyContent="center" alignItems="center" style={{
                    ...Platform.select({
                      ios: {
                        shadowColor: 'gray',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.9,
                        shadowRadius: 1,
                      },
                      android: {
                        elevation: 5,
                      },
                    }),
                  }}>
                    <Image source={require('../../assets/edit1.png')} defaultSource={require('../../assets/edit1.png')} style={{ height: verticalScale(10), width: verticalScale(10) }} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View marginTop={0} height={verticalScale(10)} />
          <View style={{ width: "80%", alignItems: "center", justifyContent: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(18), fontFamily: "Poppins-SemiBold", marginRight: 5, color: mainColor }}>
                {this.props.userData.name}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    editNameDialog: true,
                    // newName: ""
                  })
                }}>
                <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                  <Image source={require('../../assets/edit1.png')} defaultSource={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                </View>
              </TouchableOpacity>
            </View>
            {/* <View marginTop={0} height={verticalScale(2)} /> */}
            <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-Light" }}>
              {this.props.userData.email}
            </Text>
          </View>
          <View marginTop={0} height={verticalScale(10)} />
          <View
            style={{
              backgroundColor: 'white',
              width: "100%",
              height: 1,
              ...Platform.select({
                ios: {
                  shadowColor: 'gray',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.9,
                  shadowRadius: 1,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}
          />
        </View>
        <View style={{ flex: 1, paddingHorizontal: scale(12) }}>
          <View style={{ flex: 1 }}>
            <View height={verticalScale(30)} flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text style={{ fontSize: scale(12), paddingTop: 4, paddingBottom: 4, color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                {strings("ADDRESS")}
              </Text>
              <Icon name="plus" type="Feather" size={scale(15)} style={{ color: "#B5B5B5" }} onPress={() => {
                this.setState({
                  newAddressName: "",
                  newAddressValue: "",
                  isEditAddress: false,
                  addressIndex: -1,
                  showAddressModal: true,
                });
              }} />
            </View>
            <View style={{ flex: 1 }}>{this.renderProfileAddressData()}</View>
          </View>
        </View>
        {this.showEditNameDialog()}
        {this._renderDeleteModal()}
        {this._renderLoadingModal()}
        {this.render_CHANGEPASSWORD()}
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
export default connect(MapStateToProps, { setUserFromLocal })(Profile);
