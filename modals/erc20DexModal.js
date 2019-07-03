import {genTradeData, getTokenList, getTokenTradeRate} from '../services/erc20DexService';
import {createAction} from "../utils/dva";
import {AppToast} from "../utils/AppToast";
import {strings} from "../locales/i18n";
import {COINS} from "../coins/support_coin_list";

export default {
    namespace: 'ERC20Dex',
    state:{
        isLoading: true,
        isWaiting: false,
        network: COINS.ETH.network,
        currentAccount: '',
        tokenList: {},
        trade:{
            srcToken: '',
            destToken: '',
            tradeRate: 1,
        }
    },
    reducers:{
        ERC20DexUpdateState(state, {payload}){
            return {...state, ...payload};
        },

    },
    effects:{
        *getTokenList({payload}, {call, select, put}){
            const network = yield select(({ERC20Dex})=>ERC20Dex.network);
            const lists = yield call(getTokenList,network);
            // init trade;
            const srcToken = Object.keys(lists)[0];
            const destToken = Object.keys(lists)[1];
            const rate = yield call(getTokenTradeRate,srcToken, destToken, network);
            console.log(`get rate ${srcToken} -> ${destToken}=${rate}`);
            const trade = {
                srcToken:srcToken,
                destToken: destToken,
                tradeRate: rate,
            };
            yield put(createAction('ERC20DexUpdateState')({isLoading:false,tokenList:lists, trade:trade}));
        },
        *updateTrade({payload},{call,put,select}){
            yield put(createAction('ERC20DexUpdateState')({isWaiting: true}));
            const tokenList = yield select(({ERC20Dex})=>ERC20Dex.tokenList);
            const network = yield select(({ERC20Dex})=>ERC20Dex.network);
            const {srcToken,destToken} = payload;
            if(tokenList[srcToken]===undefined){
                AppToast.show(strings('token_exchange.toast_not_support',{token: srcToken}));
                return;
            }
            if(tokenList[destToken]===undefined){
                AppToast.show(strings('token_exchange.toast_not_support',{token: destToken}));
                return;
            }
            const rate = yield call(getTokenTradeRate,srcToken, destToken, network);
            console.log(`get rate ${srcToken} -> ${destToken}=${rate}`);
            let trade = {
                srcToken:srcToken,
                destToken: destToken,
                tradeRate: rate,
            };
            yield put(createAction('ERC20DexUpdateState')({trade:trade,isWaiting:false}));
        },
        *trade({payload},{call,put, select}){
            const {srcToken,destToken,srcQty,destQty} = payload;
            const currentAccount = yield select(({ERC20Dex})=>ERC20Dex.currentAccount);
            const tokenList = yield select(({ERC20Dex})=>ERC20Dex.tokenList);
            const network = yield select(({ERC20Dex})=>ERC20Dex.network);
            if('ETH'===srcToken){
                //  no need approve
                const tradeDatResp = yield call(genTradeData,currentAccount,'0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', tokenList[destToken].address,srcQty,destQty,network);
                if(!tradeDatResp.error){

                }else{

                }
            }
        }

    }
}