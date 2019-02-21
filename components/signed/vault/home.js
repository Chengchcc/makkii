import React from 'react';
import {connect} from 'react-redux';
import {
	Alert,
	DeviceEventEmitter,
	Dimensions,
	FlatList,
	Image,
	PermissionsAndroid,
	PixelRatio,
	RefreshControl,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';
import SwipeableRow from '../../swipeCell';
import {accounts_add, delete_account} from '../../../actions/accounts.js';
import {account} from '../../../actions/account.js';
import wallet from 'react-native-aion-hw-wallet';
import otherStyles from '../../styles';
import {strings} from "../../../locales/i18n";
import {ComponentTabBar} from '../../common.js';
import BigNumber from 'bignumber.js';
import Toast from "react-native-root-toast";
import {ModalList} from "../../modalList";
import {HomeComponent} from "../HomeComponent";
import HomeHeader from "./home_header";

const {width, height} = Dimensions.get('window');
const mWidth = 180;
const top = 100;

const SORT = [
	{
		title: 'sort.balance',
	},
	{
		title: 'sort.transaction',
	},
];

const FILTER = [
	{
		title: 'filter.all',
	},
	{
		title: 'filter.masterKey',
	},
	{
		title: 'filter.privateKey',
	},
	{
		title: 'filter.ledger',
	},
];

function sortAccounts(src,select){
	let res = src;
	switch (select) {
		case SORT[0].title:
			res =  res.sort((a,b)=>{
				return b.balance-a.balance
			});
			break;
		case SORT[1].title:
			res =  res.sort((a,b)=>{
				return Object.keys(b.transactions).length - Object.keys(a.transactions).length;
			});
			break;
	}

	return res;
}

function filterAccounts(src,select){
	let res = src;
	switch (select) {
		case FILTER[1].title:
			res  = res.filter(a=>{
				return a.type === '[local]';
			});
			break;
		case FILTER[2].title:
			res  = res.filter(a=>{
				return a.type === '[pk]';
			});
			break;
		case FILTER[3].title:
			res  = res.filter(a=>{
				return a.type === '[ledger]';
			});
			break;
	}
	return res;
}

function searchAccounts(src,keyword){
	if(keyword==='')
		return src;
	return src.filter(a => {
		return a.name.indexOf(keyword) >= 0;
	});
}


class Home extends HomeComponent {

	static navigationOptions = ({ navigation }) => {
	    return {
	        header: null
	    };
    };
	constructor(props){
		super(props);
		this.menuRef=null;
		this.state={
			showSort: false,
			sortOrder: SORT[0].title,
			showFilter: false,
			filter: FILTER[0].title,
			totalBalance: 0,
			openRowKey: null,
			scrollEnabled:true,
			refreshing: false,
			keyWords:'',
		};

	}

	async requestStoragePermission() {
		try {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				{
					title: strings('permission_storage_title'),
					message: strings('permission_storage_message'),
					buttonPositive: strings('ok_button'),
					buttonNegative: strings('cancel_button'),
				}
			);
			if (granted === PermissionsAndroid.RESULTS.GRANTED) {
				console.log('storage permission is granted');
			} else {
				console.log('storage permission is denied.');
			}
		} catch (err) {
			console.error("request permission error: ", err);
		}
	}

	componentDidMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		console.log('[route] ' + this.props.accounts);
		this.requestStoragePermission();
		this.isMount = true;
		this.listener = DeviceEventEmitter.addListener('updateAccountBalance',()=>this.fetchAccountsBalance());
	}


	componentWillUnmount(): void {
		this.isMount = false;
		this.listener.remove();
	}

	fetchAccountsBalance = ()=> {
		console.log('fetchAccountsBalance')
		const {dispatch,accounts} = this.props;
		if (Object.keys(accounts).length === 0) {
			if (this.isMount) {
				this.setState({
					refreshing: false,
				});
			}
			return;
		}
		let executors=[];
		Object.values(accounts).map(value => {
			executors.push(
				new Promise((resolve, reject) => {
					web3.eth.getBalance(value.address).then(balance=>{
						value.balance = new BigNumber(balance).shiftedBy(-18).toNumber();
						resolve(value)
					},error => {
						reject(error)
					})
				}));
		});
		Promise.all(executors).then(
			res=>{
				let newAccounts={};
				let totalBalance=0;
				res.forEach(account=>{
					totalBalance+=account.balance;
					newAccounts[account.address] = account;
				});
				console.log('totalBalance', totalBalance);
				dispatch(accounts_add(newAccounts, this.props.user.hashed_password));
				this.isMount&&this.setState({
					refreshing: false,
					totalBalance,
				})
			},errors=>{
				console.log(errors);
				this.isMount&&this.setState({
					refreshing: false,
				}, () => {
					Toast.show("Unable to connect to remote server");
				})
			}
		)
	};

	onRefresh = () => {
		this.setState({
			refreshing: true
		});
		setTimeout(()=>{
			this.fetchAccountsBalance();
		}, 1000);
	};



	_onOpen (Key: any) {
		console.log('[onOpen]');
		this.setState({
			openRowKey: Key,
		})
	}

	_onClose(Key: any) {
		this.setState({
			openRowKey: null,
		})
	}

	_setListViewScrollableTo(value: boolean) {
		this.setState({
				scrollEnabled: value,
		})
	}

	onDeleteAccount(key){
		const { dispatch } = this.props;
		Alert.alert(
			'WARNING',
			'Are you sure you want to delete this account?',
			[
				{text:'CANCEL',onPress:()=>{}},
				{text: 'DELETE', onPress:()=>{
						this.setState({
							openRowKey: null,
						},()=>setTimeout(()=>
							dispatch(delete_account(key,this.props.user.hashed_password)),
							500));
						DeviceEventEmitter.emit('updateAccountBalance');
						console.log('delete account: ', key );
					}}
				],
			{cancelable:false}
		)
	}

	_renderListItem=(item) => {
		const { dispatch } = this.props;
		const Key = item.address;
		let backgroundColor = '';
		let accountImage = '';
		switch (item.type) {
			case '[ledger]':
				backgroundColor = '#00796b';
				accountImage = require('../../../assets/ledger_logo.png');break;
			case '[pk]':
				backgroundColor = '#6200ee';
				accountImage = require('../../../assets/key.png');break;
			default:
				backgroundColor = '#2962ff';
				accountImage = require('../../../assets/aion_logo.png');
		}
		return (
			<SwipeableRow
				style={{padding:10}}
				isOpen={ Key === this.state.openRowKey }
				swipeEnabled={ this.state.openRowKey === null }
				preventSwipeRight={true}
				maxSwipeDistance={100}
				onOpen={()=> {
					this._onOpen(Key);
					this._setListViewScrollableTo(false)
				}}
				onClose={() => {
					this._onClose(Key);
					this._setListViewScrollableTo(true)
				}}
				shouldBounceOnMount={true}
				slideoutView={
					<TouchableOpacity style={otherStyles.VaultHome.slideOutContainer} onPress={()=>{
						this.onDeleteAccount(Key);
					}}>
						<View style={otherStyles.VaultHome.slideOutContainer}>
							<View style={{...otherStyles.VaultHome.slideBtn, backgroundColor: 'orange'}}>
								<Text>DELETE</Text>
							</View>
						</View>
					</TouchableOpacity>
				}
			>
				<TouchableOpacity
					activeOpacity={1}
					onPress={() => {
						this.state.openRowKey&&this.setState({openRowKey: null,});
						this.state.openRowKey||dispatch(account(this.props.accounts[item.address]));
						this.state.openRowKey||this.props.navigation.navigate('signed_vault_account',{address: item.address});
					}}
				>
					<View style={ {...otherStyles.VaultHome.accountContainer, backgroundColor:backgroundColor} }>
						<View style={otherStyles.VaultHome.accountLeftView}>
							<View style={otherStyles.VaultHome.accountNameView}>
								<Image source={accountImage} style={{width:15, height:15, tintColor:'#fff', marginRight:10}}/>
								<Text style={styles.listItemText}>{ item.name }</Text>
							</View>
							<Text style={otherStyles.VaultHome.addressFontStyle}>{ item.address.substring(0, 10) + '...' + item.address.substring(54)}</Text>
						</View>
						<View style={otherStyles.VaultHome.accountRightView}>
							<Text style={styles.listItemText} numberOfLines={1}>{ (item.balance-0).toFixed(4) } AION</Text>
						</View>
					</View>
				</TouchableOpacity>

			</SwipeableRow>

		)
	};

	closeSort(){
		const select = this.sortRef.getSelect();
		select&&this.setState({
			showSort:false,
			sortOrder:select,
		});
		select||this.setState({
			showSort:false,
		})
	}

	closeFilter(){
		const select = this.filterRef.getSelect();
		select&&this.setState({
			showFilter:false,
			filter:select,
		});
		select||this.setState({
			showFilter:false,
		})
	}

	render(){
		let renderAccounts= sortAccounts(Object.values(this.props.accounts),this.state.sortOrder);
		renderAccounts = filterAccounts(renderAccounts, this.state.filter);
		renderAccounts = searchAccounts(renderAccounts, this.state.keyWords);
		const sortTintColor = this.state.showSort?'blue':'black';
		const filterTintColor = this.state.showFilter?'blue':'black';
		let sortLabel = strings(this.state.sortOrder);
		console.log(sortLabel.isChinese());
		sortLabel.slice(0,6).isChinese()&&sortLabel.length>3&&(sortLabel=sortLabel.slice(0,3) + '...');
		sortLabel.slice(0,6).isChinese()||sortLabel.length>6&&(sortLabel=sortLabel.slice(0,6) + '...');
		let filterLabel = strings(this.state.filter);
		filterLabel.slice(0,6).isChinese()&&filterLabel.length>3&&(filterLabel=filterLabel.slice(0,3) + '...');
		filterLabel.slice(0,6).isChinese()||filterLabel.length>6&&(filterLabel=filterLabel.slice(0,6) + '...');
		return (
			<View style={{flex:1}}>
				<HomeHeader
					total={this.state.totalBalance}
					navigation={this.props.navigation}
				/>
				<TouchableOpacity
					style={{flex:1}}
					activeOpacity={1}
					onPress={()=>{
						this.state.openRowKey&&this.setState({openRowKey: null})
					}}
				>
					<View style={{
						flexDirection: 'row', height: 40, alignItems: 'center',
						marginLeft: 10,
						marginRight: 10,
						width: width - 20,
						borderColor: 'lightgray',
						borderBottomWidth: 1,
						justifyContent:'space-around'
					}}>

						<TouchableOpacity
							onPress={() => this.setState({showSort: true, showFilter:false})}
						>
							<View style={styles.sortHeader}>
								<Image source={require('../../../assets/sort.png')}
									   style={{...styles.sortHeaderImageStyle, tintColor: sortTintColor}}/>
								<Text style={{...styles.sortHeaderFontStyle, color:sortTintColor, width:80}}>{sortLabel}</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => this.setState({showSort: false, showFilter:true})}
						>
							<View style={styles.sortHeader}>
								<Image source={require('../../../assets/filter.png')}
									   style={{...styles.sortHeaderImageStyle, tintColor: filterTintColor}}/>
								<Text style={{...styles.sortHeaderFontStyle, color:filterTintColor,width:80}}>{filterLabel}</Text>
							</View>
						</TouchableOpacity>
						<View style={styles.sortHeader}>
							<Image source={require('../../../assets/search.png')}
								   style={{...styles.sortHeaderImageStyle, tintColor: 'black'}}/>
							<TextInput style={styles.searchStyle}
								onChangeText={(value)=>this.setState({keyWords:value})}
							/>
						</View>

						<ModalList
							data={SORT}
							ref={ref => this.sortRef = ref}
							visible={this.state.showSort}
							style={styles.sortContainer}
							viewStyle={styles.sortViewStyle}
							fontStyle={styles.sortFontStyle}
							onClose={() => this.closeSort()}
							ItemSeparatorComponent={() => (
								<View style={{height: 1 / PixelRatio.get(), backgroundColor: '#000'}}/>)}
						/>
						<ModalList
							data={FILTER}
							ref={ref => this.filterRef = ref}
							visible={this.state.showFilter}
							style={styles.sortContainer}
							viewStyle={styles.sortViewStyle}
							fontStyle={styles.sortFontStyle}
							onClose={() => this.closeFilter()}
							ItemSeparatorComponent={() => (
								<View style={{height: 1 / PixelRatio.get(), backgroundColor: '#000'}}/>)}
						/>
					</View>
					<FlatList
						style={{flex:1}}
						renderItem={({item})=>this._renderListItem(item)}
						scrollEnabled={this.state.scrollEnabled}
						data={renderAccounts}
						keyExtractor={(item, index)=>index + ''}
						onScroll={(e)=>{
							this.setState({
								openRowKey: null,
							});
						}}
						ListEmptyComponent={()=>
							<View style={{marginTop: 10}}>
								<Text style={{alignSelf: 'center', textAlign:'center'}}>
									{strings('wallet.import_accounts_hint')}
								</Text>
							</View>
						}
						refreshControl={
							<RefreshControl
								refreshing={this.state.refreshing}
								onRefresh={this.onRefresh}
								title={'Loading'}
							/>
						}
					/>
				</TouchableOpacity>
				{
					(this.state.showSort||this.state.showFilter)?<TouchableOpacity style={{position: 'absolute',
						top:10+top+30, left:0,right:0, width:width,height:height-(10+top+30),
						backgroundColor:'rgba(0, 0, 0, 0.5)'
					}}/>:null
				}
				<ComponentTabBar
					style={{
						backgroundColor: 'white',
						flexDirection: 'row',
						justifyContent: 'space-around',
						borderTopWidth: 0.3,
						borderTopColor: '#8c8a8a'
					}}
					active={'wallet'}
					onPress={[
						()=>{
							this.state.openRowKey&&this.setState({openRowKey: null});
							this.state.openRowKey||this.props.navigation.navigate('signed_vault');
						},
						()=>{
							this.state.openRowKey&&this.setState({openRowKey: null});
							this.state.openRowKey||this.props.navigation.navigate('signed_dapps');
						},
						()=>{
							this.state.openRowKey&&this.setState({openRowKey: null});
							this.state.openRowKey||this.props.navigation.navigate('signed_setting');
						},
					]}
				/>
			</View>
		)
	}
}



export default connect(state => {
	return ({
		user: state.user,
		accounts: state.accounts,
		ui: state.ui,
		setting: state.setting
	}); })(Home);

const styles = StyleSheet.create({
	divider: {
		marginLeft: 50,
		height: 1 / PixelRatio.get(),
		backgroundColor: '#fff'
	},
	sortHeader:{
		flexDirection:'row',
		alignItems: 'center'
	},
	sortContainer:{
		width: width,
		backgroundColor: '#fff',
		position: 'absolute',
		left:0,
		right:0,
		top: 10+top+30, //status bar + title bar + sort header
		padding: 5,
	},
	sortViewStyle:{
		flex:1,
		width:width,
		justifyContent:'center',
	},
	sortFontStyle:{
		color: '#000',
		fontSize: 16,
		margin:5,
	},
	sortHeaderFontStyle:{
		color: 'blue',
		fontSize: 16,
	},
	sortHeaderImageStyle:{
		width:20,
		height:20,
		marginRight:10,
		tintColor:'blue'
	},
	searchStyle:{
		borderBottomWidth: 1,
		borderBottomColor:'#000',
		marginBottom:5,
		padding:0,
		width:80,
		alignItems:'flex-end',
	},
	listBtnContainer:{
		flex:1,
		flexDirection: 'row',
		margin:0,
		justifyContent: 'flex-end',
	},
	listBtn:{
		width: 100,
		justifyContent: 'center',
		alignItems: 'center'
	},
	listItem: {
		height: 80,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
		backgroundColor: '#fff'
	},
	listItemLeft: {
		justifyContent: 'space-between'
	},
	listItemRight: {
	    width: 80,
	},
	listItemText: {
		textAlign:'left',
		color: '#fff',
	}
});
