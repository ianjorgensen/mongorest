#!/usr/bin/env node

var http = require('http');
var route = require('router')();
var buffoon = require('buffoon');
var file = require('archivo').file;
var comun = require('comun');

var jsonto = require('./lib/jsonto');

var port = process.argv[2] || 9080;
var mongo = process.argv[3] || 'root:root@alex.mongohq.com:10077/cxtlog';

var db = require('mongojs').connect(mongo);

var respond = function(response, status, obj) {
	response.writeHead(status, {'content-type':'application/javascript'});
	response.end(JSON.stringify(obj, null, '\t'));
};

var onerror = function(response) {
	return function() {
		respond(response, 500, {error: true});
	}
};

var get = function(request, callback) {
	var config = comun.join({
		query: {},
		skip: 0,
		select: {},
		limit: 100,
		sort: {}
	}, request.query);

	db.collection(request.params.collection).find(config.query, config.select).sort(config.sort).skip(config.skip).limit(config.limit, callback);
};

route.get('/', file('./html/home.html'));
route.get('/{collection}.jsonx', function(request, response) {
	get(request, comun.fork(onerror(response), function(data) {
		respond(response, 200, data);
	}));
});
route.get('/{collection}.xml', function(request, response) {
	get(request, comun.fork(onerror(response), function(data) {
		response.writeHead(200, {'content-type': 'text/xml'});
		data = JSON.parse(JSON.stringify(data));
		response.end("<data>" + jsonto.xml(data,'') + '</data>');
	}));
});
route.get('/{collection}.csv', function(request, response) {
	get(request, comun.fork(onerror(response), function(data) {
		response.writeHead(200, {'content-type': 'text/plain'});
		response.end(jsonto.csv(data));
	}));
});
route.get('/{collection}', function(request, response) {
	get(request, comun.fork(onerror(response), function(data) {
		respond(response, 200, data);
	}));
});
route.post('/{collection}' , function(request, response) {
	comun.step([
		function(next) {
			buffoon.json(request, next);
		},
		function(data, next) {
			if (request.query.query) {
				db.collection(request.params.collection).update(request.query.query, data, false, true, next);
			} else {
				db.collection(request.params.collection).save(data, next);	
			} 
		},
		function() {
			respond(request, 200, {success: true});
		}
	], onerror(response));
});
route.delete('/{collection}', function(request, response) {
	db.collection(request.params.collection).remove(request.query || {}, comun.fork(onerror(response), function() {
		respond(response, 200, {done: true});
	}));
});

http.createServer(route).listen(port);
process.on('uncaughtException', function(err) { console.log(err.stack) });
console.log('server running on port ' + port + ' connected to mongo db ' + mongo);