import React, { Component } from 'react';
import {
    Image
} from "react-native";
import { mainColor } from "../components/helper/colors";
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import SwiperScreen from '../screens/swiperScreen'
// import Home from '../screens/Home'
import Login from '../screens/login'
import SignUp from '../screens/signUp'
import ForgetPassword from '../screens/forgetPassword'
import MobileNo from '../screens/verifyMobileNo'
import Connect from '../screens/connect'
import Bookings from '../screens/bookings'
import Profile from '../screens/profile'
import Notifications from '../screens/notification'
import { scale, verticalScale } from '../components/helper/scaling'
// import CategoriesList from '../screens/categoriesList'
// import WorkerCategoriesList from '../screens/workerCategoryList'
// import WorkerCategoriesVertList from '../screens/workerCategoryVertList'
// import ProviderProfile from '../screens/provideProfile'
import MapViewScreen from '../screens/mapScreen'
// import Browes from '../screens/Browes'
import ChatMessage from '../screens/chatMessage'
import OrderSuccess from '../screens/orderSuccess'
import Reminder from '../screens/reminderScreen'
import Loading from '../screens/loading'
import MoreStack from './MoreStack'


import HomeStack from '../routes/HomeStack'
import { strings, selection } from '../../locales/i18n';
const TabNav = createBottomTabNavigator({
    Browse: {
        screen: HomeStack,
        navigationOptions: {
            tabBarLabel: strings("BROWSE"),
            tabBarIcon: ({ focused }) => {
                return (
                    <Image source={require('../../assets/dashboard.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
                );
            }
        }, defaultNavigationOptions: {
            gesturesEnabled: false,
        }

    },
    // Booking: {
    //     screen: Bookings,
    //     navigationOptions: {
    //         tabBarIcon: ({ focused }) => {
    //             return (
    //                 <Icon type='EvilIcons' size={18} name='list-alt' style={{ color: focused ? "#01999C" : "gray" }} />
    //             );
    //         }
    //     },
    //     defaultNavigationOptions: {
    //         gesturesEnabled: false,
    //     }
    // },

    Notify: {
        screen: Notifications,
        navigationOptions: {
            tabBarLabel: strings("NOTIFY"),
            tabBarIcon: ({ focused }) => {
                return (
                    <Image source={require('../../assets/tab_not.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
                );
            },
            defaultNavigationOptions: {
                gesturesEnabled: false,
            }

        }
    },
    Chat: {
        screen: Connect,
        navigationOptions: {
            tabBarLabel: strings("CHAT"),
            tabBarIcon: ({ focused }) => {
                return (
                    <Image source={require('../../assets/tab_chat.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
                );
            },
            defaultNavigationOptions: {
                gesturesEnabled: false,
            }
        }
    },

    Account: {
        screen: Profile,
        navigationOptions: {
            tabBarLabel: strings("ACCOUNT"),
            tabBarIcon: ({ focused }) => {
                return (
                    <Image source={require('../../assets/tab_user.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
                );
            },
            defaultNavigationOptions: {
                gesturesEnabled: false,
            }
        }
    },
    
More: {
  screen: MoreStack,
  navigationOptions: {
    tabBarLabel: strings("MORE"),
    tabBarIcon: ({ focused }) => {
      return (
        <Image source={require('../../assets/tab_more.png')} style={{ tintColor: focused ? mainColor : "#B5B5B5", resizeMode: 'contain', height: scale(22), width: scale(22), marginTop: scale(5) }} />
      );
    },
  },
  defaultNavigationOptions: {
    gesturesEnabled: false,
  }
},
},  
{
    tabBarOptions: {
        activeTintColor: mainColor,
        upperCaseLabel: false,
        inactiveTintColor: "#B5B5B5",
        showIcon: true,
        labelStyle: {
            fontSize: scale(8),
            fontFamily: "Poppins-SemiBold",
            textTransform: "uppercase",
            paddingTop: scale(5)
        },
        allowFontScaling: false,
        style: {
            backgroundColor: "#FFF",
            paddingVertical: 10,
            height: scale(50),
            marginBottom: 0,
            shadowOpacity: 0.05,
            shadowRadius: 10,
            shadowColor: "#000",
            shadowOffset: { height: 0, width: 0 }
        }
    }
}
);
const AppNavigator = createStackNavigator(
    {
        Loading: {
            screen: Loading
        },
        SwiperScreen: {
            screen: SwiperScreen
        },
        Login: {
            screen: Login
        },
        SignUp: {
            screen: SignUp
        },
        ForgetPassword: {
            screen: ForgetPassword
        },
        MobileNo: {
            screen: MobileNo
        },
        ChatMessage: {
            screen: ChatMessage
        },
        OrderSuccess: {
            screen: OrderSuccess
        },
        Reminder: {
            screen: Reminder
        },
        MapViewScreen: {
            screen: MapViewScreen
        },
        // Browes: {
        //     screen: Browes
        // },

        // CategoriesList: {
        //     screen: CategoriesList,
        // },
        // WorkerCategoriesList: {
        //     screen: WorkerCategoriesList,
        // },
        // WorkerCategoriesVertList: {
        //     screen: WorkerCategoriesVertList,
        // },
        // ProviderProfile: {
        //     screen: ProviderProfile
        // },
        routeTwo: {
            screen: TabNav
        }

    },
    {
        headerMode: 'none',
        defaultNavigationOptions: {
            gesturesEnabled: false,
        }
    }

);




const MySwitchNavigator = createSwitchNavigator({
    routeOne: AppNavigator,
}, {
    initialRouteName: 'routeOne'
});

const Root = createAppContainer(MySwitchNavigator);

export default Root;