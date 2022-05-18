import React, { Component } from "react";
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
} from "react-native";

const { height, width } = Dimensions.get("window");
import { verticalScale, scale } from "../components/helper/scaling";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { connect } from "react-redux";
import { setUser } from "../redux/actions/index";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
// import firebase from '@react-native-firebase/app'
import { Button, Form, Item as FormItem, Input, Label } from "native-base";
import { mainColor } from "../components/helper/colors";
import { Header } from "react-native-elements";
import { strings, selection } from '../../locales/i18n';
class GoogleAddress extends React.Component {
    constructor(props) {
        super(props);
        const { param } = this.props.navigation.state.params;
        this.state = {
            newAddressValue: {
                latitude: 0,
                longitude: 0,
                name: "",
            },
        };
    }

    // check different firestore methods
    componentDidMount = () => {
        // fetching all categories
    };
    componentWillMount() {
        //   listner for did focus
        this.subs = [
            this.props.navigation.addListener("didFocus", this.componentDidFocus),
        ];
    }
    componentWillUnmount() {
        this.subs.forEach((sub) => sub.remove());
    }
    render() {
        return (
            <View style={{ flex: 1, paddingBottom: verticalScale(12) }}>
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
                    centerComponent={
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Select_Address")}</Text>
                        </View>
                    }
                />
                <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                    <Form>
                        <View style={{ padding: scale(12) }}>
                            {/* <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>Select Address</Text> */}
                            {/* <View marginTop={0} height={verticalScale(10)} /> */}
                            <GooglePlacesAutocomplete
                                placeholder={strings("Search_Location")}
                                onPress={(data, details = null) => {
                                    // 'details' is provided when fetchDetails = true
                                    console.log("dd");
                                    console.log("dddddddddddd", details.name);
                                    let newAddressData = {
                                        latitude: details.geometry.location.lat,
                                        longitude: details.geometry.location.lng,
                                        name: details.formatted_address,
                                    };

                                    let initialRegion = {
                                        latitude: details.geometry.location.lat,
                                        longitude: details.geometry.location.lng,
                                        latitudeDelta: 0.0922,
                                        longitudeDelta: 0.0421,
                                    };
                                    this.setState({
                                        newAddressValue: newAddressData,
                                        latitude: details.geometry.location.lat,
                                        longitude: details.geometry.location.lng,
                                        name: details.formatted_address,
                                        initialRegion: initialRegion,
                                    });
                                }}
                                autoFocus={false}
                                returnKeyType={"default"}
                                fetchDetails={true}
                                query={{
                                    key: "AIzaSyC0gFTTXNp535E2IxoCHW13LwLkXxDUybA",
                                    language: "en",
                                }}
                                styles={{
                                    textInputContainer: {
                                        backgroundColor: "rgba(0,0,0,0)",
                                        borderTopWidth: 0,
                                        borderBottomWidth: 0,
                                    },
                                    textInput: {
                                        marginLeft: 0, 
                                        includeFontPadding: false,
                                        marginRight: 0,
                                        height: scale(35),
                                        color: "#242424",
                                        fontSize: scale(13),
                                        borderColor: "gray",
                                        borderWidth: 0.5,
                                        fontFamily: "Poppins-SemiBold"
                                    },
                                    listView: {
                                        backgroundColor: "lightgray",
                                    },
                                }}
                            // renderRow={(rowData) => {
                            //     const title = rowData.structured_formatting.main_text;
                            //     const address = rowData.structured_formatting.secondary_text;
                            //     return (
                            //         <View>
                            //             <Text style={{ fontSize: 14, color: "white" }}>{title}</Text>
                            //             <Text style={{ fontSize: 14 }}>{address}</Text>
                            //         </View>
                            //     );
                            // }}
                            />
                        </View>
                    </Form>
                </KeyboardAwareScrollView>
                <View
                    style={{
                        paddingBottom: verticalScale(6),
                        marginHorizontal: scale(12),
                    }}>
                    <View>
                        <Button
                            full
                            style={{ backgroundColor: mainColor, borderRadius: 5, height: verticalScale(35) }}
                            onPress={() => {
                                if (this.state.newAddressValue.name == "") {
                                    Alert.alert(strings("Please_select_address"))
                                }
                                else {
                                    this.props.navigation.state.params.personalInformation.GetAddress(this.state.newAddressValue);
                                    this.props.navigation.pop()
                                }
                            }}>
                            <Text
                                style={{
                                    fontSize: scale(16),
                                    color: "white",
                                    fontFamily: "Poppins-SemiBold"
                                }}>
                                {strings("Add_Address")}
                            </Text>
                        </Button>
                    </View>
                    <View height={verticalScale(10)} />
                    <View>
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
                                this.props.navigation.goBack();
                            }}>
                            <Text style={{ fontSize: scale(16), fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>{strings("Cancel")}</Text>
                        </Button>
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

export default connect(MapStateToProps, { setUser })(GoogleAddress);
