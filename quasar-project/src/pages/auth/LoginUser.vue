<template>
  <q-page class="flex flex-center">
    <q-form @submit.prevent="onSubmit" class="q-gutter-md my-form">
      <div class="text-h5 text-center q-mb-md white-color">Connexion</div>
      <q-input v-model="email" label="Email" type="email" class="input-style" />
      <q-input v-model="password" label="Password" type="password" class="input-style" />
      <q-checkbox v-model="rememberMe" label="Remember Me" class="white-color"/>
      <div v-if="errorMessage" class="text-negative text-center">
        {{ errorMessage }}
      </div>
      <div>
        <q-btn type="submit" label="Login" color="primary" class="btn-style" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginStore } from '../../stores/loginStore'
// import { useNotificationsStore } from '../../stores/notificationsStore'
// import { useQuasar } from 'quasar'
// import { api } from 'boot/axios'

const email = ref('')
const password = ref('')
const router = useRouter()
const loginStore = useLoginStore()
// const notificationsStore = useNotificationsStore()
// const $q = useQuasar()
const rememberMe = ref(true)
const errorMessage = ref('')

const onSubmit = async () => {
  try {
    await loginStore.login(email.value, password.value);

    // Store the rememberedEmail when the user is logged
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value)
    } else {
      localStorage.removeItem('rememberedEmail')
    }

    // Redirect to the dashboard based on the user's role (GUEST, USER, ADMIN)
    // if (authStore.getRoles.includes('GUEST')) {
    //   router.push('/dashboardGuest')
    // } else {
      router.push('/questionnaire')
    // }
  } catch {
    errorMessage.value = loginStore.error || 'Erreur de connexion. Vérifiez vos identifiants.'

  }
}

onMounted(() => {
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  if (rememberedEmail) {
    email.value = rememberedEmail
    rememberMe.value = true
  }
})
</script>

<style>

.white-color {
  color: white;
}

</style>
