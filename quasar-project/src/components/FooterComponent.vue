<template>
  <q-footer elevated class="footer">
    <div class="footer-content">
      <span>A propos</span>
      <q-space />
      <span>© 2025 Green It Scan</span>
      <q-space />
      <a href="https://github.com/MatITAka/GreenITScan" target="_blank" rel="noopener" class="footer-link">
        <q-icon name="fab fa-github" size="20px" />
        <span>GitHub</span>
      </a>
    </div>
  </q-footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  background: #0D1228;
  color: #fff;
  padding: 10px 24px;
  font-size: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  /* height: 20%; */
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.footer-link {
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #00e676;
}
</style>