const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const AWS = require('aws-sdk');
var uuid = require('uuid');
const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5000;

//Enabling CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

console.log("Access Key : " + process.env.AWS_ACCESS_KEY);

AWS.config.loadFromPath('./aws-config.json');

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

app.get('/', (req, res) => {
	res.json({"Server Stauus": " : Up and Running"});
});

app.put('/order', (req, res) => {
	console.log(req.body);
	var params = {
		TableName: 'ORDERS',
		Item: {
			"ORDER_ID": {S: uuid.v1()},
			"ORDER_STATUS": {S: "PROGRESS"},
			"FIRST_NAME": {S: req.body.FIRST_NAME},
			"LAST_NAME": {S: req.body.LAST_NAME},
			"COMPANY_NAME": {S: req.body.COMPANY_NAME},
			"STREET_ADDRESS": {S: req.body.STREET_ADDRESS},
			"CITY_ADDRESS": {S: req.body.CITY_ADDRESS},
			"STATE_ADDRESS": {S: req.body.STATE_ADDRESS},
			"ZIP_ADDRESS": {S: req.body.ZIP_ADDRESS},
			"EMAIL_ADDRESS": {S: req.body.EMAIL_ADDRESS},
			"PHONE": {S: req.body.PHONE},
			"ORDERED_ITEMS": {S: req.body.ORDERED_ITEMS}
		}
	};
	
	// Call DynamoDB to add the item to the table
	ddb.putItem(params, function(err, data) {
		if (err) {
			console.log("Error", err);
			res.json({"status" : "failed"});
		} else {
			console.log("Success", data);
			res.json({"status" : "success"});
		}
	});
});

app.get('/createTable', (req, res) => {

	var params = {
	  AttributeDefinitions: [
		{
		  AttributeName: 'ORDER_ID',
		  AttributeType: 'S'
		}
	  ],
	  KeySchema: [
		{
		  AttributeName: 'ORDER_ID',
		  KeyType: 'HASH'
		}
	  ],
	  ProvisionedThroughput: {
		ReadCapacityUnits: 1,
		WriteCapacityUnits: 1
	  },
	  TableName: 'ORDERS',
	  StreamSpecification: {
		StreamEnabled: false
	  }
	};

	// Call DynamoDB to create the table
	ddb.createTable(params, function(err, data) {
	  if (err) {
		console.log("Error", err);
		res.json({"Table Creation": " : Failed"});
	  } else {
		console.log("Table Created", data);
		res.json({"Table Creation": " : Success"});
	  }
	});	
});


app.listen(port, function () {
  console.log(`listening on ${port}`)
});