import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  PermissionsAndroid,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Avatar } from "react-native-elements";
import { verticalScale, scale } from "../helper/scaling";
import Icon from "react-native-vector-icons/FontAwesome";
import { getProviders, _getNearbyProviders } from "../helper/firestoreHandler";
import { connect } from "react-redux";
import { setProvider } from "../../redux/actions/index";
import Geolocation from "@react-native-community/geolocation";
import { Alert } from "react-native";
import { Container, Content, Card, CardItem } from "native-base";
import MyStorage from "../helper/MyStorage";
import Icon1 from "react-native-vector-icons/Feather";
import { mainColor } from "../helper/colors";
import { strings, selection } from '../../../locales/i18n';
class HorizontalNearByProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      providers: [],
      loading: false,
      favouriteProvider: false,
      favouriteProviderid: "",
      latitude: "",
      longitude: ""
    };
  }

  componentWillReceiveProps = (newProps) => {
    this.getAllProviders()
    console.log('props changeddddd', newProps.latitude)
    if (newProps.latitude != 0 && newProps.longitude != 0) {
      this.setState({
        loading: true,
        latitude: newProps.latitude,
        longitude: newProps.longitude
      });
    }
  };
  renderNearByProviders = ({ item, index }) => {
    return (
      <Card style={{ borderRadius: 10 }}>
        <TouchableOpacity
          onPress={() => {
            this.handlePress(item);
          }}>

          <View style={{
            backgroundColor: "transparent"
          }}>
            <View style={{ height: verticalScale(160) }}>
              <ImageBackground
                style={{
                  height: verticalScale(160), width: "100%"
                }}
                imageStyle={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, resizeMode: "cover" }}
                source={
                  require('../../../assets/icon1.png')
                }>
                <Image
                  style={{
                    resizeMode: "cover", height: verticalScale(160), width: "100%", borderTopLeftRadius: 10, borderTopRightRadius: 10
                  }}
                  source={{
                    uri: item.personalInfo
                      ? item.personalInfo.profileUrl
                      : item.profileUrl
                  }}
                />
              </ImageBackground>
            </View>

            <View style={{ backgroundColor: "white", flexDirection: "row", justifyContent: "center", paddingVertical: scale(5), borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}>
              <View style={{ width: "70%", paddingHorizontal: scale(5) }}>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: mainColor }}>{item.name ? item.name : "N/A"}</Text>
                {this.props.userid ? <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image source={require('../../../assets/email.png')} style={{ height: verticalScale(12), width: verticalScale(12), tintColor: "#B5B5B5", marginRight: scale(5) }} />
                  <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(13), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{item.email ? item.email : "N/A"}</Text>
                </View> : console.log("")}
                <View style={{ flexDirection: "row" }}>
                  <Image source={require('../../../assets/Pin.png')} style={{ marginTop: verticalScale(2), height: verticalScale(13), width: verticalScale(10), tintColor: "#B5B5B5", marginRight: scale(7) }} />
                  <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(13), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{item.addresses ? item.addresses[0].value.name : strings("No_Location_Provided")}</Text>
                </View>
              </View>
              <View style={{ width: "30%", alignItems: "flex-end", paddingRight: scale(5) }}>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-SemiBold", color: mainColor }}>{item.services ? item.services[0].categoryName : "N/A"}</Text>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{item.skills ? item.skills.hourlyRate.value : "N/A"}</Text>
                <Text numberOfLines={1} ellipsizeMode='tail' style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{this.getDistanceFromLatLonInKm(item.addresses) + strings("mile_away")}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };
  getAllProviders = () => {
    console.log("getallproviders called");
    getProviders()
      .then((res) => {
        this.setState({ loading: false });
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
        this.setState({ providers: arrnew });
      })
      .catch((err) => {
        this.setState({ loading: false });
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
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

  componentDidMount = () => {
  };

  handlePress = (item) => {
    this.props.setProvider(item);
    if (item.personalInfo) {
      // this.props.nav.navigate("ProviderProfile", { data: item });
      this.props.nav.navigate("ProviderProfile", { data: item, latitude: this.state.latitude, longitude: this.state.longitude });

    }
    else {
      Alert.alert(strings("No_profile"))
    }

  };

  getDistanceFromLatLonInKm(address) {

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

  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  renderCategories = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.handlePress(item);
        }}
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          paddingHorizontal: scale(5),
          // backgroundColor: "green"
        }}>
        <View>
          <ImageBackground
            style={{
              height: verticalScale(66), width: verticalScale(66)
            }}
            imageStyle={{ borderRadius: verticalScale(33) }}
            source={
              require("../../../assets/icon.png")
            }>
            <Image
              style={{
                height: verticalScale(66), width: verticalScale(66), borderRadius: verticalScale(33)
              }}
              source={{
                uri: item.personalInfo ? item.personalInfo.profileUrl : item.profileUrl
              }}
            />
          </ImageBackground>
          <View alignItems="flex-end" position="absolute" height={verticalScale(50)} width={verticalScale(50)}>
            <View height={verticalScale(10)} width={verticalScale(10)} borderRadius={verticalScale(5)} backgroundColor={item.isActive ? "#24CE40" : "gray"} justifyContent="center" alignItems="center">
            </View>
          </View>
        </View>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: verticalScale(4),
            // backgroundColor: "red"
          }}>
          <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: mainColor }}>{item.name ? item.name : "N/A"}</Text>
          {item.addresses ? <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{this.getDistanceFromLatLonInKm(item.addresses) + strings("mile_away")}
          </Text> : <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{strings("mile_away1")}</Text>}
        </View>
      </TouchableOpacity>
    );
  };
  render() {
    return (
      <View style={{}}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingLeft: scale(12),
            paddingRight: scale(12),
            paddingTop: scale(12),
            paddingBottom: scale(5),

          }}
        >
          <Text style={{ fontSize: scale(12), textAlign: "center", fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>
            {strings("NEARBY")}
          </Text>
          <TouchableOpacity
            onPress={() =>
              this.props.nav.navigate("WorkerCategoriesList", { latitude: this.state.latitude, longitude: this.state.longitude, userid: this.props.userid })
            }
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              // marginRight: scale(6),
            }}
          >
            <Text style={{ fontSize: scale(12), textAlign: "center", fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>
              {strings("SEE_ALL")}
            </Text>
            <Icon1 active size={scale(15)} color={"#B5B5B5"} name="chevron-right" />
          </TouchableOpacity>
        </View>
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
        <View marginTop={0} height={verticalScale(10)} />
        <View style={{}}>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={this.state.providers}
            renderItem={this.renderCategories}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={() =>
              !this.state.providers.length ? (
                <View
                  style={{
                    flex: 1,
                    height: verticalScale(50),
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", width: "90%", textAlign: "center" }}>
                    {strings("No_Near_By_Provider_Available")}
                  </Text>
                </View>
              ) : null
            }
          />
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
        {this.state.loading && (
          <Modal isVisible={this.state.loading} transparent={true}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                // backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
                <ActivityIndicator size="large" color="white" />
                <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
                  {strings("fetch_near")}
                </Text>
              </View>
            </View>
          </Modal>
        )}
        <View
          style={{
            paddingLeft: scale(12),
            paddingRight: scale(12),
            paddingTop: scale(12),
            // paddingBottom: scale(5),

          }}>
          <View
            style={{
              height: verticalScale(30),
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between"
            }}>

            <View
              style={{
                flexDirection: "row",
                height: "100%",
                // backgroundColor:"green"
              }}>
              <TouchableOpacity style={{ justifyContent: "center", alignItems: "center" }} onPress={() => { Alert.alert(strings("Comming_soon")) }}>
                <View style={{ justifyContent: "center", alignItems: "center", marginHorizontal: scale(5) }}>
                  <Text style={{ fontFamily: "Poppins-Semibold", fontSize: scale(12), color: "#B5B5B5" }}>{strings("TOP_RATED")}</Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Icon size={scale(15)} color={"#B5B5B5"} name="angle-down" />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                height: "100%",
                // backgroundColor:"red"
              }}>
              <TouchableOpacity style={{ justifyContent: "center", alignItems: "center" }} onPress={() => { Alert.alert(strings("Comming_soon")) }}>
                <View style={{ justifyContent: "center", alignItems: "center", marginHorizontal: scale(5) }}>
                  <Text style={{ fontFamily: "Poppins-Semibold", fontSize: scale(12), color: "#B5B5B5" }}>{strings("MAP")}</Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                {/* <Icon size={20} color={"gray"} name="angle-down" /> */}
                <Image defaultSource={require('../../../assets/map.png')} source={require('../../../assets/map.png')} style={{ height: scale(10), width: scale(10) }} />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                height: "100%",
                marginRight: scale(5)
              }}>
              <TouchableOpacity style={{ justifyContent: "center", alignItems: "center" }} onPress={() => { Alert.alert(strings("Comming_soon")) }}>
                <View style={{ justifyContent: "center", alignItems: "center", marginHorizontal: scale(5) }}>
                  <Text style={{ fontFamily: "Poppins-Semibold", fontSize: scale(12), color: "#B5B5B5" }}>{strings("FILTER")}</Text>
                </View>
              </TouchableOpacity>
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Icon size={scale(15)} color={"#B5B5B5"} name="angle-down" />
              </View>
            </View>
          </View>
        </View>

        <View marginTop={0} height={verticalScale(5)} />
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
        <View marginTop={0} height={verticalScale(10)} />
        <View style={{ paddingHorizontal: scale(12) }}>
          <FlatList
            renderItem={this.renderNearByProviders}
            data={this.state.providers}
            keyExtractor={(item, index) => item.id}
            ListEmptyComponent={() => {
              return (
                <View
                  style={{
                    flex: 1,
                    height: verticalScale(50),
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", width: "90%", textAlign: "center" }}>
                    {strings("No_Near_By_Provider_Available")}
                  </Text>
                </View>
              )
            }}
          />
        </View>
      </View>
    );
  }
}

const MapStateTopProps = (state) => {
  return {};
};
export default connect(MapStateTopProps, { setProvider })(
  HorizontalNearByProvider
);
