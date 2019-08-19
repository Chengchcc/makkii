import * as React from 'react';
import { Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BigNumber from 'bignumber.js';
import { connect, createAction, navigate } from '../../../../utils/dva';
import { accountKey } from '../../../../utils';
import { AccountBar } from '../../../components/AccountBar';
import { linkButtonColor, mainBgColor } from '../../../style_util';
import { DismissKeyboardView } from '../../../components/DismissKeyboardView';
import commonStyles from '../../../styles';
import { Cell2, CellInput } from '../../../components/Cell';
import { strings } from '../../../../locales/i18n';
import { ComponentButton } from '../../../components/common';
import Loading from '../../../components/Loading';
import { AppToast } from '../../../components/AppToast';

const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;

const { width } = Dimensions.get('window');

class Product extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('title', ''),
        };
    };

    state = {
        amount: '',
        RetAddress: '',
    };

    selectAccount = () => {
        const { currentProduct } = this.props;
        navigate('signed_Dex_account_list', { type: currentProduct.token === 'BTC' ? 'BTC' : 'ETH', usage: 'pokket' })(this.props);
    };

    selectIncomeAddress = () => {
        const { currentProduct } = this.props;
        navigate('signed_Dex_account_list', {
            type: currentProduct.token === 'BTC' ? 'BTC' : 'ETH',
            usage: ({ address }) => {
                this.setState({
                    RetAddress: address,
                });
            },
        })(this.props);
    };

    toAccountDetail = item => {
        const { dispatch } = this.props;
        dispatch(
            createAction('accountsModel/updateState')({
                currentAccount: accountKey(item.symbol, item.address),
                currentToken: '',
            }),
        );
        navigate('signed_vault_account_tokens')(this.props);
    };

    investAll = () => {
        const { currentProduct, currentAccount } = this.props;
        const { token } = currentProduct;
        if (!currentAccount.tokens[token]) {
            AppToast.show(strings('pokket.toast_no_token', { token }));
        }
    };

    scan = () => {
        const { dispatch, navigation } = this.props;
        navigation.navigate('scan', {
            success: 'signed_pokket_product',
            validate: (data, callback) => {
                console.log('validating code.....');
                dispatch(createAction('pokketModel/parseScannedData')({ data: data.data })).then(res => {
                    const { result, data } = res;
                    if (result) {
                        this.setState({
                            RetAddress: data.address,
                        });
                    }
                    result ? callback(true) : callback(false, strings('error_invalid_qrcode'));
                });
            },
        });
    };

    onBuy = () => {
        const { dispatch, navigation } = this.props;
        const { amount, RetAddress } = this.state;
        const { token, tokenFullName, weeklyInterestRate, yearlyInterestRate, token2Collateral } = this.props.currentProduct;
        const { address } = this.props.currentAccount;
        let payload = {
            amount,
            investorAddress: address.toLowerCase(),
            token,
            tokenFullName,
            weeklyInterestRate,
            yearlyInterestRate,
            token2Collateral,
            txHash: '0x11111111111111111111111111111111',
        };
        if (RetAddress) {
            payload = { ...payload, collateralAddress: RetAddress };
        }
        this.refs.refLoading.show();
        dispatch(createAction('pokketModel/createOrder')(payload)).then(() => {
            this.refs.refLoading.hide();
            navigation.goBack();
        });
    };

    render() {
        const { currentAccount, currentProduct } = this.props;
        const { token, weeklyInterestRate, yearlyInterestRate, remainingQuota, token2Collateral, minInvestAmount } = currentProduct;
        const { amount, RetAddress } = this.state;
        const expiryDate = new Date(Date.now() + 24 * 7 * 3600 * 1000).Format('dd/MM/yyyy');
        return (
            <DismissKeyboardView>
                <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                    <MyscrollView contentContainerStyle={{ justifyContent: 'center' }} keyboardShouldPersistTaps="always">
                        <AccountBar currentAccount={currentAccount} currentToken={token} selectAccount={this.selectAccount} toAccountDetail={this.toAccountDetail} />
                        <View style={styles.body}>
                            <Cell2
                                title={strings('pokket.label_weekly_rate')}
                                value={`${BigNumber(weeklyInterestRate)
                                    .times(100)
                                    .toNumber()} %`}
                            />
                            <Cell2
                                title={strings('pokket.label_yearly_rate')}
                                value={`${BigNumber(yearlyInterestRate)
                                    .times(100)
                                    .toNumber()} %`}
                            />
                            <Cell2 title={strings('pokket.label_remaining_quote')} value={`${remainingQuota}`} />
                            <Cell2 title={strings('pokket.label_min_amount')} value={`${minInvestAmount}`} />
                            <Cell2 title={strings('pokket.label_end_date')} value={`${expiryDate}`} />
                            <CellInput
                                title={strings('pokket.label_investment_amount')}
                                value={`${amount}`}
                                style={{ paddingTop: 10 }}
                                isRequired
                                onChangeText={v => this.setState({ amount: v })}
                                keyboardType="decimal-pad"
                                placeholder={strings('pokket.placeholder_investment_amount')}
                                rightView={() => (
                                    <TouchableOpacity onPress={this.investAll}>
                                        <Text style={{ color: linkButtonColor }}>{strings('send.button_send_all')}</Text>
                                    </TouchableOpacity>
                                )}
                                underlineColorAndroid="transparent"
                                unit={token}
                            />
                            <CellInput
                                title={strings('pokket.label_income_address')}
                                value={`${RetAddress}`}
                                style={{ paddingTop: 10 }}
                                multiline
                                isRequired={token === 'BTC'}
                                onChangeText={v => this.setState({ RetAddress: v })}
                                placeholder={strings('pokket.placeholder_income_address')}
                                rightView={() => (
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => this.scan()} style={{ marginRight: 10 }}>
                                            <Image
                                                source={require('../../../../assets/icon_scan.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: '#000',
                                                }}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.selectIncomeAddress}>
                                            <Image
                                                source={require('../../../../assets/icon_list.png')}
                                                style={{
                                                    width: 20,
                                                    height: 20,
                                                    tintColor: '#000',
                                                }}
                                                resizeMode="contain"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                underlineColorAndroid="transparent"
                            />
                            <View style={{ width: '100%', alignItems: 'flex-end' }}>
                                <Text style={{}}>
                                    {`${strings('pokket.label_expected_profits')} ${((amount || 0) * (1 + weeklyInterestRate)).toFixed(2)}${token} ${strings('label_or')} ${(
                                        (amount || 0) *
                                        1.1 *
                                        token2Collateral
                                    ).toFixed(2)}TUSD`}
                                </Text>
                            </View>
                        </View>
                        <ComponentButton
                            title={strings('pokket.button_buy')}
                            style={{
                                width: width - 40,
                                marginHorizontal: 20,
                                marginBottom: 20,
                            }}
                            onPress={this.onBuy}
                        />
                    </MyscrollView>
                    <Loading ref="refLoading" />
                </View>
            </DismissKeyboardView>
        );
    }
}
const mapToState = ({ pokketModel, accountsModel }) => {
    const { products, currentProduct } = pokketModel;
    const currentAccount = accountsModel.accountsMap[pokketModel.currentAccount];
    return {
        currentAccount,
        currentProduct: products[currentProduct],
    };
};

export default connect(mapToState)(Product);

const styles = {
    body: {
        ...commonStyles.shadow,
        borderRadius: 10,
        backgroundColor: 'white',
        width: width - 40,
        alignItems: 'center',
        padding: 10,
        marginVertical: 20,
        marginHorizontal: 20,
    },
};