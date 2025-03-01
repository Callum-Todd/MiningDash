var port;
const express = require('express');
var app = express();
const jsonfile = require('jsonfile');
const fetch = require('cross-fetch');
const path = require('path');
const schedule = require('node-schedule');
const date = require('date-and-time');
const Discord = require("discord.js");
const config = require("./config.json");
const nunjucks = require('nunjucks')
const { spawn } = require("child_process");

var db = jsonfile.readFileSync('./public/db.json');
var messageTrigger = false;
var minPayout = 50000000000000000;
var generalChan;
var logsChan;
var botFlag = false;

if (process.argv.length < 3) {
    port = 3000;
} else {
    port = process.argv[2];
}
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
    extended: true
}))
nunjucks.configure('public/views', {
    autoescape: true,
    express: app
});

const client = new Discord.Client();
client.login(config.BOT_TOKEN);
client.once('ready', () => {
    generalChan = client.channels.cache.get('832391997956161598');
    logsChan = client.channels.cache.get('832590219009720331')
});
client.on('mesaage', message => {
    if (message.content === "!off") {
        botFlag = false;
    } else if (message.content === "!on") {
        botFlag = true;
    }
})

// db Interactions
// function estimatePayout() {
//     let diff = minPayout - db.poolbalance;
//     const rewards = Object.create(db.rewards.reverse());
//     rewards.reverse();
//     let sum = 0;
//     for (let i = 0; i < rewards.length; i++) {
//         const ele = rewards[i];
//         sum += ele.amount;
//         if (sum >= diff) {
//             return i;
//         }
//     }
//     return null;
// }
function currentShares() {
    let sum = 0;
    db.shares_buffer.forEach(element => {
        sum += element.rig;
        sum += element.andras;
        sum += element.callum;
        sum += element.mark;
    });
    return sum;
}
function currentHash() {return  db.hashrate/1000000;}
function currentPrice() {return db.price;}
function currentPoolBalance() {return db.poolbalance}
function currentMined() {
    let diff = 0;
    if (db.poolbalance < db.dailybalance) {
        diff = (minPayout - db.dailybalance) + db.poolbalance;
    } else {
        diff = db.poolbalance - db.dailybalance;
    }
    return diff;
}

// User Interations
function printer(opt) {
    if (opt == (false || null)) {
        console.log("\n(¯`·._.·(¯`·._.· Update! ·._.·´¯)·._.·´¯)");
    }
    console.log("Pool:  " + (currentPoolBalance()/1000000000000000000).toFixed(7) + " Ether");
    console.log("Price: £" + currentPrice());
    console.log("Hash:  " + currentHash() + " mH/s");
    console.log("Shares mined today:  " + currentShares());
    console.log("Eth mined today:     " + (currentMined()/1000000000000000000).toFixed(7));
    console.log("Value earned: £" + ((currentMined()/1000000000000000000)*db.price).toFixed(2));
    // if (estimatePayout() == 0) {
    //     console.log("Expecting payout very soon!");
    // } else if (estimatePayout() == 1){
    //     console.log("1 day until payout");
    // } else {
    //     console.log(estimatePayout() + " days till payout");
    // }
    if (opt == true) {
        console.table(db.shares_buffer);
    }
}

function sendBotUpdate(bot) {
    var botString = "Ether mined: " + (currentMined()/1000000000000000000).toFixed(6) + 
                    "\nHourly shares: " + db.valid +
                    "\nDaily shares: " + currentShares() +
                    "\nValue earned: £" + ((currentMined()/1000000000000000000)*db.price).toFixed(2) +
                    "\nPrice of Ether: £" + currentPrice() + 
                    "\nPool balance: " + (currentPoolBalance()/1000000000000000000).toFixed(6); 
                    // + "\nEstimated days till next payout: " + estimatePayout();
                                
    bot.send(botString);
}


// ------------------------------------------------------------>
// Storage

function save() {
    jsonfile.writeFile('./public/db.json', db, function (err) {
        if (err) console.error(err)
    })
}
function update(bot) {
    fetch("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=GBP")
    .then(response => response.json())
    .then(pricedata => {
        db.price = pricedata.GBP;
    })
    .catch(log => {
        console.warn("API Call to fetch price failed!");
        // console.log(log);
    })
   fetch("https://flexpool.io/api/v1/miner/0xd1c6ddd842180cd54eee389aa1302bcaf55fa44a/stats")
        .then(response => response.json())
        .then(data => {
            db.hashrate = data.result.current.reported_hashrate;
            db.valid = data.result.daily.valid_shares;
            db.stale = data.result.daily.stale_shares;
        })
        .catch(log => {
            console.warn("API Call to shares/hash data failed!");
            // console.log(log);
        })
   fetch("https://flexpool.io/api/v1/miner/0xd1c6ddd842180cd54eee389aa1302bcaf55fa44a/balance")
        .then(response => response.json())
        .then(data => {
            db.poolbalance = data.result;
        })
        .catch(log => {
            console.warn("API Call to pool balance data failed!");
            // console.log(log);
        })
   fetch("https://flexpool.io/api/v1/miner/0xd1c6ddd842180cd54eee389aa1302bcaf55fa44a/workers")
        .then(response => response.json())
        .then(data => {
            db.workers = data.result;
        })
        .catch(log => {
            console.warn("API Call to workers data failed!");
            // console.log(log);
        })

        // fetch("https://api.ethermine.org/miner/d1c6ddd842180cd54eee389aa1302bcaf55fa44a/dashboard")
    //     .then(response => response.json())
    //     .then(dashboardData => {
    //         db.hashrate = dashboardData.data.currentStatistics.reportedHashrate;
    //         db.poolbalance = dashboardData.data.currentStatistics.unpaid;
    //         db.workers = dashboardData.data.workers;
    //         db.valid = dashboardData.data.currentStatistics.validShares;
    //         db.stale = dashboardData.data.currentStatistics.staleShares;
    // })
    //     .catch(log => {
    //         console.warn("API Call to pool data failed!");
    //         // console.log(log);
    //     })

    if (db.hash_history.length >= 20) {
        db.hash_history.shift();
    }
    if (db.hash_history[db.hash_history.length] == db.hashrate/100000) {
        
    } else {
        db.hash_history.push(db.hashrate/1000000);
    }

    if (db.hashrate < 150 && messageTrigger == false && botFlag == true) {
        messageTrigger = true;
        bot.send("@here Moira is down! 😢")
    }
        
}

// ------------------------------------------------------------>
// Routing
app.get('/index', function(req, res, next){
    res.render("index.njk");
});
app.get('/json', function(req, res, next){
    res.sendFile(path.join(__dirname + '/public/db.json'));
});
app.get('/history', function(req, res, next){
    res.render("history.njk");
});
app.get('/projections', function(req, res, next){
    res.render("projections.njk");
});
app.get('/reset', function(req, res, next){
    db.luck_history = [];
    db.hash_history = [];
    save();
    res.redirect('/');
});
app.get('/clearwallet', function(req, res, next){
    db.walletbalance = 0;
    save();
    res.redirect('/');
}); 
app.get('/save', function(req, res, next){
    save();
    res.redirect('/');
}); 
app.get('/payments', function(req, res, next){
    res.render('paid.njk');
});
app.get('/ledger', function(req, res, next){
    res.render('ledger.njk');
    
});
app.get('/git_pull', function(req, res, next){
    const pull = spawn("git", ["pull"]);
    pull.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });
    pull.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    res.redirect('/');
});
app.get('*', function(req, res, next){
    res.render('index.njk');
});
// update


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
    res.redirect('/');

});

app.post('/submitexspense', (req, res) => {
    const amount = req.body.amount_field;
    const user = req.body.user_field;
    let date = req.body.date_field;
    const info = req.body.info_field;
    const year = date.substring(0,4);
    const month = date.substring(5,7);
    const day = date.substring(8, 10);
    date = day + "/" + month + "/" + year;


    db.exspenses.push({
        "user": user,
        "info": info,
        "amount": amount,
        "date": date
    })
    
    save();
    res.redirect('/');

});

// ------------------------------------------------------------>
// Main
console.log("Listening at http://localhost:" + port.toString() + "\n");
app.listen(port);





// Wait to ensure all calls are returned
setTimeout(() => { 
    update(generalChan); 
    printer();
    jsonfile.writeFile('./public/db.json', db, function (err) {
        if (err) console.error(err)
    })
}, 5000);

const logging = schedule.scheduleJob('*/10 * * * *', firetime => {
    update(generalChan);
    printer();
    save();
})

// const sharesUpdate = schedule.scheduleJob('0 * * * *', (firetime) => {
//     let [c, a, m, r] = [0,0,0,0];
//         db.workers.forEach(element => {
//             switch (element.worker) {
//                 case "battlemoira":
//                     r = element.validShares;
//                     break;
//                 case "junkrat":
//                     c = element.validShares;
//                     break;
//                 case "torbjon":
//                     a = element.validShares;
//                     break;
//                 case "markminer":
//                     m = element.validShares;
//                     break;
            
//                 default:
//                     break;
//             }

//         });
//     db.shares_buffer.push({
//         "rig" : r,
//         "andras" : a,
//         "mark" : m,
//         "callum" : c
//     })
//     console.table(db.shares_buffer);
//     if (messageTrigger == true && db.hashrate > 190) {
//         messageTrigger = false;
//     }
//     sendBotUpdate(logsChan);
// });

const triggerFix = schedule.scheduleJob('0 * * * *', () => {

    if (db.hashrate > 150 && messageTrigger == true ) {
        messageTrigger= false;
    }
});

    

// Daily Job executed at midnight
const dailyJob = schedule.scheduleJob('59 23 * * *', (firetime) => {
    update(generalChan);
    console.log("Daily job ran @" + firetime);
    let diff = currentMined();

    let now = new Date();
    // db.rewards.splice(0,0,{"amount" : diff, "price" : db.price, "date" : date.format(now, 'DD/MM/YYYY') });
    db.rewards.push({"amount" : diff, "price" : db.price, "date" : date.format(now, 'DD/MM/YYYY') });
    db.dailybalance = db.poolbalance;

    let sum = 0;
    let [c, a, m, r] = [0,0,0,0];
    // for (let i = 0; i < db.shares_buffer.length; i++) {
    //     const element = db.shares_buffer[i];
    //     r += element.rig;
    //     c += element.callum;
    //     m += element.mark;
    //     a += element.andras;
    //     sum += element.rig;
    //     sum += element.callum;
    //     sum += element.mark;
    //     sum += element.andras;
    //     // Fix this god awful mess :)
    // }

    db.workers.forEach(element => {
        switch (element.name) {
            case "BattleMoira":
                r = element.valid_shares;
                break;

            case "Junkrat":
                c = element.valid_shares;
                break;

            case "Torbjon":
                a = element.valid_shares;
                break;

            case "Orisa":
                m = element.valid_shares;
                break;
            default:
                break;
        }
    });
    
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