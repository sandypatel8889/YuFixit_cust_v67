import React, { Component } from 'react';
import { createStackNavigator, createBottomTabNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation'
import Home from '../screens/Home'
import CategoriesList from '../screens/categoriesList'
import ProviderProfile from '../screens/provideProfile'
import WorkerCategoriesList from '../screens/workerCategoryList'
import WorkerCategoriesVertList from '../screens/workerCategoryVertList'
import Browes from '../screens/Browes'

const HomeStack = createStackNavigator({
  Main: {
    screen: Home,
    navigationOptions: ({ navigation }) => ({

    })
  },
  CategoriesList: {
    screen: CategoriesList,
  },
  ProviderProfile: {
    screen: ProviderProfile,
  },
  WorkerCategoriesList: {
    screen: WorkerCategoriesList,
  },
  WorkerCategoriesVertList: {
    screen: WorkerCategoriesVertList,
  },
  Browes: {
    screen: Browes
  }

},
  {
    headerMode: 'none',
    defaultNavigationOptions: {
      gesturesEnabled: false,
    }
  }
);
export default HomeStack;