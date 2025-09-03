import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const useSimulationStore = defineStore('simulation', {
  state: () => ({
    result: null,
    loading: false,
    error: null,
  }),

  actions: {
    async submitSimulation(payload) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('/simulation/new', payload)
        this.result = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.error || error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    clearResult() {
      this.result = null
    }
  }
})