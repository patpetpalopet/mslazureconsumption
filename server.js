var http = require('http');
var express = require('express');
var sql = require('mssql');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
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
                connection.close();
            } else {
                console.log(`Created table ${_tableName} success!`);
                console.log(res);
                connection.close();
            }
        });
    });
});

function loadConsumtions(){

}

var port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server running at http://localhost:' + port);
});