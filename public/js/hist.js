fetch("db.json")
.then(response => response.json())
.then(data => {

    const rTable = document.getElementById('rewardstable');
    const pTable = document.getElementById('paymentstable');
    const wdTable = document.getElementById('workhisttable');
    
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

    for (let index = data.shares_history.length - 1; index >= 0; index--) {
        const item = data.shares_history[index];
        let row = wdTable.insertRow();
        let date = row.insertCell(0);
        let rigT = row.insertCell(1);
        let andrasT = row.insertCell(2);
        let callumT = row.insertCell(3);
        let markT = row.insertCell(4);
        let Total = row.insertCell(5);
        date.innerHTML = item.date;
        rigT.innerHTML = item.rig;
        andrasT.innerHTML = item.andras;
        callumT.innerHTML = item.callum;
        markT.innerHTML = item.mark;
        Total.innerHTML = item.total;
    }
})