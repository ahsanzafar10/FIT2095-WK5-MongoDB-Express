let express = require('express');
app = express();
let print = console.log;
let bodyParser = require('body-parser');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const DB_URL = 'mongodb://localhost:27017/';
let db;
let book_col;

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

MongoClient.connect(DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    if (err) {
        print("Error in MongoDB connection" + err);
    } else {
        print("Connected successfully to server");
        db = client.db('exam_library_wk5');
        book_col = db.collection('books');
    }
});


// Middleware
app.use(bodyParser.urlencoded({extended: false}));


// Endpoints
app.get('/', function(req, res){
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/newbook', function(req, res){

    let rand_num = Math.floor((Math.random()*10000000000000)+1);
    res.render("newbook.html", {num: rand_num});
});

app.get('/listbooks', function(req, res){
    book_col.find({}).toArray(function(err, books){
        res.render('listbooks.html', {ar:books})
    });
});

app.get('/updatebook', (req, res)=> {
    res.sendFile(__dirname + "/views/update.html");
});

app.get('/deletebook', (req, res)=> {
    res.sendFile(__dirname + '/views/delete.html');
    
});

app.post('/postdeletebook', (req, res)=> {
    let filter = {isbn: req.body.ISBN};
    book_col.deleteOne(filter, function(err, result){
        res.redirect("/listbooks");
    });
});

app.post('/postupdatebook', function(req, res){

    let filter = {isbn: req.body.ISBN};
    let setOption = { $set: {
            title: req.body.title,
            author: req.body.author,
            date: req.body.date,
            summary: req.body.summary
        }    
    };
    let upsertOption = {upsert: false};
    book_col.updateOne(filter, setOption, upsertOption, function(err, result){
        res.redirect("/listbooks");
    });
});

app.post('/postnewbook', function(req,res){
    
    book_col.insertOne({
        title: req.body.title,
        author: req.body.author,
        date : req.body.date,
        isbn: req.body.ISBN,
        summary : req.body.summary
    }, function(err, result){
        if (err) {
            res.send('Error in inserting to database');
        }
        else {
            res.redirect("/listbooks");
        }     
    });
});


app.listen(8080);

