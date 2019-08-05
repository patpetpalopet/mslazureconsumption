var request = require('request');
request({
    method: 'GET',
    uri: 'https://consumption.azure.com/v3/enrollments/46606866/usagedetailsbycustomdate?startTime=2019-03-23&endTime=2019-08-04',
    header: {
        'Content-Type': 'application/json',
    },
    auth: {
        bearer: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImpoeXA2UU9DWlZmY1pmdmhDVGR1OFdxeTJ5byJ9.eyJFbnJvbGxtZW50TnVtYmVyIjoiNTM3OTI4ODkiLCJJZCI6Ijk1NjJiZjI2LWQxNjgtNGNkZC05YTU5LTBhN2Y3YTQxNjQ4OCIsIlJlcG9ydFZpZXciOiJQYXJ0bmVyIiwiUGFydG5lcklkIjoiNjE1NiIsIkRlcGFydG1lbnRJZCI6IiIsIkFjY291bnRJZCI6IiIsImlzcyI6ImVhLm1pY3Jvc29mdGF6dXJlLmNvbSIsImF1ZCI6ImNsaWVudC5lYS5taWNyb3NvZnRhenVyZS5jb20iLCJleHAiOjE1Nzc0MzM0NTIsIm5iZiI6MTU2MTYyMjI1Mn0.W4tLIEuRvM8k9CeqH6svbkVlNQZ1d_oRoSOX34Dw8evTKLon0Fo2xSX9hf604Bs9SOeX8bPPkbkwgKRV884-xinotGqZ74FxDNwxo6Dr8NH7NamD9YLuu2FZ8OZGPJf1G-zq53EEPCNiZ59FxoMo4K8YGxokJLLnAsBdaWQgkCBdEh9ehupzCoc39pRglNrx0llfQg1R6GIk8o4D7yF1nuKV6gL_LX12Wmytd_SPEOBk6PFzEIEJ0vpmR_S9KQR1S0v2wA0q4Uw8ag4-31PN_01j-mhrVy3fk7Vjz2pIuXCx_R22_WnVqK3_ex7NXpgfNhQ2exMksOku3lYOsUba2g', //token
    }
}, (err, httpResponse, body) => {
    if (err) {
        console.log(err)
    } else {
        console.log(body)
    }
});