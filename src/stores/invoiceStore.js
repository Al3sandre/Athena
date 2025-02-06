import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useInvoiceStore = defineStore('invoiceStore', {
  state: () => ({
    invoices: []
  }),

  actions: {
    // ✅ Récupérer toutes les factures depuis PocketBase
    async fetchInvoices() {
      try {
        this.invoices = await pb.collection('invoices').getFullList();
      } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
      }
    },

    // ✅ Ajouter une facture dans PocketBase
    async addInvoice(invoiceData) {
      try {
        const newInvoice = await pb.collection('invoices').create(invoiceData);
        this.invoices.push(newInvoice); // Ajouter à la liste locale
        return newInvoice;
      } catch (error) {
        console.error('Erreur lors de l’ajout de la facture:', error);
        throw error;
      }
    },

    // ✅ Modifier une facture existante dans PocketBase
    async updateInvoice(invoiceId, updatedData) {
      try {
        const updatedInvoice = await pb.collection('invoices').update(invoiceId, updatedData);
        const index = this.invoices.findIndex(i => i.id === invoiceId);
        if (index !== -1) {
          this.invoices[index] = updatedInvoice;
        }
      } catch (error) {
        console.error('Erreur lors de la modification de la facture:', error);
      }
    },

    // ✅ Supprimer une facture dans PocketBase
    async deleteInvoice(invoiceId) {
      try {
        await pb.collection('invoices').delete(invoiceId);
        this.invoices = this.invoices.filter(i => i.id !== invoiceId);
      } catch (error) {
        console.error('Erreur lors de la suppression de la facture:', error);
      }
    },

    // ✅ Récupérer une facture spécifique
    async fetchInvoiceById(invoiceId) {
      try {
        return await pb.collection('invoices').getOne(invoiceId);
      } catch (error) {
        console.error('Erreur lors de la récupération de la facture:', error);
        return null;
      }
    }
  }
});
