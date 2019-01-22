const BORDER_COLOR = '#8c8a8a';
const FONT_COLOR = '#777676';

export default styles = {
  	container: {
  		paddingLeft: 20,
  		paddingRight: 20,
  		paddingTop: 40,
  		paddingBottom: 160,
  		width: '100%',
  		height: '100%',
  	},
  	center: {
  		flex: 1,
  		justifyContent:'center',
		alignItems: 'center',
  	},
  	center_text: {
  		textAlign: 'center',
  	},
  	marginTop10: {   // in use
		marginTop: 10, 
	},
	marginTop20: {   // in use
		marginTop: 10, 
	},
	marginTop40: {   // in use
		marginTop: 10, 
	},
  	marginBottom10: {   // in use
		marginBottom: 10, 
	},
  	marginBottom20: {   // in use
  		marginBottom: 20, 
  	},
  	marginBottom40: {   // in use
  		marginBottom: 40, 
  	},
  	marginBottom80: {   // in use
  		marginBottom: 80, 
  	},
  	label: {            // in use
  		fontSize: 14,
  		lineHeight: 14,
  		color: FONT_COLOR,
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
		}
	},
	password: {
		view: {
			width: '100%'
		},
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
			fontSize: 12,
			color: FONT_COLOR,
			fontWeight: 'normal',
			lineHeight: 20,
			width: 40,
			position: 'absolute',
			right: 0,
			top: 9,
		}
	}
};