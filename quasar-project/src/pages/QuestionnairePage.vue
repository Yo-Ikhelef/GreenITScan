<template>
  <q-page class="flex flex-center">
    <q-form @submit.prevent="onSubmit" class="q-gutter-md my-form">
      <h2 class="h2-style">📧 Usage quotidien</h2>
      <q-input v-model.number="emailSimple" type="number" label="Combien d'emails envoyez-vous par jour ?" min="0" class="input-style" />
      <q-input v-model.number="emailPJ" type="number" label="...avec pièce jointe (1 Mo) ?" min="0" class="input-style" />
      <q-input v-model.number="webQueries" type="number" label="Combien de requêtes web par jour ?" min="0" class="input-style" />
      <q-input v-model.number="streamingVideo" type="number" label="Heures de streaming vidéo par semaine ?" min="0" class="input-style" />
      <q-input v-model.number="streamingAudio" type="number" label="Minutes de musique en streaming par jour ?" min="0" class="input-style" />
      <q-input v-model.number="videoConf" type="number" label="Heures de visioconférence par semaine ?" min="0" class="input-style" />

      <h2 class="q-mt-lg h2-style">🖥️ Équipements possédés ou utilisés cette année</h2>
      <q-input v-model.number="pcCount" type="number" label="Nombre d'ordinateurs portables utilisés cette année ?" min="0" class="input-style" />
      <q-input v-model.number="smartphoneCount" type="number" label="Nombre de smartphones utilisés cette année ?" min="0" class="input-style" />
      <q-input v-model.number="consoleCount" type="number" label="Nombre de consoles de jeu utilisées ?" min="0" class="input-style" />
      <q-input v-model.number="cloudCount" type="number" label="Utilisez-vous des services cloud (Dropbox, Drive, OVH…) ? Si oui, combien de comptes ou services environ ?" min="0" class="input-style" />

      <div class="q-mt-lg flex flex-center">
        <q-btn type="submit" label="Calculer mon empreinte" color="primary" />
      </div>
    </q-form>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const emailSimple = ref(0)
const emailPJ = ref(0)
const webQueries = ref(0)
const streamingVideo = ref(0)
const streamingAudio = ref(0)
const videoConf = ref(0)
const pcCount = ref(0)
const smartphoneCount = ref(0)
const consoleCount = ref(0)
const cloudCount = ref(0)

function onSubmit() {
  console.log({
    emailSimple: emailSimple.value,
    emailPJ: emailPJ.value,
    webQueries: webQueries.value,
    streamingVideo: streamingVideo.value,
    streamingAudio: streamingAudio.value,
    videoConf: videoConf.value,
    pcCount: pcCount.value,
    smartphoneCount: smartphoneCount.value,
    consoleCount: consoleCount.value,
    cloudCount: cloudCount.value
  })
}
</script>

<style scoped>
h2 {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>