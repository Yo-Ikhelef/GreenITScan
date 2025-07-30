<template>
  <q-card class="result-card">
    <q-card-section>
      <div class="text-h5 text-center q-mb-md">{{ title }}</div>
      <div class="text-subtitle2 text-center q-mb-lg">{{ subtitle }}</div>
      <div class="result-grid">
        <div class="result-item" v-for="item in items" :key="item.label">
          <q-icon :name="item.icon" size="32px" class="q-mr-sm icon" />
          <div>
            <div class="result-label">{{ item.label }}</div>
            <div class="result-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  items: Array // [{ label, value, icon, color }]
})
</script>

<style scoped>
.result-card {
  max-width: 700px;
  margin: 32px auto;
  background: #1E2438;
  color: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  border-radius: 16px;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 32px;
}

@media (max-width: 600px) {
  .result-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.result-item {
  display: flex;
  align-items: center;
  background: #636D92;
  border-radius: 8px;
  padding: 12px 16px;
}

.result-label {
  font-size: 1rem;
  color: #fff;
}

.result-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #1E2438;
}

.text-h5 {
  color: #42a5f5;
}

.text-subtitle2 {
  color: #b0bec5;
}

.icon {
  color: #b0bec5
}
</style>