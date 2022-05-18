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
    Alert
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
import Modal from "react-native-modal";
import MyStorage from "../util/MyStorage";
import { strings, selection } from '../../locales/i18n';

class socialeMedia extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            uploading: false,
            isDialogOpen: false,
            txtValue: "",
            isEditValue: "",
            indexValue: 0
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
                            <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Link_Social_Media")}</Text>
                        </View>
                    }
                />



                <View style={{ paddingHorizontal: scale(12), flex: 1 }}>
                    <View flex={0.9}>
                        <Text style={{ textAlign: "center", margin: 5, fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#242424" }}>
                            {strings("Provide_Links")}
                        </Text>
                        {/* facebook */}
                        <View
                            style={{
                                backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: moderateScale(5), padding: moderateScale(5), borderRadius: 10, ...Platform.select({
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
                            <View width="70%">
                                <Text style={{ fontSize: scale(12), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#A2A2A2", fontFamily: "Poppins-SemiBold" }}>
                                    {strings("FACEBOOK")}
                                </Text>

                                {this.props.userData && this.props.userData.facebookLink ? <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    {this.props.userData.facebookLink}
                                </Text> : <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    @
                                </Text>}

                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isDialogOpen: true,
                                        txtValue: this.props.userData && this.props.userData.facebookLink ? this.props.userData.facebookLink : "@",
                                        isEditValue: "1",
                                    });
                                }}>
                                <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                                    <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                                </View>
                            </TouchableOpacity>
                        </View>


                        {/* instagram */}
                        <View
                            style={{
                                backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: moderateScale(5), padding: moderateScale(5), borderRadius: 10, ...Platform.select({
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
                            <View width="70%">
                                <Text style={{ fontSize: scale(12), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#A2A2A2", fontFamily: "Poppins-SemiBold" }}>
                                    {strings("INSTAGRAM")}
                                </Text>

                                {this.props.userData && this.props.userData.instaLink ? <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    {this.props.userData.instaLink}
                                </Text> : <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    @
                                </Text>}

                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isDialogOpen: true,
                                        txtValue: this.props.userData && this.props.userData.instaLink ? this.props.userData.instaLink : "@",
                                        isEditValue: "2",
                                    });
                                }}>
                                <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                                    <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* twitter */}
                        <View
                            style={{
                                backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: moderateScale(5), padding: moderateScale(5), borderRadius: 10, ...Platform.select({
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
                            <View width="70%">
                                <Text style={{ fontSize: scale(12), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#A2A2A2", fontFamily: "Poppins-SemiBold" }}>
                                    TWITTER
                                </Text>

                                {this.props.userData && this.props.userData.twitterLink ? <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    {this.props.userData.twitterLink}
                                </Text> : <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    @
                                </Text>}

                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isDialogOpen: true,
                                        txtValue: this.props.userData && this.props.userData.twitterLink ? this.props.userData.twitterLink : "@",
                                        isEditValue: "3",
                                    });
                                }}>
                                <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                                    <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Tiktok */}
                        <View
                            style={{
                                backgroundColor: "white", flexDirection: "row", alignItems: "center", justifyContent: "space-between", margin: moderateScale(5), padding: moderateScale(5), borderRadius: 10, ...Platform.select({
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
                            <View width="70%">
                                <Text style={{ fontSize: scale(12), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#A2A2A2", fontFamily: "Poppins-SemiBold" }}>
                                    TIKTOK
                                </Text>

                                {this.props.userData && this.props.userData.tiktokLink ? <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    {this.props.userData.tiktokLink}
                                </Text> : <Text style={{ fontSize: scale(14), paddingTop: moderateScale(2), paddingBottom: moderateScale(2), color: "#242424", fontFamily: "Poppins-Bold" }}>
                                    @
                                </Text>}

                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    this.setState({
                                        isDialogOpen: true,
                                        txtValue: this.props.userData && this.props.userData.tiktokLink ? this.props.userData.tiktokLink : "@",
                                        isEditValue: "4",
                                    });
                                }}>
                                <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                                    <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View marginTop={0} height={verticalScale(20)} />
                    </View>

                    <View style={{ justifyContent: "center", flex: 0.1 }}>
                        <Button
                            full
                            onPress={() => {
                                this.props.navigation.pop()
                            }}
                            disabled={this.state.addingAddress}
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
                                    {strings("Update_Links")}
                                </Text>
                            )}
                        </Button>
                    </View>
                    <View marginTop={0} height={verticalScale(10)} />
                    <Modal
                        animationType="slide"
                        transparent={true}
                        isVisible={this.state.isDialogOpen}>
                        <View
                            style={{
                                flex: 1,
                                justifyContent: "center",
                            }}>
                            <Form style={{ backgroundColor: "white", padding: 15, borderRadius: 10 }}>
                                <Text style={{ fontSize: scale(18), color: mainColor, fontFamily: "Poppins-SemiBold", textAlign: "center" }}>{strings("Sociale_Account")}</Text>
                                <View marginTop={0} height={verticalScale(10)} />
                                <View>
                                    <View height={verticalScale(35)} backgroundColor="#F4F4F4" borderRadius={5}>
                                        <TextInput
                                            style={{ height: verticalScale(35), includeFontPadding: false, color: "#242424", paddingLeft: scale(5) }}
                                            placeholder={strings("Enter_your_url")}
                                            value={this.state.txtValue}
                                            onChangeText={(txtValue) => this.setState({ txtValue: txtValue })}
                                            fontSize={scale(13)}
                                            returnKeyType='done'
                                            autoCorrect={false}
                                            fontFamily="Poppins-SemiBold"
                                        />
                                    </View>
                                    <View marginTop={0} height={verticalScale(10)} />
                                </View>
                                <View
                                    style={{
                                        // flexDirection: "row",
                                        height: verticalScale(90),
                                        marginTop: 10,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        // backgroundColor: "red"
                                    }}>
                                    <Button
                                        full
                                        style={{ backgroundColor: mainColor, borderRadius: 5, height: verticalScale(35) }}
                                        onPress={() => {
                                            if (this.state.txtValue !== "") {
                                                this.setState({
                                                    isDialogOpen: false
                                                });
                                                this.AddLink()
                                            } else {
                                                Alert.alert(strings("enter_url"))
                                            }
                                        }}>
                                        <Text
                                            style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: "white" }}>
                                            {strings("Submit")}
                                        </Text>
                                    </Button>
                                    <View height={verticalScale(10)} />
                                    <Button
                                        full
                                        style={{
                                            backgroundColor: "white",
                                            borderRadius: 5,
                                            borderWidth: 1,
                                            borderColor: "#B5B5B5",
                                            height: verticalScale(35)
                                        }}
                                        onPress={() => {
                                            this.setState({
                                                isDialogOpen: false
                                            });
                                        }}>
                                        <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>{strings("Cancel")}</Text>
                                    </Button>
                                </View>
                            </Form>
                            {/* </KeyboardAwareScrollView> */}
                        </View>
                    </Modal>
                </View>
            </View >
        );
    }
}
const MapStateToProps = (state) => {
    return {
        userData: state.userData,
    };
};
export default connect(MapStateToProps, { setUser })(socialeMedia);
