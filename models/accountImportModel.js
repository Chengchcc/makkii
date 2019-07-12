import {
    getAccountFromMasterKey,
    getAccountFromPrivateKey,
    getAccountsFromLedger,
    getLedgerStatus
} from "../services/accountImportService";
import {accountKey} from '../utils'
import {createAction} from "../utils/dva";


const init = {
    symbol:'',
    private_key:'',
    type:'',
    address:'',
    derivationIndex: 0,
    ledger_lists:{
        /*
            <index>:<address>
         */
    },
    readyToImport: false,
};


export default {
    namespace: 'accountImportModal',
    state:init,
    reducers:{
        updateState(state, {payload}){
            console.log('payload=>', payload);
            return {...state, ...payload}
        }
    },
    effects:{
        *fromMasterKey(action, {call, put,select}) {
            const {symbol, hd_index ,accountsMap} = yield select(({accountImportModal, accountsModal}) => ({
                symbol: accountImportModal.symbol,
                hd_index: accountsModal.hd_index,
                accountsMap: accountsModal.accountsMap,
            }));
            const indexPathMap = hd_index[symbol] || {};
            console.log('indexPathMap=>', indexPathMap);
            console.log('accountsMap=>', accountsMap);
            let minIndex = 0;
            while(indexPathMap[minIndex]!==undefined){
                minIndex++;
            }
            while(1){
                const {private_key, address, index} = yield call(getAccountFromMasterKey, symbol, minIndex);
                console.log('getAccountFromMasterKey ret =>', {private_key, address, index} );
                yield put(createAction('accountsModal/updateHdIndex')({symbol:symbol, address:address, index: index, code:'add'}));
                if(!accountsMap[accountKey(symbol, address)]){
                    console.log('not added');
                    yield put(createAction('updateState')({private_key, address, type:'[local]', readyToImport:true}));
                    break;
                }
                minIndex++;
            }
        },
        *fromPrivateKey({payload},{call,put, select}){
            const {private_key} = payload;
            const {symbol, accountsMap} = yield select(({accountImportModal, accountsModal})=>({
                symbol:accountImportModal.symbol,
                accountsMap: accountsModal.accountsMap,
            }));
            try {
                const {address} = yield call(getAccountFromPrivateKey, symbol, private_key);
                if(!accountsMap[accountKey(symbol,address)]){
                    yield put(createAction('updateState')({private_key, address, type:'[pk]', readyToImport:true}));
                    return 1;
                }else{
                    return 2; //already imported
                }
            }catch (e) {
                return 3; // private_key error
            }
        },
        *fromLedger({payload},{put,select}){
          const {index} = payload;
          const ledger_lists = yield select(({accountImportModal})=>accountImportModal.ledger_lists);
          const address =ledger_lists[index];
          yield put(createAction('updateState')({address,derivationIndex:index, type:'[ledger]', readyToImport:true}));
        },
        *getAccountsFromLedger({payload:{page, size}}, {call, put, select}){
            const {symbol, accountsMap, old_ledger_lists} = yield select(({accountImportModal, accountsModal})=>({
                symbol:accountImportModal.symbol,
                old_ledger_lists: accountImportModal.ledger_lists,
                accountsMap: accountsModal.accountsMap,
            }));
            let new_ledger_lists =  {...old_ledger_lists};
            const rets = yield call(getAccountsFromLedger, symbol, page*size, page*size+size);
            rets.forEach(r=>{
                const {address, index} = r;
                if(!accountsMap[accountKey(symbol, address)]){
                    new_ledger_lists[index] = address;
                }
            });
            yield put(createAction('updateState')({ledger_lists:new_ledger_lists}));
        },
        *importAccount({payload:{name}}, {put,select}){
            const {symbol, address, type, private_key,derivationIndex} = yield select(({accountImportModal})=>({
                symbol: accountImportModal.symbol,
                address: accountImportModal.address,
                type: accountImportModal.type,
                private_key: accountImportModal.private_key,
                derivationIndex: accountImportModal.derivationIndex,
            }));
            let account = {symbol, address, type, name, tokens:{}};
            if(account.type === '[ledger]'){
                account.derivationIndex = derivationIndex;
            }else{
                account.private_key = private_key;
            }
            yield put(createAction('accountsModal/addAccount')({account:account}));
            yield put(createAction('updateState')(init));
        },
        *getLedgerStatus(action, {call}){
            return yield call(getLedgerStatus);
        }
    }

}