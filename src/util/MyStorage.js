import {
    AsyncStorage
} from 'react-native';



export default class MyStorage {


    USER_INFO = "USER_INFO";
    SCREEN = 'SCREEN'
    CHAT_LIST = 'CHAT_LIST'
    DEVICE_TOKEN = "DEVICE_TOKEN"

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



    setUserData = (user)=>{
        this.setItem(this.USER_INFO,user)
    }
    removeUserData = ()=>{
        this.removeItem(this.USER_INFO)
    }
    getUserData = ()=>{
        return this.getItem(this.USER_INFO)
    }

    setScreen = (screen)=>{
        this.setItem(this.SCREEN,screen)
    }
    removeScreen = ()=>{
        this.removeItem(this.SCREEN)
    }
    getScreen = ()=>{
        return this.getItem(this.SCREEN)
    }

    setDeviceToken = (token)=>{
        this.setItem(this.DEVICE_TOKEN,token)
    }
    removeDeviceToken = ()=>{
        this.removeItem(this.DEVICE_TOKEN)
    }
    getDeviceToken = ()=>{
        return this.getItem(this.DEVICE_TOKEN)
    }

    setName = (token)=>{
        this.setItem("name",token)
    }
    removeName = ()=>{
        this.removeItem("name")
    }
    getName = ()=>{
        return this.getItem("name")
    }

    
    setChatList = (data)=>{
        this.setItem(this.CHAT_LIST,data)
    }
    removeChatList = ()=>{
        this.removeItem(this.CHAT_LIST)
    }
    getChatList = ()=>{
        return this.getItem(this.CHAT_LIST)
    }

}