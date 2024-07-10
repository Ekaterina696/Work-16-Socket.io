<template>
  <div class="home">
    <div v-if="!isLoggedIn">
      <h1>Авторизация / Регистрация</h1>
      <input type="text" v-model="username" placeholder="Имя пользователя" />
      <input type="password" v-model="password" placeholder="Пароль" />
      <button @click="login">Войти</button>
      <button @click="register">Зарегистрироваться</button>
    </div>
    <div v-else>
      <h1>Чат</h1>
      <input type="number" v-model="room_id" />
      <input type="text" v-model="message" />
      <button class="btn" @click="send">Отправить</button>
      <div v-if="userCount">Users online in this room: {{ userCount }}</div>
      <div v-for="msg in messages" :key="msg.id">
        <strong>{{ msg.user_id }}:</strong> {{ msg.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client'

export default {
  data () {
    return {
      username: '',
      password: '',
      isLoggedIn: false,
      message: null,
      room_id: 1,
      userCount: 0,
      messages: [],
      socket: io('http://localhost:3001')
    }
  },
  created () {
    this.socket.on('loginResult', (data) => {
      if (data.success) {
        this.isLoggedIn = true
        this.socket.emit('joinRoom', { room_id: this.room_id })
      } else {
        alert('Неверное имя пользователя или пароль')
      }
    })

    this.socket.on('registerResult', (data) => {
      if (data.success) {
        alert('Регистрация успешна')
      } else {
        alert('Ошибка при регистрации')
      }
    })

    this.socket.on('userCount', (data) => {
      if (data.room_id === this.room_id) {
        this.userCount = data.count
      }
    })

    this.socket.on('message', (data) => {
      this.messages.push(data)
    })

    this.socket.on('history', (data) => {
      this.messages = data.reverse()
    })
  },
  methods: {
    login () {
      this.socket.emit('login', { username: this.username, password: this.password })
    },
    register () {
      this.socket.emit('register', { username: this.username, password: this.password })
    },
    send () {
      this.socket.emit('sendMessage', {
        room_id: this.room_id,
        message: this.message
      })
      this.message = null // Очистка поля ввода после отправки сообщения
    }
  }
}
</script>
