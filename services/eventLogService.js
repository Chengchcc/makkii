import HttpClient from '../utils/http_caller';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';
import {Platform} from 'react-native';

const sendEventLog = async (eventLog) => {
    try {
        const url = `${Config.app_server_api}/eventlog`;
        console.log("PUT " + url);
        const {data: resp} = await HttpClient.put(url, eventLog, true);
        console.log("response payload:", resp);
        return resp;
    } catch (e) {
        throw e;
    }
};

const sendLoginEventLog = ()=> {
    try {
        sendEventLog({
            userId: DeviceInfo.getDeviceId(),
            event: 'LOGIN',
            data: {
                platform: Platform.OS,
                version: DeviceInfo.getVersion(),
                versionCode: DeviceInfo.getBuildNumber()
            }
        });
    } catch (e) {
        console.log("send login event log error: " + e);
    }
}

const sendRegisterEventLog = () => {
    try {
        sendEventLog({
            userId: DeviceInfo.getDeviceId(),
            event: 'REGISTER',
            data: {
                platform: Platform.OS,
            }
        });
    } catch (e) {
        console.log("send register event log error: " + e);
    }
};

const sendRecoveryEventLog = () => {
    try {
        sendEventLog({
            userId: DeviceInfo.getDeviceId(),
            event: 'RECOVERY',
            data: {
                platform: Platform.OS,
            }
        });
    } catch (e) {
        console.log("send recovery event log error: " + e);
    }
};

const sendTransferEventLog = (coin, token, amount) => {
    try {
        sendEventLog({
            userId: DeviceInfo.getDeviceId(),
            event: 'TRANSFER',
            data: {
                coin: coin,
                token: token,
                amount: amount,
            }
        });
    } catch (e) {
        console.log("send transfer event log error: " + e);
    }
};


export {
    sendEventLog,
    sendLoginEventLog,
    sendRegisterEventLog,
    sendRecoveryEventLog,
    sendTransferEventLog,
}