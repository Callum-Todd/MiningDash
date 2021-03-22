fetch("db.json")
.then(response => response.json())
.then(data => {

    document.getElementById('ticker').innerHTML = "£" + ((data.walletbalance/1000000000000000000) * data.price).toFixed(2);

    const rTable = document.getElementById('rewardstable');
    const pTable = document.getElementById('paymentstable');
    const wTable = document.getElementById('workertable');

    for (let index = data.rewards.length - 1; index >= 0; index--) {
        const item = data.rewards[index];
        let row = rTable.insertRow();
        let date = row.insertCell(0);
        date.innerHTML = item.date;
        let amount = row.insertCell(1);
        amount.innerHTML = (item.amount/1000000000000000000).toFixed(7) + " Ξ";
        let value = row.insertCell(2);
        value.innerHTML = (item.amount/1000000000000000000 * item.price).toFixed(2);
        let price = row.insertCell(3);
        price.innerHTML = item.price;
        price.textContent = (+price.textContent).toLocaleString('en-US', { style: 'currency', currency: 'GBP' });
        value.textContent = (+value.textContent).toLocaleString('en-US', { style: 'currency', currency: 'GBP' });
    }

    for (let index = data.payments.length - 1; index >= 0; index--) {
        const item = data.payments[index];
        let row = pTable.insertRow();
        let date = row.insertCell(0);
        date.innerHTML = "<a class=\"datelink\" href=\"https://etherscan.io/tx/" + item.txid + "\">" + item.date + "</a>";
        let amount = row.insertCell(1);
        amount.innerHTML = (item.amount/1000000000000000000).toFixed(7) + " Ξ";
        let value = row.insertCell(2);
        value.innerHTML = (item.amount/1000000000000000000 * item.price).toFixed(2);
        let price = row.insertCell(3);
        price.innerHTML = item.price;
        price.textContent = (+price.textContent).toLocaleString('en-US', { style: 'currency', currency: 'GBP' });
        value.textContent = (+value.textContent).toLocaleString('en-US', { style: 'currency', currency: 'GBP' });
    }


    let sum = 0;
    data.workers.forEach(item =>{ 
        sum += item.valid_shares;
    })
    console.log(sum);

    for (let index = data.workers.length - 1; index >= 0; index--) {
        const item = data.workers[index];
        let row = wTable.insertRow();
        let name = row.insertCell(0);
        let valid = row.insertCell(1);
        let stale = row.insertCell(2);
        let share = row.insertCell(3);
        let online = row.insertCell(4);

        name.innerHTML = item.name;
        valid.innerHTML = item.valid_shares;
        stale.innerHTML = item.stale_shares;
        online.innerHTML = item.online;
        share.innerHTML = ((item.valid_shares / sum) * 100 ).toFixed(2) + '%' ;
        
    }

})