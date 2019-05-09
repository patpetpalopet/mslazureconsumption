var request = require('request');
var schedule = require('node-schedule');

// schedule Job
var j = schedule.scheduleJob('0 33 16 * * *', function () {
    // getCustomers();
    request({
        method: 'POST',
        uri: 'https://notify-api.line.me/api/notify',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          bearer: 'ELuBQ3SOpHxJmnR8M5dXO7Kd3I7H619UBQGukmx2DEF', //token
        },
        form: {
          message: 'กำลังอัพเดตข้อมูล Consumptions...', //ข้อความที่จะส่ง
        },
      }, (err, httpResponse, body) => {
        if (err) {
          console.log(err)
        } else {
          console.log(body)
        }
      })
});