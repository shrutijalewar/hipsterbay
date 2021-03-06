'use strict';

var bcrypt = require('bcrypt'),
    _      = require('lodash'),
    Mongo  = require('mongodb');

function User(o){
  this.alias    = o.alias;
  this.email    = o.email;
  this.password = bcrypt.hashSync(o.password, 10);
  this.phone    = o.phone;
  this.photo    = o.photo || 'http://i.dailymail.co.uk/i/pix/2013/08/07/article-2385822-1B2EBBDA000005DC-922_634x685.jpg';
  this.loc      = {name: o.name, lat: parseFloat(o.lat), lng: parseFloat(o.lng)};
}

Object.defineProperty(User, 'collection', {
  get: function(){return global.mongodb.collection('users');}
});

User.findById = function(id, cb){
  var _id = Mongo.ObjectID(id);
  User.collection.findOne({_id:_id}, function(err, user){
    user = _.create(User.prototype, user);
    cb(user);
  });
};

User.register = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(user){return cb();}
    var newUser = new User(o);
    User.collection.save(newUser, cb);
  });
};

User.authenticate = function(o, cb){
  User.collection.findOne({email:o.email}, function(err, user){
    if(!user){return cb();}
    var isOk = bcrypt.compareSync(o.password, user.password);
    if(!isOk){return cb();}
    cb(user);
  });
};

User.prototype.update = function(o, cb){
  User.collection.update({_id: this._id}, {$set: o}, cb);
};

User.prototype.unread = function(cb){
  require('./message').unread(this._id, cb);
};

User.prototype.send = function(receiver, obj, cb){
  require('./message').send(this._id, receiver._id, obj.message, cb);
};

module.exports = User;

