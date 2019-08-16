"use strict";

const rp = require('request-promise');
const help = require('./../utils/help');
const config = require('./../config');
const tokenskyUrl = config.tokensky;
const logger = require('./../utils/logger').getLogger('error');


async function sleep(t) {
    let st = 500;
    if (t) {
        st = t;
    }
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve('ok');
        }, st);
    })
}

/**
 *挂买单
 */
async function otcBuyIn({token, params}) {

    let options = {
        url: tokenskyUrl.otcEntrustBuyinUrl,
        method: 'POST',
        params: params,
        token: token
    };
    let body = await httpRequest(options);
    if (body.code == 0) {
        return true;
    } else {
        logger.error(`otcBuyIn error:`, body);
        console.error(`otcBuyIn error:`, body);
        return false;
    }
}


/**
 *挂卖单
 */
async function otcBuyout({token, params}) {
    let options = {
        url: tokenskyUrl.otcEntrustBuyoutUrl,
        method: 'POST',
        params: params,
        token: token
    };
    let body = await httpRequest(options);
    if (body.code == 0) {
        return true;
    } else {
        logger.error(`otcBuyout error:`, body);
        console.error(`otcBuyout error:`, body);
        return false;
    }
}

/**
 *取消委托单
 */
async function otcCancel({token, params}) {
    let options = {
        url: tokenskyUrl.otcEntrustCancelUrl,
        method: 'POST',
        params: params,
        token: token
    };
    let body = await httpRequest(options);
    if (body.code == 0) {
        return true;
    } else {
        logger.error(`otcCancel error:`, body);
        console.error(`otcCancel error:`, body);
        return false;
    }
}

/**
 *获取我的委托单
 */
async function getMyEntrust({token, params}) {
    let options = {
        url: tokenskyUrl.otcMyEntrustUrl,
        method: 'GET',
        token: token
    };
    let body = await httpRequest(options);
    if (body.code == 0) {
        let data = body.content.data;
        return data;
    } else {
        logger.error(`getMyEntrust error:`, body);
        console.error(`getMyEntrust error:`, body);
        return false;
    }
}

/**
 *获取用户余额
 */
async function getBalances({token, params}) {
    let options = {
        url: tokenskyUrl.balanceUrl,
        method: 'POST',
        params: params,
        token: token
    };
    let body = await httpRequest(options);
    if (body.code == 0) {
        let result = {};
        let data = body.content.data;
        for (let i = 0; i < data.length; i++) {
            result[data[i].coin_type] = data[i].balance;
        }
        return result;
    } else {
        logger.error(`getBalances error:`, body);
        console.error(`getBalances error:`, body);
        return false;
    }
}

/**
 * 获取火币实时价格
 * @returns {Promise<void>}
 */
async function getHuobiBalance() {
    try {
        let huobi = config.huobi;
        let usdtPrice = 0;
        let btcPrice = 0;
        let bchPrice = 0;

        let usdtOptions = {
            proxy: 'http://127.0.0.1:1083',
            rejectUnauthorized: false,
            timeout: 10000,
            method: 'GET',
            json: true,
            url: huobi.USDT,
            headers:
                {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
        };
        let usdtResult = await rp(usdtOptions);

        let btcOptions = {
            proxy: 'http://127.0.0.1:1083',
            rejectUnauthorized: false,
            timeout: 10000,
            method: 'GET',
            json: true,
            url: huobi.BTC,
            headers:
                {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
        };
        
         let btcResult = await rp(btcOptions);
         console.log('====> btcResult =',btcResult)
        // await sleep(2000);

        let bchOptions = {
            proxy: 'http://127.0.0.1:1083',
            rejectUnauthorized: false,
            timeout: 10000,
            method: 'GET',
            json: true,
            url: huobi.BCH,
            headers:
                {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
        };

        let bchResult = await rp(bchOptions);
        // await sleep(5000);
         console.log('====> bchResult =',bchResult)
        
        if (usdtResult.code == 200 && btcResult.status == 'ok' && bchResult.status == 'ok') {
            if (usdtResult && usdtResult.data && usdtResult.data[1] && btcResult && btcResult.tick && btcResult.tick.ask && bchResult && bchResult.tick && bchResult.tick.ask) {
                usdtPrice = parseFloat(usdtResult.data[1].price.toFixed(2));
                btcPrice = parseInt(btcResult.tick.ask[0] * usdtPrice);
                bchPrice = parseInt(bchResult.tick.ask[0] * usdtPrice);
            }
        }
        
        return {
            USDT: usdtPrice,
            BTC: btcPrice,
            BCH: bchPrice
        };
    } catch (e) {
        console.error(`getHuobiBalance error:`, e.message);
    }
}


async function httpRequest({url, method, params, token}) {
    try {
        const options = {
            method: method,
            json: true,
            url: url,
            body: params,
            headers:
                {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'token': token
                }
        };

        let body = await rp(options);
        return body;
    } catch (e) {
        logger.error(`httpRequest error:`, e.message);
        logger.error(`httpRequest options:`, options);
        console.error(`httpRequest error:`, e.message);
    }
}


module.exports = {
    otcBuyIn: otcBuyIn,
    otcBuyout: otcBuyout,
    otcCancel: otcCancel,
    getMyEntrust: getMyEntrust,
    getBalances: getBalances,
    getHuobiBalance: getHuobiBalance
};
