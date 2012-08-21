var jsonto = require('./lib/jsonto');
var mongo = process.argv[3] || 'root:root@alex.mongohq.com:10077/cxtlog';
var db = require('mongojs').connect(mongo);

db.collection('data').find(function(err,data) {
	var data = JSON.parse(JSON.stringify(data));
	console.log(JSON.parse(JSON.stringify(data)), jsonto.xml(JSON.parse(JSON.stringify(data)), ''));
});