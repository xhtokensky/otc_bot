//机器人用户配置
exports.users = [
    {
        userId: 1006,
        phone: '13240801672',
        transactionPassword: 'xkVHaw0klBjIAe/JkWXVbQ==',
        payType: '1,2,3',//支付方式 1银行卡 2支付宝 3微信
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjEwMDYsImlhdCI6MTU2NTc2ODI4NCwiZXhwIjoxNTY4MzYwMjg0fQ.t_wai3etT82VxIEM6GOsPUtoYbZhfvRgqyDlrWsOFns'
    }
];

//tokensky API
const baseUrl = 'http://127.0.0.1:9000';
exports.tokensky = {
    balanceUrl: `${baseUrl}/avatar/user/balance`,//获取用户金额
    otcMyEntrustUrl: `${baseUrl}/otc/my/entrust`,//获取我的委托单
    otcEntrustBuyinUrl: `${baseUrl}/otc/buyin/entrust`,//委托单买单
    otcEntrustBuyoutUrl: `${baseUrl}/otc/buyout/entrust`,//委托单卖单
    otcEntrustCancelUrl: `${baseUrl}/otc/cancel/entrust`//取消委托单
};

//otc委托单买单数值配置
exports.otcEntrusBuyinValue = {
    BTC: {
        quantity: 3,
        min: 0.01,
        max: 1.5,
        point: 1//1位小数点
    },
    USDT: {
        quantity: 10000,
        min: 150,
        max: 1000,
        point: 0//0位小数点
    },
    BCH: {
        quantity: 10,
        min: 0.5,
        max: 5,
        point: 1//1位小数点
    }
};

//浮动参数配置
exports.floatParams = {
    BTC: {
        cancel: 0.001,//是否取消挂单浮动参数
        buyin: 0.998,//买入浮动参数 1-0.002
        buyout: 1.002//卖出浮动参数 1+0.002
    },
    BCH: {
        cancel: 0.001,//是否取消挂单浮动参数
        buyin: 0.998,//买入浮动参数 1-0.002
        buyout: 1.002//卖出浮动参数 1+0.002
    },
    USDT: {
        cancel: 0.001,//是否取消挂单浮动参数
        buyin: 0.01,//买入浮动参数
        buyout: 0.01//卖出浮动参数
    }
};

//火币API地址
exports.huobi = {
    USDT: 'https://otc-api.huobi.br.com/v1/data/trade-market?coinId=2&currency=1&tradeType=buy&currPage=1&payMethod=0&country=37&blockType=general&online=1&range=0&amount=',
    BTC: 'https://api.huobi.pro/market/detail/merged?symbol=btcusdt',
    BCH: 'https://api.huobi.pro/market/detail/merged?symbol=bchusdt'
};
