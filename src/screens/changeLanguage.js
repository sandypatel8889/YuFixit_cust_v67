import React, { Component } from "react";
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    Platform,
    ImageBackground,
    FlatList,
    TextInput,
    Alert,
    AsyncStorage
} from "react-native";
import {
    addFacebookLink,
    addInstaLink,
    addTwitterLink,
    addTiktokLink
} from "../util/firestoreHandler";
import { Header, Avatar, colors, CheckBox } from "react-native-elements";
const { height, width } = Dimensions.get("window");
import { verticalScale, scale, moderateScale } from "../components/helper/scaling";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import NetInfo from "@react-native-community/netinfo";
import { ScrollView } from "react-native";
import { Icon } from "react-native-elements";
import { Button, Form, Item as FormItem, Input, Label, Textarea } from "native-base";
import { mainColor } from "../components/helper/colors";
import MyStorage from "../util/MyStorage";
import { strings, selection } from '../../locales/i18n';
import { StackActions, NavigationActions } from 'react-navigation';
import I18n from 'react-native-i18n';
class changeLanguage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            txtValue: "",
            isEditValue: "",
            isEnglish: true
        };
    }
    componentDidMount = () => {
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log("Connection type", state.type);
            console.log("Is connected?", state.isConnected);
            this.setState({ isInternetAvilable: state.isConnected });
            if (state.isConnected) {
                this.setState({ isInternetAlertOpne: true });
            }
            else {
                if (this.state.isInternetAlertOpne) {
                    this.setState({ isInternetAlertOpne: false });
                }
            }
        });



        AsyncStorage.getItem("isEnglish").then((data) => {
            {
                if (JSON.parse(data) == "1") {

                    this.setState({
                        isEnglish: true
                    })
                    { this.Savedata('isEnglish', "1") }
                }
                else if (JSON.parse(data) == "0") {

                    this.setState({
                        isEnglish: false
                    })
                    { this.Savedata('isEnglish', "0") }
                }
                else {
                    console.log("")
                }
            }
        })
    };
    componentWillMount() {
        this.subs = [
            this.props.navigation.addListener("didFocus", this.componentDidFocus),
        ];
    }
    componentWillUnmount() {
        this.subs.forEach((sub) => sub.remove());
    }

    componentDidFocus = () => {
       
    };
    AddLink() {
        if (this.state.isEditValue == "1") {
            addFacebookLink(this.props.userData.id, this.state.txtValue)
                .then((res) => {
                    let _data = { ...this.props.userData, facebookLink: this.state.txtValue };
                    this.props.setUser(_data);
                    new MyStorage().setUserData(JSON.stringify(_data));
                })
                .catch((err) => {
                    Alert.alert(strings("Error"), strings("Error_Something_went"));
                });
        }
        else if (this.state.isEditValue == "2") {
            addInstaLink(this.props.userData.id, this.state.txtValue)
                .then((res) => {
                    let _data = { ...this.props.userData, instaLink: this.state.txtValue };
                    this.props.setUser(_data);
                    new MyStorage().setUserData(JSON.stringify(_data));
                })
                .catch((err) => {
                    Alert.alert(strings("Error"), strings("Error_Something_went"));
                });
        }
        else if (this.state.isEditValue == "3") {
            addTwitterLink(this.props.userData.id, this.state.txtValue)
                .then((res) => {
                    let _data = { ...this.props.userData, twitterLink: this.state.txtValue };
                    this.props.setUser(_data);
                    new MyStorage().setUserData(JSON.stringify(_data));
                })
                .catch((err) => {
                    Alert.alert(strings("Error"), strings("Error_Something_went"));
                });
        }
        else if (this.state.isEditValue == "4") {
            addTiktokLink(this.props.userData.id, this.state.txtValue)
                .then((res) => {
                    let _data = { ...this.props.userData, tiktokLink: this.state.txtValue };
                    this.props.setUser(_data);
                    new MyStorage().setUserData(JSON.stringify(_data));
                })
                .catch((err) => {
                    Alert.alert(strings("Error"), strings("Error_Something_went"));
                });
        }
    }
    updateLanguage() {
        if (this.state.isEnglish) {
            selection('en')
            { this.Savedata('isEnglish', "1") }
            I18n.locale = 'en';
        }
        else {
            selection('es')
            { this.Savedata('isEnglish', "0") }
            I18n.locale = 'es';

        }
        setTimeout(() => {this.MoveHome()}, 1000)

    }
    MoveHome(){
        const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({ routeName: 'routeTwo' })],
        });
        this.props.navigation.dispatch(resetAction);
    }
    Savedata(key, detail) {
        AsyncStorage.setItem(key, JSON.stringify(detail))
            .then(() => {
                console.log('data saved')
            })
    }
    render() {
        return (
            <View style={{ flex: 1 }}>

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
                    leftComponent={
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Icon
                                onPress={() => {
                                    this.props.navigation.pop();
                                }}
                                type="FontAwesome"
                                size={40}
                                name="chevron-left"
                                color={mainColor}
                            />
                        </View>
                    }
                    centerComponent={
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Change_Language")}</Text>
                        </View>
                    }
                />
                <View style={{ paddingHorizontal: scale(12), flex: 1 }}>
                    <View flex={0.9}>
                        <View marginTop={0} height={verticalScale(20)} />
                        <Text style={{ textAlign: "center", margin: 5, fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#242424" }}>
                            {strings("select_prefer_language")}
                        </Text>
                        <View marginTop={0} height={verticalScale(5)} />
                        <View flexDirection="row" justifyContent="space-between">
                            <Button
                                onPress={() => {
                                    this.setState({
                                        isEnglish: true
                                    })
                                }}
                                disabled={this.state.addingAddress}
                                style={{ backgroundColor: this.state.isEnglish ? mainColor : "white", borderRadius: moderateScale(10), height: verticalScale(35), width: "45%", justifyContent: "center" }}>
                                {this.state.addingAddress ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text
                                        style={{
                                            fontSize: scale(14),
                                            color: this.state.isEnglish ? "white" : "black",
                                            fontFamily: "Poppins-Regular",
                                        }}>
                                        English
                                    </Text>
                                )}
                            </Button>
                            <Button
                                onPress={() => {
                                    this.setState({
                                        isEnglish: false
                                    })
                                }}
                                disabled={this.state.addingAddress}
                                style={{ backgroundColor: this.state.isEnglish ? "white" : mainColor, borderRadius: moderateScale(10), height: verticalScale(35), width: "45%", justifyContent: "center" }}>
                                {this.state.addingAddress ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text
                                        style={{
                                            fontSize: scale(14),
                                            color: this.state.isEnglish ? "black" : "white",
                                            fontFamily: "Poppins-Regular",
                                        }}>
                                        Spanish
                                    </Text>
                                )}
                            </Button>
                        </View>
                        <View marginTop={0} height={verticalScale(20)} />
                    </View>
                    <View style={{ justifyContent: "center", flex: 0.1 }}>
                        <Button
                            full
                            onPress={() => {
                                this.updateLanguage()

                            }}
                            style={{ backgroundColor: mainColor, borderRadius: 5, height: verticalScale(35) }}>
                            {this.state.addingAddress ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Text
                                    style={{
                                        fontSize: scale(16),
                                        color: "white",
                                        fontFamily: "Poppins-SemiBold"
                                    }}>
                                    {strings("Update_Language")}
                                </Text>
                            )}
                        </Button>
                    </View>
                    <View marginTop={0} height={verticalScale(10)} />
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
export default connect(MapStateToProps, { setUser })(changeLanguage);
