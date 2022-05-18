import React, { Component } from "react";
import { View, Text, Alert, ActivityIndicator } from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import Icon from "react-native-vector-icons/AntDesign";
import { Header, Avatar } from "react-native-elements";
import { addBooking } from "../components/helper/firestoreHandler";
import { Button } from "native-base";
import { connect } from "react-redux";
class OrderSuccess extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _date: "",
      loading: false,
    };
  }
  componentDidMount = () => {
    let _date = new Date(parseInt(this.props.navigation.state.params.date));
    this.setState({ _date: _date.toDateString() });
  };
  // method for handling order success if the order is completed
  handleSuccess = () => {
    // console.log('i am press',this.props.navigation.state.params)
    this.setState({ loading: true });
    const { address, time, date } = this.props.navigation.state.params;
    let data = {
      provider: this.props.provider.id,
      providerName: this.props.provider.name,
      providerProfileUrl: this.props.provider.profileUrl
        ? this.props.provider.profileUrl
        : null,
      customer: this.props.userData.id,
      customerName: this.props.userData.name,
      customerProfileUrl: this.props.userData.profileUrl
        ? this.props.userData.profileUrl
        : null,
      date: date,
      time: time,
      address: address,
    };
    addBooking(data)
      .then((res) => {
        this.setState({ loading: false });
        if (res.data) {
          this.props.navigation.navigate("routeTwo");
        } else {
          Alert.alert("Error", "Something went wrong please try again.");
        }
      })
      .catch((err) => {
        console.log("error in adding booking is: ", err);
        this.setState({ loading: false });
      });
  };
  render() {
    const { address, time } = this.props.navigation.state.params;
    return (
      <View style={{ flex: 1, backgroundColor: "lightgray" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingTop: verticalScale(12),
            marginTop: verticalScale(20),
          }}
        >
          <Icon name="checkcircle" color={"green"} size={50} />
          <Text style={{ fontSize: 40, fontWeight: "bold" }}>{"Success!"}</Text>
          <Text
            style={{
              fontSize: 14,
              paddingTop: verticalScale(12),
              fontWeight: "bold",
              color: "gray",
              textAlign: "center",
            }}
          >
            {
              "Thank you for choosing our \nservice and trust our worker to\n help you get your job done"
            }
          </Text>
        </View>
        <View
          style={{
            flex: 1.4,
            backgroundColor: "white",
            margin: scale(24),
            borderRadius: 5,
            borderWidth: 0.5,
            borderColor: "gray",
            paddingVertical: verticalScale(12),
          }}
        >
          <View style={{ flex: 0.6, alignItems: "center" }}>
            <Icon
              onPress={() => {
                this.props.navigation.goBack();
              }}
              name="edit"
              color={"gray"}
              size={25}
              style={{ alignSelf: "flex-end", paddingRight: scale(12) }}
            />
            {this.props.provider.profileUrl ? (
              <Avatar
                rounded
                title="MD"
                size={50}
                source={{
                  uri: this.props.provider.profileUrl,
                }}
              />
            ) : (
              <Avatar
                rounded
                title="MD"
                size={50}
                icon={{ name: "user", type: "font-awesome" }}
              />
            )}
            <Text style={{ marginTop: verticalScale(6) }}>
              {this.props.provider.name}
            </Text>
          </View>

          <View
            style={{
              flex: 0.4,
              marginTop: scale(12),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "gray" }}>{"Date & Time"}</Text>
            <Text style={{}}>{this.state._date}</Text>
            <Text style={{}}>{time}</Text>
          </View>
          <View
            style={{
              flex: 0.4,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "gray" }}>{"My Address"}</Text>
            <Text style={{}}>{address ? address.name : ""}</Text>
          </View>
        </View>
        <View style={{ flex: 0.5, marginHorizontal: scale(24) }}>
          <Button
            full
            disabled={this.state.loading}
            style={{ backgroundColor: "#01999C", borderRadius: scale(5) }}
            onPress={() => {
              this.handleSuccess();
            }}
          >
            {this.state.loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text
                style={{ fontSize: 15, color: "white", fontWeight: "bold" }}
              >
                Done
              </Text>
            )}
          </Button>
        </View>
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    provider: state.provider,
    userData: state.userData,
  };
};
export default connect(MapStateToProps, {})(OrderSuccess);
