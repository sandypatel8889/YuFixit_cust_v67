import React, { Component } from "react";
import MapView, { Marker, Callout } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { View, StyleSheet, Text, Dimensions, ActivityIndicator, ImageBackground, Platform } from "react-native";
import { verticalScale, scale } from "../components/helper/scaling";
import { Header, Avatar } from "react-native-elements";
import { Switch, Button } from "native-base";
import SearchBar from "../components/common/SearchBar";
import Icon from "react-native-vector-icons/FontAwesome";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { SafeAreaView } from 'react-native-safe-area-context';
const { height, width } = Dimensions.get("window");
import { getProviders } from "../components/helper/firestoreHandler";
import { Alert, FlatList, Image, TouchableOpacity, TextInput } from "react-native";
import { mainColor } from "../components/helper/colors";
import Icon1 from "react-native-vector-icons/Feather";
import Modal from "react-native-modal";
import { Keyboard } from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
import { strings, selection } from '../../locales/i18n';
var mapStyle = [
  {
    "featureType": "poi.attraction",
    "elementType": "labels.icon",
    "stylers": [
      {
        "color": "#69999f"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels.icon",
    "stylers": [
      {
        "color": "#7893b4"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#7893b4"
      }
    ]
  },
  {
    "featureType": "poi.medical",
    "elementType": "labels.icon",
    "stylers": [
      {
        "color": "#bd0900"
      },
      {
        "visibility": "on"
      }
    ]
  },

  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.icon",
    "stylers": [
      {
        "color": "#868e7b"
      },
      {
        "visibility": "on"
      },
      {
        "weight": 6.5
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text",
    "stylers": [
      {
        "color": "#868e7b"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#868e7b"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.school",
    "elementType": "labels.icon",
    "stylers": [
      {
        "color": "#7893b4"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ede5cc"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#ede5cc"
      },
      {
        "visibility": "on"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.station.bus",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "transit.station.rail",
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "water",
    "stylers": [
      {
        "color": "#c3d4e1"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "visibility": "on"
      }
    ]
  }
]
export default class Browes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longitude: 0,
      latitude: 0,
      initialRegion: {},
      name: "",
      markers: [],
      markersTemp: [],
      // processing: true
    };
    this.getAllProviders()
  }

  getAllProviders = () => {
    getProviders()
      .then((res) => {
        // this.setState({ processing: false })
        let providers = res.docs.map((item) => {
          return { ...item.data(), id: item.id };
        });


        let arrnew = []
        for (let i = 0; i < providers.length; i++) {
          if (providers[i].addresses) {
            let distance = this.getDistanceFromLatLonInKm(providers[i].addresses)
            // console.log("Distance------>", distance.toString())
            if (distance < 5) {
              arrnew.push(providers[i])
            }
          }
        }
        this.setState({ markers: arrnew, markersTemp: arrnew });



        if (arrnew.length > 0) {
          let initialRegion = {
            latitude: arrnew[0].addresses[0].value.latitude,
            longitude: arrnew[0].addresses[0].value.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          this.setState({
            initialPosition: initialRegion,
            markerPosition: initialRegion,
          });
        }



      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };


  FilterData(text) {
    this.setState({ filtertext: text })
    const techlist = this.state.markersTemp.filter(function (item) {
      //applying filter for the inserted text in search bar
      const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
      const textData = text.toUpperCase();
      return itemData.indexOf(textData) > -1;
    });
    this.setState({
      markers: techlist,
    });


    if (techlist.length > 0) {
      let initialRegion = {
        latitude: techlist[0].addresses[0].value.latitude,
        longitude: techlist[0].addresses[0].value.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
      this.setState({
        initialPosition: initialRegion,
        markerPosition: initialRegion,
      });
    }


  }
  clearFilter() {
    Keyboard.dismiss()

    this.setState({
      markers: this.state.markersTemp,
      filtertext: ""
    });
  }


  getDistanceFromLatLonInKm(address) {
    let lat1 = this.state.latitude;
    let lon1 = this.state.longitude;


    if (address.length > 0) {
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
      var d = parseInt(R * c) * 0.621371; // Distance in km

      return d;
    }
    else {
      return 1000;
    }



  }
  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  getDistanceFromLatLonInKmNew(address) {

    if (address.length > 0) {
      let lat1 = this.state.latitude;
      let lon1 = this.state.longitude;


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
  handleSearch = () => {
    this.props.handleCallback(
      this.state.latitude,
      this.state.longitude,
      this.state.name
    );
    this.props.close();
  };
  componentDidMount = async () => {
    let initialRegion = {
      latitude: this.props.navigation.state.params.latitude,
      longitude: this.props.navigation.state.params.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.setState({
      // initialPosition: initialRegion,
      // markerPosition: initialRegion,
      latitude: this.props.navigation.state.params.latitude,
      longitude: this.props.navigation.state.params.longitude,
    });
  };
  onRegionChange(region) {
    this.setState({ region });
  }
  // async request for location permissions
  async requestLocationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: strings("Location_Permission"),
          message: strings("Location_Permission1")
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use locations ");
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  calloutPress(item, index) {
    // debugger
    this.flatListRef.scrollToIndex({ animated: true, index: index });
    // if (item.personalInfo) {
    //     // this.props.navigation.navigate("ProviderProfile", { data: item });
    //     this.props.navigation.navigate("ProviderProfile", { data: item, latitude: this.state.latitude, longitude: this.state.longitude });

    // }
    // else {
    //     alert("No provider profile data available!")
    // }
  }
  MovetoProviderDetails(item) {
    if (item.personalInfo) {
      this.props.navigation.navigate("ProviderProfile", { data: item, latitude: this.state.latitude, longitude: this.state.longitude });
    }
    else {
      Alert.alert(strings("No_profile"))
    }
  }
  _renderProvider = (item, index) => {
    return (
      <TouchableOpacity
        onPress={() => this.MovetoProviderDetails(item.item)}>
        <View height={120} justifyContent="center" width={scale(260)} margin={5} paddingVertical={verticalScale(6)} backgroundColor="white" borderRadius={10} borderColor={item.item.isActive ? "green" : "red"} borderWidth={2}>
          <View flexDirection="row" alignItems="center" justifyContent="space-between" style={{ marginHorizontal: scale(5) }}>
            <View flexDirection="row" alignItems="center" width={"90%"}>
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
                    source={{
                      uri: item.item.personalInfo ? item.item.personalInfo.profileUrl : item.item.profileUrl
                    }}
                  />
                </ImageBackground>
                {/* <Image defaultSource={require("../../assets/icon.png")} source={{ uri: item.item.personalInfo ? item.item.personalInfo.profileUrl : item.item.profileUrl }} style={{ height: verticalScale(60), width: verticalScale(60), borderRadius: verticalScale(30) }} /> */}
                <View alignItems="flex-end" position="absolute" height={verticalScale(50)} width={verticalScale(50)}>
                  <View height={verticalScale(10)} width={verticalScale(10)} borderRadius={verticalScale(5)} backgroundColor={item.item.isActive ? "#24CE40" : "gray"} justifyContent="center" alignItems="center">
                  </View>
                </View>
              </View>

              <View marginLeft={10}>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: mainColor, width: scale(140) }}>{item.item.name ? item.item.name : "N/A"}</Text>
                {this.props.navigation.state.params.userid ? <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Light", color: "#B5B5B5", width: scale(140) }}>
                  {item.item.email}
                </Text> : console.log("")}
                {item.item.addresses ? <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{this.getDistanceFromLatLonInKmNew(item.item.addresses) + strings("mile_away")}
                </Text> : <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{strings("mile away1")}</Text>}
              </View>
            </View>
            {!this.props.navigation.state.params.userid ? <View><TouchableOpacity
              onPress={() => {
                const resetAction = StackActions.reset({
                  index: 0,
                  actions: [NavigationActions.navigate({ routeName: 'Login' })],
                });
                this.props.navigation.dispatch(resetAction)
              }}>
              <Icon1 active size={scale(25)} color={mainColor} name="lock" /></TouchableOpacity>
            </View> : <Icon1 active size={scale(25)} color={mainColor} name="chevron-right" />}
          </View>

        </View>
      </TouchableOpacity >
    )
  };
  render() {
    return (
      <View style={styles.container}>
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
            <Icon1
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
              <Text numberOfLines={1} ellipsizeMode='tail'
                style={{ fontSize: scale(17), fontFamily: "Poppins-SemiBold", color: mainColor }}>{strings("Browse_local_techs")}</Text>
            </View>
          }
        />
        <View justifyContent="center" alignItems="center" marginTop={10} marginBottom={20} flexDirection="row" justifyContent="space-between">
          <View height={40} marginLeft={scale(20)} width={"80%"} borderRadius={20} backgroundColor="#F4F4F4" flexDirection="row" alignItems="center" justifyContent="center">
            <View height={40} justifyContent="center" marginLeft={scale(15)}>
              <Icon1
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
              placeholder={strings("Search_local")}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="next"
              // placeholderTextColor="black"
              value={this.state.filtertext}
              onChangeText={(text) => this.FilterData(text)}></TextInput>
          </View>
          <View height={40} justifyContent="center" marginRight={scale(20)}>
            <Icon1
              type="FontAwesome"
              onPress={() => {
                this.clearFilter()
              }}
              size={25}
              name="x"
              style={{ color: mainColor }}
            />
          </View>

        </View>
        <MapView
          style={styles.map}
          ref={(ref) => {
            this.map = ref;
          }}
          // customMapStyle={mapStyle}
          // provider={PROVIDER_GOOGLE}
          mapType={Platform.OS == "ios" ? "standard" : "terrain"}
          region={this.state.initialPosition}
          onRegionChangeComplete={this.handleRegionChange}>
          {this.state.markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: marker.addresses ? marker.addresses[0].value.latitude : this.state.latitude,
                longitude: marker.addresses ? marker.addresses[0].value.longitude : this.state.longitude,
              }}
              pinColor={marker.isActive ? "green" : "red"}
              onCalloutPress={() => this.calloutPress(marker, index)}>
              <Callout onPress={() => this.calloutPress(marker, index)}>
                <View>
                  <Text style={styles.calloutTitle}>{marker.name == "" ? "N/A" : marker.name}</Text>
                  {this.props.navigation.state.params.userid ? <Text style={styles.calloutDescription}>{marker.email}</Text> : <Text style={styles.calloutDescription}>{""}</Text>}

                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        <View
          style={{
            position: "absolute",
            bottom: 50,
            left: 10,
            right: 10,
            zIndex: 2,
            // height: 110,
            // backgroundColor: "red",
            alignItems: "center",
            justifyContent: "center"

          }}>
          <FlatList flex={1}
            data={this.state.markers}
            ref={(ref) => this.flatListRef = ref}
            keyExtractor={(item, index) => `${index}`}
            renderItem={this._renderProvider}
            numColumns={1}
            horizontal={true}
            getItemLayout={(data, index) => (
              { length: 120, offset: scale(270) * index, index }
            )}
          // onScrollToIndexFailed={info => {
          //     this.flatListRef.scrollToIndex({ animated: true, index: info.index });
          //   }}
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
});
