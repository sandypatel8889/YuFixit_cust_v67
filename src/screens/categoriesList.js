import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ImageBackground
} from "react-native";
import { verticalScale, scale } from "../components/helper/scaling";
import Icon from "react-native-vector-icons/Feather";
import { connect } from "react-redux";
import { Header, Avatar } from "react-native-elements";
import { getProviderById } from "../components/helper/firestoreHandler";
import { Alert } from "react-native";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
const { height, width } = Dimensions.get("window");
import NetInfo from "@react-native-community/netinfo";
import { mainColor } from "../components/helper/colors";
import { Platform } from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
import { strings, selection } from '../../locales/i18n';
class CategoriesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      providers: [],
      fetching: true,
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
        this.CallinitialData()
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
        }

      }
    });
  };
  CallinitialData() {
    let providers = this.props.navigation.state.params.category.providers
      ? this.props.navigation.state.params.category.providers
      : [];
    if (providers.length == 0) {
      this.setState({ fetching: false });
    } else {
      // getting provider by provder id from firebase
      providers.map((provider) => {
        getProviderById(provider)
          .then((res) => {
            if (res.data()) {
              let distance = this.getDistanceFromLatLonInKm(res.data().addresses)
              if (distance < 5) {
                this.setState((prevState) => ({
                  providers: [
                    ...prevState.providers,
                    { ...res.data(), id: res.id },
                  ],
                }));
                this.setState({ fetching: false });
              }
              else {
                this.setState({ fetching: false });
              }
            }
          })
          .catch((err) => {
            console.log("error in getting provider is: ", err);
          });
      });
    }
  }
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
                source={item.personalInfo && item.personalInfo.profileUrl ? { uri: item.personalInfo.profileUrl } : item.profileUrl ? { uri: item.profileUrl } : require("../../assets/icon.png")}
              />
            </ImageBackground>
            {/* {item.personalInfo || item.profileUrl ? <Image defaultSource={require("../../assets/icon.png")} source={item.personalInfo && item.personalInfo.profileUrl ? { uri: item.personalInfo.profileUrl } : item.profileUrl ? { uri: item.profileUrl } : require("../../assets/icon.png")} style={{ height: verticalScale(60), width: verticalScale(60), borderRadius: verticalScale(30) }} /> : <Image source={require("../../assets/icon.png")} style={{ resizeMode: "cover", height: verticalScale(60), width: verticalScale(60), borderRadius: verticalScale(30) }} />} */}
            <View alignItems="flex-end" position="absolute" height={verticalScale(50)} width={verticalScale(50)}>
              <View height={verticalScale(10)} width={verticalScale(10)} borderRadius={verticalScale(5)} backgroundColor={item.isActive ? "#24CE40" : "gray"} justifyContent="center" alignItems="center">
              </View>
            </View>
          </View>
          <View
            style={{
              marginHorizontal: scale(12),
              alignItems: "flex-start",
              // paddingTop: verticalScale(4),
            }}>
            <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: mainColor, width: scale(150) }}>{item.name ? item.name : "N/A"}</Text>

            {this.props.navigation.state.params.userid ? <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Light", color: "#B5B5B5", width: scale(180) }}>
              {item.email}
            </Text> : <View />}



            {item.addresses ? <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{this.getDistanceFromLatLonInKm(item.addresses) + strings("mile_away")}
            </Text> : <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{strings("mile_away1")}</Text>}
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
            <Icon active size={scale(25)} color={mainColor} name="lock" />
          </TouchableOpacity> : <View />}
          <Icon active size={scale(25)} color={mainColor} name="chevron-right" />
        </View>
      </TouchableOpacity>
    );
  };
  render() {
    return (
      // <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
            <Icon
              onPress={() => {
                this.props.navigation.goBack();
              }}
              type="FontAwesome"
              size={30}
              name="chevron-left"
              color={mainColor}
            />
          }
          centerComponent={
            <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Text
                style={{ fontSize: scale(18), fontFamily: "Poppins-SemiBold", color: mainColor }}>{strings(this.props.navigation.state.params.category.name)}</Text>
            </View>
          }
        />
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
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={() => (
                <View height={Dimensions.get('window').height - verticalScale(80)} justifyContent="center">
                  <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", textAlign: "center" }}>
                    {strings("No_pro_cat")}
                  </Text>
                </View>
              )}
            />
          </View>
        )}
      </View>
      // </SafeAreaView>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    categories: state.categories,
  };
};
export default connect(MapStateToProps, {})(CategoriesList);
