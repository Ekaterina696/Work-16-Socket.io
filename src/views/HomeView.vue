<template>
  <div class="home">
    <h1>Chat</h1>
    <input type="text" v-model="message">
    <button class="btn" @click="send">Отправить</button>
  </div>
</template>

<script>
import HelloWorld from '@/components/HelloWorld.vue'

const { io } = require('socket.io-client')
const socket = io('http://localhost:3001')

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  },
  data () {
    return {
      message: null
    }
  },
  methods: {
    send () {
      socket.emit('message', this.message)
    }
  }
}
</script>
