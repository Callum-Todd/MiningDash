fetch("db.json")
.then(response => response.json())
.then(data => {

    let count = 0;
    let sum = 0;
    data.rewards.forEach(item => {
        sum += item.amount;
        count++;
    });
    let average_daily = sum / count;
    average_daily = ((average_daily/1000000000000000000) * data.price);

    let cost_daily = 4.10;
    document.getElementById("daily").innerHTML = "£" + average_daily.toFixed(2);
    document.getElementById("weekly").innerHTML = "£" + (average_daily * 7).toFixed(2);
    document.getElementById("monthly").innerHTML = "£" + (average_daily * 28).toFixed(2);
    document.getElementById("annual").innerHTML = "£" + (average_daily * 365).toFixed(2);
    document.getElementById("priceline").innerHTML += "£" + data.price;

    document.getElementById("cost_daily").innerHTML = "£" + (cost_daily).toFixed(2);
    document.getElementById("cost_weekly").innerHTML = "£" + (cost_daily*7).toFixed(2);
    document.getElementById("cost_monthly").innerHTML = "£" + (cost_daily*28).toFixed(2);
    document.getElementById("cost_annual").innerHTML = "£" + (cost_daily*365).toFixed(2);

    document.getElementById("profit_daily").innerHTML = "£" + (average_daily - cost_daily).toFixed(2);
    document.getElementById("profit_weekly").innerHTML = "£" + (average_daily*7 - cost_daily*7).toFixed(2);
    document.getElementById("profit_monthly").innerHTML = "£" + (average_daily*28 - cost_daily*28).toFixed(2);
    document.getElementById("profit_annual").innerHTML = "£" + (average_daily*365 - cost_daily*365).toFixed(2);






})