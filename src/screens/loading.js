import React, { Component } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { scale, verticalScale } from "../components/helper/scaling";
import { SocialIcon } from "react-native-elements";
import { Button, Form, Item as FormItem, Input, Label } from "native-base";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import auth from "@react-native-firebase/auth";
import ErrorComponent from "../components/helper/errorComp";
import { connect } from "react-redux";
import { setUserFromLocal } from "../redux/actions/index";
import MyStorage from "../components/helper/MyStorage";
import { NavigationActions, StackActions } from "react-navigation";
import SplashScreen from "react-native-splash-screen";
class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount = () => {
    new MyStorage()
      .getUserData()
      .then((data) => {
        if (data) {
          this.props.setUserFromLocal(JSON.parse(data));

          const { dispatch } = this.props.navigation;
          dispatch({
            type: "Navigation/RESET",
            actions: [
              {
                type: "Navigate",
                routeName: "routeTwo",
              },
            ],
            index: 0,
          });
        } else {
          const { dispatch } = this.props.navigation;
          dispatch({
            type: "Navigation/RESET",
            actions: [
              {
                type: "Navigate",
                routeName: "SwiperScreen",
              },
            ],
            index: 0,
          });
          // this.props.navigation.navigate('SwiperScreen')
        }
      })
      .catch((err) => {
        console.log("error in getting user data is: ", err);
      })
      .finally(() => {
        SplashScreen.hide()
      });
  };

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }
}

const MapStateToProps = (state) => {
  return {};
};

export default connect(MapStateToProps, { setUserFromLocal })(Loading);
