import React, { Component, Fragment } from "react";
import {
  Platform,
  StyleSheet,
  Dimensions,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  ImageBackground,
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Image,
  AsyncStorage,
  PermissionsAndroid
} from "react-native";
// import Icon from 'react-native-vector-icons/Feather';
import { Header, Avatar, Icon } from "react-native-elements";
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { Switch, Button, Form } from "native-base";
import { moderateScale, scale, verticalScale } from "../components/helper/scaling";
import { connect } from "react-redux";
import MapScreen from "./mapScreen";
import Icon1 from "react-native-vector-icons/Feather";
import { ImageViewer } from "react-native-image-zoom-viewer";
import Modal1 from "react-native-modal";
import { mainColor } from "../components/helper/colors";
import { Rating, AirbnbRating } from 'react-native-ratings';
import {
  getChatKey,
  addChattings,
  sendMessageToProvider,
  addMessageMedia,
  getProviders,
  notifyUser,
  addNotification,
  addRating,
  findRatings
} from "../components/helper/firestoreHandler";
import database from "@react-native-firebase/database";
import { setUserFromLocal } from "../redux/actions/index";
import MyStorage from "../components/helper/MyStorage";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import Icon2 from "react-native-vector-icons/AntDesign";
import { AudioRecorder, AudioUtils } from "react-native-audio";
import VideoPlayer from "../components/common/videoPlayer";
import VideoPlayerNew from "../components/common/VideoPlayerNew";
import { v4 as uuidv4 } from "uuid";
const { height, width } = Dimensions.get("window");
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import Geolocation from "@react-native-community/geolocation";
import Geocoder from "react-native-geocoding";
Geocoder.init("AIzaSyC0gFTTXNp535E2IxoCHW13LwLkXxDUybA");
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import RNFetchBlob from 'rn-fetch-blob'
import { strings, selection } from '../../locales/i18n';
const videoSizeLimit = 52428800

const options = {
  title: strings("Select_Picture1"),
  mediaType: "photo",
  quality: 0.5,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  },
};
const videoOptions = {
  title: strings("Select_Video"),
  mediaType: "video",
  videoQuality: "medium",
  durationLimit: 30,
  storageOptions: {
    skipBackup: true,
    path: 'images'
  },
};
var provider
var ratingValue
class ChatMessage extends Component {
  constructor(props) {
    super(props);
    console.log("params:", props.navigation.state.params)
    this.state = {
      ratedState: false,
      allRatings: [],
      ratings: [],
      messagesNumber: 0,
      conversation: [],
      message: "",
      chatKey: null,
      searching: "",
      messages: [],
      emojis: false,
      containerHeight: 300,
      showImagePicker: false,
      showVideoPicker: false,
      hasPermission: null,
      recording: false,
      searchModal: false,
      latitude: 0,
      longitude: 0,
      location: "",
      isInternetAvilable: true,
      isInternetAlertOpne: true,
      IsEnableSend: false,
      isopenimage: false,
      selectedImage: "",
      showVideoModal: false,
      videoUrl: "",
      isActive: null,
      isFirtime: true,
      isOpenRating: false,
      RatingCount: 0,
      Rating: []
    };
  }
  // open ratings modal
  showRating = () => {
    if(!this.state.ratedState && this.state.messages.length >= 3){
          this.setState({
            isOpenRating: true,
          })
      }
      this.backAction();
  }
  // fetch feedback for provider
  feedback = () => {
    findRatings(provider.id).then(result => {
      let ratings = result[0];
      let allRatings = result[1];
      let hasRated;
      if(ratings === undefined || ratings === null){
        ratings = [];
        hasRated = false;

        console.log("no ratings");
      }
      if(allRatings === undefined || allRatings === null){
        allRatings = [];
        hasRated = false;

        console.log("no rated chats!");
      }
      else {
        let find = allRatings.includes(this.props.user.id);
        if(find){
          hasRated = true;
          console.log("cannot find rated in rated array!");
        }else {
          hasRated = false;
          console.log("customer has already rated!");
        }
        console.log("ratings : " + ratings);
        console.log("allRatings : " + allRatings);
      }
      this.setState({
        ratings: ratings,
        allRatings: allRatings,
        ratedState: hasRated,
      });
      }).catch(err => {
        Alert.alert(strings("Error"),  strings("Error_Something_went"));
      });
  }  

  getAllProviders = () => {
    getProviders()
      .then((res) => {
        let providers = res.docs.map((item) => {
          return { ...item.data(), id: item.id };
        });
        let arrnew = []
        for (let i = 0; i < providers.length; i++) {
          if (providers[i].id == this.props.navigation.state.params.data.id) {
            provider = providers[i]
            this.setState({ isActive: provider.isActive });
          }
        }
        // this.setState({ markers: arrnew });
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  };
  //   closing search modal
  closeModal = () => {
    this.setState({ searchModal: false });
  };
  // handle call back for map and setting the lat and lng state
  handleCallback = (lat, long, name = this.state.location) => {
    this.setState({ latitude: lat, longitude: long, message: name });
  };
  //   search modal
  renderSearchModal = () => {
    return (
      <Modal
        isVisible={this.state.searchModal}
        style={{
          flex: 1,
        }}
        animationInTiming={500}
        animationOutTiming={500}
        onRequestClose={() => {
          this.setState({ searchModal: false });
        }}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <MapScreen
            handleCallback={this.handleCallback}
            latitude={this.state.latitude}
            close={this.closeModal}
            longitude={this.state.longitude}
          />
        </View>
      </Modal>
    );
  };

  closePicker = () => {
    this.setState({ showImagePicker: false, showVideoPicker: false })
  }

  _renderImagePicker = () => {
    return (
      <Modal
          visible={this.state.showImagePicker}
          style={{ margin: 0 }}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.closePicker()} >
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: "rgba(10, 10, 10, 0.7)" }}>
              <View style={{ backgroundColor: "white", height: 200, width: Dimensions.get("window").width / 1.3, alignSelf: "center", borderRadius: moderateScale(10) }}>
                  <View style={{ backgroundColor: "black", padding: moderateScale(12), borderTopEndRadius: moderateScale(10), borderTopStartRadius: moderateScale(10) }}>
                      <Text style={{ color: "white", alignSelf: "center", fontSize: moderateScale(16) }}>Choose Option</Text>
                      <Icon2
                          name="closecircle"
                          size={moderateScale(25)}
                          color={"white"}
                          onPress={() => {
                              this.closePicker()
                          }}
                          style={{ position: "absolute", end: 6, top: 6, bottom: 0, alignItems: "center", justifyContent: "center" }}
                      />
                  </View>
                  <View style={{ padding: moderateScale(20), flex: 1 }}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(1)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          Take Photo
                        </Text>
                      </TouchableOpacity>
                      <View height={verticalScale(18)} />
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(2)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          Choose from gallery
                        </Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    )
  }

  _renderVideoPicker = () => {
    return (
      <Modal
          visible={this.state.showVideoPicker}
          style={{ margin: 0 }}
          transparent={true}
          animationType="fade"
          onRequestClose={() => this.closePicker()} >
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: "rgba(10, 10, 10, 0.7)" }}>
              <View style={{ backgroundColor: "white", height: 200, width: Dimensions.get("window").width / 1.3, alignSelf: "center", borderRadius: moderateScale(10) }}>
                  <View style={{ backgroundColor: "black", padding: moderateScale(12), borderTopEndRadius: moderateScale(10), borderTopStartRadius: moderateScale(10) }}>
                      <Text style={{ color: "white", alignSelf: "center", fontSize: moderateScale(16) }}>Choose Option</Text>
                      <Icon2
                          name="closecircle"
                          size={moderateScale(25)}
                          color={"white"}
                          onPress={() => {
                              this.closePicker()
                          }}
                          style={{ position: "absolute", end: 6, top: 6, bottom: 0, alignItems: "center", justifyContent: "center" }}
                      />
                  </View>
                  <View style={{ padding: moderateScale(20), flex: 1 }}>
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(3)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          {strings("Record_Video")}
                        </Text>
                      </TouchableOpacity>
                      <View height={verticalScale(18)} />
                      <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={() => {
                          setTimeout(() => {
                              this.showCamera(4)
                              this.closePicker()
                          }, 500);
                        }}
                      >
                        <Text style={{ fontSize: scale(16), alignSelf: "center", color: "black", fontFamily: "Poppins-Medium" }}>
                          {strings("Choose_from_Library")}
                        </Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>
    )
  }
  
  showCamera = (value) => {
    if (Platform.OS == "android") {
        PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]).then((result) => {
            console.log("result", result)
            if (result['android.permission.CAMERA'] == "granted" &&
                result['android.permission.WRITE_EXTERNAL_STORAGE'] == "granted") {
                if (value == 1 || value == 3) {
                    this.openCamera(value)
                } else {
                    this.openGallery(value)
                }
            } else {
                Alert.alert("Please grant all permission to access this feature")
            }
        }).catch((reason) => {
            console.log("reason", reason)
        })
    } else {
        if (value == 1 || value == 3) {
            this.openCamera(value)
        } else {
            this.openGallery(value)
        }
    }
  }

  openCamera = (value) => {
      launchCamera({
          mediaType: value == 1 ? "photo" : "video",
          maxHeight: 300,
          maxWidth: 300,
          durationLimit: 240,
          quality: 0.5,
      }, (response) => {
          console.log("response", response)
          if (response.errorCode) return
          if (response.didCancel) return

          if (value == 1) {
            this.uploadImages(response.assets[0].uri)
          } else {
            this.preUploadVideo(response.assets[0].uri)
          }
      })
  }

  openGallery = (value) => {
      launchImageLibrary({
          mediaType: value == 2 ? "photo" : "video",
          maxHeight: 300,
          maxWidth: 300,
          quality: 0.5,
          selectionLimit: 1
      }, (response) => {
          console.log("response", response)
          if (response.errorCode) return
          if (response.didCancel) return

          if (value == 2) {
            this.uploadImages(response.assets[0].uri)
          } else {
            this.preUploadVideo(response.assets[0].uri)
          }
      })
  }

  uploadImages = (uri) => {
    const ext = uri.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.${ext}`;
    let message = {
      type: "IMAGE",
      url: uri,
      message: this.state.message,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };
    this.setState({
      messages: [...this.state.messages, { ...message, loading: true }],
    });
    addMessageMedia(uri, filename, (status, profileUrl) => {
      if (status) {
        message = { ...message, url: profileUrl };
        this.handleMediaMessage(message);
      } else {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }

  preUploadVideo = (uri) => {
    var filename = uri.replace('file:', '')
    RNFetchBlob.fs.stat(filename)
      .then((stats) => {
        console.log("stats: ", stats)
        if (stats.size > videoSizeLimit) {
          Alert.alert(strings("Video_size"))
        } else {
          this.uploadVideo(uri)
        }
      }).catch((error) => {
        console.log("error: ", error)
      })
  }

  listen = () => {
    this.setState({ isFirtime: true })
    setTimeout(() => { this.setState({ isFirtime: false }) }, 2000)
    let key = this.state.chatKey;
    let path = `chattings/${key}`;
    if (this.state.chatKey) {
      database()
        .ref(this.state.chatKey)
        .on("value", (snapshot) => {
          if (snapshot.val().messages) {
            let temp = snapshot.val().messages;
            let keys = Object.keys(temp);
            keys.reverse();
            let messages = keys.map((key) => {
              return temp[key];
            });
            // console.log('messages are',messages)
            messages.sort((a, b) => {
              return a.created_at - b.created_at;
            });
            this.setState({ messages: messages });
          }
        });
    }
  };

  prepareRecordingPath = () => {
    // setting revording path
    AudioRecorder.prepareRecordingAtPath(
      `${AudioUtils.DocumentDirectoryPath}/${uuidv4()}.aac`,
      {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "High",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000,
      }
    );
  };
  componentDidMount = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Connection type", state.type);
      console.log("Is connected?", state.isConnected);
      this.setState({ isInternetAvilable: state.isConnected });
      if (state.isConnected) {
        this.setState({ isInternetAlertOpne: true });
        // this.getLocation();
      }
      else {
        if (this.state.isInternetAlertOpne) {
          this.setState({ isInternetAlertOpne: false });
        }

      }
    });

    AsyncStorage.getItem('Rating')
      .then(req => JSON.parse(req))
      .then((data) => this.setState({ Rating: data }))
      .then(() => {
      })

    // backhandler event
    this.backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if(!this.state.ratedState && this.state.messages.length >= 3){
          this.setState({
            isOpenRating: true,
          })
      }
      this.backAction();
      }
    );
    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
    console.log(
      "user is: ",
      this.props.user,
      "provider is: ",
      this.props.navigation.state.params.chatKey
    );
    if (this.props.navigation.state.params.chatKey) {
      this.setState(
        { chatKey: this.props.navigation.state.params.chatKey },
        () => {
          this.listen();
          this.feedback();
        }
      );
    } else {
      Alert.alert(strings("Chat_preAlert"));
      let ids = [
        this.props.user.id,
        this.props.navigation.state.params.data.id,
      ];
      ids.sort();
      let searching = `${ids[0]}-${ids[1]}`;
      this.setState({ searching: searching });
      getChatKey(searching).then((res) => {
        if (res.val()) {
          // console.log('res is: ',res.val())
          let keys = Object.keys(res.val());
          this.setState({ chatKey: `chattings/${keys[0]}` }, () => {
            this.listen();
            this.feedback();
          });
        }
      });
    }
    // Requesting for authorization of recording audio
    AudioRecorder.requestAuthorization().then((isAuthorised) => {
      this.setState({ hasPermission: isAuthorised });

      if (isAuthorised) {
        this.prepareRecordingPath();
      }
    });

    AudioRecorder.onFinished = (data) => {

      // Android callback comes in the form of a promise instead.
      if (Platform.OS === 'ios') {
        console.log('filePath', data)
        this.sendRecording(data.audioFileURL);
        this.prepareRecordingPath();
      }
    };
  };
  //   getting user geolocation method
  getGeoLocation = () => {
    if (!this.state.isInternetAvilable) {
      return;
    }
    Geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude);
        const long = parseFloat(position.coords.longitude);
        this.setState({ latitude: lat, longitude: long }, () => {
          Geocoder.from(lat, long)
            .then((json) => {
              try {
                var addressComponent = json.results[0].address_components[2].short_name;
                this.setState({ location: addressComponent });
              } catch (err) {
                Alert.alert(strings("Location_Permission"), strings("Location_Permission1"))
                var addressComponent = json.results[0].address_components[0].short_name;
                this.setState({ location: addressComponent });
              }
            })
            .catch((error) => Alert.alert(strings("Location_error"), strings("Location_error1")));
        });
      },
      (error) => {
        Alert.alert(strings("Location_error"), strings("Location_error1"))
      }
    );
  };
  //   async getting user get location method
  async getLocation() {
    if (!this.state.isInternetAvilable) {
      return;
    }
    try {
      if (Platform.OS === "ios") {
        // your code using Geolocation and asking for authorisation with
        Geolocation.requestAuthorization();
        this.getGeoLocation();
      } else {
        // ask for PermissionAndroid as written in your code
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: strings("Location_Permission"),
            message: strings("Location_Permission1")
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.getGeoLocation();
        }
      }
    } catch (err) {
      Alert.alert(strings("Error"), strings("Error_Something_went"));
    }
  }
  _keyboardDidShow = (e) => {
    this.setState({ containerHeight: e.endCoordinates.height, emojis: false });
  };
  backAction = () => {
    if (this.state.emojis) {
      this.setState({ emojis: false });
      return true;
    } else {
      return false;
    }
  };

  start = async () => {
    // start recording button
    if (this.state.hasPermission) {
      try {
        const filePath = await AudioRecorder.startRecording();
        this.setState({ recording: true });
      } catch (error) {
        console.error(error);
      }
    } else {
      this.prepareRecordingPath();
    }
  };

  sendRecording = (path) => {
    // const ext = response.uri.split(".").pop(); // Extract image extension
    // saving recording path to the firebase
    const filename = `${uuidv4()}.aac`;
    let message = {
      type: "AUDIO",
      url: path,
      message: this.state.message,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };
    this.setState({
      messages: [...this.state.messages, { ...message, loading: true }],
    });
    // adding media messages
    addMessageMedia(path, filename, (status, _url) => {
      if (status) {
        message = { ...message, url: _url };

        this.handleMediaMessage(message);
      } else {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  };
  stop = async () => {
    // stop audio recordings
    if (this.state.recording) {
      try {
        const filePath = await AudioRecorder.stopRecording();

        this.setState({ recording: false }, () => {
          if (Platform.OS === 'android') {
            this.sendRecording(filePath);
            this.prepareRecordingPath();
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  //get chat data of the active request
  componentWillMount = () => {
    provider = this.props.navigation.state.params.data;
    this.setState({ isActive: provider.isActive });
    this.getAllProviders();

    this.keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      this._keyboardDidShow
    );
  };
  _keyboardDidShow = (e) => {
    this.setState({ containerHeight: e.endCoordinates.height, emojis: false });
    if (this.list)
      this.list.scrollToEnd({ animated: true })
  };
  componentWillUnmount = () => {
    console.log("component will unmount called");
    this.keyboardDidShowListener.remove();
    // this.chatRef.off('value', this.valueChange)
    this.stop();
}
  valueChange = (data) => {
    console.log("data is: ", data, data.val());
  };
  // uploading video from library or camera
  handleVideo = () => {
    if (!this.state.isInternetAvilable) {
      Alert.alert(strings("Internet_Error"), strings("Internet_Error_Message"));
      return;
    }
    
    this.setState({ showVideoPicker: true })

  };

  uploadVideo(path) {
    const ext = path.split(".").pop(); // Extract image extension
    const filename = `${uuidv4()}.${ext}`;
    let message = {
      type: "VIDEO",
      url: path,
      message: this.state.message,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };
    this.setState({
      messages: [...this.state.messages, { ...message, loading: true }],
    });

    addMessageMedia(path, filename, (status, profileUrl) => {
      if (status) {
        message = { ...message, url: profileUrl };
        this.handleMediaMessage(message);
      } else {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      }
    });
  }
  // uploading image from library or camera
  handleImages = () => {
    this.setState({ showImagePicker: true })
  };
  // sending media message
  sendMediaMessage = (message) => {
    let messageData = message
    console.log("message:", messageData)
    sendMessageToProvider(this.state.chatKey, message)
      .then((res) => {
        if (res.data) {
          this.setState({ message: "", IsEnableSend: false });
        } else {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        }
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });

    console.log("provider:", provider)
    let deviceToken = provider.deviceToken
    let title = "New " + messageData.type.toLowerCase() + " message from " + this.props.user.name
    if (deviceToken) {
      console.log("deviceToken: ", deviceToken)
      let tokens = [];
      tokens.push(deviceToken)
      notifyUser(tokens, title, messageData.message)
    }

    let uniqueKey = provider.email + "_" + this.props.user.email
    console.log("uniqueKey: ", uniqueKey)
    let notifData = {
      to: provider.id,
      body: title + " - " + messageData.message,
      badge: '1',
      sound: 'default',
      booking: {
        update_at: parseInt(new Date().getTime() / 1000),
        customerProfileUrl: this.props.user.profileUrl,
        chatKey: this.state.chatKey,
        sender_id: this.props.user.id,
      }
    }
    addNotification(uniqueKey, notifData)
  };
  // handling media messages

  handleMediaMessage = (message) => {
    if (this.state.chatKey) {
      this.sendMediaMessage(message);
    } else {
      // this.setState({ IsEnableSend: true });
      let customerChats = this.props.user.chats ? this.props.user.chats : [];
      let providerChats = this.props.navigation.state.params.data.chats
        ? this.props.navigation.state.params.data.chats
        : [];
      let customer = {
        id: this.props.user.id,
        profileUrl: this.props.user.profileUrl,
        name: this.props.user.name,
      };

      let provider = {
        id: this.props.navigation.state.params.data.id,
        name: this.props.navigation.state.params.data.name,
        profileUrl: this.props.navigation.state.params.data.personalInfo.profileUrl,
      };
      // method for adding chat
      addChattings(
        customer,
        provider,
        this.state.searching,
        "",
        customerChats,
        providerChats
      )
        .then((res) => {
          console.log("result of adding chat is: ", res);
          if (res) {
            this.setState({ chatKey: res.data }, () => {
              let data = this.props.user;
              let chats = data.chats ? [res.data, ...data.chats] : [res.data];
              data = { ...data, chats: chats };
              this.props.setUserFromLocal(data);
              new MyStorage().setUserData(JSON.stringify(data));
              this.listen();
              this.sendMediaMessage(message);
            });
          } else {
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          }
        })
        .catch((err) => {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        });
    }
  };


  _renderTextBox = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          marginBottom: 5,
          marginTop: 5
        }}
      >
        <TouchableOpacity
          onPress={this.handleImages}
          style={{ flex: 0.2, justifyContent: "center", alignItems: "center" }}>
          <Image source={require('../../assets/file.png')} style={{ height: scale(25), width: scale(25) }} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            marginRight: 5,
            ...Platform.select({
              ios: {
                shadowColor: 'gray',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
              },
              android: {
                elevation: 5,
              },
            }),
          }}>
          <TextInput
            placeholder={strings("Write_message")}
            style={{ width: "100%", includeFontPadding: false, fontFamily: "Poppins-Light", fontSize: scale(12), color: "#4C5264", flex: 1, marginLeft: 5, marginRight: 5, maxHeight: 150, marginTop: scale(5), marginBottom: scale(5) }}
            multiline={true}
            onChangeText={(txt) => {
              this.setState({ message: txt });
              this.list.scrollToEnd({ animated: true })
            }}
            underlineColorAndroid="transparent"
            value={this.state.message} />
        </View>
        <TouchableOpacity
          style={{ flex: 0.2, justifyContent: "center", alignItems: "center" }}>
          {this.state.message === "" && !this.state.recording && (
            <Avatar
              rounded
              size={scale(30)}
              icon={{ name: "mic", type: "Feather", color: "white" }}
              overlayContainerStyle={{ backgroundColor: mainColor }}
              onPress={this.start}
            />
          )}
          {this.state.message !== "" && !this.state.recording && (
            <Avatar
              rounded
              size={scale(30)}
              icon={{ name: "send", type: "Feather" }}
              overlayContainerStyle={{ backgroundColor: mainColor }}
              onPress={this.handleMessage}
            />
          )}

          {this.state.recording && (
            <Avatar
              rounded
              size={scale(30)}
              icon={{ name: "stop", type: "font-awesome", color: "red" }}
              overlayContainerStyle={{ backgroundColor: mainColor }}
              onPress={this.stop} />
          )}
        </TouchableOpacity>
      </View>
    );
  };
  _renderConversation = () => {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={(ref) => {
            this.list = ref;
          }}
          style={{ flex: 1 }}
          onContentSizeChange={() => this.list.scrollToEnd({ animated: this.state.isFirtime ? false : true })}>
          <FlatList
            data={this.state.messages}
            extraData={this.state}
            contentContainerStyle={{ flex: 1, marginVertical: 10 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this._renderItem}
            initialNumToRender={this.state.messages.length}
          />
        </ScrollView>
      </View>
    );
  };

  _renderItem = ({ item }) => (
    <View style={{ marginHorizontal: 20, marginVertical: 5 }}>
      {item.senderId == this.props.user.id ? (
        <View><View style={styles.providerContainer}>
          {item.loading && (
            <View
              style={{
                paddingRight: 10,
                justifyContent: "center",
                alignItems: "center",
              }}>
              <ActivityIndicator size="small" color="black" />
            </View>
          )}
          {item.type === "TEXT" && this._renderTextMessage(item)}
          {item.type === "IMAGE" && this._renderImage(item)}
          {item.type === "VIDEO" && this._renderVideo(item)}
          {item.type === "AUDIO" && this._renderAudio(item)}
        </View>
          <View style={styles.providerContainer1}>
            {item.created_at ? <Text style={{ color: "#AFAFAF", margin: 5, size: scale(10), fontFamily: "Poppins-Light" }}>{this.convertdte(item.created_at)}</Text> : console.log("")}
          </View>
        </View>
      ) : (
        <View><View style={styles.seekerContainer}>
          {item.type === "TEXT" && this._renderTextMessage(item)}
          {item.type === "IMAGE" && this._renderImage(item)}
          {item.type === "VIDEO" && this._renderVideo(item)}
          {item.type === "AUDIO" && this._renderAudio(item)}
        </View>
          {item.created_at ? <Text style={{ color: "#AFAFAF", margin: 5, size: scale(10), fontFamily: "Poppins-Light" }}>{this.convertdte(item.created_at)}</Text> : console.log("")}
        </View>
      )}
    </View>
  );
  convertdte(timestamp) {
    var newDate = moment(new Date(timestamp)).format('DD MMM, HH:mm a');
    return newDate
  }
  //   open modal for video player
  openModal = (item) => {
    this.setState({
      videoUrl: item,
      showVideoModal: true,
    });
  };
  showVideoModal = () => {
    return (
      <Modal1
        style={{
          alignSelf: "center",
          // justifyContent: "flex-end",
          // marginTop: verticalScale(30),
          maxHeight: "100%",
          marginHorizontal: scale(5),
        }}
        width="auto"
        height="100%"
        transparent={true}
        animationInTiming={500}
        animationOutTiming={500}
        isVisible={this.state.showVideoModal}>
        <View
          style={{
            // flex: 1,
            backgroundColor: "white",
            borderRadius: 10,
            height: "95%"
          }}
        >
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
              }}>
              <Text
                style={{
                  fontSize: scale(18),
                  fontFamily: "Poppins-SemiBold",
                  color: "white",
                  alignSelf: "center",
                  paddingHorizontal: scale(32),
                  textAlign: "center",
                }}>
                {strings("VIDEO_PLAYER")}
              </Text>
            </View>
            <View
              style={{
                flex: 0.2,
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: 5
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
      </Modal1>
    );
  };
  // rendering vedio player
  _renderVideo = (item) => {
    if (Platform.OS == "android") {
      return (
        <TouchableOpacity
          onPress={() => this.openModal(item.url)}>
          <View style={{ height: 200, width: 240 }}>
            <VideoPlayer videoUrl={item.url} playerHeight={200} playerWidth={240} />
          </View>
        </TouchableOpacity>
      );
    }
    else {
      return (
        <View style={{ height: 200, width: 200 }}>
          <VideoPlayerNew videoUrl={item.url} playerHeight={200} playerWidth={200} />
        </View>
      );
    }
  };
  ViewImage(item) {
    this.setState({
      isopenimage: true,
      selectedImage: item
    })
  }

  // rendering images on coversation messages
  _renderImage = (item) => {
    console.log("image item is: ", item.url);
    return (
      <TouchableOpacity
        onPress={() => this.ViewImage(item.url)}>
        <ImageBackground
          style={{
            height: 200, width: 200,
          }}
          imageStyle={{ resizeMode: "cover", borderRadius: 5 }}
          source={
            require('../../assets/picture.png')
          }>
          <Image
            style={{
              height: 200, width: 200, resizeMode: "cover"
            }}
            source={{
              uri: item.url
            }}
          />
        </ImageBackground>
      </TouchableOpacity>
    );
  };
  // render text box
  _renderTextMessage = (item) => {
    return item.senderId == this.props.user.id ? <Text style={{ fontSize: scale(12), color: "white", fontFamily: "Poppins-Regular" }}>{item.message}</Text> : <Text style={{ fontSize: scale(12), color: "#4C5264", fontFamily: "Poppins-Regular" }}>{item.message}</Text>;
  };
  // render audio player
  _renderAudio = (item) => {
    return (
      <View style={{ height: 40, width: 200, paddingTop: 19 }}>
        <VideoPlayer
          videoUrl={item.url}
          audioOnly={true}
          playerHeight={25}
          playerWidth={200}
        />
      </View>
    );
  };
  Savedata(key, detail) {
    AsyncStorage.setItem(key, JSON.stringify(detail))
      .then(() => {
        // console.log('data saved')
      })
  }
  findArrayElementByTitle(array, title) {
    return array.find((element) => {
      return element === title;
    })
  }
  // send message method
  sendMessage = () => {
    var msg = this.state.message;
    this.setState({ message: "" });

    let message = {
      type: "TEXT",
      message: msg,
      senderId: this.props.user.id,
      senderName: this.props.user.name,
    };
    this.setState({
      messages: [...this.state.messages, { ...message, loading: false }],
    });

    this.setState({
      RatingCount: this.state.RatingCount + 1
    })


    sendMessageToProvider(this.state.chatKey, message)
      .then((res) => {
        if (res.data) {
          this.setState({ message: "", IsEnableSend: false });
        } else {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        }
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });

    console.log("provider:", provider)
    let deviceToken = provider.deviceToken
    let title = "New message from " + this.props.user.name
    if (deviceToken) {
      console.log("deviceToken: ", deviceToken)
      let tokens = [];
      tokens.push(deviceToken)
      notifyUser(tokens, title, msg)
    }

    let uniqueKey = provider.email + "_" + this.props.user.email
    console.log("uniqueKey: ", uniqueKey)
    let notifData = {
      to: provider.id,
      body: title + " - " + msg,
      badge: '1',
      sound: 'default',
      booking: {
        update_at: parseInt(new Date().getTime() / 1000),
        customerProfileUrl: this.props.user.profileUrl,
        chatKey: this.state.chatKey,
        sender_id: this.props.user.id,
      }
    }
    addNotification(uniqueKey, notifData)
  };
  // send message button method
  handleMessage = () => {
    if (this.state.message == "") {
      Alert.alert(strings("enter_message"));
      return;
    }
    if (this.state.chatKey) {
      // this.setState({ IsEnableSend: true });
      this.sendMessage();

    } else {
      this.setState({ IsEnableSend: true });
      //New chat init
      let customerChats = this.props.user.chats ? this.props.user.chats : [];
      let providerChats = this.props.navigation.state.params.data.chats
        ? this.props.navigation.state.params.data.chats
        : [];
      let customer = {
        id: this.props.user.id,
        profileUrl: this.props.user.profileUrl,
        name: this.props.user.name,
      };

      let provider = {
        id: this.props.navigation.state.params.data.id,
        name: this.props.navigation.state.params.data.name,
        profileUrl: this.props.navigation.state.params.data.personalInfo.profileUrl,
      };
      addChattings(
        customer,
        provider,
        this.state.searching,
        "",
        customerChats,
        providerChats
      )
        .then((res) => {
          console.log("result of adding chat is: ", res);
          if (res) {
            this.setState({ chatKey: res.data }, () => {
              let data = this.props.user;
              let chats = data.chats ? [res.data, ...data.chats] : [res.data];
              data = { ...data, chats: chats };
              this.props.setUserFromLocal(data);
              new MyStorage().setUserData(JSON.stringify(data));
              this.listen();
              this.sendMessage();
            });
          } else {
            Alert.alert(strings("Error"), strings("Error_Something_went"));
          }
        })
        .catch((err) => {
          Alert.alert(strings("Error"), strings("Error_Something_went"));
        });
    }
    this.showRating();
  };

  ratingCompleted(rating) {
    ratingValue = rating
  }
  addProviderRating() {
    let ratings = provider.ratings
      ? [...provider.ratings, ratingValue]
      : [ratingValue];
    addRating(provider.id, this.props.user.id, ratings)
      .then((res) => {
        if (this.state.Rating && this.state.Rating.length > 0) {
          let arrrating = this.state.Rating
          arrrating.push(this.state.chatKey + '')
          { this.Savedata('Rating', arrrating) }
          this.setState({
            Rating: arrrating,
            ratedState: true
          })
        }
        else {
          let arrrating = []
          arrrating.push(this.state.chatKey + '')
          { this.Savedata('Rating', arrrating) }
          this.setState({
            Rating: arrrating
          })
          this.setState({ratedState: true});
        }
        this.getAllProviders()
      })
      .catch((err) => {
        Alert.alert(strings("Error"), strings("Error_Something_went"));
      });
  }
  render() {
    const provider = this.props.navigation.state.params.data;
    return (
      // <Fragment>
      <KeyboardAvoidingView style={styles.container} keyboardVerticalOffset={Platform.select({ ios: 0, android: -500 })} behavior="padding" enabled>
        <View style={styles.container}>
          <Header
            containerStyle={[{
              backgroundColor: "white",
              height: verticalScale(85),
              borderBottomColor: "white",
              borderBottomWidth: 1,
              alignContent: "center"
            }, Platform.OS == "android" ? { paddingTop: 0 } : null]}
            leftComponent={
              <Icon1
                onPress={() => {
                  this.props.navigation.navigate("Chat");
                }}
                type="FontAwesome"
                size={30}
                name="chevron-left"
                color={mainColor}
              />
            }
            centerComponent={
              <View flexDireaction="row" justifyContent="center" alignItems="center">
                <View justifyContent="center" alignItems="center">
                  <ImageBackground
                    style={{
                      height: verticalScale(40), width: verticalScale(40)
                    }}
                    imageStyle={{ borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1 }}
                    source={
                      require('../../assets/icon.png')
                    }>
                    <Image
                      style={{
                        height: verticalScale(40), width: verticalScale(40), borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1
                      }}
                      source={{
                        uri: provider.personalInfo
                          ? provider.personalInfo.profileUrl : provider.profileUrl
                      }}
                    />
                  </ImageBackground>

                  {/* {provider.personalInfo || provider.profileUrl ? <Image defaultSource={require('../../assets/icon.png')} source={{
                    uri: provider.personalInfo
                      ? provider.personalInfo.profileUrl : provider.profileUrl
                  }} style={{ height: verticalScale(40), width: verticalScale(40), borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1 }} /> : <Image source={require('../../assets/icon.png')} style={{ resizeMode: "cover", height: verticalScale(40), width: verticalScale(40), borderRadius: verticalScale(20), borderColor: mainColor, borderWidth: 1 }} />} */}
                  <View alignItems="flex-end" position="absolute" height={verticalScale(40)} width={verticalScale(40)}>
                    <View height={verticalScale(10)} width={verticalScale(10)} borderRadius={verticalScale(5)} backgroundColor={this.state.isActive?"#24CE40":"gray"} justifyContent="center" alignItems="center">
                    </View>
                  </View>
                </View>
                <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                  <Text
                    style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: mainColor }}>{provider.name}</Text>
                </View>
              </View>
            }
            rightComponent={
              <View style={{ flexDirection: "row" }}>
                <View>
                  <Icon
                    type="MaterialIcons"
                    onPress={() => {
                      this.handleVideo()
                    }}
                    size={30}
                    name="videocam"
                    color={mainColor}
                  />
                </View>
                <View marginLeft={10} justifyContent="center">
                  <Icon
                    type="FontAwesome"
                    onPress={() => {
                      Alert.alert("coming soon")
                    }}
                    size={22}
                    name="phone"
                    color={mainColor}
                  />
                </View>
              </View>
            }
          />
          <View
            style={{
              backgroundColor: 'white',
              width: "100%",
              height: 1,
              ...Platform.select({
                ios: {
                  shadowColor: 'lightgray',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.9,
                  shadowRadius: 1,
                },
                android: {
                  elevation: 5,
                },
              }),
            }}
          />
          {this.state.showVideoModal && this.showVideoModal()}
          {this._renderConversation()}
          {this._renderTextBox()}
          {this.state.searchModal && this.renderSearchModal()}
          {this._renderImagePicker()}
          {this._renderVideoPicker()}
          <Modal visible={this.state.isopenimage}
            transparent={true}
            animationType="slidess"
            onRequestClose={() => {
              // this.setState({ isOpenBankDropDown: false })
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

          <Modal1
            animationType="slide"
            transparent={true}
            isVisible={this.state.isOpenRating}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}>
              <Form style={{ backgroundColor: "white", margin: 15, padding: 15, borderRadius: 10 }}>
                <View alignItems="center" justifyContent="center">
                  <Image source={require('../../assets/mainstar.png')} style={{}} />
                </View>
                <View marginTop={0} height={verticalScale(10)} />
                <Text style={{ fontSize: scale(15), color: "#242424", fontFamily: "Poppins-Bold", textAlign: "center" }}>{strings("share_feedback")}</Text>
                <Text style={{ fontSize: scale(12), color: "#8A8A8A", fontFamily: "Poppins-Regular", textAlign: "center" }}>{strings("rate")}</Text>
                {/* <View marginTop={0} height={verticalScale(10)} /> */}
                <AirbnbRating
                  count={5}
                  reviews={["", "", "", "", ""]}
                  defaultRating={0}
                  size={moderateScale(40)}
                  onFinishRating={this.ratingCompleted}
                />
                <View
                  style={{
                    marginTop: 10,
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  <Button
                    full
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "white",
                      height: verticalScale(35)
                    }}
                    onPress={() => {
                      this.setState({
                        isOpenRating: false
                      });
                      this.addProviderRating()
                    }}>
                    <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#3E62C9" }}>{strings("Save")}</Text>
                  </Button>
                  <Button
                    full
                    style={{
                      backgroundColor: "white",
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: "white",
                      height: verticalScale(35)
                    }}
                    onPress={() => {
                      this.setState({
                        isOpenRating: false,
                        RatingCount: 0,
                        ratedState: true,
                      });
                    }}>
                    <Text style={{ fontSize: scale(14), fontFamily: "Poppins-SemiBold", color: "#3E62C9" }}>{strings("Later")}</Text>
                  </Button>
                </View>
              </Form>
            </View>
          </Modal1>
        </View>
        {this.state.IsEnableSend ? <View style={{ height: "100%", width: "100%", position: "absolute", justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
          <ActivityIndicator color="black" size="large" />
        </View> : console.log("")}
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingBottom: (Dimensions.get('window').height) > 812 ? 20 : 0,
  },
  seekerContainer: {
    padding: 10,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    // borderBottomLeftRadius: 5,
    borderBottomRightRadius: 20,
    minWidth: 100,
    maxWidth: 300,
    alignSelf: "flex-start",
    backgroundColor: "white",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: 'gray',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  providerContainer: {
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 5,
    minWidth: 100,
    maxWidth: 300,
    alignSelf: "flex-end",
    backgroundColor: mainColor,
    position: "relative",
    flexDirection: "row",
    ...Platform.select({
      ios: {
        shadowColor: 'gray',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  providerContainer1: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    alignSelf: "flex-end",
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.userData,
  };
};
export default connect(mapStateToProps, { setUserFromLocal })(ChatMessage);
