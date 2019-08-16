"use strict";

const config = require('./config');

const lib = require('./lib');

const help = require('./utils/help');

const logger = require('./utils/logger').getLogger('error');

//机器人用户
const users = config.users;

//otc买入数值
const otcEntrusBuyinValue = config.otcEntrusBuyinValue;

//浮动参数
const floatParams = config.floatParams;

const fs = require('fs');


/**
 * 浮动价格
 * @type {{BTC: {min: number, max: number}, USDT: {min: number, max: number}, BCH: {min: number, max: number}}}
 */


/**
 * 1.根据用户检查订单
 * 2.买单：若买单被吃光，需重新挂单；卖单：若卖单被吃光，不需要重新挂单（挂的是用户的全部金额）
 * 3.撤单
 */


/**
 * 需要挂单的币种列表
 * symbol 币种
 * action 1买单 2卖单
 */
const addData = [
    {
        symbol: 'BTC',
        action: 1
    },
    {
        symbol: 'USDT',
        action: 1
    },
    {
        symbol: 'BCH',
        action: 1
    },
    {
        symbol: 'BTC',
        action: 2
    },
    {
        symbol: 'USDT',
        action: 2
    },
    {
        symbol: 'BCH',
        action: 2
    }
];

/**
 * 获取单价
 * @param symbol
 * @param action
 * @returns {*}
 */
function getUnitPrice(symbol, action, huobiBalance) {
    //action 1买单 2卖单
    if (action == 1) {
        //BTC：火币抓取行情价，按行情价*（1-0.2%）挂单，保留整数；
        //BCH：火币抓取行情价，按行情价*（1-0.2%）挂单，保留整数；
        //USDT： 火币OTC抓取卖二价 - 0.01元挂单，保留两位小数；
        if (symbol === 'USDT') {
            return help.bigNumberMinus(huobiBalance[symbol], floatParams[symbol].buyin, 2);
        } else {
            return parseInt(huobiBalance[symbol] * floatParams[symbol].buyin);
        }
    } else if (action == 2) {
        //BTC：火币抓取行情价，按行情价*（1+0.2%）挂单，保留整数；
        //BCH：火币抓取行情价，按行情价*（1+0.2%）挂单，保留整数；
        //USDT： 火币OTC抓取买二价 + 0.01元挂单，保留两位小数；
        if (symbol === 'USDT') {
            return help.bigNumberPlus(huobiBalance[symbol], floatParams[symbol].buyout, 2);
        } else {
            return parseInt(huobiBalance[symbol] * floatParams[symbol].buyout);
        }
    } else {
        return 0;
    }
    return 0;
}

async function sleep(t) {
    let st = 1000 * 3;
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
 *是否有金额挂卖单，满足条件则返回当前币种的金额
 */
function getBuyoutQuantity(object, symbol) {
    if (object[symbol] && object[symbol] >= otcEntrusBuyinValue[symbol].min) {
        return object[symbol];
    } else {
        return 0;
    }
}

/**
 * 获取买单金额
 * @param orders
 * @param symbol
 * @returns {number}
 */
function getBuyinQuantity(orders, symbol) {

    if (!orders || orders.length == 0) {
        return otcEntrusBuyinValue[symbol].quantity ? otcEntrusBuyinValue[symbol].quantity : 0;
    }

    let quantity = 0;

    for (let i = 0; i < orders.length; i++) {
        if (orders[i].coin_type == symbol) {
            quantity = quantity + orders[i].quantity_left
        }
    }
    let sumQuantity = otcEntrusBuyinValue[symbol].quantity;

    if (help.bigNumberDiv(sumQuantity, 2) >= quantity) {
        return help.bigNumberMinus(otcEntrusBuyinValue[symbol].quantity, quantity, otcEntrusBuyinValue[symbol].point);
    }
    return 0;
}

/**
 * 获取创建委托单数量
 * @param orders
 * @param entrustType
 * @param symbol
 * @param balanceObject
 * @returns {*}
 */
function getPendOrderQuantity(orders, entrustType, symbol, balanceObject) {
    if (!orders || orders.length == 0) {
        if (entrustType == 1) {
            return getBuyinQuantity(orders, symbol);
        } else {
            return getBuyoutQuantity(balanceObject, symbol)
        }
    }

    let data = [];
    let dataObject = {};
    //筛选出当前币种的当前类型订单的集合
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].entrust_type == entrustType && orders[i].coin_type == symbol) {
            data.push(orders[i]);
        }
    }
    if (data.length == 0) {
        if (entrustType == 1) {
            return getBuyinQuantity(data, symbol);
        } else {
            return getBuyoutQuantity(balanceObject, symbol)
        }
    }

    //买单
    if (entrustType == 1) {
        return getBuyinQuantity(data, symbol);
    } else {
        //卖单
        return getBuyoutQuantity(balanceObject, symbol)
    }
}


function getTranPWD(pwd, userId) {
    let decpwd = help.decrypt(pwd, userId);
    return help.encryptTranPWDByClient(decpwd, userId);
}


/**
 * 是否可以取消
 * @param price 当前挂单价格
 * @param symbol
 * @param entrustType 1买单  2卖单
 * @param huobiBalance 火币价格
 */
function isCancel(price, symbol, entrustType, huobiBalance) {
    //BTC、BCH：当前行情价与挂单时行情价相差+-0.1%时，撤单，按照当前行情价重新计算价格后挂单；USDT：跟随OTC卖二价一起变动
    let floatSymbolPrice = fs.readFileSync('./floatSymbolPrice.json');
    floatSymbolPrice = JSON.parse(floatSymbolPrice.toString());
    if (symbol == 'USDT') {
        if (floatSymbolPrice[symbol] > 0 && floatSymbolPrice[symbol] != huobiBalance.USDT) {
            //floatSymbolPrice = JSON.parse(floatSymbolPrice.toString());
            floatSymbolPrice[symbol] = huobiBalance.USDT;
            fs.writeFileSync('./floatSymbolPrice.json', JSON.stringify(floatSymbolPrice));
            return true;
        }
        return false;
    } else {
        if (!huobiBalance[symbol]) {
            return false;
        }
        let minPrice = huobiBalance[symbol] - (huobiBalance[symbol] * floatParams[symbol].cancel);
        minPrice = parseInt(minPrice);
        let maxPrice = huobiBalance[symbol] + (huobiBalance[symbol] * floatParams[symbol].cancel);
        maxPrice = parseInt(maxPrice);


        if ((floatSymbolPrice[symbol] > 0 && floatSymbolPrice[symbol] > maxPrice) || (floatSymbolPrice[symbol] > 0 && floatSymbolPrice[symbol] < minPrice)) {
            floatSymbolPrice[symbol] = minPrice;
            floatSymbolPrice[symbol] = maxPrice;
            fs.writeFileSync('./floatSymbolPrice.json', JSON.stringify(floatSymbolPrice));
            return true;
        }
        return false;
    }
}


/**
 * 用户挂单（买单，卖单） 取消订单
 * @returns {Promise<void>}
 */
async function init() {

    try {
        while (true) {

            for (let i = 0; i < users.length; i++) {
                let options = {
                    token: users[i].token
                };
                //获取订单
                let orders = await lib.getMyEntrust(options);

                //获取火币价格
                let huobiBalance = await lib.getHuobiBalance();
                if (Object.prototype.toString.call(huobiBalance) != '[object Object]') {
                    logger.error('huobiBalance is not a Object');
                    console.error('huobiBalance is not a Object')
                    return;
                }
                if (!fs.existsSync('./floatSymbolPrice.json')) {
                    fs.writeFileSync('./floatSymbolPrice.json', JSON.stringify(huobiBalance));
                }
                console.log(huobiBalance);

                //取消订单
                if (Array.isArray(orders) && orders.length > 0) {
                    for (let j = 0; j < orders.length; j++) {
                        if (isCancel(orders[j].unit_price, orders[j].coin_type, orders[j].entrust_type, huobiBalance)) {
                            let params = {
                                token: users[i].token,
                                params: {entrustOrderId: orders[j].key_id}
                            };
                            let r = await lib.otcCancel(params);
                            if (r) {
                                orders.splice(j, 1);
                            }
                        }
                    }
                }


                //获取用户余额
                let balanceObject = await lib.getBalances({token: users[i].token});

                //挂单
                for (let k = 0; k < addData.length; k++) {
                    let btcBuyinQuantity = getPendOrderQuantity(orders, addData[k].action, addData[k].symbol, balanceObject);
                    if (btcBuyinQuantity > 0 && getUnitPrice(addData[k].symbol, addData[k].action, huobiBalance) > 0) {
                        let params = {
                            unitPrice: getUnitPrice(addData[k].symbol, addData[k].action, huobiBalance),
                            quantity: btcBuyinQuantity,
                            min: otcEntrusBuyinValue[addData[k].symbol].min,
                            max: otcEntrusBuyinValue[addData[k].symbol].max,
                            payType: users[i].payType,
                            coinType: addData[k].symbol,
                            transactionPassword: getTranPWD(users[i].transactionPassword, users[i].userId)
                        };
                        let options = {
                            token: users[i].token,
                            params: params
                        };
                        await sleep(1000);
                        if (addData[k].action == 1) {
                            await lib.otcBuyIn(options);
                        } else {
                            if (otcEntrusBuyinValue[addData[k].symbol].max > btcBuyinQuantity) {
                                options.params.max = btcBuyinQuantity;
                            }
                            await lib.otcBuyout(options);
                        }
                    }
                }
                await sleep()
            }
        }
    } catch (e) {
        logger.error('init error:' + e.message);
        console.log('init error:' + e.message);
    }
}


init();

process.on('uncaughtException', function (err) {
    console.error("***Caught exception***:" + err);
});
