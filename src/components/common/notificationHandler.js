import React, { Component } from "react";
import { Modal, Text, View, Alert, ActivityIndicator } from "react-native";
import messaging from "@react-native-firebase/messaging";
import Toast from 'react-native-toast-message';

import {
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Card,
  CardItem,
  Button,
} from "native-base";
import { connect } from "react-redux";
import { colors } from "react-native-elements";
class NotificationHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      booking: null,
      rejectedLoading: false,
      acceptedLoading: false,
    };
  }
  componentDidMount = () => {
    this.onMessage = messaging().onMessage(async (remoteMessage) => {
      Toast.show({
        type: 'info',
        // position: 'top | bottom',
        text1: 'YUFIXITCUSTOMER',
        text2: remoteMessage.notification.title,
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
        onShow: () => { },
        onHide: () => { },
        onPress: () => { this.props.navigation.navigate("Chat") }
      });

      // if (!remoteMessage)
      //   return
      // console.log("remoteMessage1: ", remoteMessage)
      // if (remoteMessage.data.type == "cancelBooking") {
      //   let data = JSON.parse(remoteMessage.data.booking);
      //   Alert.alert(
      //     "Cancel Request",
      //     `${data.providerName} canceled your request for a service.`
      //   );
      //   this.props.navigation.navigate("Booking");
      // } else if (remoteMessage.data.type == "acceptBooking") {
      //   let data = JSON.parse(remoteMessage.data.booking);
      //   Alert.alert(
      //     "Request Accepted",
      //     `${data.providerName} accepted your request for a service.`
      //   );
      //   this.props.navigation.navigate("Booking");
      // } else if (remoteMessage.data.type == "coming") {
      //   let data = JSON.parse(remoteMessage.data.booking);
      //   Alert.alert(
      //     "Technician Coming",
      //     `${data.providerName} coming to the address ${data.address.value.name}.`
      //   );
      //   this.props.navigation.navigate("Booking");
      // } else if (remoteMessage.data.type == "startedJob") {
      //   let data = JSON.parse(remoteMessage.data.booking);
      //   Alert.alert("Job Started", `${data.providerName} started the job.`);
      //   this.props.navigation.navigate("Booking");
      // } else if (remoteMessage.data.type == "completedJob") {
      //   let data = JSON.parse(remoteMessage.data.booking);
      //   Alert.alert("Job finished", `${data.providerName} finished the job.`);
      //   this.props.navigation.navigate("Booking");
      // } else if (remoteMessage.data.type == "pendingPayment") {
      //   let data = JSON.parse(remoteMessage.data.booking);
      //   Alert.alert("Payment", `Pay the amount of ${data.providerName}`);
      //   this.props.navigation.navigate("Booking");
      // }
      // else {
        // Toast.show({
        //   type: 'info',
        //   // position: 'top | bottom',
        //   text1: 'YUFIXITCUSTOMER',
        //   text2: remoteMessage.notification.title,
        //   visibilityTime: 2000,
        //   autoHide: true,
        //   topOffset: 30,
        //   bottomOffset: 40,
        //   onShow: () => { },
        //   onHide: () => { },
        //   onPress: () => { this.props.navigation.navigate("Chat") }
        // });
      // }
    });
    this.setBackgroundMessageHandler = messaging().setBackgroundMessageHandler(
      async (remoteMessage) => {
        if(remoteMessage){
          this.props.navigation.navigate("Chat")
        }
        

        // if (!remoteMessage)
        //   return
        // console.log("remoteMessage2: ", remoteMessage)
        // if (remoteMessage.data.type == "cancelBooking") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert(
        //     "Cancel Request",
        //     `${data.providerName} canceled your request for a service.`
        //   );
        //   this.props.navigation.navigate("Booking");
        // } else if (remoteMessage.data.type == "acceptBooking") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert(
        //     "Request Accepted",
        //     `${data.providerName} accepted your request for a service.`
        //   );
        //   this.props.navigation.navigate("Booking");
        // } else if (remoteMessage.data.type == "coming") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert(
        //     "Technician Coming",
        //     `${data.providerName} coming to the address ${data.address.value.name}.`
        //   );
        //   this.props.navigation.navigate("Booking");
        // } else if (remoteMessage.data.type == "startedJob") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert("Job Started", `${data.providerName} started the job.`);
        //   this.props.navigation.navigate("Booking");
        // } else if (remoteMessage.data.type == "completedJob") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert("Job finished", `${data.providerName} finished the job.`);
        //   this.props.navigation.navigate("Booking");
        // } else if (remoteMessage.data.type == "pendingPayment") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert("Payment", `Pay the amount of ${data.providerName}`);
        //   this.props.navigation.navigate("Booking");
        // }
      }
    );
    this.getInitialNotification = messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if(remoteMessage){
          this.props.navigation.navigate("Chat")
        }
        

        // if (!remoteMessage)
        //   return
        // console.log("remoteMessage: ", remoteMessage)
        // if (remoteMessage.data.type == "cancelBooking") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert(
        //     "Cancel Request",
        //     `${data.providerName} canceled your request for a service.`
        //   );
        //   this.props.navigation.navigate("Booking");
        // } else if (remoteMessage.data.type == "acceptBooking") {
        //   let data = JSON.parse(remoteMessage.data.booking);
        //   Alert.alert(
        //     "Request Accepted",
        //     `${data.providerName} accepted your request for a service.`
        //   );
        //   this.props.navigation.navigate("Booking");
        // }
      });
    // messaging().onNotificationOpenedApp(remoteMessage => {
    //     console.log(
    //       'Notification caused app to open from background state:',
    //       remoteMessage.notification,
    //     );
    //   });
  };

  // componentWillUnmount = () => {
  //   this.onMessage();
  //   this.setBackgroundMessageHandler();
  //   this.getInitialNotification();
  // };

  componentWillUnmount = () => {
    if (typeof this.onMessage === "function") this.onMessage();
    if (typeof this.setBackgroundMessageHandler === "function")
      this.setBackgroundMessageHandler();
    if (typeof this.getInitialNotification === "function")
      this.getInitialNotification();
  };


  render() {
    return <Toast ref={(ref) => Toast.setRef(ref)} />;
  }
}

const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

export default connect(MapStateToProps, {})(NotificationHandler);
