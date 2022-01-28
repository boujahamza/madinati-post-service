const express = require('express');
var locationService = express();
var bodyParser = require('body-parser');

locationService.use(bodyParser());

var MongoClient = require('mongodb').MongoClient;
const { default: axios } = require('axios');
var url = "mongodb+srv://admin:admin@cluster0.uf5pu.mongodb.net/LocationServiceDB?retryWrites=true&w=majority";

let dbConnection;

MongoClient.connect(url,function (err, db) {
    if (err) throw err;

    dbConnection = db.db("LocationServiceDB");
    console.log("Successfully connected to MongoDB.");
});

locationService.get("/",function(req,res){
    console.log("Received request for location posts");

    dbConnection
        .collection("posts")
        .find({}).toArray(function (err, result) {
            if (err) {
              res.status(400).send("Error fetching listings!");
           } else {
              res.json(result);
              console.log(result);
            }
          });
});

locationService.post("/",function(req,res){
    console.log(req.body.username + " attempting posting");
    axios.get('http://localhost:3000/verify?username='+req.body.username+'&jwt='+req.body.jwt).then(async function(response){
        if(response.status == 200){
            console.log(req.body);
            console.log(req.body.data);
            dbConnection
            .collection("posts").insertOne({'username':req.body.username,'mood':req.body.mood,'location':req.body.location,'desc':req.body.desc},function (err, result) {
                if (err) {
                res.status(400).send("Error");
                } else {
                res.json(result);
                console.log(result);
                }
            }).catch(function(err){
                res.status(400).send("Error");
            });
        }else{
            res.status(400).send("Error");
        }
    });
    
  });

locationService.listen(process.env.PORT || 3002,function(){
    console.log("Started location sharing service on port 3002")
});