var _ = require('lodash');
var express = require('express') ;
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var passport = require('passport');
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// array for data login
var users = [
    {
        id: 1,
        name: 'amir',
        email: 'amirengg15@gmail.com',
        password: '1234'
    },
    {
        id: 2,
        name: 'dharmendra',
        email: 'dharmendra@gmail.com',
        password: '1111'
    }
];

// strategy for using web token authentication
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'tasmanianDevil';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('payload received', jwt_payload);
    // usually this would be a database call:
    var user = users[_.findIndex(users, {id: jwt_payload.id})];
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});
passport.use(strategy);

var app = express();
app.use(passport.initialize());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({"message":"Express is up"});
});

// Login route - here we will generate the token - copy the token generated in the input
app.post("/login", function(req, res) {
    if(req.body.email && req.body.password){
      // var name = req.body.name;
      var email = req.body.email;
      var password = req.body.password;
    }
    // usually this would be a database call:
    var user = users[_.findIndex(users, {email: email})];
    if( ! user ){
      res.status(401).json({message:"no such user/email id found"});
    }
  
    if(user.password === req.body.password) {
      // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
      var payload = {id: user.id};
      var token = jwt.sign(payload, jwtOptions.secretOrKey);
      res.json({message: "ok", token: token});
    } else {
      res.status(401).json({message:"passwords did not match"});
    }
  });

  // now there can be as many route you want that must have the token to run, otherwise will show unauhorized access. Will show success 
  // when token auth is successfilly passed.
  app.get("/secret", passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json("Success! You can not see this without a token");
  });
  

  // server 
app.listen(5000, () => console.log('Listening to port 5000'));
