const express = require('express')
const http = require('http')
const path = require('path')
const socktio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocatonMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socktio(server);

const publicDirPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    console.log('New WebSocket Connection');

    

    socket.on('join', ({ username, roomname }, callback) => {
        const { user, error } = addUser({id: socket.id, username, roomname})

        if (error) {
            return callback(error)
        }

        socket.join(user.roomname)

        socket.emit('message', generateMessage('Admin' ,'Welcome!'));
        socket.broadcast.to(user.roomname).emit('message', generateMessage('Admin', `${user.username} has joined!`));
        io.to(user.roomname).emit('roomData', {
            roomname: user.roomname,
            users: getUsersInRoom(user.roomname)
        })

        callback()
    })

    socket.on('userMessage', (userMsg, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(userMsg)) {
            return callback('Profanity is not allowed!');
        }
        io.to(user.roomname).emit('message', generateMessage(user.username ,userMsg));
        callback('Delivered');
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.roomname).emit('message', generateMessage('Admin', `${user.username} has left the conversation!`));
            io.to(user.roomname).emit('roomData', {
                roomname: user.roomname,
                users: getUsersInRoom(user.roomname)
            })
        } 
    })

    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.roomname).emit('locationMessage', generateLocatonMessage(user.username ,`https://google.com/maps?q=${position.latitude},${position.longitude}`));
        callback()
    })

    
})

server.listen(port, () => {
    console.log(`Server is up at port ${port}`);
})