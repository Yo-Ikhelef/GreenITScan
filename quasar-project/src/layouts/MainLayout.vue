<template>
  <q-layout view="lHh Lpr lFf" class="main-bg">
    <HeaderComponent />

    <FooterComponent />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import HeaderComponent from 'components/HeaderComponent.vue'
import FooterComponent from '../components/FooterComponent.vue';
</script>

<style>
.main-bg {
  background: #0D1228; /* Change this to your desired blue color */
  /* min-height: 100vh; Ensure the background covers the full height */
}
</style>
