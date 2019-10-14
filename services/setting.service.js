/* eslint-disable camelcase */
import Config from 'react-native-config';
import { HttpClient } from 'lib-common-util-js';

const getLatestVersion = async (platform, versionCode, lang) => {
    const url = `${Config.app_server_api}/appVersion/latest?versionCode=${versionCode}&platform=${platform}&lang=${lang}`;
    console.log(`getLatestVersion ${url}`);
    try {
        const { data } = await HttpClient.get(url);
        console.log('data=>', data);
        return data;
    } catch (e) {
        return {};
    }
};

const getSupportedModule = async () => {
    const url = `${Config.app_server_api}/config`;
    console.log(`getRemoteConfig ${url}`);
    try {
        const {
            data: { supportedModule },
        } = await HttpClient.get(url);
        return { result: true, data: supportedModule };
    } catch (e) {
        return { result: false };
    }
};

const getActivityConstant = async () => {
    const url = `${Config.app_server_api}/market_activity/red_envelope/image`;
    try {
        const {
            data: { data },
        } = await HttpClient.get(url);
        return { result: true, data };
    } catch (e) {
        return { result: false };
    }
};
export { getLatestVersion, getSupportedModule, getActivityConstant };
