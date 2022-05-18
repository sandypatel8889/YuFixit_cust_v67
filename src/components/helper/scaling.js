import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const guidelineBaseWidth = 320;
const guidelineBaseHeight = 568;

const screenWidth = width;
const screenHeight = height;

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

export { screenWidth, screenHeight, scale, verticalScale, moderateScale };
