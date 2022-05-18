import { AsyncStorage } from "react-native";

export default class MyStorage {
  USER_INFO = "USER_INFO";
  DEVICE_TOKEN = "DEVICE_TOKEN";
  CHAT_LIST = "CHAT_LIST";
  FAVOURITE_PROVIDER = "FAVOURITE_PROVIDER";

  setItem(key, value) {
    AsyncStorage.setItem(key, "".concat(value));
  }

  getItem(key) {
    return AsyncStorage.getItem(key);
  }

  removeItem(key) {
    return AsyncStorage.removeItem(key);
  }

  clearStorage() {
    return AsyncStorage.clear();
  }

  setUserData = (user) => {
    this.setItem(this.USER_INFO, user);
  };
  removeUserData = () => {
    this.removeItem(this.USER_INFO);
  };
  getUserData = () => {
    return this.getItem(this.USER_INFO);
  };

  setDeviceToken = (token) => {
    this.setItem(this.DEVICE_TOKEN, token);
  };
  removeDeviceToken = () => {
    this.removeItem(this.DEVICE_TOKEN);
  };
  getDeviceToken = () => {
    return this.getItem(this.DEVICE_TOKEN);
  };

  setChatList = (data) => {
    this.setItem(this.CHAT_LIST, data);
  };
  removeChatList = () => {
    this.removeItem(this.CHAT_LIST);
  };
  getChatList = () => {
    return this.getItem(this.CHAT_LIST);
  };
  setFavouriteProviderData = (provider) => {
    console.log("providersss", provider);
    this.setItem(this.FAVOURITE_PROVIDER, provider);
  };
  removeFavouriteProviderData = () => {
    this.removeItem(this.FAVOURITE_PROVIDER);
  };
  getFavouriteProviderData = () => {
    return this.getItem(this.FAVOURITE_PROVIDER);
  };
}
