<template>
  <div class="home">
    <h1>Chat</h1>
    <input type="number" v-model="room_id"/>
    <input type="text" v-model="message">
    <button class="btn" @click="send">Отправить</button>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'

const { io } = require('socket.io-client')
const socket = io('http://localhost:3001')

socket.on('message', (data) => {
  console.log(data)
})

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  },
  data () {
    return {
      message: null,
      room_id: 1
    }
  },
  methods: {
    send () {
      socket.emit('message', {
        message: this.message,
        room_id: this.room_id
      })
    }
  }
}
</script>
