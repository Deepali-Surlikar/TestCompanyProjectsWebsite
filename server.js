const express = require('express');
var bodyParser = require('body-parser');
const app = express()
const port = 3000;

app.use(bodyParser.urlencoded({
    extended: true
  }));

// parse application/json as json
app.use(bodyParser.json({ type: 'application/json', limit: '10mb' }));

app.use(function(req, res, next)
{
    for (var key in req.query)
    { 
      req.query[key.toLowerCase()] = req.query[key];
    }
    next();
});

var companyProjectsRoute = require('./routes/companyProjects');
app.use('/api/company', companyProjectsRoute);

app.listen(port, () => console.log("Server started on port " + port))