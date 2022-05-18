import React, { Component } from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import More from "../screens/more";
import socialeMedia from "../screens/socialeMedia";
import changeLanguage from "../screens/changeLanguage";
import PersonalInformation from "../screens/personalInformation";
import GoogleAddress from "../screens/GoogleAddress";
import CategorySelection from "../screens/CategorySelection";
import inviteContact from "../screens/inviteContact";
const MoreStack = createStackNavigator({
  Main: {
    screen: More,
    navigationOptions: ({ navigation }) => ({
    })
  },
  socialeMedia: {
    screen: socialeMedia,
  },
  changeLanguage: {
    screen: changeLanguage,
  },
  CategorySelection: {
    screen: CategorySelection,
  },
  PersonalInformation: {
    screen: PersonalInformation,
  },
  GoogleAddress: {
    screen: GoogleAddress,
  },
  inviteContact: {
    screen: inviteContact,
  },
},
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      gesturesEnabled: false,
    }
  }
);
export default MoreStack;