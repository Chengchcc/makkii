import React,{Component} from 'react';
import {connect} from 'react-redux';
import {View, Alert, TouchableOpacity, Keyboard, Dimensions} from 'react-native';
import {UnsignedActionButton,PasswordInput} from '../common.js';
import {validatePassword, hashPassword, dbGet} from '../../utils.js';
import {user} from '../../actions/user.js';
import {delete_accounts} from "../../actions/accounts";
import {generateMnemonic} from '../../libs/aion-hd-wallet/index.js';
import {strings} from "../../locales/i18n";
import {mainColor} from '../style_util';

const {width,height} = Dimensions.get('window');

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			title: strings("register.title"),
		};
	}
	constructor(props){
		super(props); 
		this.state = { 
			password: '',            
			password_confirm: '',
			// alert once if there is data loaded from db when user wanna register new account
			// user will lose data if register new one
			alerted: false,
		}; 
	}
	async componentDidMount(){
	}
	render(){
		const { dispatch } = this.props;
		return (
			<TouchableOpacity activeOpacity={1} onPress={() => {Keyboard.dismiss()}} style={{
				flex: 1,
                width:width,
				height:height,
				alignItems:'center',
			}}>
                <View style={{
                	position: 'absolute',
					top: 0,
                	width: width,
                	height: 200,
					backgroundColor: mainColor,
				}}>
				</View>
				<View style={{
					marginTop: 60,
					width: width - 80,
					height: 300,
					borderRadius: 10,
					backgroundColor: 'white',
					elevation: 3,
					paddingLeft: 20,
					paddingRight: 20,
					paddingTop: 40,
				}} >
					<PasswordInput
						value={this.state.password}
						placeholder={strings('register.hint_enter_password')}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
                    <View style={{marginTop: 30}}/>
					<PasswordInput
						value={this.state.password_confirm}
						placeholder={strings('register.hint_enter_confirm_password')}
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
					/>
					<View style={{marginTop: 40}}/>
					<UnsignedActionButton
						title={strings("register.button_register")}
						onPress={e=>{
							if (!validatePassword(this.state.password))
								Alert.alert(strings('alert_title_error'),strings("register.error_password"));
							else if (this.state.password !== this.state.password_confirm)
								Alert.alert(strings('alert_title_error'),strings("register.error_dont_match"));
							else {
								const hashed_password = hashPassword(this.state.password);
								const mnemonic = generateMnemonic();
								dbGet('user').then(userJson=>{
									Alert.alert(
										strings('alert_title_warning'),
										strings("register.warning_register_again"),
										[
											{text: strings('cancel_button'),onPress:()=>{}},
											{text: strings('alert_ok_button'),onPress:()=>{
													console.log('mnemonic ', mnemonic);
													dispatch(user(hashed_password, mnemonic));
													dispatch(delete_accounts(hashed_password));
													this.props.navigation.navigate('unsigned_register_mnemonic')

												}},
										]
									)
								},err=>{
									dispatch(user(hashed_password, mnemonic));
									this.props.navigation.navigate('unsigned_register_mnemonic')
								})
							}
						}}
					/>
				</View>
			</TouchableOpacity>
		);
	}
}

export default connect(state=>{
	return {
		user: state.user
	};
})(Home);