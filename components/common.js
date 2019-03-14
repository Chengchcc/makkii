import React,{ Component } from 'react';
import {View, TextInput, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator,PixelRatio} from 'react-native';
import styles from './styles.js';
import PropTypes from 'prop-types';
import {strings} from '../locales/i18n';
import {mainColor, fontColor} from './style_util';

class ComponentButton extends Component{
	render(){
		return (
			<TouchableOpacity onPress={this.props.onPress}> 
			    <Text style={{
			    	backgroundColor: '#455372',
			    	color: 'white',
			    	paddingTop: 10,
			    	paddingBottom: 10, 
			    	borderRadius: 5,
			    	width: '100%',
			    	textAlign: 'center',
			    	fontWeight: 'bold',
			    	fontSize: 18,
			    }}>
			   		{this.props.title}    
			    </Text>
			</TouchableOpacity >
		);
	}
}

class ComponentTabBar extends Component{
	static defaultProps={
		activeTintColor: '#6c7476',
		inactiveTintColor: '#adb0b5',
	};
	static propTypes= {
		activeTintColor: PropTypes.string,
		inactiveTintColor: PropTypes.string,
		active: PropTypes.string.isRequired,
	}
	render(){
		const wallet_tint_color =  this.props.active === 'wallet'?  this.props.activeTintColor:this.props.inactiveTintColor;
		const dapp_tint_color =  this.props.active === 'dapp'?  this.props.activeTintColor:this.props.inactiveTintColor;
		const settings_tint_color =  this.props.active === 'settings'?  this.props.activeTintColor:this.props.inactiveTintColor;
		return (
			<View style={{...this.props.style}}>
				<TouchableOpacity
					activeOpacity={1}
					onPress={e=>{
						this.props.onPress[0]()
					}}
				>
					<View
						style={{height:50,justifyContent:'center',alignItems:'center'}}
					>
						<Image source={require('../assets/tab_wallet.png')} style={{width:24, height: 24, marginTop:2, opacity: 0.6, tintColor: wallet_tint_color}} />
						<Text style={{fontSize: 8, color:wallet_tint_color }}>{strings('menuRef.title_wallet')}</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					activeOpacity={1}
					onPress={e=>{
						this.props.onPress[1]()
					}}
				>
					<View
						style={{height:50,justifyContent:'center',alignItems:'center'}}
					>
						<Image source={require('../assets/tab_app.png')} style={{width: 24, height: 24, marginTop:2,opacity: 0.6, tintColor: dapp_tint_color}} />
						<Text style={{fontSize: 8, color:dapp_tint_color }}>{strings('menuRef.title_dapps')}</Text>
					</View>
				</TouchableOpacity>
				<TouchableOpacity
					activeOpacity={1}
					onPress={e=>{
						this.props.onPress[2]()
					}}
				>
					<View
						style={{height:50,justifyContent:'center',alignItems:'center'}}
					>
						<Image source={require('../assets/tab_settings.png')} style={{width: 24, height: 24, marginTop:2,opacity: 0.6, tintColor: settings_tint_color}} />
						<Text style={{fontSize: 8, color:settings_tint_color }}>{strings('menuRef.title_settings')}</Text>
					</View>
				</TouchableOpacity>
			</View>
		);
	}
} 

class ComponentLogo extends Component{
	render(){
		return(
			<Image
				style={{
					width:50,
					height:50,
                    resizeMode: 'contain'
				}}
				source={require('../assets/app_logo.png')}
			/>
		);
	}
}

class Input extends Component{
	static defaultProps = {
		supportVisibility: true
	};
	constructor(props){
		super(props);
	}
	render(){
		return (
			<View>
				<TextInput
					style={ styles.input.text_input }
			        onChangeText={ val => {
			        	this.props.onChange(val);
			        }}
			        value={ this.props.value }
			    />
				{this.props.supportVisibility &&
					<Text
						style={styles.input.text}
						onPress={e => {
							this.props.onClear(e);
						}}
					>CLR</Text>
				}
		    </View>
		);
	}
}

class InputMultiLines extends Component{
    static defaultProps = {
		numberOfLines: 4,
        borderRadius: 0,
		value: '',
		editable: true,
    };
	constructor(props){
		super(props);
	}
	render(){
		return (
				<TextInput
					style={{
					    ...this.props.style,
					}}
                    editable={this.props.editable}
					numberOfLines={this.props.numberOfLines}
					multiline={true}
					value={this.props.value}
			        onChangeText={ val => {
			        	this.props.onChangeText(val);
			        }}
			    />
		);
	}
}

const Show = ()=> <Image style={{width:20,height:20}} source={require('../assets/view_32x32.png')} />;

const Hide = ()=> <Image style={{width:20,height:20}} source={require('../assets/hide_32x32.png')} />;

const Visible = () => <Image style={{width:20,height:20,resizeMode: 'contain'}} source={require('../assets/visible.png')} />
const Invisible = () => <Image style={{width:20,height:20,resizeMode: 'contain'}} source={require('../assets/invisible.png')} />

class ComponentPassword extends Component {

	constructor(props){
		super(props);
		this.state = {
			secure: true
		};
	};

	render(){
		return (
			<View style={styles.password.view}>
                <Image style={{width:24, height: 24, resizeMode: 'contain'}} source={require('../assets/icon_password.png')} />
				<TextInput
					style={styles.password.text_input}
					placeholder={this.props.placeholder}
			        onChangeText={e=>{
			        	this.props.onChange(e);
			        }}
			    	onBlur={e=>{
			    		this.setState({
			    			secure: true
			    		});	
			    	}}
			        secureTextEntry={this.state.secure}
			        value={this.props.value}
			    />
			    <TouchableOpacity
			    	style={styles.password.display}
			    	onPress={e=>{
			    		this.setState({
			    			secure: !this.state.secure
			    		});
			    	}}
			    >
			    	{
			    		this.state.secure ?
			    		<Hide />: <Show /> 
			    	}
			    </TouchableOpacity> 
		    </View>
		);
	};
}

class PasswordInputWithTitle extends Component {
	constructor(props){
		super(props);
		this.state = {
			secure: true
		};
	};

	render(){
		return (
		    <View>
				<Text style={{
					marginBottom: 5,
					fontSize: 16,
					fontWeight: 'bold'
				}}>{this.props.title}</Text>
                <View style={{
                        flexDirection: 'row',
                        height: 50,
                        alignItems: 'center',
                    }}
                >
                    <TextInput
                        style={{
							fontSize: 16,
							color: fontColor,
							fontWeight: 'normal',
							lineHeight: 20,
							paddingRight: 45,
							borderColor: 'lightgray',
							borderBottomWidth: 1,
							flex: 1,
						}}
                        placeholder={this.props.placeholder}
                        onChangeText={e=>{
                            this.props.onChange(e);
                        }}
                        onBlur={e=>{
                            this.setState({
                                secure: true
                            });
                        }}
                        secureTextEntry={this.state.secure}
                        value={this.props.value}
                    />
                    <TouchableOpacity
                        style={styles.password.display}
                        onPress={e=>{
                            this.setState({
                                secure: !this.state.secure
                            });
                        }}
                    >
                        {
                            this.state.secure ?
                                <Invisible />: <Visible />
                        }
                    </TouchableOpacity>
                </View>
			</View>
		);
	};
}
class PasswordInput extends Component {
	constructor(props){
		super(props);
		this.state = {
			secure: true
		};
	};

	render(){
		return (
			<View style={styles.password.view}>
                <Image
                    style={{
                        width: 20,
                        height: 20,
                        resizeMode: 'contain',
                        position: 'absolute',
                        left: 0,
                    }}
                    source={require('../assets/icon_password.png')}
                />
				<TextInput
					style={styles.password.text_input}
					placeholder={this.props.placeholder}
					onChangeText={e=>{
						this.props.onChange(e);
					}}
					onBlur={e=>{
						this.setState({
							secure: true
						});
					}}
					secureTextEntry={this.state.secure}
					value={this.props.value}
				/>
				<TouchableOpacity
					style={styles.password.display}
					onPress={e=>{
						this.setState({
							secure: !this.state.secure
						});
					}}
				>
					{
						this.state.secure ?
							<Invisible />: <Visible />
					}
				</TouchableOpacity>
			</View>
		);
	};
}

class ImportListItem extends React.Component {
	shouldComponentUpdate(nextProps, nextState, nextContext): boolean {
		return this.props.selected !== nextProps.selected;
	}
	render(){
		const {item} = this.props;
		const cbImage =  this.props.selected? require('../assets/cb_enabled.png') : require('../assets/cb_disabled.png');
		const address = item.account.address;
		return (
			<View style={{...this.props.style}}>
				<TouchableOpacity style={styles.ImportList.container} onPress={this.props.onPress}>
					<Image source={cbImage} style={styles.ImportList.itemImage}/>
					<Text style={styles.ImportList.itemText}>{address.substring(0, 10) + '...'+ address.substring(address.length-10)}</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

class ImportListfooter extends React.PureComponent {

	render() {
		if (this.props.footerState === 1) {
			return (
				<View style={{height:30,alignItems:'center',justifyContent:'flex-start',}}>
					<View style={{backgroundColor:'lightgray',height:1/PixelRatio.get()}}/>
					<Text style={{color:'#999999',fontSize:14,marginTop:5,marginBottom:5,}}>
						No More Accounts
					</Text>
				</View>
			);
		} else if(this.props.footerState === 2) {
			return (
				<View>
					<View style={{backgroundColor:'lightgray',height:1/PixelRatio.get()}}/>
					<View style={styles.ImportList.footer}>
						<ActivityIndicator style={{paddingRight: 10}}/>
					<Text>Fetching accounts</Text>
				</View>
				</View>
			);
		} else if(this.props.footerState === 0){
			return (
				<View style={styles.ImportList.footer}>
					<Text></Text>
				</View>
			);
		}
	}
}

class EditableView extends  React.PureComponent {

	static defaultProps={
		value: 'Account Name',
		color: 'black',
		type: 0,
		endInput: ()=>{},
	};
	constructor(props){
		super(props);
		this.state={
			value:this.props.value,
			editable:false,
		};
		this.textInputRef=null;
	}
	_onPress(){
		const {editable} = this.state;
		this.setState({
			editable: !editable,
		},()=>{
			if (this.state.editable){
				this.textInputRef.focus();
			}else {
				this.textInputRef.blur();
				this.props.endInput(this.state.value);
			}
		})
	}

	render(){
		let typeImage ='';
		switch (this.props.type) {
			case '[ledger]':
				typeImage = require('../assets/ledger_logo.png');
				break;
			case '[pk]':
				typeImage = require('../assets/key.png');
				break;
			default:
				typeImage = require('../assets/aion_logo.png')
		}
		return(
			<View style={{flexDirection: 'row',alignItems: 'center'}}>
				<Image source={typeImage} style={{width:20, height:20, marginRight:10}}/>
				<View style={{marginRight: 30}}>
					<TextInput
						ref={ref=>this.textInputRef=ref}
						numberOfLines={1}
						value={this.state.value}
						editable={this.state.editable}
						style={{color:this.props.color, padding:0}}
						onChangeText={value=>this.setState({value})}
					/>
					{
						this.state.editable?<View style={{backgroundColor:'#000',height:1/ PixelRatio.get()}}/>:null
					}
				</View>
				<TouchableOpacity onPress={()=>this._onPress()} style={{right: 0, position:'absolute'}}>
					{
						this.state.editable?<Image source={require('../assets/ok-s.png')} style={{width:20,height:20}}/>
						:<Image source={require('../assets/edit.png')} style={{width:20,height:20}}/>
					}
				</TouchableOpacity>
			</View>
		)
	}
}

class TransactionItemCell extends React.PureComponent {
	static defaultProps={
		valueTextAlign: 'right',
	};
	render(){
		return(
			<View style={{...this.props.style,backgroundColor: '#fff', padding:10,flexDirection:'row',width:'100%',justifyContent:'space-around',alignItems:'flex-start'}}>
				<Text style={{flex:3}}>{this.props.title}</Text>
				<Text style={{flex:5,borderBottomColor:'#000',borderBottomWidth: 1,textAlign:this.props.valueTextAlign}}>{this.props.value}</Text>
			</View>
		)
	}
}

class UnsignedActionButton extends Component{
	render(){
		return (
			<TouchableOpacity onPress={this.props.onPress}>
				<Text style={{
					backgroundColor: mainColor,
					color: 'white',
					paddingTop: 10,
					paddingBottom: 10,
					borderRadius: 5,
					width: '100%',
					textAlign: 'center',
					fontWeight: 'bold',
					fontSize: 18,
				}}>
					{this.props.title}
				</Text>
			</TouchableOpacity >
		);
	}
}

module.exports = {
	ComponentButton,
	ComponentTabBar,
	ComponentLogo,
	Input,
	InputMultiLines,
	ComponentPassword,
    PasswordInput,
	PasswordInputWithTitle,
	ImportListItem,
	ImportListfooter,
	EditableView,
	TransactionItemCell,
	UnsignedActionButton
};