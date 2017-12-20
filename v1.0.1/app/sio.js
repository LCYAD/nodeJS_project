let sio;
const User = require('../models/user');

module.exports.receiveIO  = (io) => {
    sio = io;
    sio.on('connection', (socket)=>{
        console.log('A user has connected to the socket');
        socket.on('addInstrument', (data)=>{
            User.getUserByUsername(data.username, (err, user)=>{
                if (err) throw err;
                user.instruments.push(data.instrument);
                user.save();
                //console.log(user);
            });
        });
        socket.on('removeInstrument', (data)=>{
            User.getUserByUsername(data.username, (err, user)=>{
                if (err) throw err;
                user.instruments.splice(user.instruments.indexOf(data.instrument),1);
                user.save();
                //console.log(user);
            });
        })
    });
}

module.exports.emitTick = (data) =>{
    //console.log(data);
    sio.emit('tick', data);
}