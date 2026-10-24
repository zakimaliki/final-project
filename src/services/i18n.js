import { computed, reactive } from 'vue'
import { messages } from '@/i18n/messages'

const STORAGE_KEY = 'vintage_language'

function readStoredLanguage() {
  const value = localStorage.getItem(STORAGE_KEY)
  return value === 'ID' ? 'ID' : 'EN'
}

const state = reactive({
  language: readStoredLanguage(),
})

export function t(key) {
  const table = messages[state.language] || messages.EN
  return table[key] || messages.EN[key] || key
}

export function getLanguage() {
  return state.language
}

export function setLanguage(next) {
  state.language = next === 'ID' ? 'ID' : 'EN'
  localStorage.setItem(STORAGE_KEY, state.language)
}

export function toggleLanguage() {
  setLanguage(state.language === 'EN' ? 'ID' : 'EN')
}

export function useI18n() {
  return {
    language: computed(() => state.language),
    t,
    setLanguage,
    toggleLanguage,
  }
}

export const i18nState = state
