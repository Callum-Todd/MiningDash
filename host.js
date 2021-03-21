var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var fetch = require('cross-fetch');
var path = require('path');
var schedule = require('node-schedule');
var date = require('date-and-time');
var port = 8080;

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
    fetch("    https://flexpool.io/api/v1/miner/0xedD0CaF72bC3bc30c185Db4066a55102eD54A01F/workers")
    .then(response => response.json())
    .then(data => {
        db.workers = data.result;
    })
    fetch("https://flexpool.io/api/v1/miner/0xedD0CaF72bC3bc30c185Db4066a55102eD54A01F/stats")
        .then(response => response.json())
        .then(data => {
            if (data.result == null) return;
            db.hashrate = data.result.current.effective_hashrate;
    })
    fetch("https://flexpool.io/api/v1/pool/currentLuck")
        .then(response => response.json())
        .then(data => {
            if (db.luck_history.length >= 50) {
                db.luck_history.shift();
            }
                db.luck_history.push(data.result);

    })
    fetch("https://flexpool.io/api/v1/miner/0xedD0CaF72bC3bc30c185Db4066a55102eD54A01F/balance")
        .then(response => response.json())
        .then(data => {
            db.poolbalance = data.result;
    })
        
    fetch("https://flexpool.io/api/v1/miner/0xedD0CaF72bC3bc30c185Db4066a55102eD54A01F/payments?page=0")
        .then(response =>response.json())
        .then(data => {
            if (data.result.data == null) {
                return;
            }
            data.result.data.forEach(item => {
                let found = false;
                db.payments.forEach(ele => {
                    if (item.txid == ele.txid) {
                        found = true;
                    }
                })
                if (!found) {
                    let now = new Date();
                    db.payments.push({  "amount" : ele.amount,
                                        "price" : db.price,
                                        "date" : date.format(now, 'DD/MM/YYYY'),
                                        "txid" : ele.txid})
                }
            })
        })

    if (db.hash_history.length >= 50) {
        db.hash_history.shift();
    }
    db.hash_history.push(db.hashrate/1000000);

}
update();    
save();
// ------------------------------------------------------------>
// Routing
app.get('/', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/index.html'));
});
app.get('/json', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/db.json'));
});
app.get('/stats', function(req, res, next){
      res.sendFile(path.join(__dirname + '/public/daily.html'));
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
    console.log(db);
    jsonfile.writeFile('./public/db.json', db, function (err) {
        if (err) console.error(err)
    })
    update();
}, 180000);

const dailyJob = schedule.scheduleJob({hour: 0, minute: 0}, (firetime) => {
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
    let c, a, m, r;
    db.workers.forEach(item => {
        switch (item.name){
            case "BattleMoira":
                r = item.valid_shares;
                break;
            case "AndrasMiner":
                a = item.valid_shares;
                break;
            case "MarkMiner":
                m = item.valid_shares;
                break;
            case "Junkrat":
                c = item.valid_shares;
                break;
        }
    });
    db.shares_history.push({
        "Rig" : r,
        "Andras" : a,
        "Callum" : c,
        "Mark" : m
    })
    save();
})