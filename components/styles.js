import {Dimensions, PixelRatio, Platform, StatusBar, StyleSheet} from 'react-native';
import {mainColor} from './style_util';
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

const BORDER_COLOR = '#8c8a8a';
const FONT_COLOR = '#777676';

export default styles = {
	shadow:{
		elevation:5,
		shadowColor:'black',
		shadowOffset:{width:5,height:5},
		shadowOpacity: 0.3,
	},
	headerStyle: {
		shadowOpacity: 0,
		shadowOffset: { height: 0, width:0 },
		shadowRadius: 0,
		elevation: 0.5,
		marginTop: STATUSBAR_HEIGHT,
		borderBottomWidth:0,
		fontWeight: 'normal',
		backgroundColor: mainColor
	},
	headerStyleWithoutShadow: {
		shadowOpacity: 0,
		shadowOffset: { height: 0, width:0 },
		shadowRadius: 0,
		elevation: 0,
		marginTop: STATUSBAR_HEIGHT,
		borderBottomWidth:0,
		fontWeight: 'normal',
		backgroundColor: mainColor
	},
    headerTitleStyle: {
      	fontWeight: 'bold',
      	fontSize: 18,
      	alignSelf: 'center',
        textAlign: 'center',
        flex: 1,
		color: 'white'
    },
  	container: {
  		padding: 20,
  		height: Dimensions.get('window').height,
		marginBottom:20,
  	},
  	center: {
  		flex: 1,
  		justifyContent:'center',
		alignItems: 'center',
  	},
  	center_text: {
  		textAlign: 'center',
  	},
  	cellSeparator:{
		width: Dimensions.get('window').width,
		height: 1,
		backgroundColor: 'lightgray',
	},
	marginTop10: {
		marginTop: 10,
	},
	marginTop20: {
		marginTop: 10,
	},
	marginTop40: {
		marginTop: 10,
	},
	marginTop60: {
		marginTop: 10,
	},
	marginTop80: {
		marginTop: 10,
	},
  	marginBottom10: {
		marginBottom: 10,
	},
  	marginBottom20: {
  		marginBottom: 20,
  	},
  	marginBottom40: {
  		marginBottom: 40,
  	},
  	marginBottom80: {
  		marginBottom: 80,
  	},
    instruction: {
        fontSize: 16,
        lineHeight: 16,
        color: FONT_COLOR,
    },
    input_multi_lines: {
		borderWidth: 1,
		// borderRadius: 5,
		color: FONT_COLOR,
		borderColor: 'lightgray',
		fontSize: 16,
		fontWeight: 'bold',
		padding: 10,
		textAlignVertical: 'top'
	},
	input: {
		text_input: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			paddingTop: 5,
			paddingBottom: 5,
			paddingLeft: 5,
			paddingRight: 60,
			borderColor: BORDER_COLOR,
			borderBottomWidth: 1,
			width: '100%',
		},
		text: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			width: 50,
			position: 'absolute',
			right: 0,
			top: 9,
		},
		textAreaContainer: {
			borderWidth: 1,
			borderColor: 'gray',
			padding: 5
		}
	},
	password: {
		view: {
			flexDirection: 'row',
			height: 50,
			alignItems: 'center',
		},
		text_input: {
			fontSize: 16,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
            height: 50,
			paddingRight: 45,
            paddingLeft: 30,
			borderColor: 'lightgray',
			borderBottomWidth: 1,
			flex: 1,
		},
		display: {
			position: 'absolute',
			right: 0,
			// top: 12,
		}
	},
	ImportList:{
		container:{
			flex:1,
			height: 80,
			flexDirection: 'row',
			justifyContent: 'flex-start',
			alignItems: 'center',
			padding: 10,
			backgroundColor:'#fff'
		},
		itemImage:{
			marginRight: 20,
			width: 50,
			height: 50,
		},
		ItemText:{
			textAlign: 'right',
		},
		footer:{
			height:24,
			flexDirection:'row',
			justifyContent:'center',
			alignItems:'center',
			marginBottom:10,
			marginTop: 10,
		}
	},
	Account:{
		summaryContainer:{
			flexDirection: 'row',
			justifyContent: 'space-between',
			padding: 20,
			width:Dimensions.get('window').width,
		},
		summaryLeftContainer:{
			justifyContent: 'space-between',
			padding: 10,
			alignItems: 'flex-start',
			width:Dimensions.get('window').width/5*3,
		},
		addressView: {
			paddingLeft: 30,
			paddingRight: 40,
			flexDirection: 'row',
			justifyContent: 'flex-start',
		},
		buttonContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: 20,
		}
	},
	Transaction:{
		container:{
			flexDirection: 'column',
			flex:1,
			padding: 10,
			backgroundColor: "#fff",
			height: 80,
			justifyContent: 'space-between',
		},
		subContainer:{
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems:'center',
			flex:1,
		}
	},
};
