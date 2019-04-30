var request = require('request');
var sql = require('mssql');
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
    }, function (error, response, body) {
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

function getCustomers(_CustomersId) {
    console.log('GET customers info in progress....');
    var connection = new sql.ConnectionPool(sqlConfig);
    connection.connect().then(function () {
        var request = new sql.Request(connection);
        request.query(`SELECT * FROM dbo.Customers WHERE id=${_CustomersId}`, function (erre, recordset) {
            if (erre) {
                console.log('ERROR: ', erre);
                connection.close();
            } else {
                connection.close();
                var Token = recordset['recordset'][0].api_key;
                var enrollment_id = recordset['recordset'][0].enrollment_id;
                var markup = recordset['recordset'][0].markup;
                var Url = `https://consumption.azure.com/v3/enrollments/${enrollment_id}/usagedetails`;

                console.log(`GET Customer success! in ${enrollment_id}`);
                // console.log({
                //     enrollmentNumber: enrollment_id,
                //     markup: markup,
                //     token: Token
                // });
                
                // console.log(Url, Token, enrollment_id, markup);
                getAllData(Url, Token, enrollment_id, markup);
            }
        });
    });
}

// getCustomers(1);
// getCustomers(2);
// getCustomers(3);
// getCustomers(4);