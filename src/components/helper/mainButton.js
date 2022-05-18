import React, { Component } from "react";
import { ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { Icon } from "react-native-elements";
import { verticalScale, scale } from "../../components/helper/scaling";

import { mainColor, mainWhite } from "../helper/colors";

class MainButton extends Component {
  render() {
    const { show_spinner, disabled, show_icon } = this.props;

    return (
      <TouchableOpacity
        disabled={show_spinner || disabled}
        onPress={this.props.on_press}
        style={[
          styles.touchable_bg,
          this.props.custom_style,
          {
            flexDirection: "row",
            justifyContent: "center",
          },
        ]}
      >
        {show_spinner && (
          <ActivityIndicator
            size="small"
            color={mainWhite}
            style={{ marginLeft: 8, marginRight: 8 }}
          />
        )}
        {!show_spinner && (
          <Text style={[styles.text_color, this.props.text_style]}>
            {this.props.button_label}
          </Text>
        )}
        {show_icon && (
          <Icon
            color={mainWhite}
            name="check"
            type="entypo"
            size={20}
            containerStyle={{
              position: "absolute",
              right: 10,
            }}
          />
        )}
      </TouchableOpacity>
    );
  }
}

const styles = {
  touchable_bg: {
    backgroundColor: mainColor,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text_color: {
    fontSize: scale(16),
    color: mainWhite,
    fontFamily: "Poppins-SemiBold",
  },
};

export default MainButton;
