fetch("db.json")
.then(response => response.json())
.then(data => {

    // 0.001191 eth at start of 21st

    let c, a, m, bal8;
    bal8 = data.walletbalance / 8;
    c = bal8 *3;
    a = bal8 *3;
    m = bal8 *2;

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
                data: [((c/1000000000000000000)).toFixed(7), ((a/1000000000000000000)).toFixed(7), ((m/1000000000000000000)).toFixed(7)],
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
    var ctx = document.getElementById('historyChart');
    var histChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: points,
            datasets: [{
                label: 'Effective Hashrate',
                data: data.hash_history,
                backgroundColor: [
                    'rgba(255, 165, 0, 0.4)'
                ],
                borderColor: [
                    'rgba(255, 165, 0, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    display: false,
                    scaleLabel: {
                        display: false,
                        labelString: '5 Mins'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'MH/s'
                    }
                }]
            }
        }
    });
    // var ctx = document.getElementById('luckChart');
    // var luckChart = new Chart(ctx, {
    //     type: 'line',
    //     data: {
    //         labels: points,
    //         datasets: [{
    //             label: 'Pool Luck',
    //             data: data.luck_history,
    //             backgroundColor: [
    //                 'rgba(255, 165, 0, 0.0)'
    //             ],
    //             borderColor: [
    //                 'rgba(0, 145, 255)'
    //             ],
    //             borderWidth: 2
    //         }]
    //     },
    //     options: {
    //         scales: {
    //             xAxes: [{
    //                 display: false,
    //                 scaleLabel: {
    //                     display: false,
    //                     labelString: '5 Mins'
    //                 }
    //             }],
    //             yAxes: [{
    //                 display: true,
    //                 scaleLabel: {
    //                     display: true,
    //                     labelString: 'Luck'
    //                 }
    //             }]
    //         }
    //     }
    // });

}); // end of fetch

