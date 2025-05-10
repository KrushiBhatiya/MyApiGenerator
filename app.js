var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose')
var cors = require('cors')
mongoose.connect('mongodb+srv://admin:admin@cluster0.w16vr.mongodb.net/generateapi?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true, bufferCommands: false })
.then(() => {
  console.log("success");
})
.catch((error) => {
  console.log(error.message);
})
// mongoose.connect('mongodb://localhost:27017/generateapi')
// .then(() => {
//   console.log("success");
// })
// .catch((error) => {
//   console.log(error.message);
// })
mongoose.set('bufferTimeoutMS', 20000);
var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api')

var app = express();

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
