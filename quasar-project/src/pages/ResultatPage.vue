<template>
  <q-page class="flex flex-center">
    <div><CardResult title="Votre empreinte carbone" subtitle="Vos réponses" :items="resultQuestions" :calculResults="simulationStore.result" resultTitle="Résultat"/>
      <div class="q-mt-xl flex flex-center">
        <q-btn color="primary" label="Nouveau questionnaire" @click="goToQuestionnaire" unelevated/>
      </div>
    </div>  
  </q-page>
</template>

<script setup>
import CardResult from 'components/CardResult.vue'
import { useSimulationStore } from 'src/stores/simulationStore'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const simulationStore = useSimulationStore()
const router = useRouter()

const iconMap = {
  email: "mdi-email",
  email_pj: "mdi-email-fast",
  navigation_web: "mdi-web",
  streaming_video: "mdi-youtube",
  streaming_audio: "mdi-music",
  visioconference: "mdi-video",
  pc: "mdi-laptop",
  smartphone: "mdi-cellphone",
  console: "mdi-gamepad-variant",
  cloud_service: "mdi-cloud"
}

// Génère dynamiquement les réponses aux questions
const resultQuestions = computed(() =>
  simulationStore.result?.details?.map(detail => ({
    label: detail.label,
    value: detail.value,
    icon: iconMap[detail.key] || "mdi-information"
  })) || []
)

function goToQuestionnaire() {
  router.push({ name: 'questionnaire' })
}
</script>