// let io;

// module.exports = {
//     init : (httpServer) =>{
//         io = require('socket.io')(httpServer);

//     },
//     getIo: ()=> {
//         if (!io){
//             throw Error('socket.io is not initialized!');
//         }
//         return io;
//     }
// }



class Socket {
    constructor() {
        this.io ;
    }
    static init(httpServer){
        this.io = require('socket.io')(httpServer);
    }

    static getIo() {
        if (!this.io) {
            throw new Error("socket.io is not initialized");
        }
        return this.io;
    }
}

module.exports = Socket;
    
