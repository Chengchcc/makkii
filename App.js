// libs
import React, {Component} from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import {createSwitchNavigator, createStackNavigator, createAppContainer} from 'react-navigation';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

// actions
import {accounts}          from './actions/accounts.js';
import {accounts_ledger}   from './actions/accounts_ledger.js';
import {dapps}             from './actions/dapps.js';
import {setting}           from './actions/setting.js';
import {user,user_signout} from './actions/user.js';

// reducers
import reducer_account         from './reducers/account.js';
import reducer_accounts        from './reducers/accounts.js';
import reducer_accounts_ledger from './reducers/accounts_ledger.js';
import reducer_dapps           from './reducers/dapps.js';
import reducer_setting         from './reducers/setting.js';
import reducer_user            from './reducers/user.js';

// store
const store = createStore(combineReducers({
	account:         reducer_account,
	accounts:        reducer_accounts,
	accounts_ledger: reducer_accounts_ledger,
	dapps:           reducer_dapps,
	setting:         reducer_setting,
	user:            reducer_user,
}));

// ui
import Scan                  from './components/scan.js';
import Splash                from './components/splash.js';
import Login                 from './components/unsigned/login.js';
import Register              from './components/unsigned/register.js';
import RegisterMnemonic      from './components/unsigned/register_mnemonic.js';
import Recovery              from './components/unsigned/recovery.js';
import RecoveryPassword      from './components/unsigned/recovery_password.js';
import Vault                 from './components/signed/vault/home.js';
import VaultAccount          from './components/signed/vault/account.js';
import VaultImportHdWallet   from './components/signed/vault/import_list';
import VaultImportPrivateKey from './components/signed/vault/import_private_key.js';
import VaultReceive          from './components/signed/vault/receive.js';
import VaultSend             from './components/signed/vault/send.js';
import VaultTransaction      from './components/signed/vault/transaction.js';
import Dapps                 from './components/signed/dapps/home.js';
import DappsDapp             from './components/signed/dapps/dapp.js';
import DappsLaunch           from './components/signed/dapps/launch.js';
import DappsSend 	         from './components/signed/dapps/dapp_send.js';
import Setting               from './components/signed/setting/home.js';
import SettingAbout          from './components/signed/setting/about.js';
import SettingPassword       from './components/signed/setting/password.js';
import SettingRecovery       from './components/signed/setting/recovery.js';
import SettingServices       from './components/signed/setting/services.js';
import SettingLanguage       from './components/signed/setting/language.js';
import SettingAdvanced       from './components/signed/setting/advanced.js';
import SettingCurrency       from './components/signed/setting/currency.js';
import SettingPrivacyPolicy  from './components/signed/setting/privacy_policy.js';


const navigationOptions = ({navigation}) => ({
            headerRight: (<View></View>),
			headerLeft: (
                    <TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
                    	width: 48,
						height: 48,
						alignItems: 'center',
						justifyContent: 'center',
					}}>
						<Image source={require('./assets/arrow_back.png')} style={{
							tintColor: 'black',
							width: 20,
							height: 20,
						}} />
					</TouchableOpacity>
                ),
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle
        });

const navigationOptionsWithoutRight = ({navigation}) => ({
	headerLeft: (
		<TouchableOpacity onPress={()=>{navigation.goBack()}} style={{
			width: 48,
			height: 48,
			alignItems: 'center',
			justifyContent: 'center',
		}}>
			<Image source={require('./assets/arrow_back.png')} style={{
				tintColor: 'black',
				width: 20,
				height: 20,
			}} />
		</TouchableOpacity>
	),
	headerStyle: styles.headerStyle,
	headerTitleStyle: styles.headerTitleStyle
});

const Routes = createAppContainer(createStackNavigator({
	'splash':   {
		screen:Splash,
		navigationOptions: {
            header: null
        }
	},
	'scan': {
        screen: Scan,
        navigationOptions: {
            header: null
        }
    },
	'unsigned_login': {
        screen: Login,
        navigationOptions: {
            header: null
        }
    },
  	'unsigned_register': {
        screen: Register,
        navigationOptions,
    },
  	'unsigned_register_mnemonic': {
        screen: RegisterMnemonic,
        navigationOptions,
    },
  	'unsigned_recovery': {
        screen: Recovery,
        navigationOptions,
    },
  	'unsigned_recovery_password': {
        screen: RecoveryPassword,
        navigationOptions,
    },
	'signed_vault': {
		screen: Vault,
		navigationOptions: {
            header: null
        }
	},
	'signed_vault_account': {
		screen: VaultAccount,
		navigationOptions,
	},
	'signed_vault_import_list': {
		screen: VaultImportHdWallet,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_vault_import_private_key': {
		screen: VaultImportPrivateKey,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_vault_receive': {
		screen: VaultReceive,
		navigationOptions,
	},
	'signed_vault_send': {
		screen: VaultSend,
		navigationOptions,
	},
	'signed_vault_transaction': {
		screen: VaultTransaction,
		navigationOptions,
	},
	'signed_dapps': {
		screen: Dapps,
		navigationOptions: {
            headerLeft: null,
            headerRight: null,
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }
	},
	'signed_dapps_dapp': {
		screen: DappsDapp,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_dapps_launch': {
		screen: DappsLaunch,
		navigationOptions,
	},
	'signed_dapps_send': {
		screen: DappsSend,
		navigationOptions: {
			headerStyle: styles.headerStyle,
			headerTitleStyle: styles.headerTitleStyle,
		}
	},
	'signed_setting': {
		screen: Setting,
		navigationOptions: {
			headerLeft: null,
            headerRight: null,
            headerStyle: styles.headerStyle,
            headerTitleStyle: styles.headerTitleStyle,
        }
	},
	'signed_setting_about': {
		screen: SettingAbout,
		navigationOptions,
	},
	'signed_setting_password': {
		screen: SettingPassword,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_setting_recovery': {
		screen: SettingRecovery,
		navigationOptions,
	},
	'signed_setting_services': {
		screen: SettingServices,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_setting_currency': {
		screen: SettingCurrency,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_setting_language': {
		screen: SettingLanguage,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_setting_advanced': {
		screen: SettingAdvanced,
		navigationOptions: navigationOptionsWithoutRight,
	},
	'signed_setting_privacy_policy': {
		screen: SettingPrivacyPolicy,
		navigationOptions,
	}
}, {
	initialRouteName: 'splash',
	swipeEnabled: false,
  	animationEnabled: false,
  	lazy: true,
  	transitionConfig: () => ({
		transitionSpec: {
			duration: 0,
		},
  	}),
}));

import { YellowBox } from 'react-native';
import _ from 'lodash';

YellowBox.ignoreWarnings(['Setting a timer', 'WebView has been']);
const _console = _.clone(console);
console.warn = message => {
	if (message.indexOf('Setting a timer') <= -1 && message.indexOf('WebView has been') <= -1) {
		_console.warn(message);
	}
};

const defaultGetStateForAction = Routes.router.getStateForAction;
Routes.router.getStateForAction = (action, state) => {
	//console.log('[action.type] ' + action.type);
	//console.log(state);
    if (state) {
    	let newRoutes, newIndex;
    	switch(action.type){
    		case 'Navigation/COMPLETE_TRANSITION':
    			// condition routes from login, register and recovery
    			switch(state.routes[state.routes.length - 1].routeName){
					case 'unsigned_login':
						console.log("before unsigned login routes:", state.routes);
						newRoutes = [
							state.routes[state.routes.length - 1]
						];
						newIndex = 0;
						return defaultGetStateForAction(action, {index:newIndex,routes:newRoutes});
                    case 'signed_vault':
                        newRoutes = [
                            state.routes[state.routes.length - 1]
                        ];
                        newIndex = 0;
                        return defaultGetStateForAction(action, {index:newIndex,routes:newRoutes});
                    default:
                        return defaultGetStateForAction(action, state);
                }
    		case 'Navigation/BACK':
                switch(state.routes[state.routes.length - 1].routeName){
                    case 'unsigned_login':
                        newRoutes = [
                            state.routes[state.routes.length - 1]
                        ];
                        newIndex = 0;
                        return defaultGetStateForAction(action, {index:newIndex,routes:newRoutes});
                    default:
                        newRoutes = state.routes.filter(
                            r =>
                                r.routeName !== 'scan' &&
                                r.routeName !== 'splash'
                        );
                        newIndex = newRoutes.length - 1;
                        return defaultGetStateForAction(action, {index:newIndex,routes:newRoutes});
                }
    		default:
    			return defaultGetStateForAction(action, state);
    	}
    }
    return defaultGetStateForAction(action, state);
};

// dummy
import data from './data.js';
store.dispatch(dapps(data.dapps));

import {listenTransaction, listenCoinPrice} from './utils';
global.listenTx = new listenTransaction(store);
global.listenPrice = new listenCoinPrice(store);

export default class App extends Component {
	render() {
		return (
			<Provider store={store}>
				<Routes />
			</Provider>
		);
	}
}
