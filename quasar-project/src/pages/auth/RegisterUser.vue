<template>
    <q-page class="flex flex-center">
        <q-form @submit.prevent="onSubmit" class="q-gutter-md my-form">
            <div class="text-h5 text-center q-mb-md white-color">Inscription</div>
            <q-input v-model="email" label="Email" type="email" placeholder="Entrez votre email" required  class="input-style"/>
            <q-input v-model="password" label="Mot de passe" type="password" placeholder="Entrez votre mot de passe"
                required class="input-style"/>
            <q-input v-model="confirmPassword" label="Confirmer le mot de passe" type="password"
                placeholder="Confirmez votre mot de passe" required class="input-style"/>
            <div>
                <q-btn type="submit" label="Inscription" color="primary" class="btn-style" />
            </div>
        </q-form>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const onSubmit = () => {
    if (password.value !== confirmPassword.value) {
        // Ajoute ici une notification ou un message d'erreur
        alert('Les mots de passe ne correspondent pas.')
        return
    }
}
</script>