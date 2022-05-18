import ReactNative from 'react-native';
import I18n from 'react-native-i18n';

// Import all locales
import en from '../locales/en.json';  //English
import es from '../locales/es.json';  //Spanish

// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;

// Define the supported translations
// I18n.translations = {
//   en, fr, nl, de, es, it
// };

I18n.translations = {
  en, es
};

const currentLocale = I18n.currentLocale();
const locale = I18n.locale;
console.log("current locale: " + currentLocale + " : all locale: "+ locale)

// Is it a RTL language?
// export const isRTL = currentLocale.indexOf('he') === 0 || currentLocale.indexOf('ar') === 0;

// Allow RTL alignment in RTL languages
// ReactNative.I18nManager.allowRTL(isRTL);

// The method we'll use instead of a regular string
export function strings(name, params = {}) {
  return I18n.t(name, params);
};

export function selection(locale) {
  I18n.defaultLocale = locale;
  I18n.locale = locale;    
};

export default I18n;