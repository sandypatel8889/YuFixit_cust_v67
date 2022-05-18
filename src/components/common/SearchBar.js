import React, { Component } from "react";
import { Text, TextInput, View, TouchableOpacity, Image } from "react-native";
import { scale, verticalScale } from "../helper/scaling";
import Icon from "react-native-vector-icons/Feather";

const styles = {
  // container: {
  //     paddingHorizontal: scale(16),
  //     paddingVertical: verticalScale(8),
  //     backgroundColor: 'white',
  // },
  label: {
    color: "white",
    fontSize: scale(14),
    marginVertical: verticalScale(4),
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: verticalScale(30),
    marginVertical: verticalScale(4),
    borderRadius: scale(4),
    backgroundColor: "white",
  },
  textInput: {
    flex: 1,
    color: "black",
    fontSize: scale(12),
    height: verticalScale(30),
    paddingHorizontal: scale(8),
    paddingVertical: 0,
    alignSelf: "center",
  },
  buttonTitle: {
    fontSize: scale(14),
    color: "gray",
    alignSelf: "center",
    paddingHorizontal: scale(6),
  },
};

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
    };
    this.searchKey = "";
  }
  componentDidMount = () => {};

  render() {
    console.log("this.props", this.props.search);
    const { label, placeholder } = this.props;
    return (
      <View style={{ flex: 1, elevation: 10, paddingHorizontal: scale(12) }}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={styles.searchBox}>
          <Icon
            color={"#c3c3c7"}
            style={{ paddingLeft: scale(12) }}
            name="search"
            type="entypo"
            size={20}
          />
          <TextInput
            underlineColorAndroid={"transparent"}
            style={styles.textInput}
            value={this.state.search}
            placeholder={"Type location you want..."}
            placeholderTextColor="#c3c3c7"
            returnKeyType={"search"}
            onChangeText={(search) => {
              this.setState({ search });
              this.searchKey = search;
              if (search.length === 0) {
                this.props.onSearch(search);
              }
            }}
            onSubmitEditing={() => {
              this.props.onSearch(this.searchKey);
            }}
          />
          {this.state.search ? (
            <TouchableOpacity
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={() => {
                this.setState({ search: "" });
                this.props.onSearch("");
              }}
            >
              <Image
                // source={close}
                style={{
                  marginLeft: scale(12),
                  padding: 0,
                  width: 20,
                  height: 20,
                  marginRight: 12,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  }
}

SearchBar.defaultProps = {
  label: null,
  onSearch: () => {},
  placeholder: "",
};

export default SearchBar;
