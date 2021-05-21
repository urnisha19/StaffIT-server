const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config()

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('services'));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rzg3r.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("StaffIT").collection("services");
  const adminCollection = client.db("StaffIT").collection("admin");
  const reviewCollection = client.db("StaffIT").collection("review");
  const orderCollection = client.db("StaffIT").collection("order");

  console.log("DB connected");
  //Server Connection Test
  app.get('/', (req, res) => {
    res.send('Hello!!!!! Server is working!');
  });

  //Admin Page Customer all Order List show 
  app.get('/admin/orderList', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //get all added Services to show in homepage
  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  // get all added Admin
  app.get('/showAllAdmin', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //get all review to show in homepage
  app.get('/review', (req, res) => {
    reviewCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  // get all orders of a customer  
  app.get('/order', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  //Admin Page addService
  app.post('/admin/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;

    const newImg = file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: file.mimType,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };
    serviceCollection.insertOne({ title, description, image })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  //Admin Page Make Admin
  app.post('/admin/makeAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({ email })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })


  //Customer page addReview
  app.post('/customer/addReview', (req, res) => {
    const name = req.body.name;
    const companyName = req.body.companyName;
    const description = req.body.description;

    reviewCollection.insertOne({ name, companyName, description })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  //Customer page addOrder 
  app.post('/customer/serviceBooking', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const service = req.body.service;
    // const price = req.body.price;
    // const status = req.body.status;

    orderCollection.insertOne({ name, email, service })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })
});

app.listen(process.env.PORT || 5000)