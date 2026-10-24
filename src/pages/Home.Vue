<template>
    <div class="vintage-app">
      <h2 class="text-primary">Lorem ipsum dolor sit amet consectetur adipisicing elit. Recusandae, tempore!</h2>
      <!-- NAVBAR / HEADER -->
    <Navbar v-model="searchQuery" @search="handleSearch" />
  
      <!-- MAIN CONTENT AREA -->
      <main class="main-content">
        <p v-if="isLoadingProducts" class="product-status">{{ t('loadingProducts') }}</p>
        <p v-else-if="productError" class="product-status">{{ t(productError) }}</p>
        
        <!-- PAGE 1 & 2: HOME PAGE (HERO + POPULAR + BRANDS + NEW PRODUCTS) -->
        <div v-if="currentView === 'home'">
          <!-- Hero Banner -->
          <section class="hero-banner">
            <img src="@/assets/img/home-page.jpg" alt="Hero Background" class="hero-bg" />
            <div class="hero-card">
              <h2 class="hero-title">{{ t('heroTitle') }}</h2>
              <button class="btn-primary" @click="navigateTo('all')">{{ t('shopNow') }}</button>
            </div>
          </section>
  
          <!-- Popular Items Section -->
          <section class="section">
            <div class="section-header">
              <h3>{{ t('popularItems') }}</h3>
              <a href="#" class="see-all-link" @click.prevent="navigateTo('all')">{{ t('seeAll') }}</a>
            </div>
            <div class="product-grid">
              <div v-for="(item, index) in popularProducts" :key="'pop-' + index" class="product-card" @click="openDetail(item)">
                <div class="image-wrapper">
                  <img :src="item.image" :alt="item.name" @error="handleImageError" />
                </div>
                <div class="product-info">
                  <p class="price">{{ item.price }}</p>
                  <p class="name">{{ item.name }}</p>
                  <div class="meta">
                    <span>{{ item.size }}</span>
                    <span class="likes">🤍 {{ item.likes }}</span>
                  </div>
                </div>
              </div>
  
              <!-- "See All Product" Cyan Card Banner -->
              <div class="see-all-card" @click="navigateTo('all')">
                <span class="see-all-label">{{ t('seeAllProduct') }}</span>
              </div>
            </div>
          </section>
  
          <!-- Shop By Brand Section -->
          <section class="section">
            <h3>{{ t('shopByBrand') }}</h3>
            <div class="brand-list">
              <button 
                v-for="brand in brands" 
                :key="brand" 
                class="brand-chip"
                @click="filterByBrand(brand)"
              >
                {{ brand }}
              </button>
            </div>
          </section>
  
          <!-- New Product Section -->
          <section class="section">
            <div class="section-header">
              <h3>{{ t('newProduct') }}</h3>
              <a href="#" class="see-all-link" @click.prevent="navigateTo('all')">{{ t('seeAll') }}</a>
            </div>
            <div class="product-grid">
              <div v-for="(item, index) in newProducts" :key="'new-' + index" class="product-card" @click="openDetail(item)">
                <div class="image-wrapper">
                  <img :src="item.image" :alt="item.name" @error="handleImageError" />
                </div>
                <div class="product-info">
                  <p class="price">{{ item.price }}</p>
                  <p class="name">{{ item.name }}</p>
                  <div class="meta">
                    <span>{{ item.size }}</span>
                    <span class="likes">🤍 {{ item.likes }}</span>
                  </div>
                </div>
              </div>
  
              <!-- "See All New Product" Cyan Card Banner -->
              <div class="see-all-card" @click="navigateTo('all')">
                <span class="see-all-label">{{ t('seeAllNewProduct') }}</span>
              </div>
            </div>
          </section>
        </div>
  
        <!-- PAGE 3, 4, 5, 6: PRODUCTS VIEW (ALL, SEARCH, BRAND, EMPTY) -->
        <div v-else class="products-page">
          <!-- Search Keyword Filter Tag -->
          <div class="page-title-bar">
            <h2>{{ pageTitle }}</h2>
            <div v-if="activeFilterTag" class="filter-tag">
              <span>{{ activeFilterTag }}</span>
              <button class="btn-remove-tag" @click="clearFilter">✕</button>
            </div>
          </div>
  
          <!-- EMPTY STATE (Product Not Found) -->
          <div v-if="filteredProducts.length === 0" class="empty-state">
            <img src="@/assets/img/bag-cross.png" alt="Product Not Found" class="empty-icon" />
            <h3>{{ t('productNotFound') }}</h3>
            <p>{{ t('productNotFoundHint') }}</p>
            <button class="btn-primary" @click="clearFilter">{{ t('resetKeyword') }}</button>
          </div>
  
          <!-- PRODUCT GRID VIEW -->
          <div v-else class="product-grid grid-6-col">
            <div v-for="(item, index) in filteredProducts" :key="'grid-' + index" class="product-card" @click="openDetail(item)">
              <div class="image-wrapper">
                <img :src="item.image" :alt="item.name" @error="handleImageError" />
              </div>
              <div class="product-info">
                <p class="price">{{ item.price }}</p>
                <p class="name">{{ item.name }}</p>
                <div class="meta">
                  <span>{{ item.size }}</span>
                  <span class="likes">🤍 {{ item.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
  
      </main>
  
      <!-- FOOTER -->
    <Footer />
    </div>
  </template>
  
  <script>
  import appLogic from '../script.js'
  import Navbar from '../components/Navbar.vue'
  import Footer from '../components/Footer.vue'
  import { i18nState, t } from '@/services/i18n'

  export default {
    ...appLogic,
    name: 'Home',
    components: {
      Navbar,
      Footer,
    },
    computed: {
      ...appLogic.computed,
      language() {
        return i18nState.language
      },
    },
    methods: {
      ...appLogic.methods,
      t,
    },
  }
  </script>


