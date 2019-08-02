import Toast from 'react-native-root-toast';

const { positions } = Toast;
const { durations } = Toast;
class MyToast {
    constructor() {
        this.toast = null;
    }

    show(message, options = { position: Toast.positions.CENTER, duration: Toast.durations.SHORT }) {
        this.close();
        this.toast = Toast.show(message, options);
    }

    close() {
        if (this.toast) {
            Toast.hide(this.toast);
            this.toast = null;
        }
    }
}

const AppToast = new MyToast();
AppToast.positions = positions;
AppToast.durations = durations;
export { AppToast };
