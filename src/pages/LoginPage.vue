<template>
  <div class="auth-page login-page">
    <header class="auth-header">
      <button class="top-link" type="button" @click="goToLogin">{{ t('login') }}</button>
      <div class="brand-block" @click="goHome">
        <img src="@/assets/img/LogoHorizontal.png" alt="Vintage logo" class="brand-logo" />
      </div>
      <button class="language-switch" type="button" @click="switchLanguage">
        {{ language }} <span>▾</span>
      </button>
    </header>

    <main class="auth-main">
      <div class="auth-card login-card">
        <h1>{{ t('loginTitle') }}</h1>
        <p class="subtitle">{{ t('enterDetails') }}</p>
        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <form @submit.prevent="handleLogin">
          <div class="field-group">
            <label for="login-email">{{ t('email') }} <span class="required">*</span></label>
            <input id="login-email" v-model="form.email" type="email" :placeholder="t('enterEmail')" required />
          </div>

          <div class="field-group">
            <label for="login-password">{{ t('password') }} <span class="required">*</span></label>
            <div class="password-wrap">
              <input
                id="login-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="t('enterPassword')"
                required
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
                <span>{{ showPassword ? '🙈' : '👁' }}</span>
              </button>
            </div>
          </div>

          <button class="primary-btn" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? t('pleaseWait') : t('continue') }}
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginAccount, mapAuthError } from '@/services/auth'
import { useI18n } from '@/services/i18n'

const router = useRouter()
const { language, t, toggleLanguage: switchLanguage } = useI18n()
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const form = reactive({ email: '', password: '' })

function goHome() {
  router.push({ name: 'home' })
}

function goToLogin() {
  router.push({ name: 'login' })
}

function goAfterLogin() {
  const redirect = router.currentRoute.value.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    router.push(redirect)
    return
  }
  router.push({ name: 'home' })
}

async function handleLogin() {
  const email = form.email.trim()
  const password = form.password

  errorMessage.value = ''
  if (!email || !password) return

  isSubmitting.value = true
  try {
    await loginAccount(email, password)
    goAfterLogin()
  } catch (error) {
    errorMessage.value = mapAuthError(error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.auth-page {
  min-height: 100vh;
  background: #f1f1f1;
  color: #2f2f2f;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.auth-header {
  height: 72px;
  background: #1f1f1f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 0 18px;
  color: white;
}

.top-link {
  background: transparent;
  border: none;
  color: #f4f4f4;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
}

.brand-block {
  display: flex;
  align-items: center;
  margin-left: 10px;
  margin-right: auto;
  cursor: pointer;
}

.brand-logo {
  display: block;
  height: 28px;
  width: auto;
  object-fit: contain;
}

.language-switch {
  background: transparent;
  border: none;
  color: #dfe3e6;
  font-size: 15px;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
}

.auth-main {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 72px);
  padding: 32px 16px;
}

.auth-card {
  width: min(100%, 420px);
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  padding: 26px 26px 20px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.02);
}

.login-card h1 {
  margin: 0 0 10px;
  font-size: 22px;
  text-align: center;
  color: #242424;
  font-weight: 500;
}

.subtitle {
  margin: 0 0 18px;
  text-align: center;
  color: #656565;
  font-size: 14px;
}

.form-error {
  margin: -8px 0 14px;
  color: #b42318;
  font-size: 13px;
  text-align: center;
}

.field-group {
  margin-bottom: 18px;
}

.field-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #2f2f2f;
  font-weight: 600;
}

.required {
  color: #d75d5d;
}

.field-group input {
  width: 100%;
  height: 42px;
  border: 1px solid #d2d2d2;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.3);
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  outline: none;
}

.field-group input:focus {
  border-color: #2ab3c1;
  box-shadow: 0 0 0 2px rgba(42, 179, 193, 0.1);
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  padding-right: 42px;
}

.password-toggle {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #777;
  font-size: 16px;
  cursor: pointer;
}

.primary-btn {
  width: 100%;
  border: none;
  border-radius: 4px;
  background: #1ab0c5;
  color: white;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.2s ease;
}

.primary-btn:hover {
  opacity: 0.95;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 520px) {
  .auth-header {
    padding: 0 16px;
  }

  .brand-name {
    font-size: 22px;
  }

  .auth-card {
    padding: 20px 18px 18px;
  }
}
</style>
