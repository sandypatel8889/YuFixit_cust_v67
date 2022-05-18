import React, { Component } from "react";
import { Calendar } from "react-native-calendars";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { Button, Picker } from "native-base";
import { scale, verticalScale } from "../components/helper/scaling";
import Icon from "react-native-vector-icons/FontAwesome";
import { connect } from "react-redux";
import MainButton from "../components/helper/mainButton";
const today = new Date();
const temp = new Date();
const minDate = temp.setDate(today.getDate() + 1);

class Reminder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      markedDates: {
        daySelected: null,
        address: null,
        selectedTime: null,
      },
    };
  }

  componentWillMount = () => {
    let markedDates = {};
    let month =
      today.getMonth() > 8 ? today.getMonth() + 1 : `0${today.getMonth() + 1}`;
    let _date = `${today.getFullYear()}-${month}-${today.getDate()}`;
    markedDates[_date] = {
      dots: [{ key: "vacation" }],
      selected: true,
      selectedColor: "#01999C",
    };
    this.setState({ markedDates: markedDates, daySelected: today.getTime() });
  };

  renderDate = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ selectedTime: item.time });
        }}
        style={{
          flex: 1,
          backgroundColor:
            this.state.selectedTime === item.time ? "#01999C" : "white",
          borderColor:
            this.state.selectedTime === item.time ? "#01999C" : "black",
          marginRight: scale(6),
          borderRadius: 60,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 0.5,
        }}
      >
        <Text
          style={{
            color: this.state.selectedTime === item.time ? "white" : "black",
            padding: scale(5),
          }}
        >
          {item.time}
        </Text>
      </TouchableOpacity>
    );
  };
  // selecting date
  handleChangeDay = (data) => {
    let markedDates = {};
    markedDates[data.dateString] = {
      dots: [{ key: "vacation" }],
      selected: true,
      selectedColor: "#01999C",
    };
    this.setState({ daySelected: data.timestamp, markedDates: markedDates });
  };
  // handling next button
  handleNext = () => {
    if (!this.state.daySelected) {
      Alert.alert("Forget Day", "Please select a proper day");
      return;
    }
    if (!this.state.selectedTime) {
      Alert.alert("Availabe time", "Please select available time");
      return;
    }
    this.props.navigation.navigate("OrderSuccess", {
      address: this.state.address,
      time: this.state.selectedTime,
      date: this.state.daySelected,
    });
  };
  //   address selecting for task from picker
  _renderAddressSelectror = () => {
    return (
      <View
        style={{ borderBottomWidth: 0.5, borderColor: "gray", paddingTop: 10 }}
      >
        <Picker
          selectedValue={this.state.address ? this.state.address["name"] : "1"}
          mode="dropdown"
          onValueChange={(itemValue, itemIndex) => {
            console.log("selected address is: ", itemIndex);
            if (itemIndex > 0)
              this.setState({
                address: this.props.userData.addresses[itemIndex - 1],
              });
            else {
              this.setState({ address: null });
            }
          }}
        >
          <Picker.Item label="Please select an address" value={"1"} />
          {this.props.userData.addresses &&
            this.props.userData.addresses.map((address) => {
              return (
                <Picker.Item label={address["name"]} value={address["name"]} />
              );
            })}
        </Picker>
      </View>
    );
  };
  render() {
    //   dummy data for time selections
    const data = [
      {
        time: "10:00" + " AM",
      },
      {
        time: "09:00" + " AM",
      },
      {
        time: "08:00" + " AM",
      },
      {
        time: "01:00" + " AM",
      },
      {
        time: "06:00" + " AM",
      },

      {
        time: "07:00" + " AM",
      },
    ];

    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.goBack();
          }}
          style={{
            flex: 0.3,
            justifyContent: "flex-end",
            paddingHorizontal: scale(12),
          }}
        >
          <Text style={{ fontSize: 18, color: "gray" }}>Cancel</Text>
        </TouchableOpacity>
        <View style={{ flex: 4, paddingTop: verticalScale(12) }}>
          <View style={{ flex: 1, paddingBottom: verticalScale(12) }}>
            <Calendar
              onDayPress={(day) => {
                this.handleChangeDay(day);
              }}
              minDate={minDate}
              markedDates={this.state.markedDates}
              theme={{
                todayTextColor: "black",
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              paddingHorizontal: scale(12),
              marginTop: verticalScale(12),
            }}
          >
            <View style={{ paddingVertical: verticalScale(12) }}>
              <Text style={{ fontSize: 16 }}>{"Available Time"}</Text>
            </View>
            <View style={{}}>
              <FlatList
                showsHorizontalScrollIndicator={false}
                horizontal
                data={data}
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderDate}
              />
            </View>
            {this._renderAddressSelectror()}
          </View>
          <View style={{ backgroundColor: "#EBEBEB", alignItems: "center" }}>
            <MainButton
              show_spinner={this.state.signin_in_progress}
              button_label="NEXT"
              on_press={() => {
                this.handleNext();
              }}
              text_style={{
                fontSize: scale(13),
              }}
              custom_style={{
                width: "80%",
                borderRadius: 5,
                height: verticalScale(35),
                marginVertical: verticalScale(12),
                // borderRadius: scale(2),
              }}
            />
          </View>
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

export default connect(MapStateToProps, {})(Reminder);
