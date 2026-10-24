<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-col">
        <h4>Vintage</h4>
        <ul>
          <li><a href="#">{{ t('aboutUs') }}</a></li>
          <li><a href="#">{{ t('sustainability') }}</a></li>
          <li><a href="#">{{ t('blog') }}</a></li>
          <li><a href="#">{{ t('advertising') }}</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>{{ t('discover') }}</h4>
        <ul>
          <li><a href="#">{{ t('howItWorks') }}</a></li>
          <li><a href="#">{{ t('helpCenter') }}</a></li>
          <li><a href="#">{{ t('infoboard') }}</a></li>
          <li><a href="#">{{ t('mobileApps') }}</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>{{ t('help') }}</h4>
        <ul>
          <li><a href="#">{{ t('helpCenter') }}</a></li>
          <li><a href="#">{{ t('buying') }}</a></li>
          <li><a href="#">{{ t('trustSafety') }}</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>{{ t('community') }}</h4>
        <ul>
          <li><a href="#">{{ t('forum') }}</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="social-links">
        <a href="#" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
        <a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a>
      </div>
      <p class="copyright">© Vintage, 2023</p>
    </div>
  </footer>
</template>

<script>
import { i18nState, t } from '@/services/i18n'

export default {
  name: 'Footer',
  computed: {
    language() {
      return i18nState.language
    },
  },
  methods: {
    t,
  },
}
</script>
