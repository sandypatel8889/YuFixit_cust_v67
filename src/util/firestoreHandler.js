import firestore from "@react-native-firebase/firestore";

export const fetchCategories = () => {
  return firestore().collection("Categories").get();
};
export const addFacebookLink = (id, url) => {
  return firestore()
    .collection("Customers")
    .doc(id)
    .update({ facebookLink: url });
};
export const addInstaLink = (id, url) => {
  return firestore()
    .collection("Customers")
    .doc(id)
    .update({ instaLink: url });
};
export const addTwitterLink = (id, url) => {
  return firestore()
    .collection("Customers")
    .doc(id)
    .update({ twitterLink: url });
};
export const addTiktokLink = (id, url) => {
  return firestore()
    .collection("Customers")
    .doc(id)
    .update({ tiktokLink: url });
};
export const addinvites = (id, data) => {
  return firestore().collection("Customers").doc(id).update({ invites: data });
};

export const fetchinvites = async (id) => {
  const snapshot = await firestore().collection("Customers").doc(id).get();
  return snapshot.data().invites;
};


