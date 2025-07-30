<template>
    <q-page class="flex flex-center">
        <q-form @submit.prevent="onSubmit" class="q-gutter-md my-form">
            <h2 class="h2-style">Inscription</h2>
            <q-input v-model="email" label="Email" type="email" placeholder="Entrez votre email" required  class="input-style"/>
            <q-input v-model="password" label="Mot de passe" type="password" placeholder="Entrez votre mot de passe"
                required class="input-style"/>
            <q-input v-model="confirmPassword" label="Confirmer le mot de passe" type="password"
                placeholder="Confirmez votre mot de passe" required class="input-style"/>
            <div v-if="errorMessage" class="text-negative text-center">
              {{ errorMessage }}
            </div>
            <div>
                <q-btn type="submit" label="Inscription" color="primary" class="btn-style" />
            </div>
        </q-form>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const authStore = useAuthStore()
const router = useRouter()
const errorMessage = ref('')

const onSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.'
    return
  }
  try {
    await authStore.register(email.value, password.value)
    await authStore.login(email.value, password.value)
    router.push({ name: 'questionnaire' })
  } catch {
    errorMessage.value = authStore.error || 'Erreur lors de l\'inscription.'
  }
}
</script>