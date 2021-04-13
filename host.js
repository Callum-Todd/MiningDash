var express = require('express');
var app = express();
var jsonfile = require('jsonfile');
var fetch = require('cross-fetch');
var path = require('path');
var schedule = require('node-schedule');
var date = require('date-and-time');
var port = 8080;


app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: true
  }))

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
            db.hashrate = dashboardData.data.currentStatistics.reportedHashrate;
            db.poolbalance = dashboardData.data.currentStatistics.unpaid;
            db.workers = dashboardData.data.workers;
            db.valid = dashboardData.data.currentStatistics.validShares;
            db.stale = dashboardData.data.currentStatistics.staleShares;
    })
    save();

        
    // fetch("https://api.ethermine.org/miner/d1c6ddd842180cd54eee389aa1302bcaf55fa44a/payouts")
    //     .then(response =>response.json())
    //     .then(payoutData => {
    //         // if (data.result.data == null) {
    //         //     return;
    //         // }
    //         payoutData.result.data.forEach(item => {
    //             let found = false;
    //             db.payments.forEach(ele => {
    //                 if (item.txHash == ele.amount) {
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

    if (db.hash_history.length >= 20) {
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
    var ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
    console.log(ip + " has connected!");
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
app.get('/clearwallet', function(req, res, next){
    db.walletbalance = 0;
    save();
    res.sendFile(path.join(__dirname + '/public/index.html'));
}); 
app.get('/save', function(req, res, next){
    save();
    res.sendFile(path.join(__dirname + '/public/index.html'));
}); 
app.get('/payments', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/payed.html'));
});

app.post('/submitpayment', (req, res) => {
    const amount = req.body.amount_field;
    const price = req.body.price_field;
    let date = req.body.date_field;
    const txid = req.body.txid_field;
    const year = date.substring(0,4);
    const month = date.substring(5,7);
    const day = date.substring(8, 10);
    date = day + "/" + month + "/" + year;


    db.payments.push({
        "amount": (amount*1000000000000000000),
        "price": price,
        "date": date,
        "txid": txid
      })
      save();
      res.sendFile(path.join(__dirname + '/public/index.html'));
  })

// ------------------------------------------------------------>
// Main
console.log("Listening at http://localhost:" + port.toString() + "\n");
app.listen(port);

setTimeout(() => {  
    // console.log(db.workers);
    console.log("Pool:  " + (db.poolbalance/1000000000000000000).toFixed(7) + " Ether");
    console.log("Price: " + db.price + " gbp");
    console.log("Hash:  " + db.hashrate/1000000 + " mH/s");
    let sum = 0;
    db.shares_buffer.forEach(element => {
        sum += element.rig;
        sum += element.andras;
        sum += element.callum;
        sum += element.mark;
    });
    console.log("Shares mined today:  " + sum);
    console.log("Eth mined today:     " + ((db.poolbalance - db.dailybalance)/1000000000000000000).toFixed(7));
    console.table(db.shares_buffer);
    jsonfile.writeFile('./public/db.json', db, function (err) {
        if (err) console.error(err)
    })
}, 5000);

setInterval(() => { 
    update();
    console.log("\n(¯`·._.·(¯`·._.· Update! ·._.·´¯)·._.·´¯)");
    console.log("Pool:  " + (db.poolbalance/1000000000000000000).toFixed(7) + " Ether");
    console.log("Price: " + db.price + " gbp");
    console.log("Hash:  " + db.hashrate/1000000 + " mH/s");
    // console.table(db.shares_buffer);
    let sum = 0;
    db.shares_buffer.forEach(element => {
        sum += element.rig;
        sum += element.andras;
        sum += element.callum;
        sum += element.mark;
    });
    console.log("Shares mined today:  " + sum);
    console.log("Eth mined today:     " + ((db.poolbalance - db.dailybalance)/1000000000000000000).toFixed(5));
    save();
}, 180000);

const sharesUpdate = schedule.scheduleJob('0 * * * *', (firetime) => {
    let [c, a, m, r] = [0,0,0,0];
    // fetch('https://api.ethermine.org//miner/d1c6ddd842180cd54eee389aa1302bcaf55fa44a/workers')
    // .then(response => response.json())
    // .then(respData => {
        db.workers.forEach(element => {
            switch (element.worker) {
                case "battlemoira":
                    r = element.validShares;
                    break;
                case "junkrat":
                    c = element.validShares;
                    break;
                case "torbjon":
                    a = element.validShares;
                    break;
                case "markminer":
                    m = element.validShares;
                    break;
            
                default:
                    break;
            }

        });


    db.shares_buffer.push({
        "rig" : r,
        "andras" : a,
        "mark" : m,
        "callum" : c
    })
    console.table(db.shares_buffer);

});

// Daily Job executed at midnight
const dailyJob = schedule.scheduleJob('5 */24 * * *', (firetime) => {
    update();
    console.log("Daily job ran @" + firetime);
    let diff;
    if (db.poolbalance < db.dailybalance) {
        diff = (0.1 - db.dailybalance/1000000000000000000) + db.poolbalance;
    } else {
        diff = db.poolbalance - db.dailybalance;
    }
    let now = new Date();
    db.rewards.push({"amount" : diff, "price" : db.price, "date" : date.format(now, 'DD/MM/YYYY') });
    db.dailybalance = db.poolbalance;
    
    let sum = 0;
    let [c, a, m, r] = [0,0,0,0];
    for (let i = 0; i < db.shares_buffer.length; i++) {
        const element = db.shares_buffer[i];
        r += element.rig;
        c += element.callum;
        m += element.mark;
        a += element.andras;
        sum += element.rig;
        sum += element.callum;
        sum += element.mark;
        sum += element.andras;
    }
    
    db.shares_history.push({
        "date" : date.format(now, 'DD/MM/YYYY'),
        "rig" : r,
        "andras" : a,
        "callum" : c,
        "mark" : m, 
        "total" : sum
    })
    db.shares_buffer.length = 0;
    save();
})