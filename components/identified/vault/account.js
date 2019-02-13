import React, { Component } from 'react';
import { connect } from 'react-redux';
import {FlatList, View, TouchableOpacity, Text, Button, PixelRatio, Image,Clipboard, Dimensions, RefreshControl} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import styles from '../../styles.js';
import {EditableView} from "../../common";
import {fetchRequest} from "../../../utils";
import {update_account_name, update_account_txs} from "../../../actions/accounts";
import Toast from '../../toast.js';
import BigNumber from 'bignumber.js';
const {width} = Dimensions.get('window');
Date.prototype.Format = function (fmt) {
	let o = {
		"M+": this.getMonth() + 1, //month 
		"d+": this.getDate(), //day 
		"h+": this.getHours() % 12, //hour 
		"m+": this.getMinutes(), //minute 
		"s+": this.getSeconds(), //seconds 
		"q+": Math.floor((this.getMonth() + 3) / 3), //quarter 
		"S": this.getMilliseconds() //milliseconds 
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substring(4 - RegExp.$1.length));
	for (let k in o){
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substring(("" + o[k]).length)));
		}
	}
	fmt = this.getHours() > 12 ? fmt + 'PM' : fmt + 'AM';
	return fmt;
};

class Account extends Component {

	static navigationOptions = ({ navigation }) => {
	    const { state } = navigation;
	    return {
	        title: state.params ? state.params.title : '',
	        headerTitleStyle: {
	        	alignSelf: 'center',
				textAlign: 'center',
				width: '100%',
	        },
	        headerStyle: {
	        	shadowOpacity: 0,
	        	shadowOffset: { 
	        		height: 0, 
	        		width:0, 
	        	}, 
	        	shadowRadius: 0, 
	        	borderBottomWidth:0,
	        	elevation: 1,
	        },
			headerRight: <View></View>
	    };
    };
	constructor(props){
		super(props);
		this.state={
			refreshing: false,
		};
		this.addr=this.props.navigation.state.params.address;
	}
	async componentDidMount(){

	}
	componentWillMount(): void {
		console.log('[route] ' + this.props.navigation.state.routeName);
		this.props.navigation.setParams({
			title: this.props.accounts[this.addr].name
		});
	}

	_renderTransaction(transaction){
		const timestamp = new Date(transaction.timestamp).Format("yyyy/MM/dd/ hh:mm");
		const value = transaction.from === this.addr? -transaction.value: transaction.value;
		return (
			<TouchableOpacity
				onPress={e => {
					//dispatch(account(this.props.accounts[this.addr][key]));
					this.props.navigation.navigate('VaultTransaction');
				}}
			>
				<View style={styles.Transaction.container}>
					<View style={styles.Transaction.subContainer}>
						<Text style={{
							color: 'grey',
						}}>{ timestamp }</Text>
						<Text style={{
							color: 'grey',
						}}>{ transaction.status }</Text>
					</View>
					<View style={styles.Transaction.subContainer}>
						<Text style={{
							color: 'grey',
						}}>{ transaction.hash.substring(0, 16) + ' ...' }</Text>
						<Text style={{
							color: 'grey',
						}}>{ value.toFixed(2) } AION</Text>
					</View>
				</View>
			</TouchableOpacity>
		)
	}
	onChangeName = (newName) =>{
		const {dispatch} = this.props;
		const key = this.props.accounts[this.addr].address;
		dispatch(update_account_name(key,newName));
		this.props.navigation.setParams({
			title: newName
		});
	};

	onRefresh =(address)=>{
		this.setState({
			refreshing: true,
		});
		this.fetchAccountTransacions(address);
	};

	fetchAccountTransacions = (address, page=0, size=25)=>{
		const url = `https://mainnet-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address}&page=${page}&size=${size}`;
		fetchRequest(url).then(res=>{
			console.log('[fetch result]', res);
			let txs = {};
			const {content} = res;
			content.forEach(value=>{
				let tx={};
				tx.hash = '0x'+value.transactionHash;
				tx.timestamp = value.transactionTimestamp/1000;
				tx.from = '0x'+value.fromAddr;
				tx.to = '0x'+value.toAddr;
				tx.value = new BigNumber(value.value,16).shiftedBy(-18);
				tx.status = value.txError === ''? 'CONFIRMED':'FAILED';
				txs[tx.hash]=tx;
			});
			const {dispatch} = this.props;
			console.log('[txs] ', JSON.stringify(txs));
			dispatch(update_account_txs(address,txs));
			this.setState({
				refreshing: false,
			})
		},error => {
			console.log(error);
			this.setState({
				refreshing: false,
			})
		})
	};
	render(){
		const {navigation} = this.props;
		return (
			<View style={{flex:1, justifyContent: 'space-between'}}>
				<View style={styles.Account.summaryContainer}>
					<View style={styles.Account.summaryLeftContainer}>
						<EditableView
							value={this.props.accounts[this.addr].name}
							endInput={this.onChangeName.bind(this)}
							type={this.props.accounts[this.addr].type}
						/>
						<Text>{ this.props.accounts[this.addr].balance } AION</Text>
					</View>
					<View>
						<QRCode
							value={this.props.accounts[this.addr].address}
							size={100}
							color='purple'
							backgroundColor='white'
						/>
					</View>
				</View>
				<View style={styles.Account.addressView}>
					<Text style={{fontSize:10, textAlign:'auto',marginRight: 10}}>{ this.props.accounts[this.addr].address }</Text>
					<TouchableOpacity onPress={()=>{
						Clipboard.setString(this.props.accounts[this.addr].address);
						this.refs.toast.show('Copied to clipboard successfully');
					}}>
						<Image source={require("../../../assets/copy.png")} style={{width:20, height:20}}/>
					</TouchableOpacity>
				</View>

				<View style={{...styles.Account.buttonContainer, width:width}}>
					<Button
						title="SEND"
						onPress={()=>{
							navigation.navigate('VaultSend');
						}}
					/>
					<Button
						title="RECEIVE"
						onPress={()=>{
							navigation.navigate('VaultReceive');
						}}
					/>
				</View>
				<FlatList
					style={{margin:10}}
					data={Object.values(this.props.accounts[this.addr].transactions)}
					keyExtractor={(item,index)=>index + ''}
					renderItem={({item})=>this._renderTransaction(item)}
                    ItemSeparatorComponent={()=><View style={{backgroundColor:'#000', height: 1/PixelRatio.get()}}/>}
					ListEmptyComponent={()=>
						<View style={{alignItems:'center', backgroundColor:'#fff'}}>
						<Text>No Transaction</Text>
						</View>}
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={()=>this.onRefresh(this.props.accounts[this.addr].address)}
							title={'loading'}
						/>
					}
				/>
				<Toast
					ref={"toast"}
					duration={Toast.Duration.short}
					onDismiss={() => {}}
				/>
			</View>
		)
	}
}

export default connect(state => {
	return ({
		accounts: state.accounts,
	});
})(Account);