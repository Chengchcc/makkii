import BigNumber from 'bignumber.js';
import { AionTransaction } from './aion_transaction';
import { CONTRACT_ABI } from './token';
import { getTransactionReceipt, getTransactionCount, sendSignedTransaction } from './jsonrpc';
import ApiCaller from '../../utils/http_caller';

function sendNativeTx(account, to, value, gasPrice, gasLimit, data, network) {
    let tx = {
        sender: account.address,
        gasPrice,
        gas: gasLimit,
        to,
        value: value.shiftedBy(18),
        type: 1,
    };
    if (data !== undefined) {
        tx = { ...tx, data };
    }
    const { type, derivationIndex, private_key: privateKey } = account;
    return new Promise((resolve, reject) => {
        getTransactionCount(account.address, 'pending', network)
            .then(count => {
                const aionTx = new AionTransaction({
                    ...tx,
                    nonce: count,
                });
                let promise;
                try {
                    if (type === '[ledger]') {
                        promise = aionTx.signByLedger(derivationIndex);
                    } else {
                        promise = aionTx.signByECKey(privateKey);
                    }
                } catch (err) {
                    console.log('aion sign tx failed: ', err);
                    throw err;
                }
                promise
                    .then(encoded => {
                        if (!encoded) {
                            console.log('try get pending tx encoded');
                            encoded = aionTx.getEncoded();
                        }
                        console.log('encoded aion tx=> ', encoded);
                        sendSignedTransaction(encoded, network)
                            .then(hash => {
                                const pendingTx = {
                                    hash,
                                    timestamp: aionTx.timestamp.toNumber() / 1000,
                                    from: account.address,
                                    to,
                                    value,
                                    status: 'PENDING',
                                };
                                resolve({ pendingTx, pendingTokenTx: undefined });
                            })
                            .catch(err => {
                                console.log('aion send signed tx error:', err);
                                reject(err);
                            });
                    })
                    .catch(err => {
                        console.log('aion sign tx error:', err);
                        reject(err);
                    });
            })
            .catch(err => {
                console.log('aion get transaction count error: ', err);
                reject(err);
            });
    });
}

function sendTransaction(account, symbol, to, value, extraParams, data, network = 'mainnet') {
    const { gasPrice } = extraParams;
    const { gasLimit } = extraParams;
    if (account.symbol === symbol) {
        return sendNativeTx(account, to, value, gasPrice, gasLimit, data, network);
    }
    return sendTokenTx(account, symbol, to, value, gasPrice, gasLimit, network);
}

function sendTokenTx(account, symbol, to, value, gasPrice, gasLimit, network = 'mainnet') {
    const { tokens } = account;
    const { contractAddr, tokenDecimal } = tokens[symbol];
    console.log('tokenDecimal=>', tokenDecimal);
    const tokenContract = new web3.eth.Contract(CONTRACT_ABI, contractAddr);
    const methodsData = tokenContract.methods
        .send(
            to,
            value
                .shiftedBy(tokenDecimal - 0)
                .toFixed(0)
                .toString(),
            '',
        )
        .encodeABI();

    return new Promise((resolve, reject) => {
        sendNativeTx(
            account,
            contractAddr,
            new BigNumber(0),
            gasPrice,
            gasLimit,
            methodsData,
            network,
        )
            .then(res => {
                const { pendingTx } = res;
                const pendingTokenTx = {
                    hash: pendingTx.hash,
                    timestamp: pendingTx.timestamp,
                    from: pendingTx.from,
                    to,
                    value,
                    status: 'PENDING',
                };

                resolve({ pendingTx, pendingTokenTx });
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getTransactionsByAddress(address, page = 0, size = 25, network = 'mainnet') {
    const url = `https://${network}-api.aion.network/aion/dashboard/getTransactionsByAddress?accountAddress=${address.toLowerCase()}&page=${page}&size=${size}`;
    console.log(`[aion req] get aion transactions by address: ${url}`);
    return new Promise((resolve, reject) => {
        ApiCaller.get(url, false)
            .then(res => {
                console.log('[aion resp] res:', res.data);
                const { content } = res.data;
                const txs = {};
                content.forEach(t => {
                    const tx = {};
                    const timestamp = `${t.transactionTimestamp}`;
                    tx.hash = `0x${t.transactionHash}`;
                    tx.timestamp =
                        timestamp.length === 16
                            ? timestamp / 1000
                            : timestamp.length === 13
                            ? timestamp * 1
                            : timestamp.length === 10
                            ? timestamp * 1000
                            : null;
                    console.log('timestamp=>', tx.timestamp);
                    tx.from = `0x${t.fromAddr}`;
                    tx.to = `0x${t.toAddr}`;
                    tx.value = new BigNumber(t.value, 10).toNumber();
                    tx.status = t.txError === '' ? 'CONFIRMED' : 'FAILED';
                    tx.blockNumber = t.blockNumber;
                    txs[tx.hash] = tx;
                });
                resolve(txs);
            })
            .catch(err => {
                reject(err);
            });
    });
}

function getTransactionUrlInExplorer(txHash, network = 'mainnet') {
    return `https://${network}.aion.network/#/transaction/${txHash}`;
}

function getTransactionStatus(txHash, network = 'mainnet') {
    return new Promise((resolve, reject) => {
        getTransactionReceipt(txHash, network)
            .then(receipt => {
                if (receipt !== null) {
                    resolve({
                        status: parseInt(receipt.status, 16) === 1,
                        blockNumber: parseInt(receipt.blockNumber, 16),
                    });
                } else {
                    resolve(null);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
}

module.exports = {
    sendTransaction,
    getTransactionsByAddress,
    getTransactionUrlInExplorer,
    getTransactionStatus,
};
