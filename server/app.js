const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Настройка подключения к MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chat_db'
};

let connection;

async function connectToDatabase() {
    connection = await mysql.createConnection(dbConfig);
}

connectToDatabase();

// Хранение пользователей онлайн
const users = new Map();

// Настройка CORS
const corsOptions = {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
};
app.use(cors(corsOptions));

const io = socketIo(server, {
    cors: corsOptions
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('register', async (userData) => {
        if (userData.username === undefined || userData.password === undefined) {
            socket.emit('registerResult', { success: false, message: 'Username and password must be provided' });
            return;
        }
        // Регистрация пользователя в базе данных
        try {
            const [result] = await connection.execute(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [userData.username, userData.password]
            );
            socket.emit('registerResult', { success: result.affectedRows > 0 });
        } catch (error) {
            socket.emit('registerResult', { success: false, message: 'Error registering user' });
        }
    });

    socket.on('login', async (userData) => {
        if (userData.username === undefined || userData.password === undefined) {
            socket.emit('loginResult', { success: false, message: 'Username and password must be provided' });
            return;
        }
        // Авторизация пользователя
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE username = ? AND password = ?',
            [userData.username, userData.password]
        );
        if (rows.length > 0) {
            users.set(socket.id, rows[0].id);
            socket.emit('loginResult', { success: true, userId: rows[0].id });
        } else {
            socket.emit('loginResult', { success: false });
        }
    });

    socket.on('joinRoom', async (data) => {
        if (data.room_id === undefined) {
            console.error('Room ID must be provided');
            return;
        }
        socket.join(data.room_id);
        io.to(data.room_id).emit('userCount', { room_id: data.room_id, count: io.sockets.adapter.rooms.get(data.room_id)?.size || 0 });

        // Загрузка истории сообщений для комнаты
        const [messages] = await connection.execute(
            'SELECT * FROM messages WHERE room_id = ? ORDER BY id DESC LIMIT 50',
            [data.room_id]
        );
        socket.emit('history', messages);
    });

    socket.on('sendMessage', async (data) => {
        const user_id = users.get(socket.id);
        if (user_id === undefined || data.room_id === undefined || data.message === undefined) {
            console.error('User ID, Room ID, and Message must be provided');
            return;
        }
        // Сохранение сообщения в базу данных
        const [result] = await connection.execute(
            'INSERT INTO messages (user_id, room_id, message) VALUES (?, ?, ?)',
            [user_id, data.room_id, data.message]
        );
        io.to(data.room_id).emit('message', { id: result.insertId, user_id: user_id, message: data.message });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        users.delete(socket.id);
    });
});

server.listen(3001, () => console.log('Server running on port 3001'));
