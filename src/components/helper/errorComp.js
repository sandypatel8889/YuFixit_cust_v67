import React, { Component } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';

class ErrorComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {

        }
    }


    render() {
        console.log('i am calledddd :', this.props)
        const { is_modal_visible, erroText, buttonTitle,tryAgain } = this.props;
        return (
            <Modal
                width="auto"
                height="auto"
                transparent={true}
                animationInTiming={500}
                animationOutTiming={500}
                isVisible={is_modal_visible}
            // onBackdropPress={() => this.setState({ modalVisible: false })}
            >
                <View style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{
                        backgroundColor: "white",
                        width: 300,
                        height: 150,
                        paddingHorizontal: 20,
                        paddingVertical: 10
                    }}>
                        <View style={{ flex: .6, }}>
                            <Text style={{ justifyContent: 'center', alignSelf: 'center', fontSize: 20, color: 'red' }}>
                                {erroText}
                            </Text>
                        </View>
                        <View style={{ flex: .4, flexDirection: 'row' }}>

                            <View style={{ flex: 1, justifyContent: "center", backgroundColor: '#01999C', marginRight: 20, marginLeft: 20, borderRadius: 5 }}>
                                <TouchableOpacity
                                    onPress={tryAgain}
                                >
                                    <Text style={{ justifyContent: 'center', alignSelf: 'center', fontSize: 18, color: 'white', }}>
                                        {buttonTitle}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}

export default ErrorComponent;

// export default Centr