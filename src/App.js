import React, { Component } from 'react';
import Root from './routes/MyRoutes'
import Home from './screens/Home'
import { YellowBox, Platform, Text, TextInput } from 'react-native';
import SplashScreen from 'react-native-splash-screen'
import { strings, selection } from '../locales/i18n'
import I18n from 'react-native-i18n';
export default class App extends React.Component {
    constructor(props) {
        super(props);
        console.disableYellowBox = true
        YellowBox.ignoreWarnings(['ViewPagerAndroid']);

        const currentLocale = I18n.currentLocale();
        const locale = I18n.locale;
        if (locale == "en" || locale.startsWith("en")) {
            selection("en")
        }
        else {
            selection("es")
        }

        Text.defaultProps = Text.defaultProps || {};
        Text.defaultProps.allowFontScaling = false;

        TextInput.defaultProps = TextInput.defaultProps || {};
        TextInput.defaultProps.allowFontScaling = false;


    }
    componentDidMount = () => {
        if (Platform.OS == "ios")
            SplashScreen.hide()
    };
    render() {
        return (
            <Root />
        )
    }
}