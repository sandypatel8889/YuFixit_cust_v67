import React, { Component } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Linking
} from "react-native";
import { Button } from "native-base";
import { Header, Avatar } from "react-native-elements";
import Modal from "react-native-modal";
import Icon from "react-native-vector-icons/FontAwesome";
import Icon1 from "react-native-vector-icons/Feather";
import { verticalScale, scale, moderateScale } from "../components/helper/scaling";
import Play from "../../assets/play.png";
import { mainColor } from "../components/helper/colors";
import VideoPlayer from "../components/common/videoPlayer";
import VideoPlayerNew from "../components/common/VideoPlayerNew";
import MyStorage from "../components/helper/MyStorage";
import MainButton from "../components/helper/mainButton";
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import {
  getProviders, _getNearbyProviders, notifyUser,
  addNotification,
  fetchCustomerId,
  getPhoneByID,
  getUserByID
} from "../components/helper/firestoreHandler";
import {
  fetchinvites,
  fetchChats
} from "../util/firestoreHandler";
import { Alert } from "react-native";
import { LayoutAnimation } from "react-native";
import ExpandableComponent from "../components/common/ExpandableComponent";
import { connect } from "react-redux";
import { Platform } from "react-native";
import { StackActions, NavigationActions } from 'react-navigation';
const { height, width } = Dimensions.get("window");
import { ImageViewer } from "react-native-image-zoom-viewer";
import { strings, selection } from '../../locales/i18n';
let skillDetails

// export default class ProviderProfile extends React.Component {
class ProviderProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showVideoModal: false,
      favouriteProvider: false,
      ageold: "N/A",
      isInternetAvilable: true,
      isActive: null,
      categories: [],
      address: [],
      isopenimage: false,
      selectedImage: "",
      DOB: "",
      isVisibleCall: false,
      arrMutualFriends: [],
      isViewall: false,
      ViewAllTitle: strings("View_All")
    };

    skillDetails = props.navigation.state.params.data.skills.details
    if (this.props.navigation.state.params.data.personalInfo.dob) {
      try {
        let dateofbirth = new Date(this.props.navigation.state.params.data.personalInfo.dob.toDate()).toDateString()
        var today = new Date();
        var birthDate = new Date(dateofbirth);  // create a date object directly from `dob1` argument
        var age_now = today.getFullYear() - birthDate.getFullYear();
        setTimeout(() => { this.setState({ ageold: age_now }) }, 2000)
      }
      catch {
      }
    }
  }


  //   setting the favourite providers in asyncstorage
  setFavouriteProvider = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }

    this.setState({
      favouriteProvider: true,
    });
    let newArray = [];
    setTimeout(() => {
      new MyStorage().getFavouriteProviderData().then((data) => {
        if (data) {
          let newData = JSON.parse(data);
          let filterProvider = newData.filter((item) => {
            return item.id != this.props.navigation.state.params.data.id;
          });
          newArray.push(
            filterProvider,
            this.props.navigation.state.params.data
          );
          let allFavouriteProvider = newArray.flat();
          new MyStorage().setFavouriteProviderData(
            JSON.stringify(allFavouriteProvider)
          );
          return;
        } else {
          newArray.push(this.props.navigation.state.params.data);
          new MyStorage().setFavouriteProviderData(
            JSON.stringify(newArray.flat())
          );
        }
      });
    }, 2000);
  };
  getAllProviders = () => {
    getProviders()
      .then((res) => {
        let providers = res.docs.map((item) => {
          return { ...item.data(), id: item.id };
        });

        let arrnew = []
        for (let i = 0; i < providers.length; i++) {
          if (providers[i].id == this.props.navigation.state.params.data.id) {
            let pnew = providers[i]
            this.setState({ isActive: pnew.isActive });
          }
        }

        var arrMutualFriends = [];
        fetchChats(this.props.navigation.state.params.data.id).then(chats => {
          for (let i = 0; i < chats.length; i++) {
            let chat = chats[i].split("/");
            let chatId = chat[1];
            fetchCustomerId(chatId).then(customerId => {
              getPhoneByID(customerId).then(phoneNumber => {
                let phone = phoneNumber;
              fetchinvites(this.props.userData.id).then(invites => {
               let find = invites.includes(phone);
               if(!find){
                console.log("not mutual");
               }else {
                getUserByID(customerId).then(snapshot => {
                  let user = snapshot.data();
                  arrMutualFriends.push(user);
                  this.setState({ arrMutualFriends: arrMutualFriends });
                  console.warn("mutual found!");
                }).catch(err => {
                  //Alert.alert(strings("Error"), strings("Error_Something_went"));
                   
                  console.error("could not fetch user as mutual friend" + err);

                });
               }
                 }).catch(err => {
                 //Alert.alert(strings("Error"), strings("Error_Something_went"));
                   
                  console.error("could not fetch invites from customer Id" + err);

                 });
                }).catch(err => {
                 //Alert.alert(strings("Error"),strings("Error_Something_went"));
                 console.error("could not fetch phone from customer Id" + err);

                });
              }).catch(err => {
                //Alert.alert(strings("Error"), strings("Error_Something_went"));
                console.error("could not fetch customer Id from chat key" + err);

              });
            }
          }).catch(err => {
            //Alert.alert(strings("Error"), strings("Error_Something_went"));
            console.error("could not fetch chats from provider Id" + err);

            });
      });
  }
  findArrayElementByTitle(array, title) {
    return array.find((element) => {
      return element === title;
    })
  }
  sortcategory(category) {
    category.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      .map((item, i) => console.log("data", item));
    return category
  }

  componentDidMount = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
    });
    if (this.props.navigation.state.params.data.personalInfo.dob) {
      let dateofbirth = new Date(this.props.navigation.state.params.data.personalInfo.dob.toDate()).toDateString()
      var formattedDate = moment(dateofbirth).format("DD-MM-YYYY")
      this.setState({
        DOB: formattedDate + ''
      });
    }
    this.setState({
      categories: this.sortcategory(this.props.navigation.state.params.data.services),
      address: this.props.navigation.state.params.data.addresses
    })
    this.getAllProviders()
    //   getting the favourite provider from asynstorage
    new MyStorage().getFavouriteProviderData().then((data) => {
      if (data) {
        let newData = JSON.parse(data);
        newData.map((item) => {
          if (item.id == this.props.navigation.state.params.data.id) {
            this.setState({
              favouriteProvider: true,
            });
          }
        });
      } else {
        this.setState({
          favouriteProvider: false,
        });
      }
    });


    let date1 = new Date();
    date1.setDate(date1.getDate() - 1);
    let Expiry = this.props.navigation.state.params.data.Expirydate_call ? this.props.navigation.state.params.data.Expirydate_call : date1

    var CallExpiryDate = Expiry;
    var CurrentDate = new Date();
    CallExpiryDate = new Date(CallExpiryDate);

    if (CallExpiryDate > CurrentDate) {
      this.setState({
        isVisibleCall: true
      })

    } else {
      this.setState({
        isVisibleCall: false
      })
    }
  };

  //   showing videos
  renderVideos = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.openModal(item);
        }}
        style={{ flex: 1 }}>
        <View
          style={{
            borderColor: "gray",
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#F4F4F4",
            marginRight: 10
          }}
        >
          <Image
            style={{ height: verticalScale(60), width: scale(100), tintColor: "#B5B5B5" }}
            resizeMode={"contain"}
            source={Play}
          />
        </View>
      </TouchableOpacity>
    );
  };
  ViewImage(item) {
    this.setState({
      isopenimage: true,
      selectedImage: item
    })
  }
  renderImages = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.ViewImage(item)
        }}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingRight: scale(12),
        }}
      >
        <View
          style={{
            backgroundColor: "white", margin: 5, borderRadius: 10, ...Platform.select({
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
          }}
        >
          <ImageBackground
            style={{
              height: scale(75), width: scale(75)
            }}
            imageStyle={{ borderRadius: 10 }}
            resizeMode={"stretch"}
            source={
              require('../../assets/icon.png')
            }>


            <Image
              resizeMode={"stretch"}
              style={{
                height: scale(75), width: scale(75), borderRadius: 10, ...Platform.select({
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
              source={{ uri: item }}
            />
          </ImageBackground>

        </View>
      </TouchableOpacity>
    );
  };

  //   open modal for video player
  openModal = (item) => {
    // debugger
    console.log("here iam in modal");
    this.setState({
      videoUrl: item,
      showVideoModal: true,
    });
  };
  // video player modal
  showVideoModal = () => {
    return (
      <Modal
        style={{
          alignSelf: "center",
          maxHeight: "100%",
          marginHorizontal: scale(5),
        }}
        width="auto"
        height="100%"
        transparent={true}
        animationInTiming={500}
        animationOutTiming={500}
        isVisible={this.state.showVideoModal}
      >
        <View
          style={{
            // flex: 1,
            backgroundColor: "white",
            borderRadius: 10,
            height: "95%"
          }}>
          <View
            style={{
              flex: 0.3,
              flexDirection: "row",
              width: "100%",
              backgroundColor: mainColor,
              justifyContent: "flex-end",
              paddingBottom: verticalScale(6),
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10
            }}
          >
            <View style={{ flex: 0.2 }}></View>
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: scale(18),
                  fontFamily: "Poppins-SemiBold",
                  color: "white",
                  alignSelf: "center",
                  paddingHorizontal: scale(32),
                  textAlign: "center",
                }}
              >
                {strings("VIDEO_PLAYER")}
              </Text>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: 5,

              }}>
              <Icon1
                onPress={() => {
                  this.setState({
                    showVideoModal: false,
                  });
                }}
                type="feather"
                size={verticalScale(25)}
                name="x"
                style={{ color: "white" }}
              />
            </View>
          </View>
          <View style={{ flex: 3 }}>
            {Platform.OS == "android" ? <VideoPlayer videoUrl={this.state.videoUrl} /> : <VideoPlayerNew videoUrl={this.state.videoUrl} />}
          </View>
        </View>
      </Modal>
    );
  };

  updateLayout = index => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const array = [...this.state.categories];
    array[index]['isExpanded'] = !array[index]['isExpanded'];
    this.setState(() => {
      return {
        categories: array,
      };
    });
  };

  //   render service
  renderServices = ({ item, index }) => {
    return (
      <>
        <ExpandableComponent
          key={index}
          item={item}
          onClickFunction={this.updateLayout.bind(this, index)}
          editMode={false}
          IsMain={false}
        />
      </>
    );
  };
  renderCategories = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.GotoProviderProfile(item);
        }}
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          paddingHorizontal: scale(5),
          // backgroundColor: "green"
        }}>
        <View>
          <ImageBackground
            style={{
              height: verticalScale(66), width: verticalScale(66)
            }}
            imageStyle={{ borderRadius: verticalScale(33) }}
            source={
              require("../../assets/icon.png")
            }>
            <Image
              style={{
                height: verticalScale(66), width: verticalScale(66), borderRadius: verticalScale(33)
              }}
              source={{
                uri: item.personalInfo ? item.personalInfo.profileUrl : item.profileUrl
              }}
            />
          </ImageBackground>
          <View alignItems="flex-end" position="absolute" height={verticalScale(50)} width={verticalScale(50)}>
            <View height={verticalScale(10)} width={verticalScale(10)} borderRadius={verticalScale(5)} backgroundColor={item.isActive ? "#24CE40" : "gray"} justifyContent="center" alignItems="center">
            </View>
          </View>
        </View>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingTop: verticalScale(4),
            // backgroundColor: "red"
          }}>
          <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: mainColor }}>{item.name ? item.name : "N/A"}</Text>
          {/* {item.addresses ? <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{this.getDistanceFromLatLonInKm(item.addresses) + strings("mile_away")}
          </Text> : <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Regular", color: "#B5B5B5" }}>{strings("mile_away1")}</Text>} */}
        </View>
      </TouchableOpacity>
    );
  };

  renderProfileAddressData = ({ item, index }) => {
    // debugger
    return (
      <View style={{ backgroundColor: "#F4F4F4", flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 10, marginTop: 5 }}>
        <View style={{ flex: 1 }}>
          {item.name ? <View>
            <Text style={{ color: '#B5B5B5', fontSize: scale(11), fontFamily: "Poppins-Medium" }}>
              {item.name}
            </Text>
          </View>
            :
            null
          }
          {item.value ? <View>
            <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
              {item.value.name}
            </Text>
          </View>
            :
            null}
          {item.value1 ? <View>
            <Text style={{ fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
              {item.value1}
            </Text>
          </View>
            :
            null}
        </View>
      </View>)
  };
  // showing user profile sec
  renderUserProfile = () => {
    return (
      <View
        style={{
          // flex: 1,
          backgroundColor: "clear",
          alignItems: "center",
          justifyContent: "center"
        }}>

        <View style={{ alignItems: "center" }}>
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
              <Image
                style={{
                  height: verticalScale(90), width: verticalScale(90), borderRadius: verticalScale(45), borderColor: "white", borderWidth: verticalScale(2)
                }}
                source={{ uri: this.props.navigation.state.params.data.personalInfo ? this.props.navigation.state.params.data.personalInfo.profileUrl : this.props.navigation.state.params.data.profileUrl }}
              />
            </ImageBackground>
            <View position="absolute" alignItems="flex-end" height={verticalScale(90)} width={verticalScale(90)}>
              <View height={verticalScale(24)} width={verticalScale(24)} borderRadius={verticalScale(12)} justifyContent="center" alignItems="center">
                <View height={verticalScale(15)} width={verticalScale(15)} borderRadius={verticalScale(7.5)} backgroundColor={this.state.isActive ? "#24CE40" : "gray"} justifyContent="center" alignItems="center">
                </View>
              </View>
            </View>
          </View>

        </View>
        <View marginTop={0} height={verticalScale(10)} />
      </View>
    );
  };

  NotifyProvider() {
    let provider = this.props.navigation.state.params.data;
    let deviceToken = provider.deviceToken
    let title = this.props.userData.name + " wants to connect with you. can you please subscribe for continues using chat services"
    if (deviceToken) {
      console.log("deviceToken: ", deviceToken)
      let tokens = [];
      tokens.push(deviceToken)
      // notifyUser(tokens, title, msg)
      notifyUser(tokens, "Enable your subscription.", title)
    }

    let uniqueKey = provider.email + "_" + this.props.userData.email
    console.log("uniqueKey: ", uniqueKey)
    let notifData = {
      to: provider.id,
      body: title + " - " + "",
      badge: '1',
      sound: 'default',
      booking: {
        update_at: parseInt(new Date().getTime() / 1000),
        customerProfileUrl: this.props.userData.profileUrl,
        chatKey: "",
        sender_id: "",
        notifyUser: true
      }
    }
    addNotification(uniqueKey, notifData)
  }
  sendSMStoProvider() {
    let provider = this.props.navigation.state.params.data;
    if (provider.mobileNumber == "" || !provider.mobileNumber) {
      return
    }
    // let title = this.props.userData.name + " is trying to request your repairs services via let’s chat and your let’s chat function is currently disabled. Please click on link below to return back to YUFixit Pro and enable your subscription to allows customers to contact you via let’s chat.\nAndroid: https://bit.ly/3lkETrM \niOS: https://bit.ly/3zase0x"
    let title = this.props.userData.name + " is trying to request your repairs services via let’s chat and your let’s chat function is currently disabled. Please click on link below to return back to YUFixit Pro and enable your subscription to allows customers to contact you via let’s chat.\nhttps://bit.ly/3zase0x"
    let details = {
      'Body': title,
      'From': '+16237772298',
      'To': provider.mobileNumber,
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
      console.log(response)
    }).catch(error => {
      console.error(error);
    })
  }
  redirectChatHistory() {
    let date1 = new Date();
    date1.setDate(date1.getDate() - 1);
    let Expiry = this.props.navigation.state.params.data.Expirydate ? this.props.navigation.state.params.data.Expirydate : date1

    var ChatExpiryDate = Expiry;
    var CurrentDate = new Date();
    ChatExpiryDate = new Date(ChatExpiryDate);

    if (ChatExpiryDate > CurrentDate) {
      this.props.navigation.navigate("ChatMessage", {
        data: this.props.navigation.state.params.data,
      });
    } else {
      this.NotifyProvider()
      this.sendSMStoProvider()
      Alert.alert("", strings("Chat_Disable"))
    }
  }
  getDistanceFromLatLonInKm(address) {
    if (address.length > 0) {
      let lat1 = this.props.navigation.state.params.latitude;
      let lon1 = this.props.navigation.state.params.longitude;


      let lat2 = address[0].value.latitude;
      let lon2 = address[0].value.longitude;

      var R = 6371; // Radius of the earth in km
      var dLat = this.deg2rad(lat2 - lat1);  // deg2rad below
      var dLon = this.deg2rad(lon2 - lon1);
      var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = parseInt(R * c * 0.621371)
      return d;

    }
    else {
      return "N/A"
    }
  }
  deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
  openSocialeMediaLink(url) {
    try { // statements to try
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert(strings("invalid_link"))
        }
      });
    }
    catch (e) {
    }
  }
  GotoProviderProfile(item) {
    this.props.navigation.push("ProviderProfile", { data: item, latitude: this.props.navigation.state.params.latitude, longitude: this.props.navigation.state.params.longitude });
  }
  ViewAll() {
    if (this.state.isViewall) {
      this.setState({
        isViewall: false,
        ViewAllTitle: strings("View_All")
      })
    }
    else {
      this.setState({
        isViewall: true,
        ViewAllTitle: strings("hide")
      })
    }

  }
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground
          style={{
            flex: 1
          }}
          source={
            require('../../assets/profile_bg.png')
          }>
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
            leftComponent={
              <Icon1
                onPress={() => {
                  this.props.navigation.goBack();
                }}
                type="FontAwesome"
                size={30}
                name="chevron-left"
                color={"white"}
              />}
          />
          {this.showVideoModal()}
          <View style={{ flex: 1 }}>
            <View marginTop={0} height={verticalScale(20)} />
            {this.renderUserProfile()}
            <ScrollView backgroundColor="clear">
              <View margin={moderateScale(10)}>
                <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                  backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                    ios: {
                      shadowColor: 'gray',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.8,
                      shadowRadius: 1,

                    },
                    android: {
                      elevation: 5,
                    },
                  }),
                }}>
                  <View flex={1}>
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("Name")}
                    </Text>
                    <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                      {this.props.navigation.state.params.data.name == "" ? "N/A" : this.props.navigation.state.params.data.name}
                    </Text>
                  </View>
                </View>

                <View marginTop={0} height={verticalScale(10)} />


                {this.state.isVisibleCall ? <View>
                  <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                    backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                      ios: {
                        shadowColor: 'gray',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.8,
                        shadowRadius: 1,

                      },
                      android: {
                        elevation: 5,
                      },
                    }),
                  }}>
                    <View flex={1}>
                      <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                        {strings("TEL")}
                      </Text>
                      <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                        {this.props.navigation.state.params.data.mobileNumber ? this.props.navigation.state.params.data.mobileNumber : "N/A"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(`tel:${this.props.navigation.state.params.data.mobileNumber}`)
                      }}>
                      <Icon1 active size={30} color={mainColor} name="phone" />
                    </TouchableOpacity>
                  </View>
                  <View marginTop={0} height={verticalScale(10)} />
                </View> : console.log("")}



                <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                  backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                    ios: {
                      shadowColor: 'gray',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.8,
                      shadowRadius: 1,

                    },
                    android: {
                      elevation: 5,
                    },
                  }),
                }}>
                  <View flex={1}>
                    <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                      {strings("EMAIL")}
                    </Text>
                    <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                      {this.props.navigation.state.params.data.email}
                    </Text>
                  </View>
                  {!this.props.userData.id ? <View style={{}}><TouchableOpacity
                    onPress={() => {
                      const resetAction = StackActions.reset({
                        index: 0,
                        actions: [NavigationActions.navigate({ routeName: 'Login' })],
                      });
                      this.props.navigation.dispatch(resetAction)
                    }}>
                    <Icon1 active size={30} color={mainColor} name="lock" /></TouchableOpacity>
                  </View> : console.log("")}
                  {/* <TouchableOpacity
                  onPress={() => {

                  }}>
                  <View height={verticalScale(16)} width={verticalScale(16)} borderRadius={verticalScale(8)} backgroundColor="#F4F4F4" justifyContent="center" alignItems="center">
                    <Image source={require('../../assets/edit1.png')} style={{ height: verticalScale(8), width: verticalScale(8) }} />
                  </View>
                </TouchableOpacity> */}
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                {this.state.DOB == "" ? console.log("") :
                  <View>
                    <View height={moderateScale(45)} flexDirection="row" justifyContent="space-between" alignItems="center" style={{
                      backgroundColor: "white", padding: 10, borderRadius: 5, ...Platform.select({
                        ios: {
                          shadowColor: 'gray',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.8,
                          shadowRadius: 1,

                        },
                        android: {
                          elevation: 5,
                        },
                      }),
                    }}>
                      <View flex={1}>
                        <Text style={{ fontSize: scale(12), color: "#B5B5B5", fontFamily: "Poppins-SemiBold" }}>
                          {strings("Birthdate")}
                        </Text>
                        <Text style={{ fontSize: scale(12), color: "#242424", fontFamily: "Poppins-SemiBold" }}>
                          {this.state.DOB}
                        </Text>
                      </View>
                    </View>
                    <View marginTop={0} height={verticalScale(10)} />
                  </View>
                }

                <View style={{
                  backgroundColor: "white", borderRadius: 5, ...Platform.select({
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
                }}>
                  <View
                    style={{
                      flexDirection: "row",
                      paddingVertical: verticalScale(15),
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "white",
                      borderRadius: 5
                    }}>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                      }}>
                      <Text style={{ fontSize: scale(13), fontFamily: "Poppins-SemiBold" }}>
                        {this.props.navigation.state.params.data && this.props.navigation.state.params.data.chats ? this.props.navigation.state.params.data.chats.length + '' : 0}
                      </Text>
                      <Text style={{ textAlign: "center", fontSize: scale(12), fontFamily: "Poppins-Medium", color: "#B5B5B5" }}>{strings("Chats_Engaged")}</Text>
                    </View>
                    <View justifyContent="center" alignItems="center" height={"75%"} backgroundColor="#0000001A" width={1}>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                      }}>
                      <View flexDirection="row" justifyContent="center" alignItems="center">
                        <Image source={require('../../assets/star.png')} style={{ height: moderateScale(15), width: moderateScale(15) }} />
                        <Text style={{ fontSize: scale(13), marginLeft: scale(5), fontFamily: "Poppins-SemiBold", }}>
                          {this.props.navigation.state.params.data.ratings ? (this.props.navigation.state.params.data.ratings.reduce((a, b) => a + b, 0) / this.props.navigation.state.params.data.ratings.length).toFixed(1) : "0"}
                        </Text>
                      </View>
                      <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Medium", color: "#B5B5B5" }}>{strings("Rating")}</Text>
                    </View>
                    <View justifyContent="center" alignItems="center" height={"75%"} backgroundColor="#0000001A" width={1}>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                      }}>
                      <Text style={{ fontSize: scale(13), fontFamily: "Poppins-SemiBold", }}>
                        {this.state.ageold}
                      </Text>
                      <Text style={{ fontSize: scale(12), fontFamily: "Poppins-Medium", color: "#B5B5B5" }}>{strings("Yrs old")}</Text>
                    </View>
                  </View>

                  {(this.state.arrMutualFriends && this.state.arrMutualFriends.length > 0) ? <View backgroundColor="white" style={{ justifyContent: "center", flexDirection: "row", borderRadius: 5, margin: 10 }}>
                    <TouchableOpacity
                      onPress={() => this.GotoProviderProfile(this.state.arrMutualFriends[0])}>
                      <ImageBackground
                        style={{
                          height: verticalScale(30), width: verticalScale(30)
                        }}
                        imageStyle={{ borderRadius: verticalScale(15) }}
                        source={
                          require('../../assets/icon.png')
                        }>
                        <Image
                          style={{
                            height: verticalScale(30), width: verticalScale(30), borderRadius: verticalScale(15)
                          }}
                          source={{ uri: this.state.arrMutualFriends[0].personalInfo ? this.state.arrMutualFriends[0].personalInfo.profileUrl : this.state.arrMutualFriends[0].profileUrl }}
                        />
                      </ImageBackground>
                    </TouchableOpacity>
                    <View marginTop={0} width={verticalScale(5)} />

                    {this.state.arrMutualFriends.length > 1 ?
                      <TouchableOpacity
                        onPress={() => this.GotoProviderProfile(this.state.arrMutualFriends[1])}>
                        <ImageBackground
                          style={{
                            height: verticalScale(30), width: verticalScale(30)
                          }}
                          imageStyle={{ borderRadius: verticalScale(15) }}
                          source={
                            require('../../assets/icon.png')
                          }>
                          <Image
                            style={{
                              height: verticalScale(30), width: verticalScale(30), borderRadius: verticalScale(15)
                            }}
                            source={{ uri: this.state.arrMutualFriends[1].personalInfo ? this.state.arrMutualFriends[1].personalInfo.profileUrl : this.state.arrMutualFriends[1].profileUrl }}
                          />
                        </ImageBackground>
                      </TouchableOpacity> : console.log("")}

                    <View width={"70%"}>
                      <Text style={{ marginLeft: 5, fontSize: scale(12), fontFamily: "Poppins-SemiBold" }}>{this.state.arrMutualFriends.length + '' + strings("Mutual_friend")}</Text>
                      {this.state.arrMutualFriends.length > 2 ? <Text numberOfLines={2} ellipsizeMode='tail' style={{ marginLeft: 5, fontSize: scale(12), fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>{this.state.arrMutualFriends[0].name + strings("and") + this.state.arrMutualFriends[1].name + strings("and") + (this.state.arrMutualFriends.length - 2) + '' + strings("Others")}</Text> : this.state.arrMutualFriends.length > 1 ? <Text style={{ marginLeft: 5, fontSize: scale(12), fontFamily: "Poppins-SemiBold", color: "#B5B5B5" }}>{this.state.arrMutualFriends[0].name + strings("and") + this.state.arrMutualFriends[1].name + "."}</Text> : <Text style={{ marginLeft: 5, fontSize: scale(12), fontFamily: "Poppins-Medium", color: "#B5B5B5" }}>{this.state.arrMutualFriends[0].name + "."}</Text>}
                      {this.state.arrMutualFriends.length > 2 ? <TouchableOpacity
                        onPress={() => this.ViewAll()}><Text numberOfLines={2} ellipsizeMode='tail' style={{ textDecorationLine: 'underline', marginLeft: 5, fontSize: scale(12), fontFamily: "Poppins-SemiBold" }}>{this.state.ViewAllTitle}</Text></TouchableOpacity> : console.log("")}
                    </View>
                  </View> : console.log("")}
                  {this.state.isViewall ? <View padding={scale(5)}>
                    <FlatList
                      showsHorizontalScrollIndicator={false}
                      horizontal
                      data={this.state.arrMutualFriends}
                      renderItem={this.renderCategories}
                      contentContainerStyle={{ flexGrow: 1 }}
                    />
                  </View> : console.log("")}
                </View>
              </View>
              <View style={{ paddingHorizontal: scale(12) }}>
                {skillDetails ?
                  <View
                    style={{
                      flex: 1,
                      marginTop: scale(10),
                    }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: scale(12),
                        fontFamily: "Poppins-SemiBold",
                      }}
                    >
                      {strings("Skill_Details1")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />

                    <TouchableOpacity
                      onPress={() => Alert.alert(strings("Skill_Details"), skillDetails)}>
                      <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F4F4F4", borderRadius: 10, paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
                        <Text numberOfLines={2} style={{ flex: 1, fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold", textAlign: "center" }}>
                          {skillDetails}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  : <View />}


                <View marginTop={0} height={verticalScale(10)} />
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: scale(12),
                        fontFamily: "Poppins-SemiBold",
                      }}
                    >
                      {"HOURLY RATE"}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F4F4F4", borderRadius: 10, padding: 10, height: verticalScale(40) }}>
                      <Text numberOfLines={2} style={{ flex: 1, fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold", textAlign: "center" }}>
                        {strings("Rate") + this.props.navigation.state.params.data.skills.hourlyRate.value}
                      </Text>
                    </View>
                  </View>
                  <View marginTop={0} width={verticalScale(10)} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: scale(12),
                        fontFamily: "Poppins-SemiBold",
                      }}>
                      {strings("COMPLETED")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F4F4F4", borderRadius: 10, padding: 10, height: verticalScale(40) }}>
                      <Text numberOfLines={2} style={{ flex: 1, fontSize: scale(13), color: "#242424", fontFamily: "Poppins-SemiBold", textAlign: "center" }}>
                        {this.props.navigation.state.params.data.completedWork ? this.props.navigation.state.params.data.completedWork : "N/A"} {strings("works")}
                      </Text>
                    </View>
                  </View>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: scale(12),
                        fontFamily: "Poppins-SemiBold",
                      }}
                    >
                      {strings("SERVICES_OFFERED")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <FlatList
                      data={this.state.categories}
                      renderItem={this.renderServices}
                      keyExtractor={(item, index) => index.toString()}
                      ListEmptyComponent={() => {
                        return (
                          <View style={{ flex: 1, alignItems: "center" }}>
                            <Text style={{ color: "gray", fontWeight: "bold" }}>
                              {strings("No_Services_Added")}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>


                <View marginTop={0} height={verticalScale(10)} />
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: scale(12),
                        fontFamily: "Poppins-SemiBold",
                      }}>
                      {strings("ADDRESS")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <FlatList
                      data={this.state.address}
                      renderItem={this.renderProfileAddressData}
                      keyExtractor={(item, index) => item.id}
                      ListEmptyComponent={() => {
                        return (
                          <View style={{ flex: 1, alignItems: "center" }}>
                            <Text style={{ color: "gray", fontWeight: "bold" }}>
                              {strings("No_Address")}
                            </Text>
                          </View>
                        );
                      }}
                    />
                  </View>
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                {this.props.navigation.state.params.data && (this.props.navigation.state.params.data.facebookLink || this.props.navigation.state.params.data.instaLink || this.props.navigation.state.params.data.twitterLink || this.props.navigation.state.params.data.tiktokLink) ? <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "black",
                      textAlign: "center",
                      fontSize: scale(12),
                      fontFamily: "Poppins-SemiBold",
                    }}>
                    {strings("SOCIAL_MEDIA")}
                  </Text>
                </View> : console.log("")}
                {this.props.navigation.state.params.data && (this.props.navigation.state.params.data.facebookLink || this.props.navigation.state.params.data.instaLink || this.props.navigation.state.params.data.twitterLink || this.props.navigation.state.params.data.tiktokLink) ? <View marginTop={0} height={verticalScale(10)} /> : console.log("")}
                <View flexDirection="row">
                  {this.props.navigation.state.params.data && this.props.navigation.state.params.data.facebookLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.navigation.state.params.data.facebookLink)}><Image source={require('../../assets/fb.png')} style={{ height: verticalScale(30), width: verticalScale(30) }} /></TouchableOpacity> : console.log("")}
                  {this.props.navigation.state.params.data && this.props.navigation.state.params.data.instaLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.navigation.state.params.data.instaLink)}><Image source={require('../../assets/insta.png')} style={{ height: verticalScale(30), width: verticalScale(30), marginLeft: moderateScale(15) }} /></TouchableOpacity> : console.log("")}
                  {this.props.navigation.state.params.data && this.props.navigation.state.params.data.twitterLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.navigation.state.params.data.twitterLink)}><Image source={require('../../assets/twitter.png')} style={{ height: verticalScale(30), width: verticalScale(30), marginLeft: moderateScale(15) }} /></TouchableOpacity> : console.log("")}
                  {this.props.navigation.state.params.data && this.props.navigation.state.params.data.tiktokLink ? <TouchableOpacity onPress={() => this.openSocialeMediaLink(this.props.navigation.state.params.data.tiktokLink)}><Image source={require('../../assets/tiktok.png')} style={{ height: verticalScale(30), width: verticalScale(30), marginLeft: moderateScale(15) }} /></TouchableOpacity> : console.log("")}
                </View>

                <View marginTop={0} height={verticalScale(20)} />
                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: scale(12),
                        fontFamily: "Poppins-SemiBold",
                      }}>
                      {strings("VIDEOS")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <View
                      style={{
                        // paddingLeft: verticalScale(3),
                        // paddingRight: verticalScale(3),
                        paddingVertical: verticalScale(6),
                      }}>
                      {this.props.navigation.state.params.data.videos && this.props.navigation.state.params.data.videos.length > 0 ? (
                        <FlatList
                          data={this.props.navigation.state.params.data.videos}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={this.renderVideos} />
                      ) : (
                        <Text style={{ textAlign: "center", margin: 5, fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#B5B5B5" }}>
                          {strings("no_video")}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "black",
                        textAlign: "center",
                        fontSize: scale(12),
                        fontFamily: "Poppins-SemiBold",
                      }}>
                      {strings("PICTURES")}
                    </Text>
                    <View marginTop={0} height={verticalScale(5)} />
                    <View
                      style={{
                        paddingVertical: verticalScale(6),
                      }}>
                      {this.props.navigation.state.params.data.images && this.props.navigation.state.params.data.images.length > 0 ? (
                        <FlatList
                          data={this.props.navigation.state.params.data.images}
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={this.renderImages} />
                      ) : (
                        <Text style={{ textAlign: "center", margin: 5, fontFamily: "Poppins-Regular", fontSize: scale(14), color: "#B5B5B5" }}>
                          {strings("no_pic")}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>


                <Modal
                  style={{ margin: 0 }}
                  animationType="slide"
                  transparent={true}
                  isVisible={this.state.isopenimage}
                  onRequestClose={() => {
                    this.setState({ isopenimage: !this.state.isopenimage });
                  }}>
                  <View style={{ flex: 1 }}>
                    <View backgroundColor="white" height={Dimensions.get('window').height} width={"100%"} borderRadius={5}>
                      <ImageViewer
                        backgroundColor="white"
                        style={{ height: "100%", width: "100%", resizeMode: "contain", backgroundColor: "white" }}
                        imageUrls={[{ url: this.state.selectedImage }]}
                        failImageSource={require('../../assets/picture.png')}
                        loadingRender={() => {
                          return (
                            <ActivityIndicator style={{ alignSelf: 'center', justifyContent: 'center', height: '100%' }} size="large" color={"gray"} />
                          )
                        }}
                        renderIndicator={(currentIndex, size) => <View />} />
                    </View>
                    <View marginTop={50} height={100} width={"95%"} margi justifyContent="center" alignItems="flex-end" borderRadius={5} position="absolute">
                      <Icon1
                        onPress={() => {
                          this.setState({
                            isopenimage: false,
                          });
                        }}
                        type="feather"
                        size={50}
                        name="x"
                        style={{ color: "black" }}
                      />
                    </View>
                  </View>
                </Modal>
              </View>
            </ScrollView>
          </View>
          <View style={{ backgroundColor: "white", alignItems: "center", opacity: 1.0, paddingHorizontal: scale(12) }}>
            <MainButton
              show_spinner={this.state.signin_in_progress}
              button_label={strings("Connect_with_Tech")}
              on_press={() => {
                if (this.props.userData.id) {
                  this.redirectChatHistory();
                }
                else {
                  const resetAction = StackActions.reset({
                    index: 0,
                    actions: [NavigationActions.navigate({ routeName: 'Login' })],
                  });
                  this.props.navigation.dispatch(resetAction)
                }
              }}
              text_style={{
                fontSize: scale(13),
              }}
              custom_style={{
                width: "100%",
                borderRadius: 5,
                height: verticalScale(35),
                marginVertical: verticalScale(12),

              }}
            />
          </View>
        </ImageBackground>
      </View>
    );
  }
}
const MapStateToProps = (state) => {
  return {
    userData: state.userData,
  };
};

export default connect(MapStateToProps, {})(ProviderProfile);