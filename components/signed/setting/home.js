import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Dimensions,View,Button,StyleSheet} from 'react-native';
import AionCell from '../../cell.js'; 
import {user_signout} from '../../../actions/user.js';
import {strings} from '../../../locales/i18n';
import {ComponentTabBar} from '../../common.js';
import styles from '../../styles.js';

class Home extends Component {
	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
			title: strings('menu.title_settings')
	    };
    };
	constructor(props){
		super(props);
	}
	async componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log(this.props.setting);
	}
	render(){
		return ( 
			<View style={{
				backgroundColor: '#eeeeee',
				flex:1,
			}}>
				<View style={styles.marginTop60} />
                <AionCell
                    title={strings('password.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_password');
                    }}
                />
                <AionCell
                    title={strings('recovery_phrase.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_recovery');
                    }}
                />
                <AionCell
                    title={strings('service_configuration.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_services');
                    }}
                />
				<AionCell
					title={strings('language.title')}
					onClick={() => {
						this.props.navigation.navigate('signed_setting_language');
					}}
					/>
                <AionCell
                    title={strings('about.title')}
                    onClick={() => {
                        this.props.navigation.navigate('signed_setting_about');
                    }}
                />
				<View style={styles.marginTop60} />
                <AionCell
					title={strings('logout')}
					onClick={() => {
						const { dispatch } = this.props; 
						dispatch(user_signout());
						setTimeout(()=>{
							this.props.navigation.navigate('unsigned_login');
						},200);
					}}/>
				<ComponentTabBar 
					// TODO
					style={{
						position: 'absolute',
						bottom: 0,
						right: 0,
						left: 0,
						backgroundColor: 'white',
						flexDirection: 'row',
						justifyContent: 'space-around',  
						borderTopWidth: 0.3,
						borderTopColor: '#8c8a8a'  
					}}
					active={'settings'}
					onPress={[
						()=>{this.props.navigation.navigate('signed_vault');},
						()=>{this.props.navigation.navigate('signed_dapps');},
						()=>{this.props.navigation.navigate('signed_setting');},
					]}
				/>
			</View>
		);
	}
}

export default connect(state => { 
	return { 
		setting: state.setting 
	}; 
})(Home);