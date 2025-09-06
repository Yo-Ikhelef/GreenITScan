<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <h2 class="white-style">📧 Usage quotidien actuellement</h2>
        <q-input v-model.number="emailSimple" type="number" label="Combien d'emails envoyez-vous par jour ?" min="0" class="input-style" />
        <q-input v-model.number="emailPJ" type="number" label="...avec pièce jointe (1 Mo) ?" min="0" class="input-style" />
        <q-input v-model.number="webHours" type="number" label="Combien d'heures passez-vous sur internet par jour ?" min="0" class="input-style" />
        <q-input v-model.number="streamingVideo" type="number" label="Heures de streaming vidéo par semaine ?" min="0" class="input-style" />
        <q-input v-model.number="streamingAudio" type="number" label="Minutes de musique en streaming par jour ?" min="0" class="input-style" />
        <q-input v-model.number="videoConf" type="number" label="Heures de visioconférence par semaine ?" min="0" class="input-style" />

        <h2 class="q-mt-lg white-style">🖥️ Équipements possédés ou utilisés cette année</h2>
        <q-input v-model.number="pcCount" type="number" label="Nombre d'ordinateurs portables utilisés cette année ?" min="0" class="input-style" />
        <q-input v-model.number="smartphoneCount" type="number" label="Nombre de smartphones utilisés cette année ?" min="0" class="input-style" />
        <q-input v-model.number="consoleCount" type="number" label="Nombre de consoles de jeu utilisées ?" min="0" class="input-style" />
        <q-input v-model.number="cloudAccounts" type="number" label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?" min="0" class="input-style" />

        <div class="q-mt-lg flex flex-center">
          <q-btn type="submit" label="Calculer mon empreinte" color="primary" />
        </div>
      </q-form>
      <div v-if="errorMessage" class="text-negative q-mt-md">{{ errorMessage }}</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useSimulationStore } from 'src/stores/simulationStore'
import { useRouter } from 'vue-router'

const simulationStore = useSimulationStore()
const router = useRouter()
const errorMessage = ref('')

const emailSimple = ref('')
const emailPJ = ref('')
const webHours = ref('')
const streamingVideo = ref('')
const streamingAudio = ref('')
const videoConf = ref('')
const pcCount = ref('')
const smartphoneCount = ref('')
const consoleCount = ref('')
const cloudAccounts = ref('')

const onSubmit = async () => {
  try {
    await simulationStore.submitSimulation({
      emailSimple: emailSimple.value,
      emailPJ: emailPJ.value,
      webHours: webHours.value,
      streamingVideo: streamingVideo.value,
      streamingAudio: streamingAudio.value,
      videoConf: videoConf.value,
      pcCount: pcCount.value,
      smartphoneCount: smartphoneCount.value,
      consoleCount: consoleCount.value,
      cloudAccounts: cloudAccounts.value
    })
    router.push({ name: 'resultat' }) // <-- redirection vers la page résultat
  } catch {
    errorMessage.value = simulationStore.error || "Erreur lors de l'envoi du questionnaire."
  }
}
</script>

<style scoped>
h2 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>
