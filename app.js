require("dotenv").config();	

var express               = require("express"),
	path                  = require("path"),
	expressSanitizer      = require("express-sanitizer"),
	methodOverride        = require("method-override"),
	app              	  = express(),
	bodyParser            = require("body-parser"),
	favicon               = require('serve-favicon'),
	logger                = require("morgan"),
    cookieParser          = require("cookie-parser"),
    mongoose              = require("mongoose"),
    flash				  = require("connect-flash"),
	passport              = require("passport"),
	LocalStrategy         = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
	User                  = require("./models/user"),
	server                = require("http").Server(app),
    io                    = require("socket.io")(server),
	SocketHander          = require('./socket/index'),	
	indexRoutes      	  = require("./routes/index");
	// localhost:27017
var url = "mongodb://127.0.0.1:27017/mealinktesting_project";
mongoose.connect(url,
{useNewUrlParser: true, 
 useUnifiedTopology: true, 
 useCreateIndex: true
});



io.on('connection', async (socket) => {

  console.log('a user connected');
  const clients = await io.engine.clientsCount;

  const socketid = socket.id;
 

  socket.on("disconnect", () => {
    console.log("a user go out");
  });

  socket.on('login', async (obj) => {
	  
	  var chatid = obj.chatid;
	  var userid = obj.user;
    	  
	  socketHander = new SocketHander();

	  socketHander.connect();

	  const history = await socketHander.getMessages({chatid:chatid});

	  io.to(socketid).emit('history_' + chatid, history);
	  
	  
	  socket.on("message_" + chatid, (obj) => {
		  	var data = {msg:obj.msg, chatid:chatid, userid:userid}
			socketHander.storeMessages(data);
			io.emit("message_" + chatid, data);
	  });

	  
  });

});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(cookieParser());
mongoose.set("useFindAndModify", false);
app.use(express.static(path.join(__dirname + "/public")));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(expressSanitizer());
app.use(methodOverride("_method"));
app.use(flash());

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

//passport configuration
app.use(require("express-session")({
    secret: "welcome",  // 用来对session id相关的cookie进行签名
	resave: false,  // 是否每次都重新保存会话，建议false
    saveUninitialized: false  // 是否自动保存未初始化的会话，建议false 
}));

app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy({usernameField: "email"}, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


app.use(indexRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



var port = process.env.PORT || 3000;
server.listen(port, function() { 
  console.log("Server listening on port 3000 and test project has started");
}); 

module.exports = app;