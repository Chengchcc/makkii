import * as React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import commonStyles from '../styles';
import { strings } from '../../locales/i18n';
import { COINS } from '../../client/support_coin_list';

const { width } = Dimensions.get('window');

export const renderAddress = (address, symbol) => {
    if (symbol === 'ETH') {
        return (
            <View>
                <Text style={{ ...commonStyles.addressFontStyle, color: '#000' }}>
                    {`${address.substring(0, 4)} ${address.substring(4, 8)} ${address.substring(8, 12)} ${address.substring(12, 16)} ${address.substring(16, 21)}`}
                </Text>
                <Text style={{ ...commonStyles.addressFontStyle, color: '#000' }}>
                    {`${address.substring(21, 25)} ${address.substring(25, 29)} ${address.substring(29, 33)} ${address.substring(33, 37)} ${address.substring(37, 42)}`}
                </Text>
            </View>
        );
    }
    if (symbol === 'BTC') {
        return (
            <View>
                <Text style={{ ...commonStyles.addressFontStyle, color: '#000', fontSize: 10 }}>{address}</Text>
            </View>
        );
    }
};

export class AccountBar extends React.Component {
    static propTypes = {
        currentAccount: PropTypes.object,
        currentToken: PropTypes.string.isRequired,
        selectAccount: PropTypes.func.isRequired,
        toAccountDetail: PropTypes.func.isRequired,
    };

    shouldComponentUpdate({ currentAccount, currentToken }): boolean {
        const { currentAccount: currentAccount_, currentToken: currentToken_ } = this.props;
        return JSON.stringify(currentAccount_) !== JSON.stringify(currentAccount) || currentToken !== currentToken_;
    }

    render() {
        const { currentAccount, currentToken, selectAccount, toAccountDetail } = this.props;

        if (currentAccount) {
            let { balance } = currentAccount;
            let { symbol } = currentAccount;
            if (currentToken !== 'ETH' && currentAccount.tokens[currentToken]) {
                balance = currentAccount.tokens[currentToken];
                symbol = currentToken;
            }
            return (
                <View
                    style={{
                        ...commonStyles.shadow,
                        borderRadius: 10,
                        marginTop: 20,
                        marginHorizontal: 20,
                        paddingHorizontal: 10,
                        alignItems: 'flex-start',
                        backgroundColor: '#fff',
                        width: width - 40,
                    }}
                >
                    <TouchableOpacity onPress={selectAccount}>
                        <View
                            style={{
                                width: '100%',
                                paddingVertical: 10,
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                borderBottomWidth: 0.2,
                                borderBottomColor: 'lightgray',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                }}
                            >
                                {strings('token_exchange.label_current_account')}
                            </Text>
                            <Image source={require('../../assets/arrow_right.png')} style={{ width: 24, height: 24 }} />
                        </View>
                    </TouchableOpacity>
                    <TouchableWithoutFeedback onPress={() => toAccountDetail(currentAccount)}>
                        <View style={styles.accountContainerWithShadow}>
                            <Image source={COINS[currentAccount.symbol].icon} style={{ marginRight: 10, width: 24, height: 24 }} />
                            <View style={{ flex: 1, paddingVertical: 10 }}>
                                <View
                                    style={{
                                        ...styles.accountSubContainer,
                                        width: '100%',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{ ...styles.accountSubTextFontStyle1, width: '70%' }} numberOfLines={1}>
                                        {currentAccount.name}
                                    </Text>
                                    <Text
                                        style={{
                                            ...styles.accountSubTextFontStyle1,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {new BigNumber(balance).toFixed(4)}
                                    </Text>
                                </View>
                                <View style={{ ...styles.accountSubContainer, alignItems: 'center' }}>
                                    {renderAddress(currentAccount.address, currentAccount.symbol)}
                                    <Text style={styles.accountSubTextFontStyle2}>{symbol}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            );
        }
        return (
            <View
                style={{
                    ...commonStyles.shadow,
                    borderRadius: 10,
                    marginVertical: 10,
                    marginHorizontal: 20,
                    paddingHorizontal: 10,
                    alignItems: 'flex-start',
                    backgroundColor: '#fff',
                    width: width - 40,
                }}
            >
                <TouchableOpacity onPress={selectAccount}>
                    <View
                        style={{
                            width: '100%',
                            paddingVertical: 10,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            {strings('token_exchange.label_select_account')}
                        </Text>
                        <Image source={require('../../assets/arrow_right.png')} style={{ width: 24, height: 24 }} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = {
    accountContainerWithShadow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    accountSubContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    accountSubTextFontStyle1: {
        fontSize: 14,
        color: '#000',
    },
    accountSubTextFontStyle2: {
        fontSize: 12,
        color: 'gray',
    },
    divider: {
        height: 0.5,
        backgroundColor: '#dfdfdf',
    },
};
