import {Component} from 'react';
import {BackHandler} from 'react-native';
import Toast from 'react-native-root-toast';
import {strings} from '../../locales/i18n';

export class HomeComponent extends Component {

    constructor(props) {
        super(props);
        this.backClickCount = 0;
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton=() => {
        if (this.props.navigation.isFocused()) {
                console.log("count: " + this.backClickCount);
                this.backClickCount === 1? BackHandler.exitApp(): this.prepare();
                return true;
        }
        return false;
    };

    prepare() {
        this.backClickCount = 1;
        Toast.show(strings('toast_double_press_exit'), {
            onHidden:()=>this.backClickCount&&(this.backClickCount = 0),
        });
    }
}
