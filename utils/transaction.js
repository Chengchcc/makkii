import {update_account_txs} from "../actions/accounts";
import {DeviceEventEmitter} from "react-native";
import Toast from "react-native-root-toast";
import {strings} from "../locales/i18n";
import {AionTransaction} from "../libs/aion-hd-wallet";
import {Ed25519Key} from "../libs/aion-hd-wallet/src/key/Ed25519Key";

/***
 *
 * @param tx object
 * @param wallet
 * @param symbol
 * @returns {*}
 */
function sendTransaction(tx, wallet, symbol){
    if (symbol==='AION'){
        return sendAionTransaction(tx, wallet)
    }else {
        return sendTokenTransaction(tx, wallet, symbol)
    }
}

function sendAionTransaction(tx, wallet){
    const {type, derivationIndex, private_key} = wallet;
    return new Promise((resolve, reject) => {
        web3.eth.getTransactionCount(tx.sender, 'pending').then(count => {
            console.log('get transaction count: ' + count);
            let pendingTx = new AionTransaction({
                ...tx,
                nonce: count,
            });
            let promise;
            try {
                console.log('wallet type: ', type);
                promise = type === '[ledger]'? pendingTx.signByLedger(derivationIndex) : pendingTx.signByECKey(Ed25519Key.fromSecretKey(private_key));
            }catch(e){
                console.log('sign transaction failed');
                throw (e)
            }
            promise.then(()=>{
                let pending = web3.eth.sendSignedTransaction(pendingTx.getEncoded());
                resolve({pending,signedTransaction:pendingTx});
            }).catch(err=>{
                throw err
            })
        }).catch(err=>{
            reject(err)
        })
    })
}

function sendTokenTransaction(tx, wallet, symbol){

}


class listenTransaction{
    constructor(store, timeOut=60*1000){
        this.txMap={};
        this.pendingMap = {};
        this.timeOut = timeOut;
        this.store = store;
    }
    hasPending() {
        return Object.keys(this.pendingMap).length > 0;
    }
    addTransaction(tx){
        let thusMap = this.txMap;
        let thusPendingMap = this.pendingMap;
        const thusTimeOut = this.timeOut;
        const thusStore = this.store;
        const {user, setting}= this.store.getState();
        if(typeof thusMap[tx.hash] !== 'undefined')
            return;
        console.log('getting transaction ' + tx.hash + ' status');
        this.pendingMap[tx.hash] = tx;
        let removeTransaction = function(tx){
            if(typeof thusMap[tx.hash] !== 'undefined'){
                console.log('clear listener');
                clearInterval(thusMap[tx.hash]);
                delete thusMap[tx.hash];
            }
        };
        let start = Date.now();
        thusMap[tx.hash]=setInterval(function(){
            if (Date.now() - start > thusTimeOut) {
                delete thusPendingMap[tx.hash];
                console.log('timeout');
                removeTransaction(tx);
            }
            web3.eth.getTransactionReceipt(tx.hash).then(
                res=>{
                    if(res){
                        tx.blockNumber = res.blockNumber;
                        if (res.status !== 'FAILED') {
                            if (thusMap[tx.hash]) {
                                let blockNumberInterval = setInterval(() => {
                                    web3.eth.getBlockNumber().then(
                                        number => {
                                            console.log('blockbumber: ', number);
                                            if (number > tx.blockNumber + 6) {
                                                delete thusPendingMap[tx.hash];

                                                tx.status = res.status ? 'CONFIRMED' : 'FAILED';
                                                thusStore.dispatch(update_account_txs(tx.from, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                                thusStore.dispatch(update_account_txs(tx.to, {[tx.hash]: tx}, setting.explorer_server, user.hashed_password));
                                                DeviceEventEmitter.emit('updateAccountBalance');
                                                clearInterval(blockNumberInterval);
                                            }
                                        }
                                    )
                                }, 1000 * 5);
                            }
                        }
                        removeTransaction(tx);
                    }
                },
                err=>{
                    Toast.show(strings('error_connect_remote_server'));
                    removeTransaction(tx);
                }
            )
        }, 5 * 1000);

    }
}



module.exports={
    sendTransaction:sendTransaction,
    listenTransaction:listenTransaction
};
