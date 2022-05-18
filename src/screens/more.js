import React, { Component } from "react";
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    Platform,
    ImageBackground,
    Linking
} from "react-native";
import { Header, Avatar, colors, CheckBox } from "react-native-elements";
const { height, width } = Dimensions.get("window");
import { verticalScale, scale, moderateScale } from "../components/helper/scaling";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import NetInfo from "@react-native-community/netinfo";
import { ScrollView } from "react-native";
import { strings} from '../../locales/i18n';

class more extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
        };
    }
    componentDidMount = () => {
        this.setState({ newName: this.props.userData ? this.props.userData.name : "" });
        // fetching all categories
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
    sendFeedback(){
        Linking.openURL('mailto:info@yufixit.com?subject=Regarding Feedback...&body=Hello yufixit\nHope you are fine!\n\n\n\n\n\n\n\n\n\n Thanks & Regards')
    }
    OpenURL(){
        Linking.openURL('https://www.google.co.in/')
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <ImageBackground style={{ flex: 1 }}
                    source={require('../../assets/profile_bg.png')}>
                    <Header
                        containerStyle={[{
                            alignItems: "center",
                            backgroundColor: "clear",
                            borderBottomColor: "clear",
                            borderBottomWidth: 0,
                            height: verticalScale(50)
                        }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
                        screenOptions={{
                            headerStyle: { elevation: 0 }
                        }}
                    />
                    <View marginTop={0} height={verticalScale(20)} />
                    <View
                        style={{
                            // flex: 1,
                            backgroundColor: "clear",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                        <View style={{ alignItems: "center" }}>
                            {/* <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isUploadImages: false
                                    })
                                    this.handlePictureUpload();
                                }}> */}
                                <View>
                                    <ImageBackground
                                        style={{
                                            height: verticalScale(90), width: verticalScale(90),
                                            ...Platform.select({
                                                ios: {
                                                    shadowColor: 'gray',
                                                    shadowOffset: { width: 0, height: 1 },
                                                    shadowOpacity: 0.8,
                                                    shadowRadius: 1,

                                                },
                                                android: {
                                                    elevation: 5,
                                                },
                                            })
                                        }}
                                        imageStyle={{ borderRadius: verticalScale(45), borderColor: "white", borderWidth: verticalScale(2) }}
                                        source={
                                            require('../../assets/icon.png')
                                        }>
                                        {this.props.userData.personalInfo ? <Image
                                            style={{
                                                height: verticalScale(90), width: verticalScale(90), borderRadius: verticalScale(45), borderColor: "white", borderWidth: verticalScale(2)
                                            }}
                                            source={{ uri: this.props.userData.personalInfo.profileUrl }}
                                        /> : <View></View>}
                                    </ImageBackground>
                                </View>
                            {/* </TouchableOpacity> */}
                        </View>
                        <Text style={{ fontSize: scale(25), fontFamily: "Poppins-Regular", marginRight: 5, color: "black" }}>
                            {this.props.userData.name}
                        </Text>
                    </View>
                    <View style={{ flex: 1.2, paddingHorizontal: scale(12) }}>
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            showsHorizontalScrollIndicator={false}>
                            <View marginTop={0} height={verticalScale(10)} />

                            <View margin={moderateScale(20)}>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("inviteContact")}>
                                    <Text style={{ fontSize: scale(14), paddingTop: moderateScale(15), paddingBottom: moderateScale(15), color: "#242424", fontFamily: "Poppins-Regular" }}>
                                        {strings("Invite_Friends")}
                                    </Text>
                                </TouchableOpacity>
                                <View height={1} width="100%" backgroundColor="#ECECEC">
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("socialeMedia")}>
                                    <Text style={{ fontSize: scale(14), paddingTop: moderateScale(15), paddingBottom: moderateScale(15), color: "#242424", fontFamily: "Poppins-Regular" }}>
                                        {strings("link_sociale")}
                                    </Text>
                                </TouchableOpacity>
                                <View height={1} width="100%" backgroundColor="#ECECEC">
                                </View>
                                <TouchableOpacity
                                    onPress={() => alert("Under Development")}>
                                    <Text style={{ fontSize: scale(14), paddingTop: moderateScale(15), paddingBottom: moderateScale(15), color: "#242424", fontFamily: "Poppins-Regular" }}>
                                        {strings("Preferences")}
                                    </Text>
                                </TouchableOpacity>
                                <View height={1} width="100%" backgroundColor="#ECECEC">
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate("changeLanguage")}>
                                    <Text style={{ fontSize: scale(14), paddingTop: moderateScale(15), paddingBottom: moderateScale(15), color: "#242424", fontFamily: "Poppins-Regular" }}>
                                        {strings("Change_Language")}
                                    </Text>
                                </TouchableOpacity>
                                <View height={1} width="100%" backgroundColor="#ECECEC">
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.sendFeedback()}>
                                    <Text style={{ fontSize: scale(14), paddingTop: moderateScale(15), paddingBottom: moderateScale(15), color: "#242424", fontFamily: "Poppins-Regular" }}>
                                        {strings("Feedback")}
                                    </Text>
                                </TouchableOpacity>
                                <View height={1} width="100%" backgroundColor="#ECECEC">
                                </View>
                                <TouchableOpacity
                                    onPress={() => alert("Under Development")}>
                                    <Text style={{ fontSize: scale(14), paddingTop: moderateScale(15), paddingBottom: moderateScale(15), color: "#242424", fontFamily: "Poppins-Regular" }}>
                                        {strings("Help")}
                                    </Text>
                                </TouchableOpacity>
                                <View height={1} width="100%" backgroundColor="#ECECEC">
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.OpenURL()}>
                                    <Text style={{ fontSize: scale(14), paddingTop: moderateScale(15), paddingBottom: moderateScale(15), color: "#242424", fontFamily: "Poppins-Regular" }}>
                                        {strings("About_App")}
                                    </Text>
                                </TouchableOpacity>
                                <View height={1} width="100%" backgroundColor="#ECECEC">
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </ImageBackground>
            </View >
        );
    }
}
const MapStateToProps = (state) => {
    return {
        userData: state.userData,
    };
};
export default connect(MapStateToProps, { setUser })(more);
