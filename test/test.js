const rp = require('request-promise');
let lib = require('./../lib/index');


async function testHuobiBalance() {
    let d = await lib.getHuobiBalance();
    console.log(d)

}
//testHuobiBalance();



