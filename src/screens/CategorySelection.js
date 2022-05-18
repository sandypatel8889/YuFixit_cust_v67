import React from "react";
import { setUser } from "../redux/actions/index";
import {
    fetchCategories,
} from "../util/firestoreHandler";
import { connect } from "react-redux";
import { View, Text, UIManager, Platform, LayoutAnimation } from "react-native";
import ExpandableComponent from "../components/common/ExpandableComponent";
import { ScrollView } from "react-native";
import { Button, Icon } from "react-native-elements";
import { Modal } from "react-native";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { Alert } from "react-native";
import { mainColor } from "../components/helper/colors";
import { scale, verticalScale } from "../components/helper/scaling";
import { Header } from "react-native-elements";
import { strings, selection } from '../../locales/i18n';
class CategorySelection extends React.Component {
    constructor(props) {
        super(props);
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }

        this.state = {
            categories: [],
            loading: false,
        };
    }
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

    onCheckCategory(index, subIndex) {
        // console.log("index", index)
        // console.log("subIndex", subIndex)
        const array = [...this.state.categories];
        if (array[index].sub_categories) {
            array[index].sub_categories[subIndex]['isSelected'] = !array[index].sub_categories[subIndex]['isSelected'];
            // console.log("subItem: ", array[index].sub_categories[subIndex]['isSelected'])
        }
        this.setState(() => {
            return {
                categories: array,
            };
        });
    }

    componentDidMount = () => {
        let selectedCategories = this.props.navigation.state.params.selectedCategories;
        this.setState({ loading: true })
        fetchCategories()
            .then((data) => {
                // console.log("data of fetching categories are: ", data);
                let categories = data.docs.map((doc) => {
                    let isExist = false
                    let subValue = null
                    for (let i = 0; i < selectedCategories.length; i++) {
                        const element = selectedCategories[i];
                        if (element.categoryId == doc.id) {
                            console.log("category got")
                            isExist = true
                            subValue = element.subCategories
                            break
                        }
                    }
                    if (doc.data().sub_categories) {
                        let sub_categories = doc.data().sub_categories.map((ele) => {
                            let isSubExist = false
                            if (subValue)
                                for (let i = 0; i < subValue.length; i++) {
                                    const element = subValue[i];
                                    if (element.name == ele.name) {
                                        console.log("sub category got")
                                        isSubExist = true
                                        break
                                    }
                                }
                            return { ...ele, isSelected: isSubExist }
                        })
                        doc.data().sub_categories = sub_categories
                    }
                    return { ...doc.data(), id: doc.id, isExpanded: isExist };
                });

                categories.sort((a, b) => a.name.localeCompare(b.name))
                .map((item, i) => console.log("data", item));
                // console.log("data: ", JSON.stringify(categories))

                this.setState({ loading: false });
                this.setState({ categories: categories });
            })
            .catch((err) => {
                console.log("error in fetching category is: ", err);
                this.setState({ categories: [], loading: false });
            });
    };

    _renderModal = () => {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={this.state.loading}>
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}>
                    <View height={200} width={200} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.5)" borderRadius={10}>
                        <ActivityIndicator color="white" size="large" />
                        <Text style={{ color: "white", textAlign: "center", fontFamily: "Poppins-Regular", fontSize: scale(14) }}>
                            {strings("Loading_Categories")}</Text>
                    </View>
                </View>
            </Modal>
        );
    };
    render() {
        return (
            // <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
                        <View style={{ flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
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
                            <Text style={{ fontSize: scale(18), color: mainColor, width: "100%", textAlign: "center", fontFamily: "Poppins-SemiBold" }}>{strings("Choose_Categories")}</Text>
                        </View>
                    }
                />
                {/* <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: scale(18), padding: 8, textAlign: "center", justifyContent: "center", color: mainColor }}>
                            Choose Categories</Text>
                    </View>
                    <View position="absolute">
                        <Icon
                            onPress={() => {
                                this.props.navigation.goBack();
                            }}
                            type="FontAwesome"
                            size={40}
                            name="chevron-left"
                            color={mainColor}
                        // style={{ color: mainColor }}
                        />
                    </View> */}

                <ScrollView>
                    {this.state.categories.map((item, key) => (
                        <ExpandableComponent
                            key={item.id}
                            onClickFunction={this.updateLayout.bind(this, key)}
                            onCheck={(subKey) => () => this.onCheckCategory(key, subKey)}
                            item={item}
                            editMode={true}
                            IsMain={true}
                        />
                    ))}
                </ScrollView>
                <Button
                    title={strings("DONE")}
                    titleStyle={{
                        color: "white",
                        fontSize: scale(14),
                        fontFamily: "Poppins-SemiBold"
                    }}
                    buttonStyle={{ backgroundColor: mainColor, height: verticalScale(35), borderRadius: 5 }}
                    containerStyle={{ width: "60%", justifyContent: "center", alignSelf: "center", margin: 15 }}
                    onPress={() => {
                        let selectedCategories = []
                        this.state.categories.map((item, key) => {
                            let sub_categories = []
                            if (item.sub_categories) {
                                item.sub_categories.map((subItem, subKey) => {
                                    if (subItem.isSelected) {
                                        sub_categories.push({ name: subItem.name })
                                    }
                                })
                            }
                            if (sub_categories.length > 0) {
                                selectedCategories.push({ categoryName: item.name, categoryId: item.id, detail: "", subCategories: sub_categories })
                            }
                        })
                        if (selectedCategories.length == 0) {
                            Alert.alert(strings("select_one_category"))
                        } else {
                            debugger
                            this.props.navigation.state.params.onGoBack(selectedCategories);
                            this.props.navigation.goBack();
                        }
                    }} />
                {this._renderModal()}
            </View>
            // </SafeAreaView>
        );
    }
}

const MapStateToProps = (state) => {
    return {
        userData: state.userData,
    };
};
export default connect(MapStateToProps, { setUser })(CategorySelection);
