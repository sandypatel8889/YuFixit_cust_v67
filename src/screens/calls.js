import React, { Component } from 'react';
import { View, } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome';
import { verticalScale, scale } from '../components/helper/scaling'
import {  List, ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';
export default class Calls extends React.Component {
    render() {
        return (
            <View style={{ flex: 1, }}>

                <List>
                    <ListItem avatar>
                        <Left>
                            <Thumbnail source={{ uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png' }} />
                        </Left>
                        <Body>
                            <Text>Daniel Santio</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon type='EvilIcons' size={20} name='phone' style={{ color: "#01999C", paddingVertical: verticalScale(4) }} />
                                <Text style={{ color: "#01999C", paddingLeft: scale(6) }}>{'Outgoing'}</Text>
                            </View>
                        </Body>
                        <Right>
                            <Text note>3:43 pm</Text>
                        </Right>
                    </ListItem>
                </List>
            </View>
        )
    };
}