// polyfill unit8array
// import Uint8Array from 'core-js/fn/typed/uint8-array';

global.BigNumber = require('bignumber.js');

// if (!Uint8Array.prototype.fill) {
//     Uint8Array.prototype.fill = function fill(value) {
//         // Steps 1-2.
//         if (this == null) {
//             throw new TypeError('this is null or not defined');
//         }
//
//         let O = Object(this);
//
//         // Steps 3-5.
//         let len = O.length >>> 0;
//
//         // Steps 6-7.
//         let start = arguments[1];
//         let relativeStart = start >> 0;
//
//         // Step 8.
//         let k = relativeStart < 0 ? Math.max(len + relativeStart, 0) : Math.min(relativeStart, len);
//
//         // Steps 9-10.
//         let end = arguments[2];
//         let relativeEnd = end === undefined ? len : end >> 0;
//
//         // Step 11.
//         let final = relativeEnd < 0 ? Math.max(len + relativeEnd, 0) : Math.min(relativeEnd, len);
//
//         // Step 12.
//         while (k < final) {
//             O[k] = value;
//             k++;
//         }
//
//         // Step 13.
//         return O;
//     };
// }

if (!Date.prototype.Format) {
    Date.prototype.Format = function Format(fmt, radix = 12) {
        const ext = radix === 12 && fmt.indexOf('h') >= 0;
        let o = {
            'M+': this.getMonth() + 1, // month
            'd+': this.getDate(), // day
            'h+': radix === 12 ? (this.getHours() % 12 === 0 ? 12 : this.getHours() % 12) : this.getHours(), // hour
            'm+': this.getMinutes(), // minute
            's+': this.getSeconds(), // seconds
            'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
            S: this.getMilliseconds(), // milliseconds
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, `${this.getFullYear()}`.substring(4 - RegExp.$1.length));
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substring(`${o[k]}`.length));
            }
        }
        if (ext) {
            fmt = this.getHours() >= 12 ? `${fmt} PM` : `${fmt} AM`;
        }
        return fmt;
    };
}

if (!String.prototype.isChinese) {
    String.prototype.isChinese = function isChinese() {
        let patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
        return patrn.exec(this);
    };
}

// fix bip39
// eslint-disable-next-line func-names
String.prototype.normalize = function(form) {
    const unorm = require('unorm');
    let str = `${this}`;
    form = form === undefined ? 'NFC' : form;

    if (form === 'NFC') {
        return unorm.nfc(str);
    }
    if (form === 'NFD') {
        return unorm.nfd(str);
    }
    if (form === 'NFKC') {
        return unorm.nfkc(str);
    }
    if (form === 'NFKD') {
        return unorm.nfkd(str);
    }
    throw new RangeError(`Invalid normalization form: ${form}`);
};

if (!BigNumber.prototype.toNonExString) {
    BigNumber.prototype.toNotExString = function toNotExString() {
        let m = this.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        if (m) {
            return this.toFixed(Math.max(0, (m[1] || '').length - m[2]));
        }
        return this.toString();
    };
}
if (!Array.prototype.remove) {
    Array.prototype.remove = function remove(val) {
        let index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };
}

if (typeof btoa === 'undefined') {
    // eslint-disable-next-line func-names
    global.btoa = function(str) {
        return Buffer.from(str, 'binary').toString('base64');
    };
}

if (typeof atob === 'undefined') {
    // eslint-disable-next-line func-names
    global.atob = function(b64Encoded) {
        return Buffer.from(b64Encoded, 'base64').toString('binary');
    };
}

// // symbol polyfills
// global.Symbol = require('core-js/es6/symbol');
// require('core-js/fn/symbol/iterator');
//
// // collection fn polyfills
// require('core-js/fn/map');
// require('core-js/fn/set');
// require('core-js/fn/array/find');
require('crypto');
