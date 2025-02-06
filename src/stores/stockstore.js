import { defineStore } from 'pinia'
import pb from '@/api/pocketbase'

export const useStockStore = defineStore('stock', {
  state: () => ({
    stockArrivals: []
  }),
  actions: {
    async getStockArrivals() {
      this.stockArrivals = await pb.collection('stock_arrivals').getFullList()
      return this.stockArrivals
    },
    async addStockArrival(data) {
      return await pb.collection('stock_arrivals').create(data)
    }
  }
})
