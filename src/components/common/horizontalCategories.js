import React, { Component } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { verticalScale, scale } from "../helper/scaling";
import Icon from "react-native-vector-icons/Feather";
import { connect } from "react-redux";
import { fetchCategories } from "../../redux/actions/index";
import { getAllProviders } from "../../components/helper/firestoreHandler";
import { mainColor } from "../helper/colors";
import { strings } from "../../../locales/i18n";

class HorizontalCategores extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      latitude: "",
      longitude: "",
      userid: ""
    };
  }
  componentDidFocus = () => {
    this.CallinitialData()
    // this.props.fetchCategories();
  }
  CallinitialData() {
    getAllProviders()
      .then((res) => {
        console.log(res.docs.length);
        let providers = [];
        res.docs.map((doc) => {
          providers.push({ ...doc.data(), id: doc.id });
        });
        let arrnew = []
        for (let i = 0; i < providers.length; i++) {
          if (providers[i].addresses) {
            let distance = this.getDistanceFromLatLonInKm(providers[i].addresses)
            if (distance < 5) {
              arrnew.push(providers[i].id)
            }
          }
        }
        this.props.fetchCategories(arrnew);
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
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

  componentWillUnmount() {
    // removing listner
    this.subs.forEach((sub) => sub.remove());
  }
  componentDidMount() {
    this.subs = [
      this.props.nav.addListener("didFocus", this.componentDidFocus),
    ];

  }
  componentWillReceiveProps = (newProps) => {
    if (newProps.latitude != 0 && newProps.longitude != 0) {
      if (newProps.latitude != this.state.latitude) {
        // this.props.fetchCategories(newProps.latitude, newProps.longitude);
        this.CallinitialData()
      }


      // this.props.fetchCategories();
      this.setState({
        latitude: newProps.latitude,
        longitude: newProps.longitude,
        userid: newProps.userid
      });
    }
    else {
      this.setState({
        userid: newProps.userid
      });
    }
  };
  renderCategories = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.nav.navigate("CategoriesList", { category: item, latitude: this.state.latitude, longitude: this.state.longitude, userid: this.state.userid });
        }}
        style={{ justifyContent: "center", marginHorizontal: scale(2) }}>
        <View
          style={{
            height: scale(66),
            width: scale(66),
            justifyContent: "center",
            backgroundColor: mainColor,
            alignItems: "center",
            borderRadius: scale(33),
          }}
        >
          <Image
            source={{ uri: item.url }}
            resizeMode={"contain"}
            style={{ height: verticalScale(25), width: verticalScale(25), tintColor: "white" }}
          />
        </View>
        <View
          style={{
            width: scale(70),
            paddingTop: verticalScale(4),
            flex: 1,
            flexDirection: "column",
            // backgroundColor: "red"
          }}>
          <View style={{ justifyContent: "center", marginBottom: 5 }}>
            <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: scale(9), textAlign: "center", color: "#242424", fontFamily: "Poppins-Medium" }}>{strings(item.name)}</Text>
            <Text style={{ fontSize: scale(9), textAlign: "center", color: "#B5B5B5", fontFamily: "Poppins-Light" }}>
              {item.provider1
                ? item.provider1.length + " " + strings("Workers")
                : "0 " + strings("Workers")}
            </Text>
          </View>
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
            padding: scale(12),
          }}>
          <Text style={{ fontSize: scale(12), textAlign: "center", fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>
            {strings("CATEGORIES")}
          </Text>
          <TouchableOpacity
            onPress={() => this.props.nav.navigate("WorkerCategoriesVertList", { latitude: this.state.latitude, longitude: this.state.longitude, userid: this.state.userid })}
            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: scale(12), textAlign: "center", fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>
              {strings("SEE_ALL")}
            </Text>
            <Icon active size={scale(15)} color={"#B5B5B5"} name="chevron-right" />
          </TouchableOpacity>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <FlatList
            showsHorizontalScrollIndicator={false}
            // horizontal
            numColumns={4}
            data={this.props.categories}
            extraData={this.props.categories}
            renderItem={this.renderCategories}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    categories: state.categories,
  };
};

export default connect(MapStateToProps, { fetchCategories })(
  HorizontalCategores
);
