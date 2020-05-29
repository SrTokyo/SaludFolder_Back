var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
const mongoose = require('mongoose');


var usersRouter = require('./routes/users');
var documentosRouter = require('./routes/documentos');

mongoose.connect('mongodb+srv://dbEditor:dbEditorPass@dbsaludfolder-itysn.azure.mongodb.net/test?retryWrites=true&w=majority', 
  {
    useNewUrlParser :true,
    useUnifiedTopology: true  
  }
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  } 
  next();
});

app.use('/documentos', documentosRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// error handler
app.use(function (error, req, res, next) {
  // set locals, only providing error in development
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
  // render the error page
  //res.render('error');
});

module.exports = app;
