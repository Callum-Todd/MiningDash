fetch("db.json")
.then(response => response.json())
.then(data => {

    const lTable = document.getElementById('ledgertable');
    const total =document.getElementById('total_spent');
    
    let sum = 0;

    for (let index = 0; index < data.exspenses.length; index++) {
        const ele = data.exspenses[index];
        sum += parseFloat(ele.amount);
    }
    // total.innerHTML = sum;
    total.textContent = (sum).toLocaleString('en-US', { style: 'currency', currency: 'GBP' });
    for (let index = data.exspenses.length - 1; index >= 0; index--) {
        const item = data.exspenses[index];
        let row = lTable.insertRow();
        let date = row.insertCell(0);
        date.innerHTML = item.date;
        let amount = row.insertCell(1);
        amount.innerHTML = item.amount;
        let info = row.insertCell(2);
        info.innerHTML = item.info;
        let user = row.insertCell(3);
        user.innerHTML = item.user;
        amount.textContent = (+amount.textContent).toLocaleString('en-US', { style: 'currency', currency: 'GBP' });
    }
})