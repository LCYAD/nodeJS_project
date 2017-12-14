const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    token:{
        type: String
    }
});

let User = module.exports = mongoose.model('User', UserSchema);

//This create the hashed password then replace the newUser's inserted password
module.exports.createUser = (newUser, callback) =>{
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = (username, callback)=>{
    let query = {username: username};
    User.findOne(query, callback);
}

module.exports.getUserById = (id, callback)=>{
    User.findById(id, callback);
}

module.exports.getUserByToken = (token, callback)=>{
    let query = {token: token};
    User.findOne(query, callback);
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if (err) throw err;
        callback(null, isMatch);
    });
}

module.exports.changeToken = (username, newToken, callback) =>{
    User.findOneAndUpdate({username: username}, {token: newToken}, callback);
}