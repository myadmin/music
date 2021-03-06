var express = require('express');
var app = express();
var path = require('path');
var request = require('request');

//设置端口
app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile('./index.html');
});

var url = 'http://tingapi.ting.baidu.com/v1/restserver/ting?format=json&calback=&from=webapp_music&method=';

app.get('/api/songList', function (req, res, next) {
	request( url + 'baidu.ting.billboard.billList&type=1&size=10&offset=0', function (error, response, body) {
		if (!error) {
			res.json({
	  			code: 1,
	  			body: JSON.parse(body)
	  		});
		}
	});
});

app.get('/api/getData', function (req, res, next) {
	var songId = req.query.song;
	request( url + 'baidu.ting.song.lry&songid=' + songId, function (error, response, body) {
		res.json({
  			code: 1,
  			body: body
  		});
	});
});

app.get('/api/getSong', function (req, res, next) {
	var songId = req.query.song;
	request( url + 'baidu.ting.song.play&songid=' + songId, function (error, response, body) {
		if (!error) {
			res.json({
	  			code: 1,
	  			body: body
	  		});
		}
	});
});

app.get('/api/search', function (req, res, next) {
	var val = encodeURIComponent(req.query.val);
	
	var urls = url + 'baidu.ting.search.catalogSug&query=' + val;

	request( urls , function (error, response, body) {
		if (!error) {
			res.json({
	  			code: 1,
	  			body: JSON.parse(body)
	  		});
		}
	});
});

//404
app.use(function (req, res) {
    res.type('text/plan');
    res.status(404);
    res.send('404 - Not Found');
});
//500
app.use(function (err, req, res, next) {
    res.type('text/plan');
    res.status(500);
    res.send('500 - Server Error');
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
