import {Component} from 'react';
import {BackHandler} from 'react-native';
import Toast from 'react-native-root-toast';

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
        console.log("count: " + this.backClickCount);
        this.backClickCount == 1? BackHandler.exitApp(): this.prepare();
        return true;
    }

    prepare() {
        this.backClickCount = 1;
        let thus = this;
        Toast.show('Press Back again to quit app');
        setTimeout(function() {
            console.log("timeout");
            thus.backClickCount = 0;
        }, 1000);
    }
}