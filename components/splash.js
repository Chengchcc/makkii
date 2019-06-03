import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ImageBackground, Dimensions, Text} from 'react-native';
import {user} from '../actions/user.js';
import {setting} from "../actions/setting.js";
import {accounts} from '../actions/accounts.js';
import {dbGet,decrypt} from '../utils';
import {strings} from "../locales/i18n";
import {ComponentLogo} from "./common";
import {fetchTokenDetail} from '../coins/eth/token';

const {width,height} = Dimensions.get('window');

class Splash extends Component {
	constructor(props){
		super(props);
	}


	componentWillMount(){
		fetchTokenDetail('0x722dd3f80bac40c951b51bdd28dd19d435762180', 'ropsten')
			.then(res=>console.log('get token =>',res))
			.catch(e=>console.log('get token err=>',e));
		console.log('[route] ' + this.props.navigation.state.routeName);
		const {navigate} = this.props.navigation;
		const {dispatch} = this.props;
		dbGet('settings').then(json => {
		    let setting_json =JSON.parse(json);
		    setting_json.coinPrice = undefined;
			this.props.dispatch(setting(setting_json));
			listenPrice.reset(setting_json.exchange_refresh_interval, setting_json.fiat_currency);
			listenPrice.startListen();
			// load db user
			dbGet('user')
				.then(json=>{
					// load db accounts
					const db_user = JSON.parse(json);
					dbGet('accounts')
						.then(json=>{
							let decrypted = decrypt(json, db_user.hashed_password);
							dispatch(accounts(JSON.parse(decrypted)));
						},err=>{
							console.log(err);
						});
					dispatch(user(db_user.hashed_password,
						db_user.mnemonic,
						db_user.hashed_pinCode!==undefined?db_user.hashed_pinCode:'',
						db_user.address_book!==undefined?db_user.address_book: {}));
					setTimeout(()=>{
						// navigate('signed_vault');
						navigate('unsigned_login');
					}, 1000);

				}, err=>{
					console.log('[splash] db.user null');
					setTimeout(()=>{
						navigate('unsigned_login');
					}, 1000);
				});

		}, err=> {
			console.log("load setting failed: ", err);
			listenPrice.setCurrency(this.props.setting.fiat_currency);
			setTimeout(()=>{
				navigate('unsigned_login');
			}, 1000);
		});
	}

	render(){
		return (
			<ImageBackground
				style={{
					flex: 1,
                    alignItems: 'center',
					paddingTop: 150,
				}}
				source={require('../assets/splash_bg.png')}
			>
                <ComponentLogo/>
                <Text style={{
                    fontSize: 24,
                    color: 'white',
                    marginTop: 20,
                }}>{strings('app_name')}</Text>
			</ImageBackground>
		);
	}
}

export default connect(state => {
	return {
		user: state.user,
        setting: state.setting,
	};
})(Splash);
