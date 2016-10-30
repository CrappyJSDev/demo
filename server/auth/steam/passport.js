'use strict';

const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const Promise = require('bluebird');
const steam = require('../../components/steam');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

exports.setup = function (User, config) {
  passport.use(new SteamStrategy({
      returnURL: process.env.NODE_ENV === 'development' ? 'http://localhost:9000/auth/steam/return' : 'http://clanverse.com/auth/steam/return',
      realm: process.env.NODE_ENV === 'development' ? 'http://localhost:9000/' : 'http://clanverse.com',
      apiKey: 'BE3DC08157BC0F14108D97B31C4D523A',
      passReqToCallback: true
    },
    function(req, identifier, profile, done) {
      let userModel = null;

      User.findOne({
        steamid: profile._json.steamid
      })
      .then(function(user){
        let func = null;

        if (!user) {
          user = new User({
            steamid:profile._json.steamid,
            steam: profile._json,
            role: 'user'
          });

          steam.addFriend(user.steamid);

          userModel = user;
          func = user.save();

        } else if(!user.role) {

          user.role = 'user';
          user.steam = profile._json;

          userModel = user;

          func = user.save();

        } else if(!user.friended) {
          if(steam.checkForFriend(user.steamid)){
            user.friended = true;
            func = user.save()
          }
          userModel = user;
        }

        req.user = user;
        return func;
      })
      .then(function(){
        console.log(req.user);
        return done(null, req.user);
      })
      .catch(function(err){
        return done(err);
      });
    }
  ));
};
