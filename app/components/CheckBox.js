import * as React from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    Text,
} from 'react-native';
import PropTypes from 'prop-types';

class CheckBox extends React.PureComponent {
    static propTypes = {
        onCheck: PropTypes.func,
        onUncheck: PropTypes.func,
        textRight: PropTypes.element.isRequired || PropTypes.string.isRequired,
        imageStyle: PropTypes.object,
    };
    state={
        isChecked: false,
    };

    onPressCheck  = ()=>{
        const {isChecked} = this.state;
        const {onUncheck, onCheck} = this.props;
        isChecked?onUncheck&&onUncheck()
            :onCheck&&onCheck();
        this.setState({
            isChecked: !isChecked
        })
    };

    render(){
        const {textRight, imageStyle} = this.props;
        const {isChecked} = this.state;
        const BoxImage = isChecked? require('../../assets/icon_check.png'):require('../../assets/icon_uncheck.png');
        const textView = textRight&&React.isValidElement(textRight)?textRight
            :textRight&&typeof textRight == 'string'?<Text>{textRight}</Text>:null;
        return (
            <View style={this.props.style}>
                <View style={{flexDirection:'row', alignItems:'center'}}>
                    <TouchableOpacity  activeOpacity={1} onPress={this.onPressCheck}>
                        <Image source={BoxImage} style={{width:24,height:24, ...imageStyle, marginRight:5}}/>
                    </TouchableOpacity>
                    {textView}

                </View>
            </View>
        )
    }
}
export {CheckBox}