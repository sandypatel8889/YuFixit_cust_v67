import React, { Component } from "react";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { View, StyleSheet, Text, Dimensions, Platform } from "react-native";
import { verticalScale, scale, moderateScale } from "../components/helper/scaling";
import { Header, Avatar } from "react-native-elements";
import { Switch, Button } from "native-base";
import SearchBar from "../components/common/SearchBar";
import Icon from "react-native-vector-icons/FontAwesome";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { SafeAreaView } from 'react-native-safe-area-context';
const { height, width } = Dimensions.get("window");
import { mainColor } from "../components/helper/colors";
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
export default class MapViewScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      longitude: 0,
      latitude: 0,
      initialRegion: {},
      name: "",
    };
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
      latitude: this.props.latitude,
      longitude: this.props.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.setState({
      initialPosition: initialRegion,
      markerPosition: initialRegion,
      latitude: this.props.latitude,
      longitude: this.props.longitude,
      name: this.props.name
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
          message:strings("Location_Permission1"),
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
  render() {
    return (
      // <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ flex: 3, justifyContent: "center"}}>
          <MapView
            style={styles.map}
            ref={(ref) => {
              this.map = ref;
            }}
            // customMapStyle={mapStyle}
            // provider={PROVIDER_GOOGLE}
            mapType={Platform.OS == "ios" ? "standard" : "terrain"}
            region={this.state.initialPosition}
            onRegionChangeComplete={this.handleRegionChange}
          >
            <Marker
              coordinate={{
                latitude: this.state.latitude,
                longitude: this.state.longitude,
              }}
              pinColor={"red"}
            ></Marker>
          </MapView>
        </View>
        <View style={{ height: "100%", width: "100%", justifyContent: "center", backgroundColor: "transparent", position: "absolute", justifyContent: "flex-end" }}>
          <View
            style={{
              flex: 0.4,
              justifyContent: "flex-end",
              backgroundColor: "white",
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
              {strings("Your_Location")}
            </Text>
          </View>
          <View
            style={{
              flex: 3,
              // backgroundColor: "red"
            }}>
            <View
              style={{
                backgroundColor: "white",
                position: "absolute",
                width: "100%"
              }}>
              <View margin={scale(10)}>
                <View backgroundColor="#F4F4F4" borderRadius={20} flexDirection="row">
                  <View justifyContent="center" marginLeft={scale(15)} marginTop={13} position="absolute">
                    <Icon
                      type="FontAwesome"
                      onPress={() => {
                      }}
                      size={scale(12)}
                      name="search"
                      style={{ color: "#D1D1D1" }}
                    />
                  </View>

                  <GooglePlacesAutocomplete
                    placeholder={this.props.name == "" ? strings("Search_Something") : this.props.name}
                    onPress={(data, details = null) => {
                      let initialRegion = {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      };
                      var arraddress = details.address_components
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

                      this.setState({
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                        name: LocationName,
                        initialRegion: initialRegion,
                      });
                      this.map.animateToCoordinate(
                        {
                          latitude: this.state.latitude,
                          longitude: this.state.longitude,
                        },
                        1
                      );
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
                        // margin: (Dimensions.get('window').width) > 375 || (Dimensions.get('window').height) > 675 ? verticalScale(4) : 0,
                      },
                      textInput: {
                        // marginTop: 5,
                        // marginBottom: 5,
                        marginLeft: scale(25),
                        includeFontPadding: false,
                        color: "#242424",
                        fontSize: 16,
                        borderColor: "transparent",
                        // borderWidth: 0.5,
                        backgroundColor: "transparent",
                        fontFamily: "Poppins-Light",
                        // height: 35,
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
            </View>
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
                  this.handleSearch()
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
                    {strings("Update_Location")}
                  </Text>
                )}
              </Button>
            </View>
            <View marginTop={0} height={verticalScale(10)} />
            <View style={{ justifyContent: "center" }}>
              <Button
                full
                onPress={() => {
                  this.props.close();
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

