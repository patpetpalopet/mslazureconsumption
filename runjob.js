var request = require('request');
request({
    method: 'GET',
    uri: 'https://consumption.azure.com/v3/enrollments/53792889/usagedetails',
    header: {
        'Content-Type': 'application/json',
    },
    auth: {
        bearer: '', //token
    }
}, (err, httpResponse, body) => {
    if (err) {
        console.log(err)
    } else {
        console.log(body)
    }
});