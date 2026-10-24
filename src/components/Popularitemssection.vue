<section class="section">
            <div class="section-header">
              <h3>Popular items</h3>
              <a href="#" class="see-all-link" @click.prevent="navigateTo('all')">See all</a>
            </div>
            <div class="product-grid">
              <div v-for="(item, index) in popularProducts" :key="'pop-' + index" class="product-card">
                <div class="image-wrapper">
                  <img :src="item.image" :alt="item.name" />
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
  </section>