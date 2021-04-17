fetch("db.json")
.then(response => response.json())
.then(data => {

    const pTable = document.getElementById('paymentstable');
    const wTable = document.getElementById('workertable');
    // const wdTable = document.getElementById('workhisttable');


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
        sum += item.validShares;
    })
    console.log(sum);

    for (let index = data.workers.length - 1; index >= 0; index--) {
        const item = data.workers[index];
        let row = wTable.insertRow();
        let name = row.insertCell(0);
        let valid = row.insertCell(1);
        let stale = row.insertCell(2);
        let share = row.insertCell(3);
        // let online = row.insertCell(4);

        name.innerHTML = item.worker;
        valid.innerHTML = item.valid_shares;
        stale.innerHTML = item.stale_shares;
        // online.innerHTML = item.online;
        share.innerHTML = ((item.valid_shares / sum) * 100 ).toFixed(2) + '%' ;
        
    }

    // for (let index = data.shares_history.length - 1; index >= 0; index--) {
    //     const item = data.shares_history[index];
    //     let row = wdTable.insertRow();
    //     let date = row.insertCell(0);
    //     let rigT = row.insertCell(1);
    //     let andrasT = row.insertCell(2);
    //     let callumT = row.insertCell(3);
    //     let markT = row.insertCell(4);
    //     let Total = row.insertCell(5);
    //     date.innerHTML = item.date;
    //     rigT.innerHTML = item.rig;
    //     andrasT.innerHTML = item.andras;
    //     callumT.innerHTML = item.callum;
    //     markT.innerHTML = item.mark;
    //     Total.innerHTML = item.total;
    // }
})