import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    ActivityIndicator,
    Text,
    Dimensions
} from 'react-native';
import PropTypes from 'prop-types';

const {width, height} = Dimensions.get('window');

export default class Loading extends Component {
    static propTypes = {
        isShow: PropTypes.bool
    }

    constructor(props) {
        super(props);
        this.state = {
            message: null,
            isShow: false,
        }
    }

    render() {
        return this.state.isShow ?(
            <View style={styles.container}>
                <View style={styles.progressContainer}>
                    <ActivityIndicator animating={true} size='large' color='white'/>
                    {this.state.message && <Text style={styles.defaultText}>{this.state.message}</Text>}
                </View>
            </View>
        ): (null)
    }

    show(message = null) {
        this.setState({
            isShow: true,
            message: message,
        });
    }

    hide() {
        this.setState({
            isShow: false,
            message: null,
        });
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        height: height,
    },
    progressContainer: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,.8)',
        padding: 20,
        maxWidth: width / 2,
    },
    defaultText: {
        color: '#FFF',
        fontSize: 15,
    }
});