var request = require('request');
request({
    method: 'GET',
    uri: 'https://consumption.azure.com/v3/enrollments/53792889/usagedetails',
    header: {
        'Content-Type': 'application/json',
    },
    auth: {
        bearer: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImpoeXA2UU9DWlZmY1pmdmhDVGR1OFdxeTJ5byJ9.eyJFbnJvbGxtZW50TnVtYmVyIjoiNTM3OTI4ODkiLCJJZCI6IjljMjE3OTc5LTlmZDItNGFhNS1hZDExLTVhMmVmOGYyNWNhYSIsIlJlcG9ydFZpZXciOiJQYXJ0bmVyIiwiUGFydG5lcklkIjoiNjE1NiIsIkRlcGFydG1lbnRJZCI6IiIsIkFjY291bnRJZCI6IiIsImlzcyI6ImVhLm1pY3Jvc29mdGF6dXJlLmNvbSIsImF1ZCI6ImNsaWVudC5lYS5taWNyb3NvZnRhenVyZS5jb20iLCJleHAiOjE1Nzg2MzY5NTIsIm5iZiI6MTU2MjczOTM1Mn0.HJF_C80rAvNsjVses1GXd0jtInH9xNFEOQnzXelHoIYA894lkGOEYlCoPsgAc4ecyikXwyKFaEfwmiSNTV4j1Zb31phuht1QDLL2672707kARsTsCmg69biXgk7Phf5cH-iqrfD20f1ByZ-dkHkp9Qxsny5Y6XEXNOBxS_QtiE7S0KGavlDYd0qVG5OJSnQCHc7lYsLOSnvIiRB-zsXyl5XzpFQdmcKWIrm1E1gGY0488FszyyCMbx_0HqerdLj5kEk3On4wR8XYUGy_LMRReQwn-QQBtXNubFIvRWwC0K2lvb3s6JGWSm9YKKE_HQ0oLeJNXuNWq-lqbSy9OlgbuQ', //token
    }
}, (err, httpResponse, body) => {
    if (err) {
        console.log(err)
    } else {
        console.log(body)
    }
});