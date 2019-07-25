import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, Text, View, TouchableOpacity, Image, FlatList,  StyleSheet, Dimensions, PixelRatio} from 'react-native';
import {ComponentTabBar} from '../../../components/common.js';
import {strings} from '../../../../locales/i18n.js';
import {fixedHeight, mainBgColor} from "../../../style_util";
import dappsModel from "../../../../models/dapps.model";

const {width} = Dimensions.get('window');
class Home extends Component {
	static navigationOptions = ({ navigation }) => ({
		title: strings('menuRef.title_dapps')
	});
	constructor(props){
		super(props);
	}

	render(){
		return (
			<View style={{
				backgroundColor: mainBgColor,
				flex:1
			}}>
				<View style={{
					flex:1,
					flexDirection:'column',
					alignItems: 'stretch',
					paddingTop: 8,
				}}>
					{
						this.props.dapps.map((v,k)=>{
							return (
								<TouchableOpacity
									key={k}
									onPress={()=>{
										this.props.navigation.navigate('signed_dapps_launch',{
											'title': v.name,
											'dapp': v,
										})
									}}
								>
									<View
										style={{
											height: 50,
											backgroundColor: 'white',
											position: 'relative',
											marginTop: 1,
											paddingLeft: 60,
										}}>
										<Image
											source={v.logo}
											style={{
												width: 30,
												height: 30,
												position: 'absolute',
												left: 10,
												top: 10,
											}}
										/>
										<Text
											style={{
												lineHeight: 50,
												fontSize: 16,
											}}
											numberOfLines={1}
										>{v.name}</Text>
									</View>
								</TouchableOpacity>
							)
						})
					}
				</View>
				<ComponentTabBar
					// TODO
					style={{
						position: 'absolute',
						bottom: 0,
						right: 0,
						height: fixedHeight(156),
						left: 0,
						backgroundColor: 'white',
						flexDirection: 'row',
						justifyContent: 'space-around',
						borderTopWidth: 0.3,
						borderTopColor: '#8c8a8a'
					}}
					active={'dapp'}
					onPress={[
						()=>{this.props.navigation.navigate('signed_vault');},
						()=>{},
						()=>{this.props.navigation.navigate('signed_setting');},
					]}
				/>
			</View>
		);
	}
}

export default connect(state => { return ({ dapps: state.dappsModel }); })(Home);
