/** @format */
import 'node-libs-react-native/globals';
import './globals';
import { AppRegistry, Text, TextInput, YellowBox } from 'react-native';
import _ from 'lodash';
import { name as appName } from './app.json';
import App from './App';

TextInput.defaultProps = Object.assign({}, TextInput.defaultProps, { allowFontScaling: false });
Text.defaultProps = Object.assign({}, Text.defaultProps, { allowFontScaling: false });
AppRegistry.registerComponent(appName, () => App);

YellowBox.ignoreWarnings(['Setting a timer', 'WebView has been', 'Async Storage has', 'requires main queue setup.', 'Accessing view manager']);
const _console = _.clone(console);
console.warn = message => {
    if (!message.match(/|Setting a timer|WebView has been|Async Storage has|Accessing view manager|/)) {
        _console.warn(message);
    }
};
