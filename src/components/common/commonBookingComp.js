import React, { Component } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { verticalScale, scale } from "../helper/scaling";
import {
  List,
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Text,
} from "native-base";

const statusColors = {
  pending: "#B2B94B",
  accepted: "orange",
  completed: "green",
  rejected: "red",
};
export default class BookingComponent extends React.Component {
  renderItem = (booking) => {
    let d = new Date(booking.date);
    let _date = d.toDateString();
    return (
      <List>
        <ListItem avatar>
          <Left>
            {booking.providerProfileUrl ? (
              <Thumbnail source={{ uri: booking.providerProfileUrl }} />
            ) : (
              <Thumbnail
                source={{
                  uri:
                    "https://facebook.github.io/react-native/docs/assets/favicon.png",
                }}
              />
            )}
          </Left>
          <Body>
            <Text>{booking.providerName}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: verticalScale(2),
              }}
            >
              <Text style={{ color: "black" }}>{_date}</Text>
            </View>
            <Text style={{ color: "gray" }}>{booking.time}</Text>
          </Body>
          <Right>
            <View
              style={{
                flex: 1,
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "gray", paddingLeft: scale(6) }}>
                {"30 min before"}
              </Text>
              <TouchableOpacity
                style={{
                  width: scale(70),
                  // height: 20,
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: statusColors[booking.status],
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: scale(11),
                    padding: scale(2),
                  }}
                >
                  {booking.status}
                </Text>
              </TouchableOpacity>
            </View>
          </Right>
        </ListItem>
      </List>
    );
  };
  render() {
    console.log("booking is ", this.props.data);
    return (
      <View style={{ flex: 1 }}>
        {this.props.data.length > 0 ? (
          <ScrollView>
            {this.props.data.map((booking) => this.renderItem(booking))}
          </ScrollView>
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ color: "gray" }}>
              {this.props.selectedTab == 1
                ? "Currently you dont have any upcomming booking"
                : "Currently you dont have any previous booking"}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
