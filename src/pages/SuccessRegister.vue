<template>
  <div class="success-page">
    <div class="success-modal">
      <div class="plane-icon" aria-hidden="true">✈</div>
      <h1>Successfully Register</h1>
      <p>
        Thank you for register at vintage. Start find your favorite pre-loved product here.
      </p>
      <button type="button" @click="goHome">Go to Home Page</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.success-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: rgba(18, 18, 18, 0.7);
  padding: 24px;
}

.success-modal {
  width: min(100%, 420px);
  background: rgba(255, 255, 255, 0.96);
  border-radius: 10px;
  padding: 32px 28px 28px;
  text-align: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.plane-icon {
  font-size: 58px;
  line-height: 1;
  margin-bottom: 18px;
  color: #1ab0c5;
  transform: rotate(-10deg);
}

.success-modal h1 {
  margin: 0 0 14px;
  color: #2d2d2d;
  font-size: 28px;
  font-weight: 600;
}

.success-modal p {
  margin: 0 0 22px;
  color: #4f4f4f;
  font-size: 14px;
  line-height: 1.6;
}

.success-modal button {
  width: 100%;
  height: 42px;
  border: none;
  border-radius: 4px;
  background: #1ab0c5;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
