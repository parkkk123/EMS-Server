/**
 * Revised by PanPark
 * lastest update 1/5/63
 */
const express = require('express');
const bodyParser = require("body-parser");


/**
 * Import routes
 */
const app = express();
const users = require('./routes/user')
const admin = require('./routes/admin')
const device = require('./routes/device')
const others = require('./routes/others')
const patient = require('./routes/patient')
const ambulance = require('./routes/ambulance')

/**
 * Config json body request 
 */
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/**
 * Allowed CORs
 */
let cors = require('cors')
let corsOptions = {
    origin: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Authorization', 'Accept'],
    credentials: true
}

app.use(cors(corsOptions))

app.get('/', (req, res) => {
    res.send('<h1>API server is running normally</h2>');
});

//1 - patient
//2 - admin
//3 - ambulance
//4 - doctor
//5 - device

app.use('/v1/patient', patient)
app.use('/v1/admin', admin)
app.use('/v1/users', users)
app.use('/v1/others', others)
app.use('/v1/device', device)
app.use('/v1/ambulance', ambulance)


var listener = app.listen(process.env.PORT, () =>
    console.log('Listening onport %d', listener.address().port));