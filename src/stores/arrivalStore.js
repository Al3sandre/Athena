import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';
import { useProductStore } from '@/stores/productStore';

export const useArrivalStore = defineStore('arrivalStore', {
    state: () => ({
        arrivals: [],
    }),

    actions: {
        async fetchArrivals() {
            try {
                const response = await pb.collection('arrivals').getFullList();
                this.arrivals = response;
            } catch (error) {
                console.error('Erreur lors de la récupération des arrivages:', error);
            }
        },

        async fetchArrivalById(arrivalId) {
            try {
                const response = await pb.collection('arrivals').getOne(arrivalId, {
                    expand: 'arrival_product'
                });
                if (!response.arrival_product || !Array.isArray(response.arrival_product)) {
                    throw new Error('Les produits de l\'arrivage ne sont pas disponibles.');
                }
                const arrivalProducts = response.arrival_product;
                const productStore = useProductStore();
                const products = await Promise.all(arrivalProducts.map(async (arrivalProductId) => {
                    try {
                        const arrivalProduct = await pb.collection('arrival_products').getOne(arrivalProductId);
                        const productId = arrivalProduct.product;
                        const product = await productStore.fetchProductById(productId);
                        if (!product) {
                            throw new Error(`Produit avec l'ID ${productId} non trouvé.`);
                        }
                        return {
                            ...product,
                            quantity: arrivalProduct.quantity
                        };
                    } catch (error) {
                        console.error(`Erreur lors de la récupération du produit ${arrivalProductId}:`, error);
                        return null;
                    }
                }));
                response.products = products.filter(product => product !== null);
                console.log('Final products list:', response.products);
                return response;
            } catch (error) {
                console.error('Erreur lors de la récupération de l’arrivage:', error);
                throw error;
            }
        },

        async addArrival(arrivalData) {
            try {
                const response = await pb.collection('arrivals').create(arrivalData);
                this.arrivals.push(response);
                return response;
            } catch (error) {
                console.error('Erreur lors de l’ajout de l’arrivage:', error);
                throw error;
            }
        },

        async addArrivalProduct(arrivalProductData) {
            try {
                const response = await pb.collection('arrival_products').create(arrivalProductData);
                return response;
            } catch (error) {
                console.error('Erreur lors de l’ajout du produit à l’arrivage:', error);
                throw error;
            }
        },

        async updateArrival(arrivalId, arrivalData) {
            try {
                const response = await pb.collection('arrivals').update(`${arrivalId}?_method=PUT`, arrivalData);
                return response;
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l’arrivage:', error);
                throw error;
            }
        },

        async updateProductQuantity(arrivalId, productId, quantity) {
            try {
                console.log(`Updating product quantity for arrival ID: ${arrivalId}, product ID: ${productId}, quantity: ${quantity}`);
                const arrivalProduct = await pb.collection('arrival_products').getFirstListItem({
                    filter: `arrival_id="${arrivalId}" AND product_id="${productId}"`
                });
                if (arrivalProduct) {
                    console.log('Updating existing arrival product:', arrivalProduct);
                    await pb.collection('arrival_products').update(`${arrivalProduct.id}?_method=PUT`, { quantity });
                } else {
                    console.log('Creating new arrival product');
                    await pb.collection('arrival_products').create({
                        arrival_id: arrivalId,
                        product_id: productId,
                        quantity
                    });
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour de la quantité du produit:', error);
                throw error;
            }
        },

        async receptionArrival(arrivalId) {
            try {
                console.log(`Receptioning arrival with ID: ${arrivalId}`);
                const arrival = await this.fetchArrivalById(arrivalId);
                for (const product of arrival.products) {
                    console.log(`Updating stock for product ID: ${product.id}, quantity: ${product.quantity}`);
                    await pb.collection('products').update(`${product.id}?_method=PUT`, {
                        stock: product.stock + product.quantity
                    });
                }
                await pb.collection('arrivals').update(`${arrivalId}?_method=PUT`, { status: 'réceptionné' });
                console.log('Arrival receptioned');
            } catch (error) {
                console.error('Erreur lors de la réception de l’arrivage:', error);
                throw error;
            }
        },

        async unreceptionArrival(arrivalId) {
            try {
                console.log(`Unreceptioning arrival with ID: ${arrivalId}`);
                const arrival = await this.fetchArrivalById(arrivalId);
                for (const product of arrival.products) {
                    console.log(`Updating stock for product ID: ${product.id}, quantity: ${product.quantity}`);
                    await pb.collection('products').update(`${product.id}?_method=PUT`, {
                        stock: product.stock - product.quantity
                    });
                }
                await pb.collection('arrivals').update(`${arrivalId}?_method=PUT`, { status: 'en cours' });
                console.log('Arrival unreceptioned');
            } catch (error) {
                console.error('Erreur lors de la modification du statut de l’arrivage:', error);
                throw error;
            }
        }
    }
});