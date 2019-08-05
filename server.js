// var http = require('http');
var express = require('express');
var sql = require('mssql');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var schedule = require('node-schedule');
var moment = require('moment');

// const appInsights = require("applicationinsights");
// appInsights.setup("c908f080-bab0-4370-af22-32d5a754f598");
// appInsights.start();

// schedule Job utc0
var j = schedule.scheduleJob('0 0 0 * * *', function() {
    getCustomers();
    // sendLog(`=========================================================================`);
});

function sendLog(text) {
    request({
        method: 'POST',
        uri: 'https://notify-api.line.me/api/notify',
        header: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
            bearer: 'bocXxg3buRE1Zmry34RedGFRh6DTD2U5omO4aKPBlGM',
            // bearer: 'xrzR8tzdmn8vklmFQQ9Lzf0NztNnX4Yycya6wmd1QWk',
        },
        form: {
            message: text, //ข้อความที่จะส่ง
        },
    }, (err, httpResponse, body) => {
        if (err) {
            console.log(err)
        } else {
            console.log(body)
        }
    })
}

// sql Config
var sqlConfig = {
    user: 'metro',
    password: 'P@ssw0rd',
    server: 'mslazureconsumption.database.windows.net',
    database: 'AzureConsumption',
    options: {
        encrypt: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 1440
    }
};

// set bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// set Origin
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-access-token");
    res.header("Access-Control-Allow-Headers", "Content-Type, application/json");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.get('/customers', (req, res) => {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`SELECT * FROM dbo.Customers WHERE isDelete='false'`, function(erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                res.json({
                    status: 200,
                    recordset: recordset['recordset'],
                    rows: recordset['rowsAffected']
                });
                connection.close();
            }
        });
    });
});

app.get('/customers/:id', (req, res) => {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`select * from dbo.Customers where id=${req.params.id}`, function(erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                // console.log(recordset);
                res.json(recordset);
                connection.close();
            }
        });
    });
});

app.get('/consumption/:enrollment_id', (req, res) => {
    // console.log(req.params.enrollment_id);
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`select * from dbo.[${req.params.enrollment_id}]`, function(erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                res.json({
                    "data": recordset['recordset']
                });
                connection.close();
            }
        });
    });
});

app.post('/addcustomers', (req, res) => {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`INSERT INTO dbo.Customers (
            [customer_name], 
            [enrollment_id], 
            [enrollment_status], 
            [startdate], 
            [enddate], 
            [markup], 
            [api_key], 
            [status], 
            [api_key_expire], 
            [isActive], 
            [isDelete]
        ) VALUES (
            '${req.body.customer_name}',
            ${req.body.enrollment_id},
            '${req.body.enrollment_status}',
            '${req.body.startdate}',
            '${req.body.enddate}',
            ${req.body.markup},
            '${req.body.api_key}',
            '${req.body.status}',
            '${req.body.api_key_expire}',
            '${req.body.isActive}',
            '${req.body.isDelete}'
        )`, function(erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                res.json(erre);
                connection.close();
            } else {
                //สร้าง 
                createtable(req.body);
                res.json(req.body);
                connection.close();
            }
        });
    });
});
app.post('/delcustomer', (req, res) => {
    // deleteTable(req.body.id);
    // console.log(req)
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`drop table dbo.[${req.body.enrollment_id}]`, function(erre, recordset) {
            if (erre) {
                console.log(erre);
                // deleteTable(req.body.id);
                res.json(erre);
                connection.close();
            } else {
                deleteTable(req.body.id);
                console.log(recordset);
                res.json(recordset);
                connection.close();
            }
        });
    });
});
app.post('/updatecustomer', (req, res) => {
    console.log(req.body);
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`
            UPDATE dbo.Customers
            SET customer_name='${req.body.customer_name}',
                enrollment_id=${req.body.enrollment_id},
                enrollment_status='${req.body.enrollment_status}',
                startdate='${req.body.startdate}',
                enddate='${req.body.enddate}',
                markup=${req.body.markup},
                api_key='${req.body.api_key}'
            WHERE id=${req.body.id}
        `, function(erre, recordset) {
            if (erre) {
                res.json({
                    status: 'Error.',
                    data: erre
                });
                connection.close();
            } else {
                res.json({
                    status: 200,
                    data: 'Updated.'
                });
                connection.close();
            }
        });
    });
});

function createtable(_customerData) {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`CREATE TABLE [${_customerData.enrollment_id}](
                id int NOT NULL IDENTITY PRIMARY KEY,
                azureconsumptionId nvarchar(255),
                serviceName nvarchar(255),
                date date,
                cost float,
                consumption_cost float,
                serviceTier nvarchar(255),
                location nvarchar(255),
                chargesBilledSeparately bit,
                partNumber nvarchar(255),
                resourceGuid nvarchar(255),
                offerId nvarchar(255),
                accountId decimal(18,0),
                productId decimal(18,0),
                resourceLocationId decimal(18,0),
                consumedServiceId decimal(18,0),
                departmentId decimal(18,0),
                accountOwnerEmail nvarchar(255),
                accountName nvarchar(255),
                serviceAdministratorId nvarchar(255),
                subscriptionId decimal(18,0),
                subscriptionGuid nvarchar(255),
                subscriptionName nvarchar(255),
                product nvarchar(255),
                meterId nvarchar(255),
                meterCategory nvarchar(255),
                meterSubCategory nvarchar(255),
                meterRegion nvarchar(255),
                meterName nvarchar(255),
                consumedQuantity float,
                resourceRate float,
                resourceLocation nvarchar(255),
                consumedService nvarchar(255),
                instanceId nvarchar(max),
                serviceInfo1 nvarchar(255),
                serviceInfo2 nvarchar(255),
                additionalInfo nvarchar(255),
                tags nvarchar(max),
                storeServiceIdentifier nvarchar(255),
                departmentName nvarchar(255),
                costCenter nvarchar(255),
                unitOfMeasure nvarchar(255),
                resourceGroup nvarchar(255)
            )
            `, function(erre, ress) {
            if (erre) {
                connection.close();
                console.log('ERROR: ', erre);
                sendLog(`Create Table ${_customerData.enrollment_id} ERROR: ${erre}`);
            } else {
                connection.close();
                console.log(`Created table  success!`);
                sendLog(`Create Table ${_customerData.enrollment_id} success!`);
                getCustomerByID(_customerData.enrollment_id);
            }
        });
    });
}

// "message":"Error on authorization" = invalid token 
// Invalid character in header content ["authorization"] = invalid token
function getAllData(_urllink, _tokeninput, _tableInsert, _markup) {
    console.log(_urllink);
    request({
        method: 'GET',
        url: _urllink,
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        auth: {
            bearer: _tokeninput.toString().trim()
        }
    }, function(_error, _response, body) {
        console.log('GET Consumption id response');
        if (_error) {
            AddLog(_tableInsert, _error, moment().format('YYYY-MM-DDTHH:mm:ss') + 'Z');
            // console.log(_error, _response, body);
        }
        var info = JSON.parse(body);
        var result = info.data;
        for (var i in info.data) {
            var consuc = ((_markup * result[i].cost) / 100) + result[i].cost;
            result[i].consumption_cost = consuc;
            result[i]['azureconsumptionId'] = info.id;
        }
        if (result) {
            var infoText = JSON.stringify(result);
            var connection = new sql.ConnectionPool(sqlConfig);
            connection.connect().then(function() {
                var request = new sql.Request(connection);
                request.query(`USE [AzureConsumption]
            DECLARE @jsonVariable NVARCHAR(MAX)
            SET @jsonVariable = N'${infoText}'
            INSERT INTO [dbo].[${_tableInsert}]
                       ([serviceName]
                       ,[azureconsumptionId]
                       ,[date]
                       ,[cost]
                       ,[consumption_cost]
                       ,[serviceTier]
                       ,[location]
                       ,[chargesBilledSeparately]
                       ,[partNumber]
                       ,[resourceGuid]
                       ,[offerId]
                       ,[accountId]
                       ,[productId]
                       ,[resourceLocationId]
                       ,[consumedServiceId]
                       ,[departmentId]
                       ,[accountOwnerEmail]
                       ,[accountName]
                       ,[serviceAdministratorId]
                       ,[subscriptionId]
                       ,[subscriptionGuid]
                       ,[subscriptionName]
                       ,[product]
                       ,[meterId]
                       ,[meterCategory]
                       ,[meterSubCategory]
                       ,[meterRegion]
                       ,[meterName]
                       ,[consumedQuantity]
                       ,[resourceRate]
                       ,[resourceLocation]
                       ,[consumedService]
                       ,[instanceId]
                       ,[serviceInfo1]
                       ,[serviceInfo2]
                       ,[additionalInfo]
                       ,[tags]
                       ,[storeServiceIdentifier]
                       ,[departmentName]
                       ,[costCenter]
                       ,[unitOfMeasure]
                       ,[resourceGroup])
             SELECT * 
             FROM OPENJSON(@jsonVariable)
             WITH (serviceName nvarchar(255),
                    azureconsumptionId nvarchar(255),
                    date date,
                    cost float,
                    consumption_cost float,
                    serviceTier nvarchar(255),
                    location nvarchar(255),
                    chargesBilledSeparately bit,
                    partNumber nvarchar(255),
                    resourceGuid nvarchar(255),
                    offerId nvarchar(255),
                    accountId decimal(18,0),
                    productId decimal(18,0),
                    resourceLocationId decimal(18,0),
                    consumedServiceId decimal(18,0),
                    departmentId decimal(18,0),
                    accountOwnerEmail nvarchar(255),
                    accountName nvarchar(255),
                    serviceAdministratorId nvarchar(255),
                    subscriptionId decimal(18,0),
                    subscriptionGuid nvarchar(255),
                    subscriptionName nvarchar(255),
                    product nvarchar(255),
                    meterId nvarchar(255),
                    meterCategory nvarchar(255),
                    meterSubCategory nvarchar(255),
                    meterRegion nvarchar(255),
                    meterName nvarchar(255),
                    consumedQuantity float,
                    resourceRate float,
                    resourceLocation nvarchar(255),
                    consumedService nvarchar(255),
                    instanceId nvarchar(max),
                    serviceInfo1 nvarchar(255),
                    serviceInfo2 nvarchar(255),
                    additionalInfo nvarchar(255),
                    tags nvarchar(max),
                    storeServiceIdentifier nvarchar(255),
                    departmentName nvarchar(255),
                    costCenter nvarchar(255),
                    unitOfMeasure nvarchar(255),
                    resourceGroup nvarchar(255))`,
                    function(erre, recordset) {
                        if (erre) {
                            console.log('ERROR: ', erre);
                            updateStatus(_tableInsert, 'Failure');
                            sendLog(`INSERT Data ${_tableInsert}  ERROR: ${erre}`);
                            AddLog(_tableInsert, erre, moment().format('YYYY-MM-DDTHH:mm:ss') + 'Z');
                            connection.close();
                        } else {
                            console.log(`INSERT ${recordset.rowsAffected[1]} records success! in ${_tableInsert}`);
                            connection.close();
                            if (info.nextLink) {
                                getAllData(info.nextLink, _tokeninput, _tableInsert, _markup);
                            } else {
                                sendLog(`INSERT Data ${_tableInsert} success!`);
                                updateStatus(_tableInsert, 'Completed');
                                AddLog(_tableInsert, info.id, moment().format('YYYY-MM-DDTHH:mm:ss') + 'Z');
                            }
                        }
                    });
            });
        } else {
            console.log(info)
            updateStatus(_tableInsert, 'Failure');
            sendLog(`INSERT Data ${_tableInsert}  ERROR: ${info.error.message}`);
        }
    });
};

function AddLog(_enrollment_id, _response_data, _time_stamp) {
    console.log(_enrollment_id, _response_data, _time_stamp);
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`INSERT INTO [dbo].[Log]
        ([enrollment_id]
        ,[response_data]
        ,[time_stamp]
        ) VALUES (
            ${_enrollment_id},
            '${_response_data}',
            '${_time_stamp}'
        )`, function(erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                //สร้าง 
                console.log('Completed: ', erre);
                connection.close();
            }
        });
    });
};


function updateStatus(enrollment_id, st) {
    console.log(enrollment_id, typeof(enrollment_id), st, typeof(st));
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`
            UPDATE dbo.Customers
            SET status='${st}'
            WHERE enrollment_id=${enrollment_id}
        `, function(erre, recordset) {
            if (erre) {
                console.log(erre);
                connection.close();
            } else {
                console.log(recordset);
                connection.close();
            }
        });
    });
};

function deleteTable(enrollment_id) {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`
            UPDATE dbo.Customers
            SET isDelete='true'
            WHERE id=${enrollment_id}
        `, function(erre, recordset) {
            if (erre) {
                console.log(erre)
                connection.close();
            } else {
                console.log(recordset)
                connection.close();
            }
        });
    });
};

function getCustomers() {
    console.log('GET customers info in progress....');
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`SELECT * FROM dbo.Customers WHERE status='Completed' AND isDelete='false'`, function(erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                connection.close();
                var Customer = recordset.recordset;
                // console.log(Customer);
                Customer.forEach(function(_item) {
                    console.log(_item.enrollment_id);
                    var Token = _item.api_key;
                    var enrollment_id = _item.enrollment_id;
                    var markup = _item.markup;
                    // var startTime = moment(_item.startdate).format('YYYY-MM-DD');
                    var endTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    // var endTime = moment().format('YYYY-MM-DD');
                    var Url = `https://consumption.azure.com/v3/enrollments/${enrollment_id}/usagedetailsbycustomdate?`;
                    Url += `startTime=${endTime}&endTime=${endTime}`;
                    sendLog(`GET data ${enrollment_id} success!`);
                    getAllData(Url, Token, enrollment_id, markup);
                });

            }
        });
    });
}

function getCustomerByID(_enrollmentId) {
    console.log('GET customers info in progress....');
    sendLog(`GET data ${_enrollmentId}`);
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function() {
        var request = new sql.Request(connection);
        request.query(`SELECT * FROM dbo.Customers WHERE enrollment_id=${_enrollmentId} AND isDelete='false'`, function(erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                sendLog(`GET data ${_enrollmentId}`);
                connection.close();
            } else {
                connection.close();
                var Customer = recordset.recordset[0];
                console.log(Customer);
                var Token = Customer.api_key;
                var enrollment_id = Customer.enrollment_id;
                var markup = Customer.markup;
                // var startTime = moment(Customer.startdate).format('YYYY-MM-DD');
                var endTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
                var startTime = moment().subtract(36, 'months').format('YYYY-MM-DD');
                var months = moment(endTime).diff(moment(startTime), 'months', true);
                console.log(Customer.startdate, Customer.enddate, months);
                if (months > 36) {
                    endTime = moment(Customer.enddate).format('YYYY-MM-DD');
                }
                var Url = `https://consumption.azure.com/v3/enrollments/${enrollment_id}/usagedetailsbycustomdate?`;
                Url += `startTime=${startTime}&endTime=${endTime}`;
                getAllData(Url, Token, enrollment_id, markup);
            }
        });
    });
}

var port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server running at http://localhost:' + port);
});