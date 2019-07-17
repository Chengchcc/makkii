import {NavigationActions} from "react-navigation";
import {DeviceEventEmitter} from 'react-native';
import {
    genTradeData,
    getTokenList,
    getTokenTradeRate,
    getEnabledStatus,
    getApproveAuthorizationTx,
    ETHID
} from '../services/erc20DexService';
import {createAction, navigate} from "../utils/dva";
import {AppToast} from "../utils/AppToast";
import {strings} from "../locales/i18n";
import {COINS} from "../coins/support_coin_list";
import {popCustom} from "../utils/dva";
import {Storage} from "../utils/storage";
import BigNumber from 'bignumber.js';
import {getExchangeRulesURL} from "../components/signed/dex/constants";
import Config from 'react-native-config';

const network = COINS.ETH.network;
export default {
    namespace: 'ERC20Dex',
    state:{
        isLoading: true,
        isWaiting: false,
        tokenList: {},
        currentAccount: '',
        tokenApprovals:{}, // save; 2 states 'waitApprove'/'waitRevoke'
        trade:{
            srcToken: '',
            destToken: '',
            tradeRate: 1,
        }
    },
    reducers:{
        ERC20DexUpdateState(state, {payload}){
            console.log('ERC20Dex payload=>',payload);
            return {...state, ...payload};
        },
    },
    subscriptions: {
        setup({dispatch}) {
            DeviceEventEmitter.addListener('add_new_account', (account)=> {
                if (account.symbol === 'ETH') {
                    dispatch(createAction('tryUpdateCurrentAccount')({address: account.address}));
                }
            });
        }
    },
    effects:{
        *loadStorage(action,{call,put, select, take}){
            const accountsMap = yield select(({accountsModel}) => accountsModel.accountsMap);

            let currentAccount = '';
            for (let key of Object.keys(accountsMap)) {
                if (key.startsWith("ETH+")) {
                    currentAccount = key;
                    break;
                }
            }

            const tokenApprovals = yield call(Storage.get, 'tokenApprovals', false);
            console.log('get tokenApprovals from storage => ', tokenApprovals);
            yield put(createAction('ERC20DexUpdateState')({tokenApprovals, currentAccount}))
            yield put(createAction('getTokenList')());
        },
        *tryUpdateCurrentAccount({payload}, {select, put}) {
            const currentAccount = yield select(({ERC20Dex}) => ERC20Dex.currentAccount);
            if (currentAccount.length <= 0) {
                const {address} = payload;
                yield put(createAction('ERC20DexUpdateState')({currentAccount: 'ETH+' + address}));
            }
        },
        *reset(action, {call, put}){
            yield call(Storage.remove, 'tokenApprovals');
            yield put(createAction('ERC20DexUpdateState')({tokenApprovals:{}}))
        },
        *updateTokenApproval({payload},{call,select,put}) {
            const oldTokenApprovals = yield select(({ERC20Dex}) => ERC20Dex.tokenApprovals);
            const {symbol, state, address} = payload; // state one of 'waitApprove'/'waitRevoke'/'delete'
            let newTokenApprovals =  Object.assign({},oldTokenApprovals);
            if('delete'===state){
                delete newTokenApprovals[address][symbol]
            }else {
                newTokenApprovals[address]={...newTokenApprovals[address],[symbol]:state};
            }
            yield put(createAction('ERC20DexUpdateState')({tokenApprovals:newTokenApprovals}));
            yield call(Storage.set, 'tokenApprovals', newTokenApprovals);
        },

        *getTokenList({payload}, {call, select, put}){
            const lists = yield call(getTokenList,network);
            // init trade;
            const srcToken = Object.keys(lists)[0];
            const destToken = Object.keys(lists)[1];
            console.log(srcToken + " " + lists[srcToken].address);
            console.log(destToken + " " + lists[destToken].address);
            const result = yield call(getTokenTradeRate, lists[srcToken].address, lists[destToken].address, 1, network);
            if (result.status) {
                console.log(`get rate ${srcToken} -> ${destToken}=${result.rate}`);
                const trade = {
                    srcToken: srcToken,
                    destToken: destToken,
                    tradeRate: result.rate,
                };
                yield put(createAction('ERC20DexUpdateState')({isLoading: false, tokenList: lists, trade: trade}));
            } else {
                yield put(createAction('ERC20DexUpdateState')({isLoading: false, tokenList: lists}));
            }
        },
        *updateTrade({payload},{call,put,select}){
            const {srcToken,destToken, srcQty, displayLoading=true} = payload;
            if (displayLoading)
                yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const tokenList = yield select(({ERC20Dex})=>ERC20Dex.tokenList);
            if(tokenList[srcToken]===undefined){
                AppToast.show(strings('token_exchange.toast_not_support',{token: srcToken}));
                return;
            }
            if(tokenList[destToken]===undefined){
                AppToast.show(strings('token_exchange.toast_not_support',{token: destToken}));
                return;
            }
            const result = yield call(getTokenTradeRate,tokenList[srcToken].address, tokenList[destToken].address, srcQty, network);
            if (result.status) {
                console.log(`get rate ${srcToken} -> ${destToken}=${result.rate}`);
                let trade = {
                    srcToken: srcToken,
                    destToken: destToken,
                    tradeRate: result.rate,
                };
                yield put(createAction('ERC20DexUpdateState')({trade: trade, isWaiting: false}));
            } else {
                AppToast.show(strings(result.message, {token: destToken}), {
                    position: AppToast.positions.CENTER
                });
                yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
            }
        },
        *trade({payload},{call,put,select}){
            yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const {srcToken,destToken,srcQty,destQty, account, dispatch} = payload;
            const {tokenList, currentAccount} = yield select(({ERC20Dex})=>({...ERC20Dex}));
            const lang = yield select(({settingsModel})=>settingsModel.lang);

            if('ETH'===srcToken){
                //  no need approve
                const tradeDatResp = yield call(genTradeData,account.address,ETHID, tokenList[destToken].address,srcQty,BigNumber(destQty).multipliedBy(0.97).toNumber(),Config.kyber_wallet_id, network);
                yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
                if(!tradeDatResp.error){
                    const rawTx = tradeDatResp.data[0];
                    console.log('rawTx=>',rawTx);
                    yield put(createAction('accountsModel/updateState')({currentToken:'', currentAccount: currentAccount}));
                    yield put(createAction('txSenderModel/updateState')({
                        ...rawTx,
                        gasPrice: BigNumber(rawTx.gasPrice).shiftedBy(-9).toNumber(),
                        gasLimit:BigNumber(rawTx.gasLimit).toNumber(),
                        amount:BigNumber(rawTx.value).shiftedBy(-18).toNumber(),
                        editable:false,
                        txType:{type:'exchange', data:{srcToken:srcToken,destToken:destToken,srcQty:srcQty,destQty:destQty, status:'PENDING'}}}));

                    yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{title:strings('token_exchange.title_exchange'),}}));
                }else{
                    AppToast.show(tradeDatResp["reason"] + tradeDatResp["additional_data"]);
                }
            }else{
                // check enabledStatus
                const txs_required = yield call(getEnabledStatus, account.address,tokenList[srcToken].address, network);
                console.log('tx_required=>',txs_required);
                const tokenApprovals = yield select(({ERC20Dex}) => ERC20Dex.tokenApprovals);
                if(tokenApprovals[account.address] && tokenApprovals[account.address][srcToken]){
                    yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
                    AppToast.show(strings('token_exchange.toast_waitApprove'),{position:AppToast.positions.CENTER});
                    return;
                }
                if(txs_required === 1){
                    // No allowance so approve to maximum amount (2^255)
                    popCustom.show(
                        strings('token_exchange.alert_title_need_authorization'),
                        strings('token_exchange.alert_content_need_approve',{token:srcToken}),
                        [
                            {
                                text:strings('token_exchange.alert_button_why_need_authorization'),
                                onPress:()=>{
                                    const initialUrl = getExchangeRulesURL(lang);
                                    navigate("simple_webview", {
                                        title: strings('token_exchange.title_exchange_rules'),
                                        initialUrl: initialUrl
                                    })({dispatch});
                                }
                            },
                            {
                                text:strings('cancel_button'),
                                onPress:()=>{}
                            },

                            {
                                text:strings('token_exchange.alert_button_approve'),
                                onPress:()=>{
                                    dispatch(createAction('ERC20Dex/enableTransfer')({token:srcToken, account:account, title:strings('token_exchange.title_approve'), type:'waitApprove'}))
                                }
                            }
                        ]
                    )
                }else if(txs_required ===2){
                    // Allowance has been given but is insufficient.
                    // Have to approve to 0 first to avoid this issue https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
                    popCustom.show(
                        strings('token_exchange.alert_title_need_authorization'),
                        strings('token_exchange.alert_content_need_re-approve'),
                        [
                            {
                                text:strings('token_exchange.alert_button_why_need_authorization'),
                                onPress:()=>{
                                    const initialUrl = getExchangeRulesURL(lang);
                                    navigate("simple_webview", {
                                        title: strings('token_exchange.title_exchange_rules'),
                                        initialUrl: initialUrl
                                    })({dispatch});
                                }
                            },
                            {
                                text:strings('cancel_button'),
                                onPress:()=>{}
                            },
                            {
                                text:strings('token_exchange.alert_button_approve'),
                                onPress:()=>{
                                    dispatch(createAction('ERC20Dex/enableTransfer')({token:srcToken, account:account, title:strings('token_exchange.title_revoke'), type:'waitRevoke'}))
                                }
                            }
                        ]
                    )
                }else{
                    const tradeDatResp = yield call(genTradeData,account.address,tokenList[srcToken].address, tokenList[destToken].address,srcQty,destQty,Config.kyber_wallet_id, network);
                    if(!tradeDatResp.error){
                        const rawTx = tradeDatResp.data[0];
                        console.log('rawTx=>',rawTx);
                        yield put(createAction('accountsModel/updateState')({currentToken:'', currentAccount: currentAccount}));
                        yield put(createAction('txSenderModel/updateState')({
                            ...rawTx,
                            gasPrice: BigNumber(rawTx.gasPrice).shiftedBy(-9).toNumber(),
                            gasLimit:BigNumber(rawTx.gasLimit).toNumber(),
                            amount:BigNumber(rawTx.value).shiftedBy(-18).toNumber(),
                            editable:false,
                            txType:{type:'exchange', data:{srcToken:srcToken,destToken:destToken,srcQty:srcQty,destQty:destQty, status:'PENDING'}}}));
                        yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{title:strings('token_exchange.title_exchange'),}}))
                    }else{
                        AppToast.show(tradeDatResp["reason"] + tradeDatResp["additional_data"]);
                    }
                }
                yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
            }
        },
        *enableTransfer({payload},{call,select,put}){
            yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const {tokenList, currentAccount} = yield select(({ERC20Dex})=>({...ERC20Dex}));
            const {token, account, title,type} = payload;
            const rawTx = yield call(getApproveAuthorizationTx,account.address,tokenList[token].address,network);
            console.log('rawTx=>', rawTx);
            yield put(createAction('ERC20DexUpdateState')({isWaiting: false}));
            yield put(createAction('accountsModel/updateState')({currentToken:'', currentAccount: currentAccount}));
            yield put(createAction('txSenderModel/updateState')({
                ...rawTx,
                gasPrice: BigNumber(rawTx.gasPrice).shiftedBy(-9).toNumber(),
                gasLimit:BigNumber(rawTx.gasLimit).toNumber(),
                amount:BigNumber(rawTx.value).shiftedBy(-18).toNumber(),
                editable:false,
                txType:{type:'approve',data:{address: account.address,symbol:token, state:type}}}));
            yield put(NavigationActions.navigate({routeName:'signed_vault_send', params:{title}}))
        }

    }
}