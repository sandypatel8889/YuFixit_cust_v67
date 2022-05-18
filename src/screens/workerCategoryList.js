import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ImageBackground
} from "react-native";
import { verticalScale, scale } from "../components/helper/scaling";
import Icon from "react-native-vector-icons/Feather";
import { connect } from "react-redux";
import { Header, Avatar } from "react-native-elements";
import { getAllProviders } from "../components/helper/firestoreHandler";
import { Alert } from "react-native";
import { ActivityIndicator } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { Keyboard } from "react-native";
import { mainColor } from "../components/helper/colors";
import { Platform } from "react-native";
const { height, width } = Dimensions.get("window");
import { StackActions, NavigationActions } from 'react-navigation';
import { strings, selection } from '../../locales/i18n';
class WorkerCategoriesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      providers: [],
      providersTemp: [],
      fetching: true,
      filtertext: "",
      isInternetAvilable: true,
      isInternetAlertOpne: true
    };
  }
  componentDidMount = () => {
    // getting all providers from firebase
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        this.setState({ isInternetAlertOpne: true });
        this.CallinitialData()
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
          // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
        }
      }
    });
  };
  CallinitialData() {
    getAllProviders()
      .then((res) => {
        console.log(res.docs.length);
        let providers = [];
        res.docs.map((doc) => {
          providers.push({ ...doc.data(), id: doc.id });
        });

        // debugger

        let arrnew = []
        for (let i = 0; i < providers.length; i++) {
          if (providers[i].addresses) {
            let distance = this.getDistanceFromLatLonInKm(providers[i].addresses)
            if (distance < 5) {
              arrnew.push(providers[i])
            }
          }
        }



        this.setState({ fetching: false, providers: arrnew, providersTemp: arrnew });
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
  // navigating user to the provider profile screen
  handlePress = (item) => {
    if (item.personalInfo) {
      this.props.navigation.navigate("ProviderProfile", { data: item, latitude: this.props.navigation.state.params.latitude, longitude: this.props.navigation.state.params.longitude });
    }
    else {
      Alert.alert(strings("No_profile"))
    }

  };
  getDistanceFromLatLonInKm(address) {

    if (address.length > 0) {
      let lat1 = this.props.navigation.state.params.latitude;
      let lon1 = this.props.navigation.state.params.longitude;


      let lat2 = address[0].value.latitude;
      let lon2 = address[0].value.longitude;

      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
      var dLon = this.deg2rad(lon2 - lon1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = parseInt(R * c * 0.621371)

      return d;

    }
    else {
      return "N/A"
    }



    // debugger


  }

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  renderWorker = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.handlePress(item);
        }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 0.5,
          borderBottomColor: "lightgray",
        }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: verticalScale(6),
          }}>

          <View>
            <ImageBackground
              style={{
                height: verticalScale(60), width: verticalScale(60)
              }}
              imageStyle={{ borderRadius: verticalScale(30) }}
              source={
                require('../../assets/icon.png')
              }>
              <Image
                style={{
                  height: verticalScale(60), width: verticalScale(60), borderRadius: verticalScale(30)
                }}
                source={{ uri: item.personalInfo ? item.personalInfo.profileUrl : item.profileUrl }}
              />
            </ImageBackground>
            {/* {item.personalInfo || item.profileUrl ? <Image defaultSource={require("../../assets/icon.png")} source={{ uri: item.personalInfo ? item.personalInfo.profileUrl : item.profileUrl }} style={{ height: verticalScale(60), width: verticalScale(60), borderRadius: verticalScale(30) }} /> : <Image source={require("../../assets/icon.png")} style={{ resizeMode: "cover", height: verticalScale(60), width: verticalScale(60), borderRadius: verticalScale(30) }} />} */}
            <View alignItems="flex-end" position="absolute" height={verticalScale(50)} width={verticalScale(50)}>
              <View height={verticalScale(10)} width={verticalScale(10)} borderRadius={verticalScale(5)} backgroundColor={item.isActive ? "#24CE40" : "gray"} justifyContent="center" alignItems="center">
              </View>
            </View>
          </View>

          <View
            style={{
              marginHorizontal: scale(12),
              alignItems: "flex-start",
            }}>
            <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: mainColor, width: scale(150) }}>{item.name ? item.name : "N/A"}</Text>

            {this.props.navigation.state.params.userid ? <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Light", color: "#B5B5B5", width: scale(180) }}>
              {item.email}
            </Text> : console.log("")}
            {item.addresses ? <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{this.getDistanceFromLatLonInKm(item.addresses) + strings("mile_away")}
            </Text> : <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{strings("mile_away1")}</Text>}
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          {!this.props.navigation.state.params.userid ? <TouchableOpacity
            onPress={() => {
              const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: 'Login' })],
              });
              this.props.navigation.dispatch(resetAction)
            }}>
            <Icon active size={30} color={mainColor} name="lock" />
          </TouchableOpacity> : console.log("")}
          <Icon active size={30} color={mainColor} name="chevron-right" />
        </View>
      </TouchableOpacity>
    );
  };
  FilterData(text) {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    this.setState({ filtertext: text })
    const countrylist = this.state.providersTemp.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      providers: countrylist,
    });
  }
  clearFilter() {
    Keyboard.dismiss()
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    this.setState({
      providers: this.state.providersTemp,
      filtertext: ""
    });
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
            height: verticalScale(55)
          }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
          screenOptions={{
            headerStyle: { elevation: 0 }
          }}
          leftComponent={
            <View height={40} justifyContent="center">
              <Icon
                onPress={() => {
                  this.props.navigation.goBack();
                }}
                type="FontAwesome"
                size={30}
                name="chevron-left"
                color={mainColor}
              />
            </View>
          }
          centerComponent={
            <View height={40} width={scale(230)} borderRadius={20} backgroundColor="#F4F4F4" flexDirection="row" alignItems="center">
              <View height={40} justifyContent="center" marginLeft={scale(15)}>
                <Icon
                  type="FontAwesome"
                  onPress={() => {
                  }}
                  size={scale(12)}
                  name="search"
                  style={{ color: "#D1D1D1", marginTop: 4 }}
                />
              </View>
              <TextInput
                ref="FirstInput"
                style={{ marginLeft: 10, paddingVertical: 8, marginRight: 10, includeFontPadding: false, fontFamily: "Poppins-Light", fontSize: 16, color: "#242424", height: 40, width: "80%" }}
                placeholder={strings("Search_Worker")}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="next"
                // placeholderTextColor="black"
                value={this.state.filtertext}
                onChangeText={(text) => this.FilterData(text)}></TextInput>
            </View>
          }
          rightComponent={
            <View height={40} justifyContent="center">
              <Icon
                type="FontAwesome"
                onPress={() => {
                  this.clearFilter()
                }}
                size={25}
                name="x"
                style={{ color: mainColor }}
              />
            </View>
          }
        />
        <View marginTop={0} height={verticalScale(10)} />
        <View
          style={{
            paddingHorizontal: scale(12),
            // flex: 0.5,
            justifyContent: "center",
          }}>
          <Text
            style={{ fontSize: scale(18), color: mainColor, fontFamily: "Poppins-SemiBold" }}>
            {strings("Worker")}
          </Text>
        </View>
        <View marginTop={0} height={verticalScale(10)} />
        {this.state.fetching ? (
          <View
            style={{ flex: 4, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator color="black" size="large" />
          </View>
        ) : (
          <View style={{ flex: 4, paddingHorizontal: scale(12) }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.state.providers}
              renderItem={this.renderWorker}
              ListEmptyComponent={() => (
                <View height={Dimensions.get('window').height - verticalScale(80)} justifyContent="center">
                  <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", textAlign: "center" }}>
                    {strings("No_Providers_available")}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
    );
  }
}
const MapStateToProps = (state) => {
  return {
    categories: state.categories,
  };
};
export default connect(MapStateToProps, {})(WorkerCategoriesList);
