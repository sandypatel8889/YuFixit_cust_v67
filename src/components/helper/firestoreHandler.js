import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import functions from "@react-native-firebase/functions";
import database from "@react-native-firebase/database";
import { Platform } from "react-native";

export const getCategories = () => {
  return firestore().collection("Categories").get();
};

//all providers
export const getProviders = () => {
  return firestore().collection("Providers").get();
};

//register new customer
export const registerCustomer = (data) => {
  if (data.data) {
    return firestore().collection("Customers").add(data.data);
  } else {
    return firestore().collection("Customers").add(data);
  }
};

// get user data from firebase
export const getUserData = (email) => {
  return firestore().collection("Customers").where("email", "==", email).get();
};

// get user data from firebase
export const getProviderbyEmail = (email) => {
  return firestore().collection("Providers").where("email", "==", email).get();
};


// get user data from firebase
export const getUserByID = async (id) => {
  return await firestore().collection("Customers").doc(id).get();
};

// add phone number
export const addPhoneNumber = (id, phoneNumber) => {
  return firestore()
    .collection(`Customers`)
    .doc(id)
    .update({ phoneNumber: phoneNumber });
};

//add image to firestore
export const addProfileUrl = (id, profileUrl) => {
  return firestore()
    .collection(`Customers`)
    .doc(id)
    .update({ profileUrl: profileUrl });
};

//add image to firestore
export const updateCustomerName = (id, newName) => {
  return firestore()
    .collection(`Customers`)
    .doc(id)
    .update({ name: newName });
};

//add image to storage
export const addProfileImage = (path, filename, cb) => {
  storage()
    .ref(`customers/${filename}`)
    .putFile(path)
    .then(async (res) => {
      try {
        const url = await storage()
          .ref(`customers/${filename}`)
          .getDownloadURL();
        cb(true, url);
      } catch (err) {
        cb(false, null);
      }
    })
    .catch((err) => {
      cb(false, null);
      console.log("error in uploading image is: ", err);
    });
};
// Adding new address in firestore
export const _addNewAddress = (id, data) => {
  return firestore()
    .collection("Customers")
    .doc(id)
    .update({ addresses: data });
};
// adding device token in firestore
export const addDeviceToken = (id, token) => {
  return firestore()
    .collection("Customers")
    .doc(id)
    .update({ deviceToken: token });
};
// adding booking by using firebase function
export const addBooking = (data) => {
  return functions().httpsCallable("addBooking")({
    data: data,
  });
};
// get booking from firestore
export const getBookings = (id) => {
  return firestore().collection("Bookings").where("customer", "==", id).get();
};
// getting chat key
export const getChatKey = (searching) => {
  return database()
    .ref()
    .child("chattings")
    .orderByChild("searching")
    .equalTo(searching)
    .once("value");
};
// add chating
export const addChattings = (
  customer,
  provider,
  searching,
  message,
  customerChats,
  providerChats
) => {
  return functions().httpsCallable("addChattings")({
    customer,
    provider,
    searching,
    message,
    customerChats,
    providerChats,
  });
};
// when the customer send message to the provider firebase function call
export const sendMessageToProvider = (chatKey, message) => {
  return functions().httpsCallable("sendMessageToProvider")({
    chatKey,
    message,
  });
};
// adding media message to the firebase
export const addMessageMedia = (path, filename, cb) => {
  storage()
    .ref(`messages/${filename}`)
    .putFile(path)
    .then(async (res) => {
      try {
        const url = await storage()
          .ref(`messages/${filename}`)
          .getDownloadURL();
        cb(true, url);
      } catch (err) {
        cb(false, null);
      }
    })
    .catch((err) => {
      cb(false, null);
      console.log("error in uploading image is: ", err);
    });
};
// adding credit card in firestore
export const addCard = (id, cards) => {
  return firestore().collection("Customers").doc(id).update({ cards: cards });
};
// getting all provider from firestore
export const getAllProviders = () => {
  return firestore().collection("Providers").get();
};
// getting specific provider by id from firestore
export const getProviderById = (id) => {
  return firestore().collection("Providers").doc(id).get();
};
// getting nearby providers by firebase function
export const _getNearbyProviders = (latitude, longitude) => {
  return functions().httpsCallable("getNearbyProviders")({
    latitude,
    longitude,
  });
};

export const notifyUser = (tokens, title, body) => {

  let data = {
    direct_book_ok: true,
    registration_ids: tokens,
    notifyUser: true,
    data: {
      message: body,
    },
    notification: {
      title,
      body,
      sound: Platform.OS == "ios" ? "Custom.wav" : "custom.wav",
      badge: 1
    },
    priority: "high"
  }
  // https://github.com/firebase/quickstart-js/issues/71

  let jsonData = JSON.stringify(data)
  console.log("data:", jsonData)
  fetch("https://fcm.googleapis.com/fcm/send", {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: "key=AAAADBNjqPE:APA91bHfVUhd4fy87G4eSUBPIjwtLV0OTSbS9X5vfUD_JJjHvnSTpQpN2m7idObHfB04R1X8uz9XDVD58G7ZnGES-Q_DkhgumeTQrmd1D8wd_xlNZml1H2gJblvMSkVHg_TdcPcQTgFc"
    },
    body: jsonData
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("response: ", data)
    })
    .catch((error) => {
      console.log("error: ", error);
    });
}

// adding credit card in firestore
export const addNotification = (uniqueKey, notification) => {
  return firestore().collection("Notifications").doc(uniqueKey).set(notification);
};

// add rating to provider in firestore
export const addRating = (id, customerId, data) => {
  return firestore().collection("Providers").doc(id).update({ ratings: data, allRatings: firestore.FieldValue.arrayUnion(customerId)  });
};

// fetch existing provider ratings 
export const findRatings = async (id) => {
  const snapshot = await firestore().collection("Providers").doc(id).get();
  let data = snapshot.data();
  let arr = [];
  if (data.ratings) {
    arr.push(data.ratings);
  } else {
    arr.push([]);
  }
  if (data.allRatings) {
    arr.push(data.allRatings);
  }
  else {
    arr.push([]);
  }
  return arr;
}

// getting all notifications
export const getNotifications = (id) => {
  return firestore().collection("Notifications").where("to", "==", id).get();
};
// function for if there any pending payment
export const payPendingPayment = (payment) => {
  return functions().httpsCallable("payPendingPayment")({
    ...payment,
  });
};
export const fetchCustomerId = async (chatId) => {
  const snapshot = await database()
    .ref("chattings")
    .child(chatId)
    .once("value");
  return snapshot.val()["customer"].id;
  
};

export const getPhoneByID = async (id) => {
  const snapshot = await firestore().collection("Customers").doc(id).get();
  return snapshot.data().phoneNumber;
};