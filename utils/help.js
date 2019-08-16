"use strict";

const BigNumber = require('bignumber.js');
const CryptoJS = require("crypto-js");
const crypto = require('crypto');


/**
 * 服务端内部解密
 * @param message
 * @param key
 */
exports.decrypt = function (message, key) {
    if(!message){
        return '';
    }
    let iv = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d,
        0x0e, 0x0f];
    let md5 = crypto.createHash('md5').update('tokensky_' + key + "_tranpwd").digest('hex');
    const decipher = crypto.createDecipheriv(
        'aes-128-cbc',
        new Buffer.from(md5, 'hex'),
        new Buffer.from(iv)
    );
    var decrypted = decipher.update(message, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

/**
 * 客户端交易密码加密
 * @param message
 */
exports.encryptTranPWDByClient = function (message, key) {
    // Encrypt
    let ciphertext = CryptoJS.AES.encrypt(message, '2019tokensky'+key);
    ciphertext = ciphertext.toString();
    return encodeURIComponent(ciphertext);
};


/**
 * 加
 * @param x
 * @param y
 * @returns {number}
 */
exports.bigNumberPlus = function (x, y, n) {
    let a = new BigNumber(x);
    let b = new BigNumber(y);
    let c = a.plus(b);
    c = c.toNumber();
    if (n) {
        c = c.toFixed(n);
        c = parseFloat(c);
    }
    return c;
};

/**
 * 减
 * @param x
 * @param y
 * @returns {number}
 */
exports.bigNumberMinus = function (x, y, n) {
    let a = new BigNumber(x);
    a = a.minus(y);
    a = a.toNumber();
    if (n) {
        a = a.toFixed(n);
        a = parseFloat(a);
    }
    return a;
};

/**
 * 乘
 * @param x
 * @param y
 * @returns {number}
 */
exports.bigNumberMultipliedBy = function (x, y, n) {
    let a = new BigNumber(x);
    let b = a.multipliedBy(y);
    b = b.toNumber();
    if (n) {
        b = b.toFixed(n);
        b = parseFloat(b);
    }
    return b;
};

/**
 * 除
 * @param x
 * @param y
 * @returns {number}
 */
exports.bigNumberDiv = function (x, y, n) {
    let a = new BigNumber(x);
    a = a.div(y);
    a = a.toNumber();
    if (n) {
        a = a.toFixed(n);
        a = parseFloat(a);
    }
    return a;
};
