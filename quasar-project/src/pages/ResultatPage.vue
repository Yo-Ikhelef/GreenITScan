<template>
  <q-page class="flex flex-center">
    <CardResult title="Votre empreinte carbone" subtitle="Estimation basée sur vos réponses" :items="resultItems" />
  </q-page>
</template>

<script setup>
import CardResult from 'components/CardResult.vue'

const resultItems = [
  { label: "Emails envoyés", value: 10, icon: "mdi-email" },
  { label: "Emails avec PJ", value: 2, icon: "mdi-email-fast" },
  { label: "Requêtes web", value: 50, icon: "mdi-web" },
  { label: "Streaming vidéo", value: "5 h/semaine", icon: "mdi-youtube" },
  { label: "Streaming audio", value: "60 min/jour", icon: "mdi-music" },
  { label: "Visioconférence", value: "3 h/semaine", icon: "mdi-video" },
  { label: "PC utilisés", value: 1, icon: "mdi-laptop" },
  { label: "Smartphones", value: 1, icon: "mdi-cellphone" },
  { label: "Consoles", value: 0, icon: "mdi-gamepad-variant" },
  { label: "Comptes cloud", value: 2, icon: "mdi-cloud" }
]
</script>