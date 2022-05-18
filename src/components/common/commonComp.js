import React, { Component } from "react";
import { Platform } from "react-native";
import { Text, View, FlatList, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { scale, verticalScale } from "../helper/scaling";
import { strings, selection } from '../../../locales/i18n';

export default class CommonComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderData = ({ item, index }) => {
    return (
      <View style={{
        backgroundColor: "white", flexDirection: "row", alignItems: "center", padding: 10, marginLeft: 5, marginRight: 5, borderRadius: 10, marginVertical: verticalScale(4), ...Platform.select({
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
      }}>
        <View style={{ flex: 1 }}>
          {item.name ? (
            <View>
              <Text style={{ color: '#B5B5B5', fontSize: scale(11), fontFamily: "Poppins-Medium" }}>{item.name}</Text>
            </View>
          ) : null}
          {item.value ? (
            <View>
              <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                {item.value.name}
              </Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={this.props.onEditAddress(item, index)}
          style={{ marginEnd: 10 }}>
          <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
            <Image source={require('../../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
          </View>
        </TouchableOpacity>

        {index == 0 ?
          null :
          <TouchableOpacity
            onPress={this.props.onRemove(item, index)}>
            <Icon
              type="Feather"
              size={scale(15)}
              name="x"
              style={{ color: "#B5B5B5" }}
            />
          </TouchableOpacity>}
      </View>
    );
  };
  render() {
    console.log("i am on ", this.props.data);
    return (
      <View style={{ flex: 1, paddingBottom: verticalScale(2), flexDirection: 'column' }}>
        {this.props.data ? (
          <View style={{ flex: 1 }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={this.props.data}
              keyExtractor={(item, index) => index.toString()}
              renderItem={this.renderData}
              ListEmptyComponent={() => {
                return (
                  <Text style={{ color: "#B5B5B5", fontSize: scale(14), fontFamily: "Poppins-Regular", textAlign: "center" }}>
                    {strings("msg_1")}
                  </Text>
                );
              }}
            />
          </View>
        ) : null}
      </View>
    );
  }
}
