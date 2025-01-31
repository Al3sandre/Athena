import { defineStore } from 'pinia';
import { products as mockProducts } from '../mock/products';

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [...mockProducts] // Initialisation avec les données mockées
  }),
  actions: {
    addProduct(product) {
      this.products.push({ id: Date.now(), ...product });
    },
    deleteProduct(id) {
      this.products = this.products.filter(p => p.id !== id);
    },
    updateProduct(updatedProduct) {
      const index = this.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        this.products[index] = updatedProduct;
      }
    }
  }
});
