import {Storage} from "../utils/storage";
import {createAction} from "../utils/dva";
import {accountKey, hashPassword, validatePassword} from "../utils";
import keyStore from "react-native-makkii-core";
import {strings} from "../locales/i18n";

/*
    features: manage user base information
 */
export default {
    namespace: 'userModal',
    state:{
        hashed_password: '',
        hashed_pinCode: '',
        mnemonic: '',
        address_book:{},
    },
    reducers:{
        updateState(state,{payload}){
            console.log('payload=>',payload);
            return {...state,...payload};
        }
    },
    effects:{
        *loadStorage(action,{call,put}){
            // Don't need upgrade
            const payload = yield call(Storage.get, 'user');
            keyStore.createByMnemonic(payload.mnemonic,'');
            yield put(createAction('updateState')(payload));
            return true;
        },
        *saveUser(action,{select,call}){
            const toBeSaved = yield select(({userModal})=>({
                hashed_password: userModal.hashed_password,
                hashed_pinCode: userModal.hashed_pinCode,
                mnemonic: userModal.mnemonic,
                address_book: userModal.address_book,
            }));
            yield call(Storage.set, 'user',toBeSaved);
        },
        *addContact({payload:{contactObj}}, {select, put}){
            let {address_book} = yield select(mapToUserModal);
            address_book[accountKey(contactObj.symbol, contactObj.address)] = contactObj;
            yield put(createAction('updateState')({address_book}));
            yield put(createAction('saveUser'))();
        },
        *deteleContact({payload:{key}},{select, put}){
            let {address_book} = yield select(mapToUserModal);
            delete address_book[key];
            yield put(createAction('updateState')({address_book}));
            yield put(createAction('saveUser'))();
        },
        *updatePassword({payload}, {select,put}){
            const {hashed_password} = payload;
            const {accountsKey} = yield select(({accountsModal})=>accountsModal.accountsKey);
            yield put(createAction('updateState')({hashed_password}));
            yield put(createAction('saveUser'))();
            // re-save all accounts
            yield put(createAction('accountsModal/saveAccounts')({keys:accountsKey}));
        },
        *register({payload}, {call,put}){
            const {password, password_confirm} = payload;
            if(validatePassword(password)){
                return {result:false, error:strings("register.error_password")}
            }else if(password!==password_confirm){
                return {result:false, error:strings("register.error_password")}
            }
            const mnemonic = yield call(keyStore.generateMnemonic);
            const hashed_password = hashPassword(password);
            yield put(createAction('updateState')({hashed_password,mnemonic,hashed_pinCode:'', address_book:{}}));
            yield put(createAction('saveUser'))();
            return {result:true}
        },
        *recovery({payload}, {put}){
            const {password, password_confirm, mnemonic} = payload;
            if(validatePassword(password)){
                return {result:false, error:strings("register.error_password")}
            }else if(password!==password_confirm){
                return {result:false, error:strings("register.error_password")}
            }
            const hashed_password = hashPassword(password);
            yield put(createAction('updateState')({hashed_password,mnemonic,hashed_pinCode:'', address_book:{}}));
            yield put(createAction('saveUser'))();
            return {result:true}
        },
        *reset(action, {put}){
            yield put(createAction('updateState')({hashed_password:'',mnemonic:'',hashed_pinCode:'', address_book:{}}));
            yield put(createAction('saveUser'))();
        }
    }
}

const mapToUserModal = ({userModal})=>({...userModal});
