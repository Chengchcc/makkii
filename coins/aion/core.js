import {validateAmount, validatePositiveInteger} from '../../utils/index';
import BigNumber from 'bignumber.js';

function validateAddress(address, network='mainnet') {
    return new Promise((resolve, reject) => {
        // do not verify prefix a0
        let reg = /^[0-9a-fA-F]{64}$/;
        address = address.startsWith('0x') ? address.substring(2) : address;
        resolve(reg.test(address));
    });
}

function formatAddress1Line(address) {
    let pre = address.startsWith('0x')? 2: 0;
    return address.substring(0, 10 + pre) + '...' + address.substring(address.length - 10);
}


function validateBalanceSufficiency(account, symbol, amount, extra_params, network='mainnet') {
    if (!validateAmount(amount)) return {result: false, err: 'error_format_amount'};
    if (!validateAmount(extra_params['gas_price'])) return {result: false, err: 'error_invalid_gas_price'};
    if (!validatePositiveInteger(extra_params['gas_limit'])) return {result: false, err: 'error_invalid_gas_limit'};

    let gasLimit = new BigNumber(extra_params['gasLimit']);
    let gasPrice = new BigNumber(extra_params['gasPrice']);
    let balance = new BigNumber(account.balance);
    let transferAmount = new BigNumber(amount);
    if (account.symbol === symbol) {
        if (transferAmount.plus(gasPrice.multipliedBy(gasLimit).dividedBy(BigNumber(10).pow(9))).isGreaterThan(balance)) {
            return {result: false, err: 'error_insufficient_amount'};
        }
    } else {
        if (gasPrice.multipliedBy(gasLimit).dividedBy(BigNumber(10).pow(9)).isGreaterThan(balance)) {
            return {result: false, err: 'error_insufficient_amount'};
        }
        let totalCoins = account.tokens[network][symbol].balance;
        if (transferAmount.isGreaterThan(totalCoins)) {
            return {result: false, err: 'error_insufficient_amount'};
        }
    }
    return {result: true};
}

module.exports = {
    validateAddress,
    formatAddress1Line,
    validateBalanceSufficiency,
}
