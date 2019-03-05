import React, {Component} from 'react';
import {Keyboard,TouchableOpacity,View,Text, Alert} from 'react-native';
import {ComponentPassword, ComponentButton} from '../common.js';
import {connect} from 'react-redux'; 
import {hashPassword,validatePassword} from '../../utils.js';
import {user} from '../../actions/user.js';
import styles from '../styles.js';
import {strings} from "../../locales/i18n";

class Password extends Component {
	static navigationOptions = ({ navigation }) => {
	    return {
	       	title: strings('recovery_password.title'),
	    };
    };
	constructor(props){
		super(props);
		this.state = {
			mnemonic: '',
			password: '',            
			password_confirm: '',
		}
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
	}
	async componentWillReceiveProps(props){   
		this.setState({
			mnemonic: props.navigation.getParam('mnemonic', '')  
		});
	}
	render(){
		const {dispatch} = this.props; 
		return (
			<TouchableOpacity activeOpacity={1} onPress={() => {Keyboard.dismiss()}}>
			<View style={ styles.container }>
				<Text>{strings('recovery_password.label_password')}</Text>
				<View style={styles.marginBottom20}>
					<ComponentPassword  
						value={this.state.password}
						onChange={e=>{
							this.setState({
								password: e
							});
						}}
					/>
				</View>
				<Text>{strings('recovery_password.label_confirm_password')}</Text>
				<View style={styles.marginBottom20}>
					<ComponentPassword 
						value={this.state.password_confirm} 
						onChange={e=>{
							this.setState({
								password_confirm: e
							});
						}}
					/>
				</View>
				<ComponentButton
					title={strings('recovery_password.button_reset')}
					onPress={e=>{
						if (!validatePassword(this.state.password)) {
						    Alert.alert(strings('alert_title_error'), strings('recovery_password.error_password'));
						} else if (this.state.password !== this.state.password_confirm) {
							Alert.alert(strings('alert_title_error'), strings('recovery_password.error_dont_match'));
						} else {
							let hashed_password = hashPassword(this.state.password);
							dispatch(user(hashed_password, this.state.mnemonic)); 
							this.setState({
								password: '',
								password_confirm: '',
								mnemonic: ''
							});
						    this.props.navigation.navigate('signed_vault');
						}    
					}}
				/>
			</View>
			</TouchableOpacity>
		);
	}
}

export default connect()(Password);