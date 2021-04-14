fetch("db.json")
.then(response => response.json())
.then(data => {



    let c, a, m;
    c = 3;
    a = 3;
    m = 2;

    //  Fill Data into html fields
    document.getElementById('walbal').innerText = (data.walletbalance/1000000000000000000).toFixed(7) + " Ξ";
    document.getElementById('poolbal').innerText = (data.poolbalance/1000000000000000000).toFixed(7) + " Ξ";
    document.getElementById('price').innerText = "£" + data.price;
    document.getElementById('hash').innerText = (data.hashrate/1000000).toFixed(2) + " MH/s";

    let points = [];
    for (let index = 0; index < 50; index++) {
        points.push(index);
    }
    var ctx = document.getElementById('pieChart');
    var pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Callum', 'Andras', 'Mark'],
            datasets: [{
                label: 'Split of Balance',
                data: [c, a, m],
                backgroundColor: [
                    'rgba(37, 204, 247,0.8)',
                    'rgba(27, 156, 252,0.8)',
                    'rgba(59, 59, 152,0.8)'
                ],
                borderColor: [
                    'rgba(37, 204, 247,1.0)',
                    'rgba(27, 156, 252,1.0)',
                    'rgba(59, 59, 152,1.0)'
                ],
                borderWidth: 1
            }]
        },
    });
    
}); 

