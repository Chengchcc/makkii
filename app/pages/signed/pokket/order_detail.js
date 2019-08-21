import * as React from 'react';
import { Clipboard, Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import BigNumber from 'bignumber.js';
import { linkButtonColor, mainBgColor } from '../../../style_util';
import { connect, createAction, navigate } from '../../../../utils/dva';
import { strings } from '../../../../locales/i18n';
import commonStyles from '../../../styles';
import { Cell2, CellInput } from '../../../components/Cell';
import { AppToast } from '../../../components/AppToast';
// import CheckBox from '../../../components/CheckBox';
import { COINS } from '../../../../client/support_coin_list';
import { accountKey } from '../../../../utils';
import Loading from '../../../components/Loading';

const { width } = Dimensions.get('window');
const MyscrollView = Platform.OS === 'ios' ? KeyboardAwareScrollView : ScrollView;

class OrderDetail extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('pokket.title_order_detail'),
        };
    };

    toAccountDetail = ({ token, address }) => {
        const { dispatch, accounts } = this.props;
        const symbol = token === 'BTC' ? 'BTC' : 'ETH';
        const targetUri = COINS[symbol].tokenSupport ? 'signed_vault_account_tokens' : 'signed_vault_account';
        let key = accountKey(symbol, address);
        let key_;
        for (let e in accounts) {
            if (e.toLowerCase() === key.toLowerCase()) {
                key_ = e;
                break;
            }
        }
        dispatch(
            createAction('accountsModel/updateState')({
                currentAccount: key_,
                currentToken: '',
            }),
        );
        navigate(targetUri)({ dispatch });
    };

    toggleAutoRoll = ({ autoRoll, orderId }) => {
        const { dispatch } = this.props;
        this.refs.refLoading.show();
        dispatch(createAction('pokketModel/toggleAutoRoll')({ autoRoll, orderId })).then(() => {
            this.refs.refLoading.hide();
        });
        return false;
    };

    render() {
        const { amount, token, tokenFullName, investorAddress, weeklyInterestRate, yearlyInterestRate, startTime, token2Collateral, orderId, status, /* autoRoll, */ result } = this.props.order;
        const profits1 = `${((amount || 0) * (1 + weeklyInterestRate / 100)).toFixed(2)}${token}`;
        const profits2 = `${((amount || 0) * (1.1 + weeklyInterestRate / 100) * token2Collateral).toFixed(2)}TUSD`;
        let actualProfits = null;
        if (result) {
            actualProfits = result.match(/LESS_THAN/) ? profits1 : profits2;
        }
        const endTime = startTime + 24 * 7 * 60 * 60 * 1000;
        return (
            <View style={{ flex: 1, backgroundColor: mainBgColor }}>
                <MyscrollView contentContainerStyle={{ justifyContent: 'center' }} keyboardShouldPersistTaps="always">
                    <View style={styles.container}>
                        <Cell2 title={strings('pokket.label_token')} value={`${token}/${tokenFullName}`} />
                        <CellInput
                            title={strings('pokket.label_account')}
                            value={`${investorAddress}`}
                            editable={false}
                            multiline
                            rightView={() => (
                                <TouchableOpacity onPress={() => this.toAccountDetail({ token, address: investorAddress })}>
                                    <Text style={{ color: linkButtonColor }}>{strings('pokket.label_account_detail')}</Text>
                                </TouchableOpacity>
                            )}
                            underlineColorAndroid="transparent"
                        />
                        <Cell2 title={strings('pokket.label_fixed_deposits')} value={`${amount} ${token}`} />
                        <Cell2 title={strings('pokket.label_weekly_rate')} value={`${BigNumber(yearlyInterestRate).toNumber()}%`} />
                        <Cell2 title={strings('pokket.label_yearly_rate')} value={`${BigNumber(weeklyInterestRate).toNumber()}%`} />
                        <Cell2 title={strings('pokket.label_start_date')} value={`${new Date(startTime).Format('dd/MM/yyyy')}`} />
                        <Cell2 title={strings('pokket.label_end_date')} value={`${new Date(endTime).Format('dd/MM/yyyy')}`} />
                        {status !== 'COMPLETE' ? (
                            <Cell2 title={strings('pokket.label_expected_profits')} value={`${profits1} ${strings('label_or')} ${profits2}`} />
                        ) : (
                            <Cell2 title={strings('pokket.label_actual_profits')} value={actualProfits} />
                        )}
                        <CellInput
                            title={strings('pokket.label_orderId')}
                            value={`${orderId}`}
                            editable={false}
                            multiline
                            textAlign="right"
                            rightView={() => (
                                <TouchableOpacity
                                    onPress={() => {
                                        Clipboard.setString(orderId);
                                        AppToast.show(strings('toast_copy_success'));
                                    }}
                                >
                                    <Image source={require('../../../../assets/icon_copy.png')} style={{ width: 20, height: 20, tintColor: '#000' }} resizeMode="contain" />
                                </TouchableOpacity>
                            )}
                            underlineColorAndroid="transparent"
                        />
                        <Cell2 title={strings('pokket.label_status')} value={strings(`pokket.label_${status}`)} />
                        {/* {status !== 'COMPLETE' ? ( */}
                        {/*    <CheckBox */}
                        {/*        style={{ marginTop: 10 }} */}
                        {/*        initValue={!!autoRoll} */}
                        {/*        beforeCheck={() => this.toggleAutoRoll({ autoRoll: false, orderId })} */}
                        {/*        beforeUncheck={() => this.toggleAutoRoll({ autoRoll: true, orderId })} */}
                        {/*        textRight={strings('pokket.label_autoRoll')} */}
                        {/*    /> */}
                        {/* ) : null} */}
                    </View>
                    <Loading ref="refLoading" />
                </MyscrollView>
            </View>
        );
    }
}

const mapToState = ({ pokketModel, accountsModel }) => {
    const order = pokketModel.orders[pokketModel.currentOrder];
    console.log('order=>', order);
    return {
        order,
        accounts: accountsModel.accountsMap,
    };
};
export default connect(mapToState)(OrderDetail);

const styles = {
    container: {
        ...commonStyles.shadow,
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 10,
        width: width - 40,
        backgroundColor: '#fff',
        padding: 10,
    },
};
