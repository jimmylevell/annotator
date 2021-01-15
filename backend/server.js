const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const dbConfig = require('./database/db');
const api = require('./routes/documentRoutes')
const app = express();
const port = process.env.BACKEND_PORT || 10000;

// MongoDB Configuration
mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.db, {
    useNewUrlParser: true
}).then(() => {
    console.log('Database sucessfully connected')
},
    error => {
        console.log('Database could not be connected: ' + error)
    }
)

// serve static folder for production
let publicFolder = path.resolve(__dirname, '..')
app.use(express.static(path.join(publicFolder, 'build')));

app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  }));
  app.use(bodyParser.json({limit: "50mb", extended: true}));

app.use(cors());

app.use('/public', express.static('public'));
app.use('/api', api)

const server = app.listen(port, () => {
    console.log('Connected to port ' + port)
})

// forward all requests to the react app
app.get('*', function(req, res) {
    res.sendFile(path.join(publicFolder, 'build', 'index.html'));
  });