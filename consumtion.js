var request = require('request');
var sql = require('mssql');
var moment = require('moment');

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

function createdTable(_tableName) {
    console.log('Created table in progress....');
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`CREATE TABLE dbo.[${_tableName}](
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
}

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
getCustomers();
// getCustomers(2);
// getCustomers(3);
// getCustomers(4);