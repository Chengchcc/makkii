import React, { Component } from 'react';
import { Dimensions, View, Text, PixelRatio } from 'react-native';
import { connect } from 'react-redux';
import { strings } from '../../../../locales/i18n';
import SelectList from '../../../components/SelectList';
import { mainBgColor } from '../../../style_util';
import { RightActionButton } from '../../../components/common';
import defaultStyles from '../../../styles';
import { createAction } from '../../../../utils/dva';
import Loading from '../../../components/Loading';

const { width } = Dimensions.get('window');

class Language extends Component {
    static navigationOptions = ({ navigation, screenProps: { t, lang } }) => {
        return {
            title: t('language.title', { locale: lang }),
            headerRight: (
                <RightActionButton
                    onPress={() => {
                        navigation.state.params.updateLocale();
                    }}
                    disabled={!navigation.state.params || !navigation.state.params.isEdited}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.props.navigation.setParams({
            updateLocale: this.updateLocale,
            isEdited: false,
        });
    }

    updateLocale = () => {
        const { dispatch, navigation } = this.props;
        const lang = Object.keys(this.refs.refSelectList.getSelect())[0];
        this.refs.refLoading.show();
        dispatch(createAction('settingsModel/updateLocale')({ lang })).then(() => {
            setTimeout(() => {
                this.refs.refLoading.hide();
                navigation.goBack();
            }, 1000);
        });
    };

    render() {
        const { currentLanguage } = this.props;
        return (
            <View
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                    paddingTop: 40,
                }}
            >
                <View
                    style={{
                        ...defaultStyles.shadow,
                        width: width - 40,
                        borderRadius: 5,
                        backgroundColor: 'white',
                        paddingLeft: 20,
                        paddingRight: 20,
                    }}
                >
                    <SelectList
                        ref="refSelectList"
                        itemHeight={55}
                        data={{
                            auto: strings('language.auto'),
                            en: strings('language.english'),
                            zh: strings('language.chinese'),
                        }}
                        cellLeftView={item => {
                            return <Text style={{ flex: 1 }}>{item}</Text>;
                        }}
                        defaultKey={currentLanguage}
                        onItemSelected={() => {
                            this.props.navigation.setParams({
                                isEdited: currentLanguage !== Object.keys(this.refs.refSelectList.getSelect())[0],
                            });
                        }}
                        ItemSeparatorComponent={() => <View style={{ backgroundColor: 'lightgray', height: 1 / PixelRatio.get() }} />}
                    />
                </View>
                <Loading ref="refLoading" />
            </View>
        );
    }
}

const mapToState = ({ settingsModel }) => ({
    currentLanguage: settingsModel.lang,
});

export default connect(mapToState)(Language);
