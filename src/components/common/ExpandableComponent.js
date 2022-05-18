import React, { Component } from 'react';
import { PureComponent } from 'react';
//import react in our project
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import CheckBox from 'react-native-check-box';
import Icon from "react-native-vector-icons/Feather";
import { mainColor } from '../helper/colors';
import { verticalScale, scale } from '../helper/scaling';
import { strings, selection } from '../../../locales/i18n';
//import basic react native components

export default class ExpandableComponent extends PureComponent {
    //Custom Component for the Expandable List
    constructor() {
        super();
        this.state = {
            layoutHeight: 0,
        };
    }

    componentDidMount() {
        let nextProps = this.props
        this.updateHeight(nextProps)
    }

    componentWillReceiveProps(nextProps) {
        this.updateHeight(nextProps)
    }

    updateHeight(nextProps) {
        // console.log("nextProps: ", nextProps)
        if (nextProps.item.isExpanded) {
            this.setState(() => {
                return {
                    layoutHeight: null,
                };
            });
        } else {
            this.setState(() => {
                return {
                    layoutHeight: 0,
                };
            });
        }
    }
    render() {
        // console.log("data: ", this.props)
        if (this.props.editMode)
            return (
                <View marginLeft={5} marginRight={5} alignItems="center" justifyContent="center">
                    {/*Header of the Expandable List Item*/}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={this.props.onClickFunction}
                        style={[this.props.IsMain ? styles.header1 : styles.header, { flexDirection: "row", alignItems: "center" }]}>
                        <Text style={[styles.headerText, { flex: 1 }]}>{strings(this.props.item.name)}</Text>
                        <Icon
                            type="Feather"
                            size={scale(20)}
                            name={this.props.item.isExpanded ? "chevron-down" : "chevron-right"}
                            style={{ color: "#B5B5B5", marginRight: 6, alignSelf: "center" }}
                        />
                    </TouchableOpacity>
                    <View
                        style={{
                            height: this.state.layoutHeight,
                            overflow: 'hidden',
                            alignItems: "center", justifyContent: "center"
                        }}>
                        {/*Content under the header of the Expandable List Item*/}
                        {this.props.item.sub_categories ?
                            this.props.item.sub_categories.map((item, key) => {
                                return (
                                    <TouchableOpacity
                                        key={key}
                                        style={styles.content}
                                        onPress={this.props.onCheck(key)}>
                                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", width: "90%" }}>
                                            <Text style={[styles.text, { flex: 1 }]}>
                                                {strings(item.name)}
                                            </Text>
                                            <CheckBox checkBoxColor={"#B5B5B5"} isChecked={item.isSelected} disabled onClick={() => { }} />
                                        </View>
                                        {/* <View style={styles.separator} /> */}
                                    </TouchableOpacity>
                                )
                            }) : <View />}
                    </View>
                </View>
            );
        else
            return (
                <View>
                    {/*Header of the Expandable List Item*/}
                    <View style={[styles.header, {marginTop: 5,borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" }]}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={{ flex: 1 }}
                            onPress={this.props.onClickFunction}>
                            <Text style={[styles.headerText, {}]}>{strings(this.props.item.categoryName)}</Text>
                        </TouchableOpacity>
                        <Icon
                            type="Feather"
                            size={scale(15)}
                            name={this.props.item.isExpanded ? "chevron-down" : "chevron-right"}
                            style={{ color: "#B5B5B5", marginRight: 6, alignSelf: "center" }}
                        />
                        {this.props.deleteMode && this.props.data.length > 1 ?
                            <Icon
                                onPress={this.props.onDelete}
                                type="Feather"
                                size={scale(15)}
                                name="x"
                                style={{ color: "#B5B5B5", alignSelf: "center" }}
                            />
                            :
                            <View />}
                    </View>
                    <View
                        style={{
                            height: this.state.layoutHeight,
                            overflow: 'hidden',
                            // borderWidth: 0.5
                        }}>
                        {/*Content under the header of the Expandable List Item*/}
                        {this.props.item.subCategories ?
                            this.props.item.subCategories.map((item, key) => {
                                return (
                                    <View
                                        key={key}
                                        style={styles.content}>
                                        <View style={{ flexDirection: "row", alignItems: "center", padding: 5 }}>
                                            <Text style={[styles.text, { flex: 1 }]}>
                                                {strings(item.name)}
                                            </Text>
                                        </View>
                                        {/* <View style={styles.separator} /> */}
                                    </View>
                                )
                            }) : <View />}
                    </View>
                </View>
            )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        backgroundColor: '#F5FCFF',
    },
    topHeading: {
        paddingLeft: 10,
        fontSize: 20,
    },
    header: {
        backgroundColor: "#F4F4F4",
        padding:10,
        height: verticalScale(40),
    },
    header1: {
        backgroundColor: "#F4F4F4",
        paddingLeft: 12,
        margin: 5,
        borderRadius: 5,
        height: verticalScale(35),
    },
    headerText: {
        fontSize: scale(13),
        color: "#242424",
        fontFamily: "Poppins-SemiBold",
        // backgroundColor: "red"
    },
    separator: {
        height: 0.5,
        backgroundColor: '#808080',
        width: '95%',
        marginLeft: 6,
        marginRight: 6,
    },
    text: {
        fontSize: scale(13),
        color: '#242424',
        padding: 8,
        fontFamily: "Poppins-Regular"
    },
    content: {
        paddingLeft: 6,
        paddingRight: 6,
        backgroundColor: '#fff',
    },
});
