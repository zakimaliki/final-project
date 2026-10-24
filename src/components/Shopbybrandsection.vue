<section class="section">
            <h3>Shop by brand</h3>
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