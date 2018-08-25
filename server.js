'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser= require("body-parser");
var dns= require("dns");

var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
mongoose.connect(process.env.MONGO_URI);
var Schema= mongoose.Schema;

var shortSchema= new Schema({
  url: String,
  short: Number

});

var Short= mongoose.model("Short",shortSchema);

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// your first API endpoint...
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// url shortener API
app.post("/api/shorturl/new",function(req,res){
  var all_url= req.body.url;
  var original_url=all_url.replace(/(^\w+:|^)\/\//, '');
  var json="";
  var check=dns.lookup(original_url,function(err,data){
    if(err){
      json={"error":"invalid URL"};
    res.json(json);
       }
    else{
      //insert url
    var get_counter=Short.count({}, function (err, count) {
      var counter=count++;
      Short.create({url:all_url,short: counter},function(err,data){
        // json={original_url:original_url,short_url:data.short,check:check};
        res.json({original_url:original_url,short_url:data.short});
     });
    });

    }

  });

});

// redirect API
app.get("/api/shorturl/:num",function(req, res){
  var num = req.params.num;
  Short.findOne({short:num},function(err, data){
    res.redirect(data.url);
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});
