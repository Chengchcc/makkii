import jsonrpc from './jsonrpc';
import core from './core';
import transaction from './transaction';

module.exports = {
    getBalance: jsonrpc.getBalance,
    getTransactionsByAddress: transaction.getTransactionsByAddress,
    validateAddress: jsonrpc.validateAddress,
    formatAddress1Line: core.formatAddress1Line,
    sendTransaction: transaction.sendTransaction,
    validateBalanceSufficiency: core.validateBalanceSufficiency,
    getTransactionStatus: transaction.getTransactionStatus,
    getTransactionUrlInExplorer: transaction.getTransactionUrlInExplorer,
}