let sio

module.exports.receiveIO  = (io) => {
    sio = io;
}

module.exports.emitTick = (data) =>{
    //console.log(data);
    sio.emit('tick', data);
}