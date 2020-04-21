import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Image, ImageBackground, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Animated, Text, ActivityIndicator } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ImagePicker from 'react-native-image-picker';
import LocalBarcodeRecognizer from 'react-native-local-barcode-recognizer';
import { strings } from '../../locales/i18n';
import { mainColor } from '../style_util';
import { AppToast } from '../components/AppToast';
import { ignoreNextAppStateChange } from '../../utils/touchId';

class Scan extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: strings('scan.title'),
            headerRight: (
                <TouchableOpacity
                    onPress={() => {
                        navigation.state.params.switchFlash();
                    }}
                    style={{
                        width: 48,
                        height: 48,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {navigation.state.params.torch ? (
                        <Image
                            source={require('../../assets/icon_flash_off.png')}
                            style={{
                                tintColor: 'white',
                                width: 20,
                                height: 20,
                            }}
                        />
                    ) : (
                        <Image
                            source={require('../../assets/icon_flash_on.png')}
                            style={{
                                tintColor: 'white',
                                width: 20,
                                height: 20,
                            }}
                        />
                    )}
                </TouchableOpacity>
            ),
        };
    };

    state = {
        focusedScreen: false,
    };

    isVerifying = false;

    constructor(props) {
        super(props);
        this.animatedValue = new Animated.Value(-120);
        this.state = {
            toast: Date.now(),
            torch: false,
        };
    }

    componentWillMount() {
        this.props.navigation.setParams({
            switchFlash: this.switchFlash,
            torch: false,
        });
    }

    componentDidMount() {
        console.log(`[route] ${this.props.navigation.state.routeName}`);
        this.isMount = true;
        const { navigation } = this.props;
        navigation.addListener('willFocus', () => this.isMount && this.setState({ focusedScreen: true }));
        navigation.addListener('willBlur', () => this.isMount && this.setState({ focusedScreen: false }));
        ignoreNextAppStateChange(true);
        this.scannerLineMove();
    }

    componentWillUnmount() {
        this.isMount = false;
        ignoreNextAppStateChange(false);
    }

    // eslint-disable-next-line react/sort-comp
    scannerLineMove() {
        this.animatedValue.setValue(-120);
        Animated.timing(this.animatedValue, {
            toValue: 120,
            duration: 2000,
            sInteraction: false,
        }).start(() => this.scannerLineMove());
    }

    switchFlash = () => {
        const currentTorch = this.state.torch;
        this.setState({
            torch: !currentTorch,
        });
        this.props.navigation.setParams({
            torch: !currentTorch,
        });
    };

    openImageLibrary = () => {
        const options = {
            title: 'QRCode Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        ignoreNextAppStateChange(true);
        ImagePicker.launchImageLibrary(options, res => {
            ignoreNextAppStateChange(false);
            if (res.error) {
                console.log('error ', res.error);
            } else {
                this.getQrcode(res.data);
            }
        });
    };

    getQrcode = data => {
        if (data) {
            const { validate } = this.props.navigation.state.params;
            LocalBarcodeRecognizer.decode(data, { codeTypes: ['qr'] })
                .then(result => {
                    if (result === '') {
                        AppToast.show(strings('scan.decode_fail'));
                    }
                    if (validate) {
                        if (!this.isVerifying) {
                            this.isVerifying = true;
                            validate({ data: result }, (res, message = '') => {
                                if (res) {
                                    this.props.navigation.goBack();
                                } else {
                                    AppToast.show(message);
                                }
                                this.isVerifying = false;
                            });
                        }
                    }
                })
                .catch(() => {
                    AppToast.show(strings('scan.decode_fail'));
                });
        }
    };

    render() {
        const animatedStyle = {
            transform: [{ translateY: this.animatedValue }],
        };
        const { validate } = this.props.navigation.state.params;
        if (!this.state.focusedScreen) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator animating color="red" size="large" />
                </View>
            );
        }
        return (
            <View style={{ width: '100%', height: '100%' }}>
                <RNCamera
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                    }}
                    flashMode={this.state.torch ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                    captureAudio={false}
                    onBarCodeRead={e => {
                        if (validate) {
                            if (!this.isVerifying) {
                                this.isVerifying = true;
                                validate(e, (result, message = '') => {
                                    if (result) {
                                        this.props.navigation.goBack();
                                    } else {
                                        // slow down toast log
                                        const now = Date.now();
                                        if (now - this.state.toast > 1000) {
                                            AppToast.show(message);
                                            this.isMount &&
                                                this.setState({
                                                    toast: now,
                                                });
                                        }
                                    }
                                    this.isVerifying = false;
                                });
                            }
                        } else {
                            this.props.navigation.goBack();
                        }
                    }}
                    androidCameraPermissionOptions={{
                        title: strings('wallet.title_permission_camera'),
                        message: strings('wallet.message_permission_camera'),
                        buttonPositive: strings('ok_button'),
                        buttonNegative: strings('cancel_button'),
                    }}
                >
                    {/* up view */}
                    <View style={styles.backgroundStyle} />
                    <View style={styles.centerView}>
                        {/* left view */}
                        <View style={styles.backgroundStyle} />
                        <ImageBackground style={[styles.scanImage, { alignItems: 'center', justifyContent: 'center' }]} imageStyle={styles.scanImage} source={require('../../assets/scan_border.png')}>
                            <Animated.View style={[animatedStyle]}>
                                <Image style={{ width: 240, tintColor: mainColor }} source={require('../../assets/scan_bar.png')} resizeMode="contain" />
                            </Animated.View>
                        </ImageBackground>
                        {/* right view */}
                        <View style={styles.backgroundStyle} />
                    </View>
                    {/* down view */}
                    <View style={styles.backgroundStyle} />
                </RNCamera>
                {/* add from album */}
                <TouchableWithoutFeedback onPress={this.openImageLibrary}>
                    <View style={styles.buttonStyle}>
                        <Image source={require('../../assets/icon_album.png')} style={{ height: 20, width: 20, tintColor: '#fff' }} resizeMode="contain" />
                        <Text style={{ marginLeft: 10, color: '#fff', fontSize: 16 }}>{strings('scan.add_photos_button')}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

export default connect(state => {
    return state;
})(Scan);

const styles = StyleSheet.create({
    backgroundStyle: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    centerView: {
        height: 250,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    scanImage: {
        height: 250,
        width: 250,
    },
    scanLine: {
        height: 1,
        width: 230,
        backgroundColor: mainColor,
    },
    buttonStyle: {
        backgroundColor: mainColor,
        height: 50,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
