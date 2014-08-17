//Mehul Patel
//My NYU Story App 


//the hero of the app
var express = require('express');
//the hero of HTML
var hbs = require('hbs');
//the hero of user auth
var passport = require('passport');
//the hero of mongodb
var mongoose = require('mongoose');
//require nodemailer
var nodemailer = require('nodemailer');
//require twilio


var app = express();
var path = require('path');
var busboy = require('connect-busboy');
app.use(busboy()); 

//var uri = 'mongodb://heroku_app21925448:4p7tgven51i7j1at8uepeviji0@ds027809.mongolab.com:27809/heroku_app21925448';
var uri = 'mongodb://heroku_app21925448_A:WnKoqXpEKCEohaxGnDZQHJFNXoDmWGZF@ds027809.mongolab.com:27809/heroku_app21925448'
mongoose.connect(uri);

var storySchema = mongoose.Schema({
	name : String,
	major : String, 
	theStory: {
		title: {type: String, default : "hi"},
		body: String
	}, 
	year: String, 
	code: String,
	phone: Number


});

mongoose.model("Story", storySchema); 
var Story = mongoose.model("Story"); 

//configure express
app.configure(function() {
app.use(express.logger('dev'));
app.use(express.cookieParser('thissecretrocks'));

app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(express.bodyParser());
app.use(express.static('public'));
app.use(express.methodOverride());

app.use(express.session({ secret: 'keyboard cat' }));

app.use(app.router);
app.use(express.methodOverride());















});


//INDEX PAGE 
app.get('/', function(req, res) { 

	res.render("choose");

}); 

app.get("/startstory", function(req, res) {
	res.render("index");
}); 

app.get("/directstory", function(req, res) {

	Story.find(function(err, stories){
			
		
			res.render("stories", {stories: stories});


	}); 
});
//The Story 
app.post('/story', function(req, res){


	var tempStore = new Story({
		name : req.body.name, 
		major : req.body.major,
		year : req.body.year
		
	}).save(function(err, temp){
		if(!err) console.log(temp);
		else throw err; 
		var link = "localhost:3000/writestory/" + temp._id; 
		var str = req.body.name + "'s NYU Story";
		sendEMail(req.body.email, "me", str, link ); 
	});
});


//Save Story

app.post('/savestory',  function(req, res){
		
		Story.findByIdAndUpdate(req.body.theid, {theStory : {title:  req.body.title, body: req.body.theStory}}, function(err, user){
			if(err) throw err; 
			console.log(req.body);
		
			Story.find(function(err, stories){
			
		
			res.render("stories", {stories: stories});


		}); 
		}); 
		
		
		
    });



app.get('/writestory/:token', function(req, res) {
	console.log(req.params.token); 
  Story.findOne({ _id : req.params.token }, function(err, user) {
   if(user != null) {
   	console.log(user.theStory);
   		if(user.theStory.title == "hi") {
   			res.render("writestory", {name :  user.name, year : user.year, major: user.major, id : user._id});
   		}
   		else {
   		res.render("writestory", {name :  user.name, year : user.year, major: user.major, id : user._id, story : user.theStory});
   	}

   }

   else {
   	res.render("writestory", {name :  "Something Went Wrong", year :  "Something Went Wrong", major:  "Something Went Wrong", id : null, story :  "Something Went Wrong"});

   }
   	
  });
});


// app.get('/sendmessage', function(req, res){
// 			//var accountSid = 'AC7de357fe90f6ca41f6ad156f5514d749';
// 			//var authToken = "fb5e5a8673ddb42f03bf8e5baea847c9";
// 			//var client = require('twilio')(accountSid, authToken);
			 
// 			var client = require('twilio')('AC7de357fe90f6ca41f6ad156f5514d749', 'fb5e5a8673ddb42f03bf8e5baea847c9');

// 			//Send an SMS text message
// 			client.sendMessage({

// 			    to:'+9176889963', // Any number Twilio can deliver to
// 			    from: '+16463628726', // A number you bought from Twilio and can use for outbound communication
// 			    body: 'word to your mother.' // body of the SMS message

// 			}, function(err, responseData) { //this function is executed when a response is received from Twilio

// 			    if (!err) { // "err" is an error received during the request, if any

// 			        // "responseData" is a JavaScript object containing data received from Twilio.
// 			        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
// 			        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

// 			        console.log(responseData.from); // outputs "+14506667788"
// 			        console.log(responseData.body); // outputs "word to your mother."

// 			    }
// 			    else {
// 			    	console.log("error");
// 			    }
// 			});


// });



function sendEMail(to,from, subject, text ) {


//creates the transport JSON Object 
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "youremail",
        pass: "youpassword"
    }
});

// setup e-mail data with unicode symbols

var mailOptions = {
    from: "MY NYU STORY <foo@blurdybloop.com>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plaintext body
    html: text // html body
}

// send mail with defined transport object
smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
        console.log(error);
    }else{
        console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
});


}

app.listen( process.env.PORT || 3000);

