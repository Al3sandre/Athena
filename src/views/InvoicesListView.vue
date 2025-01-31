<template>
    <div>
        <h1>Liste des Factures</h1>
        <ul>
            <li v-for="invoice in invoices" :key="invoice.id">
                Facture #{{ invoice.id }} - {{ invoice.status }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useInvoiceStore } from '@/stores/invoiceStore';
import { computed } from 'vue';

const invoiceStore = useInvoiceStore();
const invoices = computed(() => invoiceStore.invoices);
</script>