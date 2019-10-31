import * as React from 'react';
import { connect } from 'react-redux';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, Image, PixelRatio, TouchableOpacity, Dimensions } from 'react-native';
import { createAction } from '../../../../utils/dva';
import { mainBgColor } from '../../../style_util';
import { ImportListFooter } from '../../../components/common';
import { dateDiff } from '../../../../utils';
import commonStyles from '../../../styles';
import { strings } from '../../../../locales/i18n';

const { height, width } = Dimensions.get('window');
class CoinVoices extends React.Component {
    static navigationOptions = () => {
        return {
            title: strings('news.origin_coinvoice'),
        };
    };

    state = {
        isLoading: true,
        refreshing: false,
        footerState: 0,
        isShowToTop: false,
    };

    async componentDidMount(): void {
        this.isMount = true;
        setTimeout(() => {
            this.fetchArticles(0);
        }, 200);
    }

    componentWillUnmount(): void {
        this.isMount = false;
    }

    // eslint-disable-next-line react/sort-comp
    fetchArticles = page_ => {
        const { nextPage, dispatch } = this.props;
        const page = page_ === undefined ? nextPage : page_;
        dispatch(createAction('newsModel/getArticlesCoinVoices')({ page })).then(r => {
            if (r === 0) {
                this.isMount &&
                    this.setState({
                        isLoading: false,
                        refreshing: false,
                        footerState: 1,
                    });
            } else {
                this.isMount &&
                    this.setState({
                        isLoading: false,
                        refreshing: false,
                        footerState: r > 0 ? 0 : 1,
                    });
            }
        });
    };

    onEndReached() {
        // if not in fetching account
        if (this.state.footerState !== 0) {
            return;
        }
        // set footer state
        this.setState(
            {
                footerState: 2,
            },
            () => {
                setTimeout(() => this.fetchArticles(), 500);
            },
        );
    }

    onRefresh() {
        if (this.state.refreshing) {
            return;
        }
        this.setState(
            {
                refreshing: true,
            },
            () => {
                setTimeout(() => this.fetchArticles(1), 500);
            },
        );
    }

    toArticle = uri => {
        this.props.navigation.navigate('simple_webview', {
            initialUrl: { uri },
        });
    };

    // loading page
    renderLoadingView() {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mainBgColor,
                }}
            >
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }

    renderItem = ({ item }) => {
        const { title, origin, timestamp, link } = item;

        const timeText = dateDiff(timestamp);
        return (
            <TouchableOpacity
                onPress={() => this.toArticle(link)}
                activeOpacity={1}
                style={{ width: '100%', padding: 10, paddingVertical: 20, flexDirection: 'row', alignItem: 'center', justifyContent: 'space-between' }}
            >
                <View style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10 }} numberOfLines={2}>
                        {title}
                    </Text>
                    <Text style={{ color: 'gray' }}>{`${strings(`news.origin_${origin}`)}  ${timeText}`}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    renderNoNetWork() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity
                    style={{
                        ...commonStyles.shadow,
                        borderRadius: 10,
                        backgroundColor: 'white',
                        flex: 1,
                        width: width - 20,
                        marginVertical: 20,
                        marginHorizontal: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onPress={() => {
                        this.setState(
                            {
                                isLoading: true,
                            },
                            () => this.checkNetWork(),
                        );
                    }}
                >
                    <Image source={require('../../../../assets/empty_under_construction.png')} style={{ width: 80, height: 80, tintColor: 'gray' }} resizeMode="contain" />
                    <Text style={{ color: 'gray', textAlign: 'center', marginTop: 20 }}>{strings('error_connect_remote_server')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    _onScroll = e => {
        const offsetY = e.nativeEvent.contentOffset.y;
        if (offsetY > 100 && this.state.isShowToTop === false) {
            this.setState({
                isShowToTop: true,
            });
        } else if (offsetY <= 100 && this.state.isShowToTop === true) {
            this.setState({
                isShowToTop: false,
            });
        }
    };

    render() {
        const { isLoading, refreshing, footerState, isShowToTop } = this.state;
        const { articles } = this.props;
        if (isLoading) {
            return this.renderLoadingView();
        }
        if (articles.length === 0) {
            return this.renderNoNetWork();
        }
        return (
            <View style={{ flex: 1 }}>
                <FlatList
                    style={{ backgroundColor: '#fff', height }}
                    ref="listRef"
                    onScroll={this._onScroll}
                    renderItem={this.renderItem}
                    keyExtractor={(item, index) => `${index}`}
                    data={articles}
                    ItemSeparatorComponent={() => (
                        <View
                            style={{
                                height: 1 / PixelRatio.get(),
                                marginHorizontal: 10,
                                backgroundColor: 'lightgray',
                            }}
                        />
                    )}
                    onEndReached={() => this.onEndReached()}
                    ListFooterComponent={() => <ImportListFooter hasSeparator={false} footerState={footerState} />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => this.onRefresh()} />}
                />

                {isShowToTop ? (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            elevation: 8,
                            shadowColor: 'black',
                            shadowOffset: { width: 5, height: 5 },
                            shadowOpacity: 0.3,
                            position: 'absolute',
                            right: 10,
                            bottom: 20,
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#ffffff',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => {
                            this.refs.listRef && this.refs.listRef.scrollToOffset({ animated: true, offset: 0 });
                        }}
                    >
                        <Image source={require('../../../../assets/arrow_asc.png')} style={{ width: 20, height: 20 }} resizeMode="contain" />
                    </TouchableOpacity>
                ) : null}
            </View>
        );
    }
}

const mapToState = ({ newsModel }) => {
    return {
        articles: Object.values(newsModel.articlesCoinVoice).sort((a, b) => {
            return b.timestamp - a.timestamp;
        }),
        nextPage: newsModel.articlesCoinVoiceNextPage,
    };
};
export default connect(mapToState)(CoinVoices);
