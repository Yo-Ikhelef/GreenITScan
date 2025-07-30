<template>
  <q-header elevated class="custom-nav">
    <q-toolbar>
      <q-toolbar-title>Green It Scan</q-toolbar-title>
      <q-space />
      <template v-if="!isAuthenticated">
        <q-btn v-if="isLogin" label="Inscription" flat @click="goToRegister" aria-label="Inscription" />
        <q-btn v-else-if="isRegister" label="Connexion" flat @click="goToLogin" aria-label="Connexion" />
      </template>
      <q-btn v-else label="Déconnexion" flat @click="logout" aria-label="Déconnexion" />
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useLoginStore } from '../stores/loginStore'

const route = useRoute()
const router = useRouter()
const loginStore = useLoginStore()

const isAuthenticated = computed(() => loginStore.isAuthenticated)
const isLogin = computed(() => route.name === 'login')
const isRegister = computed(() => route.name === 'register')

function goToRegister() {
  router.push({ name: 'register' })
}

function goToLogin() {
  router.push({ name: 'login' })
}

function logout() {
  loginStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.custom-nav {
  background-color: #0D1228;
  color: white;
}
</style>