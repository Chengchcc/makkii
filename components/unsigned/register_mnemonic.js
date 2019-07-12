import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Clipboard, Dimensions, NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { ComponentButton, InputMultiLines } from '../common.js';
import {strings} from "../../locales/i18n";
import defaultStyles from '../styles.js';
import {mainBgColor} from '../style_util';
import screenshotHelper from 'react-native-screenshot-helper';
import {AppToast} from "../../utils/AppToast";
import {createAction} from "../../utils/dva";

const {width,height} = Dimensions.get('window');

const nativeBridge = NativeModules.RNScreenshotHelper;
const NativeModule = new NativeEventEmitter(nativeBridge);

class Mnemonic extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       title: strings('unsigned_register_mnemonic.title')
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		if (Platform.OS === 'android') {
			screenshotHelper.disableTakeScreenshot();
        } else {
			this.subscription = NativeModule.addListener('screenshot_taken',() => {
				AppToast.show(strings('toast_mnemonic_share_warning'), {
					duration: AppToast.durations.LONG,
					position: AppToast.positions.CENTER
				});
			});
		}
	}

	componentWillUnmount() {
	    if (Platform.OS === 'android') {
			screenshotHelper.enableTakeScreenshot();
		} else {
			this.subscription.remove();
		}
	}

	render(){
		const {mnemonic} = this.props;
		const {dispatch} = this.props.navigation;
		return (
			<View style={{
					flex: 1,
					padding: 40,
                	backgroundColor: mainBgColor,
				}}
			>
                <Text style={{
                	fontSize: 16,
					marginBottom: 20
				}}>{strings('unsigned_register_mnemonic.hint')}</Text>
                <View style={{
                    ...defaultStyles.shadow,
					padding: 10,
                    borderRadius: 5,
					height: 130,
					backgroundColor: 'white',
					width: width - 80,
                    marginBottom: 100,
				}}>
                    <InputMultiLines
                        editable={false}
                        value={mnemonic}
                        style={{
                            borderWidth: 0,
                            fontSize: 18,
                            fontWeight: 'normal',
                            textAlignVertical: 'top'
                        }}
                    />
				</View>
                <ComponentButton
                    title={strings('unsigned_register_mnemonic.btn_copy')}
                    onPress={e=>{
                        Clipboard.setString(mnemonic);
                        AppToast.show(strings('unsigned_register_mnemonic.toast_copy_mnemonic'));
                    }}
                />
				<View style={{marginBottom: 20}} />
                <ComponentButton
                    title={strings('unsigned_register_mnemonic.btn_done')}
                    onPress={e=>{
						dispatch(createAction('userModel/login')());
					}}
                />
			</View>
		);
	}
}

const mapToState = ({userModel})=>({
	mnemonic: userModel.mnemonic,
});

export default connect(mapToState)(Mnemonic);
