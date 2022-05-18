import React, { Component } from "react";
import { View, Text, Dimensions, Image, ImageBackground, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { connect } from "react-redux";
import { getNotifications, getProviders, getProviderById } from "../components/helper/firestoreHandler";
import moment from "moment";
var PushNotification = require("react-native-push-notification");
import { scale, verticalScale } from "../components/helper/scaling";
import { mainColor } from "../components/helper/colors";
import { StackActions, NavigationActions } from 'react-navigation';
import {
  Container,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
} from "native-base";
import { Header, Avatar } from "react-native-elements";
import { Alert } from "react-native";
import { Platform } from "react-native";
import { strings, selection } from '../../locales/i18n';
class Notifications extends React.Component {
  constructor() {
    super();
    this.state = {
      notifications: [
        {
          temp: true,
        },
      ],
    };
  }
  componentWillUnmount() {
    // removing listner
    this.subs.forEach((sub) => sub.remove());
  }
  componentWillMount() {
    // crating event listner
    this.subs = [
      this.props.navigation.addListener("didFocus", this.componentDidFocus),
    ];
  }
  componentDidFocus = () => {
    if (!this.props.userData.id) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Login' })],
      });
      this.props.navigation.dispatch(resetAction)
    }
    else {
      PushNotification.setApplicationIconBadgeNumber(0)
      // getting all notifications
      getNotifications(this.props.userData.id)
        .then((res) => {
          console.log("res: ", res)
          if (res.docs.length > 0) {
            let temp = res.docs.map((item) => {
              return { ...item.data(), id: item.id };
            });
            temp.sort((a, b) => {
              return b.booking.update_at - a.booking.update_at;
            });
            this.setState({ notifications: temp });
          } else {
            this.setState({ notifications: [] });
          }
        })
        .catch((err) => {
          console.log("Error in getting notifications is: ", err);
        });
    }
  };
  // getting time from date
  getTimeFromDate = (timestamp) => {
    var newDate = moment(new Date(timestamp * 1000)).format('DD MMM, HH:mm a');
    return newDate
  };
  pad = (num) => {
    return ("0" + num).slice(-2);
  };
  getProviderData(notification) {
    getProviderById(notification.booking.sender_id)
      .then((res) => {
        // console.log('user data is.....', res.id)
        let data = { ...res.data(), id: res.id };

        let date1 = new Date();
        date1.setDate(date1.getDate() - 1);
        let Expiry = res._data.Expirydate ? res._data.Expirydate : date1

        var ChatExpiryDate = Expiry;
        var CurrentDate = new Date();
        ChatExpiryDate = new Date(ChatExpiryDate);

        if (ChatExpiryDate > CurrentDate) {
          this.props.navigation.navigate("ChatMessage", {
            data: data,
            chatKey: notification.booking.chatKey,
          });
        }
        else {
          Alert.alert("", strings("Chat_Disable"))
        }
      })
      .catch((err) => {
        console.log("error getting customer: ", err)
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
            height: verticalScale(50)
          }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
          screenOptions={{
            headerStyle: { elevation: 0 }
          }}
          centerComponent={
            <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Notifications")}</Text>
            </View>
          } />
        <View style={{ paddingRight: scale(12), flex: 1 }}>
          {this.state.notifications.length === 0 ? (
            <View
              style={{
                height: Dimensions.get('window').height,
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                position: "absolute",
              }}>
              <Text style={{ color: "#B5B5B5", textAlign: "center", fontSize: scale(14), fontFamily: "Poppins-Regular" }}>
                {strings("No_notification")}
              </Text>
            </View>
          ) : (
            <ScrollView>
              <List>
                {this.state.notifications.map((notification) => {
                  if (notification.temp) {
                    return (
                      <ListItem>
                        <Body
                          style={{ backgroundColor: "white", height: 60 }}
                        ></Body>
                      </ListItem>
                    );
                  } else {
                    return (
                      <ListItem
                        onPress={() => {
                          if (notification.booking.chatKey) {
                            this.getProviderData(notification)
                          }
                          else {
                            Alert.alert(strings("Error"), strings("no_chatkey"));
                          }
                        }}>
                        <Body>
                          <View flexDirection="row" justifyContent="space-between" alignItems="center">
                            <View>

                              <ImageBackground
                                style={{
                                  height: verticalScale(50), width: verticalScale(50)
                                }}
                                imageStyle={{ borderRadius: verticalScale(25) }}
                                source={
                                  require('../../assets/icon.png')
                                }>
                                <Image
                                  style={{
                                    height: verticalScale(50), width: verticalScale(50), borderRadius: verticalScale(25)
                                  }}
                                  source={{
                                    uri: notification.booking.providerProfileUrl
                                  }}
                                />
                              </ImageBackground>
                            </View>
                            <View justifyContent="center" width={"45%"}>
                              <Text numberOfLines={3} ellipsizeMode='tail' style={{ color: mainColor, fontSize: scale(14), fontFamily: "Poppins-Regular" }}>
                                {notification.body.split("-")[0]}
                              </Text>
                            </View>
                            <View justifyContent="center">
                              <Text style={{ color: "#A7A8AB", fontSize: scale(10), fontFamily: "Poppins-Regular" }}>
                                {this.getTimeFromDate(
                                  notification.booking.update_at
                                )}
                              </Text>
                            </View>
                          </View>
                        </Body>
                      </ListItem>
                    );
                  }
                })}
              </List>
            </ScrollView>
          )}
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
export default connect(MapStateToProps, {})(Notifications);
