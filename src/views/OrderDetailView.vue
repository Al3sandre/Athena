<template>
    <div class="p-6 bg-gray-100 min-h-screen">
        <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Détails de la Commande</h1>

        <!-- Détails de la commande -->
        <div v-if="order" class="bg-white p-6 rounded-lg shadow-md">
            <div class="mb-4">
                <p><strong>ID de la commande :</strong> {{ order.id }}</p>
                <p><strong>Utilisateur :</strong> {{ user?.name || 'Utilisateur inconnu' }}</p>
                <p><strong>Statut :</strong>
                    <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-semibold">
                        {{ order.status }}
                    </span>
                </p>
                <p><strong>Montant total :</strong> {{ calculateTotalCost() }} €</p>
            </div>

            <!-- Modification du statut -->
            <div class="mt-4">
                <h2 class="text-xl font-semibold mb-2">Modifier le statut</h2>
                <div class="flex space-x-4">
                    <button v-for="status in orderStatuses" :key="status" @click="updateOrderStatus(status)" :class="[
                        'px-4 py-2 rounded text-white font-semibold',
                        order.status === status ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
                    ]">
                        {{ status }}
                    </button>
                </div>
            </div>

            <!-- Produits -->
            <h2 class="text-xl font-semibold mt-6 mb-4">Produits</h2>
            <div v-if="orderItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="item in orderItems" :key="item.id" class="bg-gray-50 p-4 rounded-lg shadow-md">
                    <img :src="getProductImage(item.product?.image)" alt="Produit"
                        class="w-32 h-32 mx-auto object-contain rounded-md mb-4 bg-gray-100 border border-gray-300">
                    <p><strong>Produit :</strong> {{ item.product?.name || 'Produit inconnu' }}</p>
                    <p><strong>Quantité :</strong> {{ item.quantity }}</p>
                    <p><strong>Prix unitaire :</strong> {{ item.price }} €</p>
                    <p><strong>Sous-total :</strong> {{ (item.quantity * item.price).toFixed(2) }} €</p>
                </div>
            </div>
            <p v-else class="text-gray-500">Aucun produit dans cette commande.</p>

            <!-- Génération de la facture -->
            <div v-if="order.status === 'livrer'" class="mt-6">
                <button @click="generateInvoice"
                    class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-md">
                    Générer la facture
                </button>
            </div>
        </div>

        <!-- Chargement -->
        <div v-else>
            <p class="text-center text-gray-500">Chargement des détails de la commande...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import jsPDF from 'jspdf';

const route = useRoute();
const orderStore = useOrderStore();
const userStore = useUserStore();
const order = ref(null);
const orderItems = ref([]);
const user = ref(null);
const orderStatuses = ['en cours', 'en transfert', 'en preparation', 'livrer'];

const fetchOrderDetails = async () => {
    try {
        order.value = await orderStore.fetchOrderById(route.params.id);
        orderItems.value = order.value.items.map((item) => ({
            ...item,
            price: parseFloat(item.price) || 0 // Convertit `price` en nombre ou définit 0 par défaut
        }));
        user.value = await userStore.fetchUserById(order.value.user_id);
    } catch (error) {
        console.error('Erreur lors du chargement des détails de la commande :', error);
    }
};

const calculateTotalCost = () => {
    return orderItems.value.reduce((total, item) => {
        return total + item.quantity * item.price; // `price` est maintenant un nombre
    }, 0).toFixed(2);
};

const updateOrderStatus = async (status) => {
    try {
        await orderStore.updateOrder(order.value.id, { status });
        order.value.status = status;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la commande :', error);
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 'en cours':
            return 'bg-yellow-100 text-yellow-800';
        case 'en transfert':
            return 'bg-purple-100 text-purple-800';
        case 'en preparation':
            return 'bg-blue-100 text-blue-800';
        case 'livrer':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getProductImage = (imagePath) => {
    if (!imagePath) {
        return '/images/placeholder.png';
    }
    return `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${imagePath}`;
};

const generateInvoice = () => {
    if (order.value.status !== 'livrer') {
        console.error('La facture ne peut être générée que lorsque le statut est "livrer".');
        return;
    }

    const doc = new jsPDF();

    // Titre de la facture
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('Facture', 105, 20, { align: 'center' });

    // Informations sur la commande
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`ID de la commande : ${order.value.id}`, 20, 40);
    doc.text(`Nom du client : ${user.value?.name || 'Utilisateur inconnu'}`, 20, 50);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, 20, 60);

    // Ligne de séparation
    doc.setDrawColor(200);
    doc.line(20, 65, 190, 65);

    // Tableau des produits
    let startY = 80;
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Détails des produits', 20, startY - 10);

    // En-tête du tableau
    doc.setFontSize(12);
    doc.setFillColor(230, 230, 230);
    doc.rect(20, startY, 170, 10, 'F'); // Fond gris clair
    doc.text('Produit', 25, startY + 7);
    doc.text('Quantité', 90, startY + 7, { align: 'right' });
    doc.text('Prix unitaire', 130, startY + 7, { align: 'right' });
    doc.text('Sous-total', 180, startY + 7, { align: 'right' });

    startY += 15;

    // Contenu du tableau
    orderItems.value.forEach((item) => {
        const productName = item.product?.name || 'Produit inconnu';
        const quantity = item.quantity || 0;
        const price = item.price; // `price` est maintenant un nombre
        const subtotal = quantity * price;

        // Ajoutez les données au tableau
        doc.text(productName, 25, startY);
        doc.text(`${quantity}`, 90, startY, { align: 'right' });
        doc.text(`${price.toFixed(2)} €`, 130, startY, { align: 'right' });
        doc.text(`${subtotal.toFixed(2)} €`, 180, startY, { align: 'right' });

        startY += 10;

        // Ajoutez une ligne de séparation entre les produits
        doc.setDrawColor(220);
        doc.line(20, startY - 5, 190, startY - 5);
    });

    // Montant total
    startY += 10;
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text(`Montant total : ${calculateTotalCost()} €`, 20, startY);

    // Pied de page
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Merci pour votre achat !', 105, 290, { align: 'center' });

    // Générer et télécharger le PDF
    doc.save(`Facture_Commande_${order.value.id}.pdf`);
};

onMounted(() => {
    fetchOrderDetails();
});
</script>