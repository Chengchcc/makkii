import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Clipboard, Dimensions, NativeModules, Platform, NativeEventEmitter } from 'react-native';
import { ComponentButton } from '../common.js';
import {strings} from "../../locales/i18n";
import defaultStyles from '../styles.js';
import {mainBgColor} from '../style_util';
import screenshotHelper from 'react-native-screenshot-helper';
import {AppToast} from "../../utils/AppToast";
import {createAction} from "../../utils/dva";
import {MnemonicView} from "../common";

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


	renderMnemonic = ()=>{
		const {mnemonic} = this.props;
		return mnemonic.split(' ').map(str=>{
			return(
				<MnemonicView
					key={str}
					canDelete={false}
					disabled={true}
					onSelected={()=>{}}
					text={str}
				/>
			)
		})
	};

	toBackup = ()=>{
		const {navigation} = this.props;
		navigation.navigate('signed_backup_tips');
	};

	render(){
		const {dispatch} = this.props.navigation;
		return (
			<View style={{
					flex: 1,
					padding: 40,
                	backgroundColor: mainBgColor,
					alignItems: 'center'
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
					flexDirection: 'row', flexWrap: 'wrap'
				}}>
					{this.renderMnemonic()}
				</View>
                <ComponentButton
					style={{width: width-80}}
                    title={strings('backup.button_backup_now')}
                    onPress={this.toBackup}
                />
				<View style={{marginBottom: 20}} />
                <ComponentButton
					style={{width: width-80}}
                    title={strings('backup.button_backup_later')}
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
