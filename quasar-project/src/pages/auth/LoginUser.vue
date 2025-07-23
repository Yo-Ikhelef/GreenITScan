<template>
  <q-page class="flex flex-center">
    <q-form @submit.prevent="onSubmit" class="q-gutter-md">
      <q-input v-model="email" label="Email" type="email" />
      <q-input v-model="password" label="Password" type="password" />
      <q-checkbox v-model="rememberMe" label="Remember Me" />
      <div class="q-mt-lg q-mb-lg q-ml-xl" >
        <q-btn type="submit" label="Login" color="primary" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
// import { useNotificationsStore } from '../../stores/notificationsStore'
// import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()
// const notificationsStore = useNotificationsStore()
// const $q = useQuasar()
const rememberMe = ref(true)

const onSubmit = async () => {
  try {
    const response = await api.post('http://localhost:8000/api/auth/login', {
      email: email.value,
      password: password.value,
    })

    // Sanctum does not provide an expiration date for the token. JWT does.
    // response.data.expiration is set inside the auth controller
    authStore.setToken(response.data.token, response.data.expiration)
    // if the token is not expired, set the user and redirect to the dashboard
    await authStore.fetchUserWithInfo(response.data.userWithInfo)
    // // Show positive notification
    // notificationsStore.createNotification({
    //   message: 'Login successful! Welcome back.',
    //   type: 'positive',
    //   position: 'top-right',
    //   $q,
    // })

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
      router.push('/dashboard')
    // }
  } catch (error) {
    if (error.response) {
      const statusCode = error.response.status

      if (statusCode === 403) {
        // Deactivated User
      //   notificationsStore.createNotification({
      //     message: 'Your account is deactivated. Please contact your favorite Admin.',
      //     type: 'error',
      //     position: 'top-right',
      //     $q,
      //   })
      // } else if (statusCode === 401) {
      //   // Credentials error
      //   notificationsStore.createNotification({
      //     message: 'Connection failed. Please check your credentials and try again.',
      //     type: 'error',
      //     position: 'top-right',
      //     $q,
      //   })
      }
    } else {
      // No response -> network issue
      // notificationsStore.createNotification({
      //   message: 'Network error. Please check your internet connection.',
      //   type: 'error',
      //   position: 'top-right',
      //   $q,
      // })
    }
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
