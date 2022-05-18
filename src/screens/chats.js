import React, { Component } from "react";
import { View, TouchableOpacity, ImageBackground } from "react-native";
import {
  Container,
  Header,
  Content,
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Text,
  Button,
} from "native-base";
import { connect } from "react-redux";
import database from "@react-native-firebase/database";
import MyStorage from "../components/helper/MyStorage";
import moment from "moment";
import NetInfo from "@react-native-community/netinfo";
import { Alert, ScrollView, Image } from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import { mainColor } from "../components/helper/colors";
import { getProviderById } from "../components/helper/firestoreHandler";
var PushNotification = require("react-native-push-notification");
import { StackActions, NavigationActions } from 'react-navigation';
import { strings, selection } from '../../locales/i18n';
class Chats extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      isInternetAvilable: true,
      isInternetAlertOpne: true
    };

  }
  convertdte(timestamp) {
    var newDate = moment(new Date(timestamp)).format('DD MMM, HH:mm a');
    return newDate
  }
  // calling refresh method that will refreash messages
  refreshData = () => {
    if (!this.props.userData.id) {
      return;
    }

    PushNotification.setApplicationIconBadgeNumber(0)
    let chats = this.props.userData.chats ? this.props.userData.chats : [];
    let messages = [];
    var rowLen = 0
    chats.map((chatKey) => {
      database()
        .ref()
        .child(chatKey)
        .once("value")
        .then((res) => {
          let result = res.val();
          if (result) {
            let lastMessage = null;
            getProviderById(result.provider.id).then((res) => {
              if (res.data()) {
                if (result.messages) {
                  let keys = Object.keys(result.messages);
                  keys.sort();
                  lastMessage = result.messages[keys[keys.length - 1]];
                }

                let date1 = new Date();
                date1.setDate(date1.getDate() - 1);
                let Expiry = res._data.Expirydate ? res._data.Expirydate : date1

                var ChatExpiryDate = Expiry;
                var CurrentDate = new Date();
                ChatExpiryDate = new Date(ChatExpiryDate);

                messages.push({
                  key: chatKey,
                  provider: result.provider,
                  lastMessage: lastMessage,
                  expiryDate: ChatExpiryDate > CurrentDate ? true : false
                });
                const sortedActivities = messages.sort((a, b) => b.lastMessage.created_at - a.lastMessage.created_at)

                rowLen = rowLen + 1

                if (rowLen === chats.length) {
                  this.setState({ messages: messages });
                  this.saveToStorage(sortedActivities);
                } else {
                  // not last one
                }

              }
            });
          }
        })
        .catch((err) => {
        });
    });

  };
  componentDidMount = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        this.setState({ isInternetAlertOpne: true });
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
        }
      }
    });
    // this.refreshData();
  };
  // saving tmessages to asyncstorage
  saveToStorage = (data) => {
    new MyStorage().setChatList(JSON.stringify(data));
  };
  componentDidFocus = () => {
    if (!this.props.userData.id) {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: 'Login' })],
      });
      this.props.nav.dispatch(resetAction)
    }
    else {
      this.refreshData();
    }
  };

  componentWillMount() {
    this.subs = [
      this.props.nav.addListener("didFocus", this.componentDidFocus),
    ];
  }
  componentWillUnmount() {
    this.subs.forEach((sub) => sub.remove());
  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.messages.length > 0 ? (
          <ScrollView>
            <List>
              {this.state.messages.map((message, index) => (
                <ListItem
                  key={index}
                  onPress={() => {
                    if (message.expiryDate) {
                      this.props.nav.navigate("ChatMessage", {
                        data: message.provider,
                        chatKey: message.key,
                      })
                    }
                    else {
                      Alert.alert("", strings("Chat_Disable"))
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
                              uri: message.provider.profileUrl
                            }}
                          />
                        </ImageBackground>
                      </View>
                      <View justifyContent="center" width={"45%"}>
                        <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: mainColor, fontSize: scale(14), fontFamily: "Poppins-Regular" }}>
                          {message.provider.name}
                        </Text>
                        {message.lastMessage.message != "" ? <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: "#A7A8AB", fontSize: scale(11), fontFamily: "Poppins-Light" }}>
                          {message.lastMessage.message}
                        </Text> : <Text style={{ color: "#A7A8AB", fontSize: scale(11), fontFamily: "Poppins-Light" }}>{strings("Media_file")}</Text>}
                      </View>
                      <View justifyContent="center">
                        <Text style={{ color: "#A7A8AB", fontSize: scale(10), fontFamily: "Poppins-Regular" }}>
                          {this.convertdte(message.lastMessage.created_at)}
                        </Text>
                      </View>
                    </View>
                  </Body>
                </ListItem>
              ))}
            </List>
          </ScrollView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", textAlign: "center" }}>
              {strings("no_message")}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};
export default connect(MapStateToProps, {})(Chats);
