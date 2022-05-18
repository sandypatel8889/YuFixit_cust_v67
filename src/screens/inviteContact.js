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
    Switch,
    PermissionsAndroid
} from "react-native";
import {
    addinvites,
    handleEnableDisable
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
import Contacts from 'react-native-contacts';

import SearchBar from "../components/SearchBar";

class inviteContact extends React.Component {
    constructor(props) {
        super(props);
        this.search = this.search.bind(this);
        this.state = {
            searchPlaceholder: "Search",
            uploading: false,
            isDialogOpen: false,
            replyValue: "",
            isEdit: false,
            indexValue: 0,
            arrContact: [],
            InviteValues: ""
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
    search(text) {
        const phoneNumberRegex = /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[-\s\/\.0-9]{3,15}\b/m;
        const emailAddressRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
        if (text === "" || text === null) {
          this.loadContacts();
        } else if (phoneNumberRegex.test(text)) {
          Contacts.getContactsByPhoneNumber(text).then(contacts => {
            this.setState({ arrContact: contacts });
          });
        } else if (emailAddressRegex.test(text)) {
          Contacts.getContactsByEmailAddress(text).then(contacts => {
            this.setState({ arrContact: contacts });
          });
        } else {
          Contacts.getContactsMatchingString(text).then(contacts => {
            this.setState({ arrContact: contacts });
          });
        }
      }
    componentWillMount() {
        this.subs = [
            this.props.navigation.addListener("didFocus", this.componentDidFocus),
        ];
    }
    componentWillUnmount() {
        this.subs.forEach((sub) => sub.remove());
    }
    componentDidFocus = () => {

        if (Platform.OS === "android") {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
                title: "Contacts",
                message: "This app would like to view your contacts."
            }).then((status) => {
                console.log("permission:", status)
                this.loadContacts();
            }).catch((error) => {
                console.log("error:", error)
            });
        } else {
            this.loadContacts();
        }

    };

    loadContacts() {

        var contactArr = []
        Contacts.getAll().then(contacts => {
            contacts.sort((a, b) => a.givenName.localeCompare(b.givenName))
                .map((item, i) => console.log("data", item));
            contacts.map((item) => {
                if (item.phoneNumbers.length > 0) {
                    contactArr.push(item)
                }
            })
            this.setState({
                arrContact: contactArr
            })

        })
       /* Contacts.getCount().then(count => {
            this.setState({ searchPlaceholder: `Search ${count} contacts` });
          });
          */
    }

    renderSuggestion = ({ item, index }) => {
        return (
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
                <Text style={{ fontSize: scale(14), paddingTop: moderateScale(1), paddingBottom: moderateScale(1), color: "#242424", fontFamily: "Poppins-Regular", width: "70%" }}>
                    {item.givenName + " " + item.familyName + "\n" + item.phoneNumbers[0].number + ''}
                </Text>

                <TouchableOpacity
                    onPress={() => {
                        this.inviteAlert(item)
                    }}>
                    <View justifyContent="center" alignItems="center">
                        <Image source={require('../../assets/invitation.png')} style={{ height: verticalScale(30), width: verticalScale(30) }} />
                    </View>
                </TouchableOpacity>
            </View>

        );
    };
    inviteAlert(item) {
        Alert.alert("Invite",
            "Are you sure want to invite?",
            [
                {
                    text: strings("No"),
                    style: "cancel"
                },
                {
                    text: strings("Yes"),
                    onPress: () => {
                        this.storeInviteContact(item)
                    }
                }
            ])
    }
    sendSMStoInvite(item) {
        let title = this.props.userData.name + " is invited you to Check out Yufixit.\niOS: https://apple.co/3iDDJak \nAndroid: https://bit.ly/3Bl2H5B"
        let details = {
            'Body': title,
            'From': '+16237772298',
            'To': item.phoneNumbers[0].number,
        };

        let formBody = [];
        for (let property in details) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        fetch('https://api.twilio.com/2010-04-01/Accounts/AC33609ffe19b3b48e07816e9132a55847/Messages.json', {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Basic QUMzMzYwOWZmZTE5YjNiNDhlMDc4MTZlOTEzMmE1NTg0NzpkMmQ4NTNmZGMxZTgyMDA3YWQ0YTA5OWZjZTBmMDQ5OQ==',
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body: formBody,
        }).then(response => {
            console.log(response);
        }).catch(error => {
            console.error(error);
        })
    }
    storeInviteContact(item) {
        const number = item.phoneNumbers[0].number;
        console.log(this.props.userData.id)
        const mobile = number.replace(/ /g, '')
        let isplus = mobile.includes("+")
        var mobile_number = ""
        if (!isplus) {
            mobile_number = "+" + mobile
        }
        else {
            mobile_number = mobile
        }
        if (this.props.userData.invites) {
            let arrinvites = this.props.userData.invites

            let data = arrinvites.filter(function (item) {
                return item == mobile_number;
            }).map(function (item) {
                return item;
            });
            if (data.length == 0) {
                let invites = this.props.userData.invites
                    ? [...this.props.userData.invites, mobile_number]
                    : [mobile_number];
                let data = this.props.userData;
                data = { ...data, invites: invites }
                addinvites(this.props.userData.id, invites)
                    .then((res) => {
                        this.props.setUser(data);
                        new MyStorage().setUserData(JSON.stringify(data));
                        Alert.alert(strings("Invite"), strings("Invitation_Sent"));
                        this.sendSMStoInvite(item)
                    })
                    .catch((err) => {
                        console.log("err invite:", err)
                        Alert.alert(strings("Error"), strings("Error_Something_went"));
                    });
            }
            else {
                Alert.alert(strings("Invite"), strings("already_invited"));
            }
        }
        else {
            let invites = this.props.userData.invites
                ? [...this.props.userData.invites, mobile_number]
                : [mobile_number];
            let data = this.props.userData;
            data = { ...data, invites: invites }
            addinvites(this.props.userData.id, invites)
                .then((res) => {
                    this.props.setUser(data);
                    new MyStorage().setUserData(JSON.stringify(data));
                    Alert.alert(strings("Invite"), strings("Invitation_Sent"));
                    this.sendSMStoInvite(item)
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
                        /*<View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Invite_Friends")}</Text>
                        </View>*/
                        <SearchBar
                        searchPlaceholder={this.state.searchPlaceholder}
                        onChangeText={this.search}
                      />
                    }
                />
                <View style={{ paddingHorizontal: scale(12), flex: 1 }}>
                    <View style={{ flax: 1 }}>
                        {this.state.arrContact ? (
                            <FlatList
                                data={this.state.arrContact}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id}
                                renderItem={this.renderSuggestion}
                            />
                        ) : (
                            <Text style={{ textAlign: "center", margin: 5, fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#B5B5B5" }}>
                                {strings("no_reply")}
                            </Text>
                        )}

                        {/* <View marginTop={0} height={verticalScale(20)} /> */}
                    </View>
                    {/* <View marginTop={0} height={verticalScale(10)} />
                    <View style={{ justifyContent: "center", flex: 0.1 }}>
                        <Button
                            full
                            onPress={() => {
                                this.setState({
                                    isDialogOpen: true,
                                    replyValue: "",
                                    isEdit: false
                                });
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
                                    {strings("add_reply")}
                                </Text>
                            )}
                        </Button>
                    </View> */}
                    {/* <View marginTop={0} height={verticalScale(10)} /> */}
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
export default connect(MapStateToProps, { setUser })(inviteContact);
