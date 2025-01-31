import { defineStore } from 'pinia';
import { categories as mockCategories } from '@/mock/categories';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: [...mockCategories]
  })
});
