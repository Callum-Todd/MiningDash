var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var fetch = require('cross-fetch');
var path = require('path');
var schedule = require('node-schedule');
var date = require('date-and-time');
var port = 3000;

app.use(express.static(__dirname + '/public'));
app.use(function (req, res, next) {
    // req.testing = 'testing';
    // console.log(req.connection.remoteAddress);
    return next();
});

// ------------------------------------------------------------>
// Storage
var db = jsonfile.readFileSync('./public/db.json');
function save() {
    jsonfile.writeFile('./public/db.json', db, function (err) {
        if (err) console.error(err)
    })
}
function update() {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=GBP")
    .then(response => response.json())
    .then(pricedata => {
        db.price = pricedata.GBP;
    })
    // fetch("https://api.ethermine.org/miner/d1c6ddd842180cd54eee389aa1302bcaf55fa44a/workers")
    // .then(response => response.json())
    // .then(workerData => {
    //     db.workers = workerData.result.data[0];
    // })
    fetch("https://api.ethermine.org/miner/d1c6ddd842180cd54eee389aa1302bcaf55fa44a/dashboard")
        .then(response => response.json())
        .then(dashboardData => {
            // if (dashboardData.result == null) return;
            // console.log("reported hashrate == " + dashboardData.result.data.currentStatistics.reportedHashrate);
            db.hashrate = dashboardData.data.currentStatistics.reportedHashrate;
            db.poolbalance = dashboardData.data.currentStatistics.unpaid;
            db.workers = dashboardData.data.workers;
    })
    save();
    // fetch("https://flexpool.io/api/v1/pool/currentLuck")
    //     .then(response => response.json())
    //     .then(data => {
    //         if (db.luck_history.length >= 50) {
    //             db.luck_history.shift();
    //         }
    //             db.luck_history.push(data.result);
        
    // fetch("https://api.ethermine.org/miner/d1c6ddd842180cd54eee389aa1302bcaf55fa44a/payouts")
    //     .then(response =>response.json())
    //     .then(payoutData => {
    //         // if (data.result.data == null) {
    //         //     return;
    //         // }
    //         payoutData.result.data.forEach(item => {
    //             let found = false;
    //             db.payments.forEach(ele => {
    //                 if (item.txHash == ele.txid) {
    //                     found = true;
    //                 }
    //             })
    //             if (!found) {
    //                 let now = new Date();
    //                 db.payments.push({  "amount" : item.amount,
    //                                     "price" : db.price,
    //                                     "date" : date.format(now, 'DD/MM/YYYY'),
    //                                     "txid" : item.txHash})
    //             }
    //         })
    //     })

    if (db.hash_history.length >= 50) {
        db.hash_history.shift();
    }
    if (db.hash_history[db.hash_history.length] == db.hashrate/100000) {
        
    } else {
        db.hash_history.push(db.hashrate/1000000);
    }
}

update();    
// save();

// ------------------------------------------------------------>
// Routing
app.get('/', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
app.get('/json', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/db.json'));
});
app.get('/history', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/hist.html'));
});
app.get('/projections', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/proj.html'));
});
app.get('/reset', function(req, res, next){
    db.luck_history = [];
    db.hash_history = [];
    save();
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

// ------------------------------------------------------------>
// Main
console.log("Listening at http://localhost:" + port.toString());
app.listen(port);

setTimeout(() => {  console.log(db);
    jsonfile.writeFile('./public/db.json', db, function (err) {
        if (err) console.error(err)
    })
}, 5000);

setInterval(() => { 
    console.log("<-------------- Printing JSON -------------->"); 
    update();
    console.log(db);
    save();
}, 180000);

const sharesUpdate = schedule.scheduleJob('0 */12 * * *', (firetime) => {
    let sum = 0;
    fetch("https://api.ethermine.org/miner/d1c6ddd842180cd54eee389aa1302bcaf55fa44a/history")
    .then(response => response.json())
    .then(histData => {
        histData.data.forEach(item => {
            sum += item.validShares;
        });
        
})
    let [c, a, m, r] = [0,0,0,0];
    // db.workers.forEach(item => {
    //     switch (item.worker){
    //         case "battlemoira":
    //             r = item.validShares;
    //             break;
    //         case "torbjorn":
    //             a = item.validShares;
    //             break;
    //         case "markminer":
    //             m = item.validShares;
    //             break;
    //         case "junkrat":
    //             c = item.validShares;
    //             break;
    //     }
    // });

    db.shares_buffer.push({
        // NEEDS FIXED! find a way to see indivdual workers history
        "rig" : sum,
        "andras" : a,
        "callum" : c,
        "mark" : m, 
        "total" : sum
        // "total" : r+a+c+m
    })

});

// Daily Job executed at midnight
const dailyJob = schedule.scheduleJob('5 */24 * * *', (firetime) => {
    update();
    console.log("Daily job ran @" + firetime);
    let diff;
    if (db.poolbalance < db.dailybalance) {
        diff = (0.2 - db.dailybalance/1000000000000000000) + db.poolbalance;
        console.log("0.2 - " + db.dailybalance/1000000000000000000);
    } else {
        diff = db.poolbalance - db.dailybalance;
    }
    let now = new Date();
    db.rewards.push({"amount" : diff, "price" : db.price, "date" : date.format(now, 'DD/MM/YYYY') });
    db.dailybalance = db.poolbalance;
    
    let first = db.shares_buffer[db.shares_buffer.length - 2];
    let second = db.shares_buffer[db.shares_buffer.length - 1];

    let [c, a, m, r] = [0,0,0,0];
    r = first.rig + second.rig;
    m = first.mark + second.mark;
    a = first.andras + second.andras;
    c = first.callum + second.callum;

    db.shares_history.push({
        "date" : date.format(now, 'DD/MM/YYYY'),
        "rig" : r,
        "andras" : a,
        "callum" : c,
        "mark" : m, 
        "total" : r+a+c+m
    })
    save();
})