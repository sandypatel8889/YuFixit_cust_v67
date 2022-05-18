import React, { Component } from "react";
import { View, Text, Alert } from "react-native";
import { scale } from "../components/helper/scaling";
import { Container, Header, Tab, Tabs, TabHeading, Icon } from "native-base";
import BookingComponent from "../components/common/commonBookingComp";
import { getBookings } from "../components/helper/firestoreHandler";
import { connect } from "react-redux";
import NetInfo from "@react-native-community/netinfo";
class Bookings extends React.Component {
  constructor() {
    super();
    this.state = {
      current: [],
      previous: [],
      isInternetAvilable: true,
      isInternetAlertOpne:true
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
          // Alert.alert("Internet Error", "No internet connection available. Please check your connection.");
        }
        
      }
    });
  };
  CallinitialData() {
    let previous = [];
    let current = [];
    // get booking from firebase database
    getBookings(this.props.userData.id)
      .then((res) => {
        console.log(res.docs);
        res.docs.map((doc) => {
          let data = { ...doc.data(), id: doc.id };
          if (data.status == "completed") previous.push(data);
          else current.push(data);
        });
        current.sort((a, b) => {
          return b.update_at - a.update_at;
        });
        previous.sort((a, b) => {
          return b.update_at - a.update_at;
        });
        console.log("current is: ", current);
        this.setState({ current: current, previous: previous });
      })
      .catch((err) => {
        console.log("error in getting bookings is: ", err);
        // Alert.alert("Error", "Internet issue / Error. Please try again");
      });
  }
  componentDidFocus = () => {
    // get booking from firebase database
    getBookings(this.props.userData.id)
      .then((res) => {
        // console.log(res.docs)
        res.docs.map((doc) => {
          let data = { ...doc.data(), id: doc.id };
          if (data.status == "completed") previous.push(data);
          else current.push(data);
        });
        current.sort((a, b) => {
          return b.date - a.date;
        });
        previous.sort((a, b) => {
          return b.date - a.date;
        });
        this.setState({ current: current, previous: previous });
      })
      .catch((err) => {
        console.log("error in getting bookings is: ", err);
        // Alert.alert("Error", "Internet issue / Error. Please try again");
      });
  };

  componentWillUnmount() {
    // event remove
    this.subs.forEach((sub) => sub.remove());
  }

  componentWillMount() {
    // event added
    this.subs = [
      this.props.navigation.addListener("didFocus", this.componentDidFocus),
    ];
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            paddingHorizontal: scale(12),
          }}
        >
          <Text style={{ fontSize: 30, color: "black", fontWeight: "bold" }}>
            Bookings
          </Text>
        </View>
        <View style={{ flex: 4 }}>
          <Tabs
            tabContainerStyle={{ borderTopWidth: 0, elevation: 0, opacity: 10 }}
            tabBarBackgroundColor={"white"}
            tabBarUnderlineStyle={{ backgroundColor: "#01999C" }}
          >
            <Tab
              style
              heading={
                <TabHeading style={{ backgroundColor: "white" }}>
                  <Text style={{ fontSize: scale(12) }}>Upcoming</Text>
                </TabHeading>
              }
            >
              <BookingComponent data={this.state.current} selectedTab={1} />
            </Tab>
            <Tab
              heading={
                <TabHeading style={{ backgroundColor: "white" }}>
                  <Text style={{ fontSize: scale(12) }}>Previous</Text>
                </TabHeading>
              }
            >
              <BookingComponent data={this.state.previous} selectedTab={2} />
            </Tab>
          </Tabs>
        </View>
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

export default connect(MapStateToProps, {})(Bookings);
