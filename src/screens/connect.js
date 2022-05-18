import React, { Component } from "react";
import { View, Text } from "react-native";
import { Container, Tab, Tabs, TabHeading, Icon } from "native-base";
import Tab1 from "./chats";
import Tab2 from "./calls";
import { scale, verticalScale } from "../components/helper/scaling";
import { mainColor } from "../components/helper/colors";
import { Header, Avatar } from "react-native-elements";
import { Platform } from "react-native";
import { strings, selection } from '../../locales/i18n';
export default class Connect extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
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
              <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Chat")}</Text>
            </View>
          } />
        <View style={{ paddingRight: scale(12), flex: 1 }}>
          <Tab1 nav={this.props.navigation} />
        </View>
      </View>
    );
  }
}
