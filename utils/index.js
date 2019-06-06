import {AsyncStorage, Platform, CameraRoll, Dimensions, StatusBar, AppState} from 'react-native';
import blake2b from "blake2b";
import wallet from 'react-native-aion-hw-wallet';
import RNFS from 'react-native-fs';
import {strings} from '../locales/i18n';
import Toast from 'react-native-root-toast';
import {fetchRequest} from './others';

const tripledes = require('crypto-js/tripledes');
const CryptoJS = require("crypto-js");

function accountKey(symbol, address) {
    return symbol + '+' + address;
}

function hexString2Array(str) {
    if (str.startsWith('0x')) {
        str = str.substring(2);
    }

    var result = [];
    while (str.length >= 2) {
        result.push(parseInt(str.substring(0, 2), 16));
        str = str.substring(2, str.length);
    }

    return result;
}

function encrypt(plain, seed){
    return tripledes.encrypt(plain, seed).toString();
}

function decrypt(encrypted, seed){
    return tripledes.decrypt(encrypted, seed).toString(CryptoJS.enc.Utf8);
}

function dbSet(key, value){
    return new Promise((resolve, reject)=>{

    });
}

function dbGet(key){
    return new Promise((resolve, reject)=>{
        AsyncStorage
            .getItem(key)
            .then(json=>{
                if(json){
                    resolve(json);
                } else {
                    reject('[dbGet] db.' + key + ' null');
                }
            });
    });
}

function validatePassword(password) {
    let reg = /^[A-Za-z0-9!?#]{8,16}$/;
    return reg.test(password);
}

function validateUrl(url) {
    let reg = /^(https?:\/\/)((([a-z\d]([a-z\d-]*[a-z\d])*)\.?)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&amp;a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    return reg.test(url);
}

function validatePrivateKey(privateKey, symbol='AION') {
    if (symbol === 'AION') {
        privateKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;
        let reg = /^[0-9a-fA-F]{128}$/;
        return reg.test(privateKey);
    } else if (symbol === 'BTC') {
        // TODO:
    } else if (symbol === 'EOS') {
        // TODO:
    } else if (symbol === 'LTC') {
        // TODO:
    } else if (symbol === 'TRX') {
        // TODO:
    }
    return true;
}

function validateAmount(amount) {
    let reg = /^[0-9]?((\.[0-9]+)|([0-9]+(\.[0-9]+)?))$/;
    return reg.test(amount);
}

function validatePositiveInteger(input) {
    let reg= /^[1-9][0-9]*$/;
    return reg.test(input);
}

function hashPassword(password) {
    let passwordHash = blake2b(32).update(Buffer.from(password, 'utf8')).digest('hex')
    return passwordHash;
}

function getLedgerMessage(errorCode) {
    if (errorCode === wallet.APP_INACTIVATED) {
        return strings('ledger.error_application_inactive');
    } else if (errorCode === wallet.INVALID_DEVICE_NUMBER) {
        return strings('ledger.error_device_count');
    } else if (errorCode === wallet.USER_REJECTED) {
        return strings('ledger.error_user_rejected');
    } else if (errorCode === wallet.NO_PERMISSION) {
        return strings('ledger.error_permission_denied');
    } else if (errorCode === wallet.GENERAL_ERROR || errorCode === wallet.INVALID_ACCOUNT_TYPE || errorCode === wallet.INVALID_TX_PAYLOAD || errorCode === wallet.OPEN_DEVICE_FAIL) {
        return strings('ledger.error_general');
    } else if (errorCode === 'error.wrong_device') {
        return strings('ledger.error_wrong_device');
    } else {
        return strings('ledger.error_general');
    }
}

function generateQRCode(amount, address, coin='AION') {
    let obj ={};
    obj['receiver'] = address;
    obj['amount'] = amount;
    obj['coin'] = coin;
    return JSON.stringify(obj);
}

function saveImage(base64, imageFileName) {
    const storeLocation = `${RNFS.PicturesDirectoryPath}`;
    const filePath = `${storeLocation}/${imageFileName}`;
    return new Promise((resolve, reject)=> {
        RNFS.writeFile(filePath, base64, 'base64').then(() => {
            const filePath_ = Platform.OS === 'ios'? filePath: 'file://'+filePath;
            CameraRoll.saveToCameraRoll(filePath_).then(result => {
                deleteFile(filePath);
                resolve(result);
            }).catch(error => {
                deleteFile(filePath);
                console.log("save image fail: " + error);
                reject(error);
            });
        }, error => {
            console.log("save image failed: ", error);
            reject(error);
        });
    });

}

function deleteFile(filePath) {
    RNFS.unlink(filePath).then(() => {
        console.log("delete " + filePath + " succeed");
    }).catch(err=> {
        console.log("delete " + filePath + " failed: " + err);
    });
}


function getCoinPrice(currency='CNY',amount=1) {
    // const url = `https://www.chaion.net/makkii/price?crypto=AION&fiat=${currency}`;
    const url = `http://45.118.132.89:8080/price?crypto=AION&fiat=${currency}`;
    return new Promise((resolve, reject) => {
        fetchRequest(url,'GET').then(res=>{
            console.log('[res] ',res);
            const price = res.price;
            resolve(amount*price)
        },err=>{
            console.log('[err] ', err);
            reject(err)
        });
    })
}

function getLatestVersion(platform, currentVersionCode, language) {
    const url = "http://45.118.132.89:8080/appVersion/latest" +
        "?versionCode=" + currentVersionCode +
        "&platform=" + platform +
        "&lang=" + language;
    console.log("request get latest version: " + url);

    return fetchRequest(url, 'GET');
}
function generateUpdateMessage(version) {
    let message = strings('version_upgrade.label_version') + ': ' + version.version;
    if (version.updatesMap) {
        let keys = Object.keys(version.updatesMap);
        if (keys.length > 0) {
            message = message + '\n' + strings('version_upgrade.label_updates') + ': \n' + version.updatesMap[keys[0]];
        }
    }
    return message;
}

class AppToast {
    constructor() {
        this.toast = null;
    }
    show(message, options = {position: Toast.positions.BOTTOM, duration: Toast.durations.SHORT}){
        this.close();
        this.toast= Toast.show(message,options);
    }
    close(){
        if(this.toast){
            Toast.hide(this.toast);
            this.toast = null;
        }
    }
}



class listenAppState{
    constructor(){
        this.timeOut = '30';
        this.timestamp = Date.now('milli');
    }
    handleActive = null;
    handleTimeOut = null;
    _handleAppStateChange=(nextAppState)=>{
        console.log('appState change');
        if (nextAppState != null && nextAppState === 'active') {
            // in active
            const max_keep_signed = 60000*parseInt(this.timeOut);
            console.log('max_keep_signed ', max_keep_signed);
            const time_diff = Date.now('milli') - this.timestamp;
            if (time_diff > max_keep_signed) {
                this.handleTimeOut&&this.handleTimeOut();
            }else{
                this.handleActive&&this.handleActive();
            }
        } else if (nextAppState === 'background') {
            this.timestamp = Date.now('milli');
            console.log('update timestamp ', this.timestamp)
        }
    };
    start(){
        console.log('start listen app state');
        AppState.addEventListener('change',this._handleAppStateChange);
    }
    stop(cb=()=>{}){
        console.log('stop listen app state');
        AppState.removeEventListener('change',this._handleAppStateChange);
        cb();
    }

}
function isIphoneX() {
    const dimen = Dimensions.get('window');
    return (
        Platform.OS === 'ios' &&
        !Platform.isPad &&
        !Platform.isTVOS &&
        ((dimen.height === 812 || dimen.width === 812) || (dimen.height === 896 || dimen.width === 896))
    );
}

function ifIphoneX(iphoneXStyle, regularStyle) {
    if (isIphoneX()) {
        return iphoneXStyle;
    }
    return regularStyle;
}

function getStatusBarHeight(safe) {
    return Platform.select({
        ios: ifIphoneX(safe ? 44 : 30, 20),
        android: StatusBar.currentHeight
    });
}

function strLen(str){
    let len = 0;
    for (let i=0; i<str.length; i++) {
        let c = str.charCodeAt(i);
        //单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
            len++;
        }
        else {
            len+=2;
        }
    }
    return len;
}

const mainnet_url = 'https://api.nodesmith.io/v1/aion/mainnet/jsonrpc?apiKey=c8b8ebb4f10f40358b635afae72c2780';
const mastery_url = 'https://api.nodesmith.io/v1/aion/testnet/jsonrpc?apiKey=651546401ff0418d9b0d5a7f3ebc2f8c';
// const mastery_url = 'http://192.168.50.105:8545';
function navigationSafely(pinCodeEnabled, hashed_password,navigation,
                          route={
                              url: '',
                              args:{},
                              onVerifySuccess:undefined,
                          }) {
    const newRoute = {
        url: '',
        args:{},
        onVerifySuccess:undefined,
        ...route
    };
    pinCodeEnabled||popCustom.show(
        strings('alert_title_warning'),
        strings('warning_dangerous_operation'),
        [
            {
                text: strings('cancel_button'),
                onPress:()=>{
                    popCustom.hide()
                }
            },
            {
                text: strings('alert_ok_button'),
                onPress:(text)=>{
                    const _hashed_password = hashPassword(text);
                    if(_hashed_password === hashed_password){
                        popCustom.hide();
                        newRoute.onVerifySuccess&&newRoute.onVerifySuccess();
                        newRoute.onVerifySuccess||navigation.navigate(newRoute.url,newRoute.args)
                    }else{
                        popCustom.setErrorMsg(strings('unsigned_login.error_incorrect_password'))
                    }
                }
            }
        ],
        {
            cancelable: false,
            type:'input',
            canHide: false,
        }
    );
    pinCodeEnabled&&navigation.navigate('unlock',{
        targetScreen: newRoute.url,
        targetScreenArgs: newRoute.args,
        onUnlockSuccess: newRoute.onVerifySuccess
    });

}

function range(start, end, step) {
    let arr = [];
    for(let i=start; i < end; i++){
        if(i%step===0){arr.push(i)}
    }
    return arr;
}

function appendHexStart(str) {
    let str1 = str.startsWith('0x')? str.substring(2): str;
    let str2 = str1.length % 2 ? '0' + str1: str1;
    return '0x' + str2;
}

function toHex(value) {
    if (!value) {
        return '0x00';
    } else if (typeof value === 'string') {
        return appendHexStart(value);
    } else if (value instanceof Buffer) {
        return appendHexStart(value.toString('hex'));
    } else if (typeof value === 'number') {
        return appendHexStart(value.toString(16));
    } else if (value instanceof Uint8Array) {
        return appendHexStart(Buffer.from(value).toString('hex'));
    } else if (BigNumber.isBigNumber(value)) {
        return appendHexStart(value.toString(16));
    } else {
        throw value;
    }
}

function fromHexString(str) {
    let strNo0x = str.startsWith('0x')? str.substring(2): str;
    return parseInt(strNo0x, 16);
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    dbGet: dbGet,
    validatePassword: validatePassword,
    hashPassword: hashPassword,
    getLedgerMessage: getLedgerMessage,
    validatePrivateKey: validatePrivateKey,
    generateQRCode: generateQRCode,
    validateAmount: validateAmount,
    saveImage: saveImage,
    validatePositiveInteger: validatePositiveInteger,
    fetchRequest: fetchRequest,
    hexString2Array: hexString2Array,
    mainnet_url: mainnet_url,
    mastery_url: mastery_url,
    getStatusBarHeight:getStatusBarHeight,
    listenAppState:listenAppState,
    strLen: strLen,
    AppToast: AppToast,
    navigationSafely,
    getLatestVersion: getLatestVersion,
    generateUpdateMessage: generateUpdateMessage,
    range,
    accountKey,
    appendHexStart,
    toHex,
    fromHexString,
};
