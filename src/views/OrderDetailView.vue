<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Détails de la Commande</h1>
        <div v-if="order" class="bg-white p-4 rounded shadow-md">
            <p class="mb-2"><strong>ID de la commande :</strong> {{ order.id }}</p>
            <p class="mb-2"><strong>Utilisateur :</strong> {{ userName }}</p>
            <p class="mb-2"><strong>Produits :</strong></p>
            <ul class="space-y-4 mb-4">
                <li v-for="product in products" :key="product.id" class="flex items-center space-x-4">
                    <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }"
                        class="flex items-center space-x-2">
                        <img :src="product.image" alt="Image du produit" class="w-12 h-12 object-cover rounded" />
                        <span class="font-semibold">{{ product.name }}</span>
                    </router-link>
                    <div>
                        <p>Quantité : {{ product.quantity }}</p>
                        <p>Tarif unitaire : {{ product.price.toFixed(2) }} €</p>
                        <p>Prix total : {{ (product.price * product.quantity).toFixed(2) }} €</p>
                    </div>
                </li>
            </ul>
            <p class="mb-2"><strong>Montant total de la commande :</strong> {{ totalOrderPrice }} €</p>
            <p class="mb-2"><strong>Statut :</strong>
                <select v-if="isAdmin" v-model="order.status" @change="updateOrderStatus"
                    class="border rounded px-2 py-1">
                    <option v-for="status in orderStatuses" :key="status" :value="status">{{ status }}</option>
                </select>
                <span v-else>{{ order.status }}</span>
            </p>
            <p class="mb-2"><strong>Créé le :</strong> {{ new Date(order.created).toLocaleString() }}</p>
            <p class="mb-2"><strong>Mis à jour le :</strong> {{ new Date(order.updated).toLocaleString() }}</p>
            <button v-if="order.status === 'livré'" @click="generateInvoice"
                class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Générer la facture
            </button>
        </div>
        <div v-else>
            <p>Chargement des détails de la commande...</p>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { useProductStore } from '@/stores/productStore';
import { ref, computed, onMounted } from 'vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const route = useRoute();
const orderStore = useOrderStore();
const userStore = useUserStore();
const productStore = useProductStore();
const order = ref(null);
const userName = ref('');
const products = ref([]);
const isAdmin = computed(() => userStore.isAdmin());
const orderStatuses = ['en cours', 'préparé', 'en transfert', 'livré'];

const fetchOrder = async () => {
    order.value = await orderStore.fetchOrderById(route.params.id);
    if (order.value) {
        const user = await userStore.fetchUserById(order.value.user_id);
        userName.value = user ? user.name : 'Utilisateur inconnu';
        products.value = await Promise.all(order.value.product.map(async (product) => {
            const productDetails = await productStore.fetchProductById(product.product_id);
            return {
                ...productDetails,
                quantity: product.quantity,
                image: productStore.getImageUrl(productDetails)
            };
        }));
    }
};

const updateOrderStatus = async () => {
    await orderStore.updateOrder(order.value.id, { status: order.value.status });
};

const totalOrderPrice = computed(() => {
    const total = products.value.reduce((total, product) => {
        return total + (product.price * product.quantity);
    }, 0);
    return total.toFixed(2);
});

const generateInvoice = () => {
    const doc = new jsPDF();
    doc.text(`Facture pour la commande #${order.value.id}`, 10, 10);
    doc.text(`Utilisateur : ${userName.value}`, 10, 20);
    doc.text(`Date de création : ${new Date(order.value.created).toLocaleString()}`, 10, 30);
    doc.text(`Date de mise à jour : ${new Date(order.value.updated).toLocaleString()}`, 10, 40);

    const tableColumn = ["Produit", "Quantité", "Tarif unitaire (€)", "Prix total (€)"];
    const tableRows = [];

    products.value.forEach(product => {
        const productData = [
            product.name,
            product.quantity,
            product.price.toFixed(2),
            (product.price * product.quantity).toFixed(2)
        ];
        tableRows.push(productData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
        styles: { fontSize: 10 }
    });

    doc.text(`Montant total de la commande : ${totalOrderPrice.value} €`, 10, doc.lastAutoTable.finalY + 10);
    doc.save(`facture_commande_${order.value.id}.pdf`);
};

onMounted(() => {
    fetchOrder();
});
</script>