import BigNumber from 'bignumber.js';
import blake2b from 'blake2b';
import {Crypto} from "./utils/crypto";
import {AionRlp} from './utils/rlp';

const sigToBytes = (signature, publicKey) => {
    let fullSignature = new Uint8Array((signature.length + publicKey.length));
    fullSignature.set(publicKey, 0);
    fullSignature.set(signature, publicKey.length);
    return fullSignature;
};

export class AionTransaction {
    nonce;
    to;
    valueHex;
    value;
    data;
    gas;
    gasPrice;
    timestampHex;
    timestamp;
    type;
    signature;
    /**
     * Signature with public key appended
     */
    fullSignature;

    /**
     *
     * @param params - example {
          nonce: '0x00',
          gasPrice: '0x09184e72a000',
          gas: '0x2710',
          to: '0x0000000000000000000000000000000000000000',
          value: '0x00',
          data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
          type: 0,
          timestamp: ts
        }
     */
    constructor(params) {
        if (!params) {
            return;
        }

        this.setHexFieldOrNull('nonce', params.nonce);
        this['type'] = params.type;

        if (!params.timestamp) {
            params.timestamp= new BigNumber(new Date().getTime() * 1000);
        }
        this.timestamp = params.timestamp;
        this.setHexField('data', params.data);
        this.setHexField('timestampHex', params.timestamp);
        this.setHexField('valueHex', params.value);
        this.value = params.value;
        this.setHexField('to', params.to);
        this.setHexField('gas', params.gas);
        this.setHexField('gasPrice', params.gasPrice);

    }

    setHexFieldOrNull(field, valueHex) {
        if (!valueHex) {
            this[field] = '0x00';
        } else {
            this.setHexField(field, valueHex);
        }
    }

    setHexField(field, valueHex) {
        if (!valueHex) {
            return;
        }
        this[field] = Crypto.toHex(valueHex);
    }

    /**
     *
     * @returns {*}
     */
    getEncodedRaw = ()=>{
        let encodedTx = {};
        encodedTx.nonce = AionRlp.encode(this.nonce);
        encodedTx.to = AionRlp.encode(this.to);
        encodedTx.valueHex = AionRlp.encode(this.valueHex);
        encodedTx.data = AionRlp.encode(this.data);
        encodedTx.timestampHex = AionRlp.encode(this.timestampHex);
        encodedTx.gas = AionRlp.encodeLong(this.gas);
        encodedTx.gasPrice = AionRlp.encodeLong(this.gasPrice);
        encodedTx.type = AionRlp.encode(this.type);

        return AionRlp.encodeList([
            encodedTx.nonce,
            encodedTx.to,
            encodedTx.valueHex,
            encodedTx.data,
            encodedTx.timestampHex,
            encodedTx.gas,
            encodedTx.gasPrice,
            encodedTx.type,
        ]);
    };
    /**
     * Used in web3
     * @returns {*}
     */
    getEncoded = ()=>{
        let encodedTx = {};
        encodedTx.nonce = AionRlp.encode(this.nonce);
        encodedTx.to = AionRlp.encode(this.to);
        encodedTx.valueHex = AionRlp.encode(this.valueHex);
        encodedTx.data = AionRlp.encode(this.data);
        encodedTx.timestampHex = AionRlp.encode(this.timestampHex);
        encodedTx.gas = AionRlp.encodeLong(this.gas);
        encodedTx.gasPrice = AionRlp.encodeLong(this.gasPrice);
        encodedTx.type = AionRlp.encode(this.type);
        encodedTx.fullSignature = AionRlp.encode(new Buffer(this.fullSignature));

        let encoded = AionRlp.encodeList([
            encodedTx.nonce,
            encodedTx.to,
            encodedTx.valueHex,
            encodedTx.data,
            encodedTx.timestampHex,
            encodedTx.gas,
            encodedTx.gasPrice,
            encodedTx.type,
            encodedTx.fullSignature,
        ]);
        return Crypto.toHex(encoded);
    };

    getRawHash = () => {
        return blake2b(32).update(this.getEncodedRaw()).digest();
    };

    sign = (ecKey) => {
        let rawHash = this.getRawHash();
        this.signature = ecKey.sign(rawHash);
        this.fullSignature = sigToBytes(this.signature, ecKey.publicKey);
    }
}