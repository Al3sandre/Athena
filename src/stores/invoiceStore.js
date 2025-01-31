import { defineStore } from 'pinia';
import { invoices as mockInvoices } from '@/mock/invoices';

export const useInvoiceStore = defineStore('invoiceStore', {
  state: () => ({
    invoices: [...mockInvoices]
  }),
  actions: {
    addInvoice(invoice) {
      this.invoices.push({ id: Date.now(), ...invoice });
    }
  }
});
