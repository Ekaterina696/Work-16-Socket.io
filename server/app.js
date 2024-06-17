const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:8080",
    }
});


// Маршруты для HTTP
app.get('/', async (req, res) => {
    return res.send(123);
});

app.listen(3000, async () => {
    console.log('Server started');
});


// Запуск сокет-сервера
io.on('connection', (socket) => {
        socket.emit('connected', {
        message: 'Вы успешно подключены!'
    });

    socket.on('message', (arg) => {
        console.log(arg);
    })
});

httpServer.listen(3001);