var http = require('http');
var express = require('express');
var sql = require('mssql');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var cron = require('node-cron');


// Set Time to Get consumption
cron.schedule('0 0 0 * * *', function () {
    getCustomers();
});

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
        idleTimeoutMillis: 5
    }
};

// set bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

// set Origin
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-access-token");
    res.header("Access-Control-Allow-Headers", "Content-Type, application/json");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.get('/customers', (req, res) => {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`SELECT * FROM dbo.Customers WHERE isDelete='false'`, function (erre, recordset) {
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
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`select * from dbo.Customers where id=${req.params.id}`, function (erre, recordset) {
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
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`select top 2 * from dbo.[${req.params.enrollment_id}]`, function (erre, recordset) {
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
app.post('/addcustomers', (req, res) => {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`INSERT INTO dbo.Customers (
            [customer_name], 
            [enrollment_id], 
            [enrollment_status], 
            [startdate], 
            [enddate], 
            [markup], 
            [api_key], 
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
            '${req.body.isActive}',
            '${req.body.isDelete}'
        )`, function (erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                res.json(erre);
                connection.close();
            } else {
                res.json(req.body);
                connection.close();
            }
        });
    });
});
app.post('/delcustomer', (req, res) => {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`
            UPDATE dbo.Customers
            SET isDelete='true'
            WHERE id=${req.body.id}
        `, function (erre, recordset) {
            if (erre) {
                res.json({
                    status: 'error',
                    data: erre
                });
                connection.close();
            } else {
                res.json({
                    status: 200,
                    data: 'delete'
                });
                connection.close();
            }
        });
    });
});
app.post('/updatecustomer', (req, res) => {
    console.log(req.body);
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
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
        `, function (erre, recordset) {
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
app.post('/createtable', (req, res) => {
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`CREATE TABLE [${req.body.enrollment_id}](
                       serviceName nvarchar(128),
                       date date,
                       cost float,
                       consumption_cost float,
                       serviceTier nvarchar(128),
                       location nvarchar(128),
                       chargesBilledSeparately bit,
                       partNumber nvarchar(128),
                       resourceGuid nvarchar(128),
                       offerId nvarchar(128),
                       accountId int,
                       productId int,
                       resourceLocationId int,
                       consumedServiceId int,
                       departmentId int,
                       accountOwnerEmail nvarchar(128),
                       accountName nvarchar(128),
                       serviceAdministratorId nvarchar(128),
                       subscriptionId int,
                       subscriptionGuid nvarchar(128),
                       subscriptionName nvarchar(128),
                       product nvarchar(128),
                       meterId nvarchar(128),
                       meterCategory nvarchar(128),
                       meterSubCategory nvarchar(128),
                       meterRegion nvarchar(128),
                       meterName nvarchar(128),
                       consumedQuantity float,
                       resourceRate float,
                       resourceLocation nvarchar(128),
                       consumedService nvarchar(128),
                       instanceId nvarchar(128),
                       serviceInfo1 nvarchar(128),
                       serviceInfo2 nvarchar(128),
                       additionalInfo nvarchar(128),
                       tags nvarchar(128),
                       storeServiceIdentifier nvarchar(128),
                       departmentName nvarchar(128),
                       costCenter nvarchar(128),
                       unitOfMeasure nvarchar(128),
                       resourceGroup nvarchar(128))
            `, function (erre, res) {
            if (erre) {
                console.log('ERROR: ', erre);
                res.json(erre);
                connection.close();
            } else {
                console.log(`Created table ${_tableName} success!`);
                res.json(erre);
                connection.close();
                getCustomerByID(req.body.id);
            }
        });
    });
});

function getAllData(_urllink, _tokeninput, _tableInsert, _markup) {
    console.log('INSERT Consumption in progress....');
    request({
        method: 'GET',
        url: _urllink,
        headers: {
            'accept': 'application/json',
            'Authorization': `bearer ${_tokeninput}`
        }
    }, function (_error, _response, body) {
        var info = JSON.parse(body);
        var result = info.data;
        for (var i in info.data) {
            result[i].consumption_cost = ((_markup * result[i].cost) / 100) + result[i].cost;
        }
        var infoText = JSON.stringify(result);
        var connection = new sql.ConnectionPool(sqlConfig);
        connection.connect().then(function () {
            var request = new sql.Request(connection);
            request.query(`USE [AzureConsumption]
            DECLARE @jsonVariable NVARCHAR(MAX)
            SET @jsonVariable = N'${infoText}'
            INSERT INTO [dbo].[${_tableInsert}]
                       ([serviceName]
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
             WITH (serviceName nvarchar(128),
                       date date,
                       cost float,
                       consumption_cost float,
                       serviceTier nvarchar(128),
                       location nvarchar(128),
                       chargesBilledSeparately bit,
                       partNumber nvarchar(128),
                       resourceGuid nvarchar(128),
                       offerId nvarchar(128),
                       accountId int,
                       productId int,
                       resourceLocationId int,
                       consumedServiceId int,
                       departmentId int,
                       accountOwnerEmail nvarchar(128),
                       accountName nvarchar(128),
                       serviceAdministratorId nvarchar(128),
                       subscriptionId int,
                       subscriptionGuid nvarchar(128),
                       subscriptionName nvarchar(128),
                       product nvarchar(128),
                       meterId nvarchar(128),
                       meterCategory nvarchar(128),
                       meterSubCategory nvarchar(128),
                       meterRegion nvarchar(128),
                       meterName nvarchar(128),
                       consumedQuantity float,
                       resourceRate float,
                       resourceLocation nvarchar(128),
                       consumedService nvarchar(128),
                       instanceId nvarchar(128),
                       serviceInfo1 nvarchar(128),
                       serviceInfo2 nvarchar(128),
                       additionalInfo nvarchar(128),
                       tags nvarchar(128),
                       storeServiceIdentifier nvarchar(128),
                       departmentName nvarchar(128),
                       costCenter nvarchar(128),
                       unitOfMeasure nvarchar(128),
                       resourceGroup nvarchar(128))`,
                function (erre, recordset) {
                    if (erre) {
                        console.log('ERROR: ', erre);
                        connection.close();
                    } else {
                        console.log(`INSERT ${recordset.rowsAffected[1]} records success! in ${_tableInsert}`);
                        if (info.nextLink) {
                            getAllData(info.nextLink, _tokeninput, _tableInsert);
                        }
                        connection.close();
                    }
                });
        });

    });
};

function getCustomers() {
    console.log('GET customers info in progress....');
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`SELECT * FROM dbo.Customers WHERE enrollment_status!='Inactive' AND isDelete='false'`, function (erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                connection.close();
                var Customer = recordset.recordset;
                console.log(Customer);
                Customer.forEach(function (_item) {
                    console.log(_item.enrollment_id);
                    var Token = _item.api_key;
                    var enrollment_id = _item.enrollment_id;
                    var markup = _item.markup;
                    var startTime = moment(_item.startdate).format('YYYY-MM-DD');
                    var endTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
                    var Url = `https://consumption.azure.com/v3/enrollments/${enrollment_id}/usagedetailsbycustomdate?`;
                    Url += `startTime=${startTime}&endTime=${endTime}`;
                    getAllData(Url, Token, enrollment_id, markup);
                });

            }
        });
    });
}

function getCustomerByID(_idcus) {
    console.log('GET customers info in progress....');
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`SELECT * FROM dbo.Customers WHERE id=${_idcus}`, function (erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                connection.close();
                var Customer = recordset.recordset[0];
                console.log(Customer);
                var Token = Customer.api_key;
                var enrollment_id = Customer.enrollment_id;
                var markup = Customer.markup;
                var startTime = moment(Customer.startdate).format('YYYY-MM-DD');
                var endTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
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