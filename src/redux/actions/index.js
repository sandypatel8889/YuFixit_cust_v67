
import { AsyncStorage } from 'react-native'
import constants from '../constants'
import { getCategories, getUserData } from '../../components/helper/firestoreHandler'
import MyStorage from '../../components/helper/MyStorage'
export const setUser = (email) => {
    return (dispatch) => {
        getUserData(email)
            .then(res => {
                if (res.docs.length > 0) {
                    let data = { ...res.docs[0].data(), 'id': res.docs[0].id }
                    new MyStorage().setUserData(JSON.stringify(data))
                    dispatch({
                        type: constants.SET_USER,
                        payload: data
                    });
                }
            })
            .catch(err => {
                console.log('error in getting user is: ', err)
            })
    }
}
export const setUserFromLocal = (data) => {
    console.log('data is: ', data)
    return (dispatch) => {

        dispatch({
            type: constants.SET_USER,
            payload: data
        });
    }
}
export const fetchCategories = (arrProvider) => {
    return (dispatch) => {
        getCategories().then(res => {
            let categories = res.docs.map(cat => {
                return { ...cat.data(), id: cat.id }
            })
            categories.sort((a, b) => a.name.localeCompare(b.name))
                .map((item, i) => console.log("data", item));
            let arrayNew = categories
            for (var i = 0; i < arrayNew.length; i++) {
                var datum = arrayNew[i].providers ? arrayNew[i].providers : [];
                var datum1 = arrayNew[i];
                var arrfinal = []
                for (var j = 0; j < datum.length; j++) {
                    var ele = datum[j];
                    let find = findArrayElementByTitle(arrProvider, ele)
                    if (find) {
                        arrfinal.push(ele)
                    }
                }
                if (arrfinal) {
                    var newNum = "provider1";
                    var newVal = arrfinal;
                    datum1[newNum] = newVal;
                }
                else {
                    var newNum = "provider1";
                    var newVal = [];
                    datum1[newNum] = newVal;
                }
            }
            dispatch({ type: constants.SET_CATEGORIES, payload: arrayNew });
        })
            .catch(err => {
                alert('Something went wrong. Please refresh the app.')
                console.log('error in fetching categories from firestore is: ', err)
            })
    }
}
export const findArrayElementByTitle = (array, title) => {
    return array.find((element) => {
        return element === title;
    })
}
export const setProvider = (provider) => {
    return (dispatch) => {
        dispatch({
            type: constants.SET_PROVIDER,
            payload: provider
        });
    }
}

