var request = require('request');
request({
    method: 'GET',
    uri: 'https://consumption.azure.com/v3/enrollments/46606866/usagedetailsbycustomdate?startTime=2019-03-23&endTime=2019-08-04',
    header: {
        'Content-Type': 'application/json',
    },
    auth: {
        bearer: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6ImpoeXA2UU9DWlZmY1pmdmhDVGR1OFdxeTJ5byJ9.eyJFbnJvbGxtZW50TnVtYmVyIjoiNDY2MDY4NjYiLCJJZCI6IjYyYzk0NjJlLWNmM2ItNGEyZi05N2FkLTgzYzk0YjNkNTMyYiIsIlJlcG9ydFZpZXciOiJQYXJ0bmVyIiwiUGFydG5lcklkIjoiNjE1NiIsIkRlcGFydG1lbnRJZCI6IiIsIkFjY291bnRJZCI6IiIsImlzcyI6ImVhLm1pY3Jvc29mdGF6dXJlLmNvbSIsImF1ZCI6ImNsaWVudC5lYS5taWNyb3NvZnRhenVyZS5jb20iLCJleHAiOjE1Nzc0MzA1NzgsIm5iZiI6MTU2MTYxOTM3OH0.C36g1twwGoOeMw3pxBkjU1C8fdSQszU_gksrl_dj70cio6N6JtNzoaA5J5jQnx19xC80MWvf0lwoyzOuzl6R2zK-HL8hQM8QdQpk9rwx3LanH0l5DCmzjDFyv2kBfTJuvfpVTL1A1k-zK9N0dV6rWfGLxZ69KHyA0lpJlERM8JKwPq2Vj7Vo7YvKZTVWwCSw7VEzwxw5oX9FGRodp9CluRfHYVfxDnTbbFAk_ffpIMF5wRTrmaUxvjNsE-oQKHdl1Dq4-i_6hFyrWJbsMnyQh-7rQviWLgbUPjIu3vk4jtvfAqqG0JjSdvTspmaArZ0z4EPyLEyeehMATmwcxACiOQ', //token
    }
}, (err, httpResponse, body) => {
    if (err) {
        console.log(err)
    } else {
        console.log(body)
    }
});