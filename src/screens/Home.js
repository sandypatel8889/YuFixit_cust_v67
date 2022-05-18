import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
  Modal,
  PermissionsAndroid,
  Image,
  AppState
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Header, Avatar } from "react-native-elements";
import { Switch, Button } from "native-base";
import { verticalScale, scale } from "../components/helper/scaling";
import ErrorComponent from "../components/helper/errorComp";
import HorizontalCategores from "../components/common/horizontalCategories";
import HorizontalNearByProvider from "../components/common/horizontalNearByProvider";
import NetInfo from "@react-native-community/netinfo";
import {
  Container,
  Content,
  Card,
  CardItem,
  Form,
  Item as FormItem,
  Body,
  Input,
  Label,
} from "native-base";
import MyStorage from "../components/helper/MyStorage";
import messaging from "@react-native-firebase/messaging";
import {
  addDeviceToken,
  getUserByID,
} from "../components/helper/firestoreHandler";
import { connect } from "react-redux";
import { setUserFromLocal } from "../redux/actions/index";
import MapScreen from "./mapScreen";
import Geolocation from "@react-native-community/geolocation";
import { Alert } from "react-native";
import Geocoder from "react-native-geocoding";
import NotificationHandler from "../components/common/notificationHandler";
import database from "@react-native-firebase/database";
import { mainColor } from "../components/helper/colors";
import constants from "../redux/constants";
import { strings, selection } from '../../locales/i18n';

Geocoder.init("AIzaSyC0gFTTXNp535E2IxoCHW13LwLkXxDUybA");
const { height, width } = Dimensions.get("window");
var count = 0

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      online: false,
      someComponentHasError: false,
      searchModal: false,
      latitude: 0,
      longitude: 0,
      location: "",
      adding: false,
      isInternetAvilable: true,
      isInternetAlertOpne: true,
      appState: AppState.currentState
    };
  }

  //   closing search modal
  closeModal = () => {
    this.setState({ searchModal: false });
  };
  // handle call back for map and setting the lat and lng state
  handleCallback = (lat, long, name = this.state.location) => {
    this.setState({ latitude: lat, longitude: long, location: name });
  };
  //   search modal
  renderSearchModal = () => {
    // this.props.navigation.navigate("Browes", { latitude: 23.022505, longitude: 72.5713621 });
    return (
      <Modal
        isVisible={this.state.searchModal}
        style={{
          flex: 1,
        }}
        animationInTiming={500}
        animationOutTiming={500}
        onRequestClose={() => {
          this.setState({ searchModal: false });
        }}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <MapScreen
            handleCallback={this.handleCallback}
            latitude={this.state.latitude}
            close={this.closeModal}
            longitude={this.state.longitude}
            name={this.state.location}
            nav={this.props.navigation}
          />
        </View>
      </Modal>
    );
  };
  // getting user by user id
  refreshData = () => {
    if (!this.state.isInternetAvilable) {
      // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
      return;
    }
    getUserByID(this.props.userData.id).then((res) => {
      if (res.data()) {
        let data = { ...res.data(), id: res.id };
        this.props.setUserFromLocal(data);
        new MyStorage().setUserData(JSON.stringify(data));
      }
    });
  };
  //   getting user geolocation method
  getGeoLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude);
        const long = parseFloat(position.coords.longitude);
        constants.Currentlat = lat
        constants.Currentlong = long
        this.setState({ latitude: lat, longitude: long }, () => {
          Geocoder.from(lat, long)
            .then((json) => {
              try {
                var arraddress = json.results[0].address_components
                var city = "";
                var state = "";
                for (let i = 0; i < arraddress.length; i++) {
                  if (arraddress[i].types[0] == 'administrative_area_level_1') {
                    state = arraddress[i].short_name + '';
                  }
                  else if (arraddress[i].types[0] == 'administrative_area_level_2') {
                    city = arraddress[i].long_name + '';
                  }
                }
                var LocationName;
                if (city == "") {
                  LocationName = state;
                }
                else {
                  LocationName = city + "," + state;
                }

                this.setState({ location: LocationName });
              } catch (err) {
                Alert.alert(strings("Location_error"), strings("Location_error1"))
                var addressComponent = json.results[0].address_components[0].short_name;
                this.setState({ location: addressComponent });
              }
            })
            .catch((error) => Alert.alert(strings("Location_error"), strings("Location_error1")));
        });
      },
      (error) => {
        Alert.alert(strings("Location_error"), strings("Location_error1"))
        console.log(error.code, error.message);
      }
    );
  };
  //   async getting user get location method
  async getLocation() {
    if (!this.state.isInternetAvilable) {
      return;
    }

    try {
      if (Platform.OS === "ios") {
        // your code using Geolocation and asking for authorisation with
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
  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }
  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      setTimeout(() => {
        this.getLocation();
      }, 2000);
    }
    this.setState({ appState: nextAppState });
  }
  componentDidMount = async () => {
    AppState.addEventListener('change', this._handleAppStateChange);
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        this.setState({ isInternetAlertOpne: true });
        if (this.props.userData.id) {
          this.CallinitialData()
        }
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
          Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
        }
      }
    });
    setTimeout(() => {
      this.getLocation();
    }, 2000);
  };
  CallinitialData() {
    this.refreshData();
    new MyStorage().getDeviceToken().then((token) => {
      if (!token) {
        messaging()
          .getToken()
          .then((token) => {
            if (token) {
              addDeviceToken(this.props.userData.id, token).then((res) => {
                new MyStorage().setDeviceToken(token);
                let _data = { ...this.props.userData, deviceToken: token };
                this.props.setUserFromLocal(_data);
              });
            }
          });
      }
    });
  }
  OpenMap() {
    this.setState({ searchModal: true });
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
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
          leftComponent={
            <TouchableOpacity
              onPress={() => this.OpenMap()}>
              <View flexDirection="row" width={scale(275)} padding={5} alignItems="center">
                <Image source={require('../../assets/Pin.png')} style={{ height: verticalScale(13), width: verticalScale(10), tintColor: mainColor }} />
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ paddingLeft: scale(6), paddingRight: scale(6), width: "95%", fontFamily: "Poppins-SemiBold", fontSize: scale(14), color: mainColor }}>
                  {this.state.location}
                </Text>
              </View>
            </TouchableOpacity>
          }
          rightComponent={
            <TouchableOpacity
              onPress={() => this.props.navigation.navigate("Browes", { latitude: this.state.latitude, longitude: this.state.longitude, userid: this.props.userData.id })}>
              <View padding={5}>
                <Image source={require('../../assets/search.png')} style={{ height: verticalScale(13), width: verticalScale(13), tintColor: mainColor }} />
              </View>
            </TouchableOpacity>
          }
        />
        < View
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
        < ScrollView >
          <View style={{ flex: 4 }}>
            <View style={{ flex: 2, justifyContent: "flex-start" }}>
              <HorizontalCategores
                latitude={this.state.latitude}
                longitude={this.state.longitude}
                nav={this.props.navigation}
                userid={this.props.userData.id}
              />
            </View>
            <View style={{ flex: 3.5 }}>
              <HorizontalNearByProvider
                latitude={this.state.latitude}
                longitude={this.state.longitude}
                nav={this.props.navigation}
                userid={this.props.userData.id}
              />
            </View>
          </View>
        </ScrollView >
        {this.state.searchModal && this.renderSearchModal()}
        <NotificationHandler navigation={this.props.navigation} />
      </View >
    );
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

export default connect(MapStateToProps, { setUserFromLocal })(Home);
