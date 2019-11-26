/* eslint-disable camelcase */
import { hexutil } from 'lib-common-util-js';
import { getBlockByNumber, getBlockNumber, getTransactionStatus } from '../client/api';

const WAIT_BLOCKS = 2;
/** *
 * @param txs //array of {oldTx, symbol, listenerStatus}
 * @returns {Promise<any[]>} array of {newtx, symbol, listenerStatus}
 */
const getTxsStatus = txs => {
    return Promise.race([
        Promise.all(txs.map(tx => getOneTxStatus(tx))),
        new Promise(resolve => {
            setTimeout(() => resolve([]), 8 * 1000);
        }),
    ]);
};

/** *
 * @param tx eg:{oldTx, symbol, listenerStatus}
 * @returns {Promise<any> | Promise<*>} {newTx, symbol, listenerStatus}
 */

const getOneTxStatus = async tx => {
    const { oldTx, symbol, listenerStatus, timestamp } = tx;
    try {
        let newTx = { ...oldTx };
        let newListenerStatus = listenerStatus;
        console.log(`tx[${oldTx.hash}] listenerStatus=>${listenerStatus}`);
        if (listenerStatus === 'waitReceipt') {
            const { status, blockNumber, gasUsed } = await getTransactionStatus(symbol, oldTx.hash);
            if (symbol === 'ETH' || symbol === 'AION') {
                newTx.fee = gasUsed * newTx.gasPrice * 10 ** -18;
            }
            newTx.blockNumber = blockNumber;
            if (status) {
                // success
                newListenerStatus = blockNumber;
                if (symbol === 'TRX') {
                    newTx.status = 'CONFIRMED';
                    newListenerStatus = 'CONFIRMED';
                }
                return { newTx, symbol, listenerStatus: newListenerStatus, timestamp };
            } // failed
            newTx.status = 'FAILED';
            newListenerStatus = 'FAILED';
            if (symbol === 'ETH') {
                try {
                    const { timestamp } = await getBlockByNumber(symbol, numberToHexString(blockNumber));
                    newTx.timestamp = hexutil.hexStringToInt(timestamp) * 1000;
                } catch {
                    //
                }
            }
            return { newTx, symbol, listenerStatus: newListenerStatus, timestamp };
        }
        const number = await getBlockNumber(symbol);
        if (number > newListenerStatus + WAIT_BLOCKS) {
            // confirm
            newTx.status = 'CONFIRMED';
            newListenerStatus = 'CONFIRMED';
            if (symbol === 'ETH') {
                try {
                    const { timestamp } = await getBlockByNumber(symbol, numberToHexString(newTx.blockNumber));
                    newTx.timestamp = hexutil.hexStringToInt(timestamp) * 1000;
                    console.log('newTx.timestamp:', newTx.timestamp);
                } catch (e) {
                    console.log('get block by number failed');
                }
            }
            return { newTx, symbol, listenerStatus: newListenerStatus, timestamp };
        } // stay wait
        return { newTx, symbol, listenerStatus: newListenerStatus, timestamp };
    } catch (e) {
        return { newTx: oldTx, symbol, listenerStatus, timestamp };
    }
};

const numberToHexString = n => {
    if (typeof n === 'number') {
        return `0x${n.toString(16)}`;
    }
    if (typeof n === 'string') {
        return n.startsWith('0x') ? n : `0x${n}`;
    }
    throw new Error('invalid number=>', n);
};

export { getTxsStatus };
