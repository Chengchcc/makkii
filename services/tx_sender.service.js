/* eslint-disable camelcase */
import BigNumber from 'bignumber.js';
import { validator } from 'lib-common-util-js';
import { decode } from 'bip21';
import { COINS } from '../client/support_coin_list';
import { client, buildTransaction } from '../client/api';
import { validateAddress } from '../client/keystore';
import { getHardware, getLocalSigner } from '../utils';

const validateTxObj = async (txObj, account) => {
    const { to, amount, gasPrice, gasLimit, byteFee } = txObj;
    const { symbol, coinSymbol } = account;
    // validate 'to'
    try {
        let ret = validateAddress(symbol, to);
        if (!ret) {
            return { result: false, err: 'error_format_recipient' };
        }
    } catch (e) {
        return { result: false, err: 'error_format_recipient' };
    }
    // validate amount
    if (!validator.validateAmount(amount)) {
        return { result: false, err: 'error_format_amount' };
    }
    if (coinSymbol !== symbol) {
        const coinBalance = new BigNumber(account.tokens[coinSymbol].balance);
        if (coinBalance.lt(new BigNumber(amount))) return { result: false, err: 'error_insufficient_amount' };
        let gasPrice_ = new BigNumber(gasPrice);
        if (gasPrice_.lt(10 ** 9)) gasPrice_ = gasPrice_.shiftedBy(9);
        const gasLimit_ = new BigNumber(gasLimit);
        const fee = gasPrice_.multipliedBy(gasLimit_).shiftedBy(-18);
        const balance = new BigNumber(account.balance);
        if (balance.lt(fee)) return { result: false, err: 'error_insufficient_amount' };
    } else {
        const balance = new BigNumber(account.balance);
        const amount_ = new BigNumber(amount);
        let gasPrice_ = new BigNumber(gasPrice);
        if (gasPrice_.lt(10 ** 9)) gasPrice_ = gasPrice_.shiftedBy(9);
        const gasLimit_ = new BigNumber(gasLimit);
        if (symbol === 'LTC' || symbol === 'BTC') {
            const all_amount = await client.getCoin(symbol).sendAll(account.address, byteFee);
            if (amount_.gt(new BigNumber(all_amount))) {
                return { result: false, err: 'error_insufficient_amount' };
            }
        }
        if (symbol === 'AION' || symbol === 'ETH') {
            console.log(gasPrice_, gasLimit_);
            const fee = gasPrice_.multipliedBy(gasLimit_).shiftedBy(-18);
            if (balance.lt(amount_.plus(fee))) return { result: false, err: 'error_insufficient_amount' };
        }
    }
    return { result: true };

    // Todo validate other fields
};

const getAllBalance = async (currentAccount, options) => {
    const { symbol, balance, coinSymbol } = currentAccount;
    const { currentGasLimit, currentGasPrice, currentByteFee } = options;
    let amount = 0;
    if (coinSymbol !== symbol) {
        amount = BigNumber(currentAccount.tokens[coinSymbol].balance).toNumber();
    } else if (symbol === 'AION' || symbol === 'ETH') {
        amount = BigNumber.max(
            BigNumber(0),
            BigNumber(balance)
                .shiftedBy(18)
                .minus(BigNumber(currentGasLimit).times(BigNumber(currentGasPrice).shiftedBy(9)))
                .shiftedBy(-18),
        ).toNumber();
    } else if (symbol === 'BTC' || symbol === 'LTC') {
        amount = await client.getCoin(symbol).sendAll(currentAccount.address, currentByteFee);
    } else {
        amount = balance.toNumber();
    }
    return amount;
};

const parseScannedData = async (data, currentAccount) => {
    let ret;
    let retData = {};
    const coinName = COINS[currentAccount.symbol].name.toLowerCase();
    try {
        const { address, options } = decode(data, coinName);
        const { amount } = options;
        const ret1 = await validateAddress(currentAccount.symbol, address);
        const ret2 = amount ? validator.validateAmount(amount) : true;
        ret = ret1 && ret2;
        if (ret) {
            retData = {
                ...options,
                to: address,
            };
        }
    } catch (e) {
        ret = await validateAddress(currentAccount.symbol, data);
        if (ret) {
            retData.to = data;
        }
    }
    return { result: ret, data: retData };
};

const sendTx = async (txObj, currentAccount, shouldBroadCast) => {
    const { symbol, coinSymbol, tokens } = currentAccount;
    const { gasPrice, gasLimit, amount, to, data, byteFee } = txObj;
    try {
        const isTokenTransfer = symbol !== coinSymbol;
        const tokenParam = isTokenTransfer
            ? {
                  contractAddr: tokens[coinSymbol].contractAddr,
                  tokenDecimal: tokens[coinSymbol].tokenDecimal,
              }
            : {};
        const unsignedTx = await buildTransaction(symbol, currentAccount.address, to, new BigNumber(amount), {
            gasPrice: gasPrice * 10 ** 9,
            gasLimit: parseInt(gasLimit),
            data,
            isTokenTransfer,
            byte_fee: parseInt(byteFee),
            ...tokenParam,
        });
        let signer;
        let singerParams;
        if (currentAccount.type === '[ledger]') {
            signer = getHardware(symbol);
            // check whether the same device
            const { address } = await signer.getAccount(currentAccount.derivationIndex);
            if (address !== currentAccount.address) {
                return { result: false, error: { message: 'error.wrong_device' } };
            }
            singerParams = { index: currentAccount.derivationIndex };
        } else {
            signer = getLocalSigner(symbol);
            singerParams = { private_key: currentAccount.private_key, compressed: currentAccount.compressed };
        }
        if (!shouldBroadCast) {
            const encoded = await signer.signTransaction(unsignedTx, singerParams);
            return {
                result: true,
                data: {
                    encoded,
                    txObj: {
                        from: unsignedTx.from,
                        to: unsignedTx.to,
                        value: unsignedTx.value,
                    },
                },
            };
        }
        const res = await client.sendTransaction(symbol, unsignedTx, signer, singerParams);
        return { result: true, data: { pendingTx: res } };
    } catch (e) {
        console.log('sendTransaction error=>', e);
        return { result: false, error: e };
    }
};

export { validateTxObj, getAllBalance, parseScannedData, sendTx };
