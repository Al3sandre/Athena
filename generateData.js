import { faker } from '@faker-js/faker';
import PocketBase from 'pocketbase';
import fs from 'fs';
import path from 'path';

// Remplacez par l'URL de votre instance PocketBase
const pb = new PocketBase('http://localhost:8090');

// Remplacez par les informations d'identification de votre utilisateur
const email = 'arsenevalentin.cancale@gmail.com';
const password = 'testtest';

const authenticate = async () => {
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        console.log('Authentification réussie:', authData);
    } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        throw error;
    }
};

const generateFakeCategory = () => {
    return {
        name: faker.commerce.department()
    };
};

const generateFakeProduct = (categoryIds) => {
    if (categoryIds.length === 0) {
        throw new Error("Cannot generate product: categoryIds is empty");
    }
    return {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        stock: faker.number.int({ min: 0, max: 100 }),
        category: faker.helpers.arrayElement(categoryIds), // Utilise un ID de catégorie valide
        image: '' // Laisser vide pour les images
    };
};

const generateFakeStockArrival = (productIds) => {
    if (productIds.length === 0) {
        throw new Error("Cannot generate stock arrival: productIds is empty");
    }
    return {
        product_id: faker.helpers.arrayElement(productIds), // Utilise un ID de produit valide
        quantity: faker.number.int({ min: 1, max: 100 }),
        arrival_date: faker.date.past().toISOString().split('T')[0]
    };
};

const generateFakeOrder = (productIds, userIds) => {
    if (productIds.length === 0) {
        throw new Error("Cannot generate order: productIds is empty");
    }
    if (userIds.length === 0) {
        throw new Error("Cannot generate order: userIds is empty");
    }
    return {
        user_id: faker.helpers.arrayElement(userIds), // Utilise un ID d'utilisateur valide
        product: JSON.stringify([{ product_id: faker.helpers.arrayElement(productIds), quantity: faker.number.int({ min: 1, max: 10 }) }]),
        total_price: faker.commerce.price(),
        status: faker.helpers.arrayElement(['pending', 'completed', 'cancelled'])
    };
};

const generateFakeInvoice = (orderIds) => {
    if (orderIds.length === 0) {
        throw new Error("Cannot generate invoice: orderIds is empty");
    }
    return {
        order_id: faker.helpers.arrayElement(orderIds), // Utilise un ID de commande valide
        amount: faker.commerce.price(),
        due_date: faker.date.future().toISOString().split('T')[0],
        status: faker.helpers.arrayElement(['unpaid', 'paid', 'overdue'])
    };
};

const generateFakeCart = (productIds, userIds) => {
    if (productIds.length === 0) {
        throw new Error("Cannot generate cart: productIds is empty");
    }
    if (userIds.length === 0) {
        throw new Error("Cannot generate cart: userIds is empty");
    }
    return {
        user_id: faker.helpers.arrayElement(userIds), // Utilise un ID d'utilisateur valide
        items: JSON.stringify([{ product_id: faker.helpers.arrayElement(productIds), quantity: faker.number.int({ min: 1, max: 10 }) }])
    };
};

const addRecordToPocketBase = async (collectionName, record) => {
    try {
        const response = await pb.collection(collectionName).create(record);
        console.log(`Record ajouté à la collection ${collectionName}:`, response);
        return response.id; // Retourne l'ID du record ajouté
    } catch (error) {
        console.error(`Erreur lors de l'ajout du record à la collection ${collectionName}:`, error);
        console.error(`Données envoyées:`, record);
    }
};

const generateAndAddRecords = async (collectionName, generateFakeRecord, count, ...args) => {
    const ids = [];
    for (let i = 0; i < count; i++) {
        const record = generateFakeRecord(...args);
        console.log(`Envoi du record à la collection ${collectionName}:`, record);
        const id = await addRecordToPocketBase(collectionName, record);
        if (id) {
            ids.push(id);
        }
    }
    return ids;
};

const main = async () => {
    // Authentification
    await authenticate();

    // Génère et ajoute des catégories, puis récupère leurs IDs
    const categoryIds = await generateAndAddRecords('categories', generateFakeCategory, 10);
    console.log('Generated category IDs:', categoryIds);

    // Vérifie que des catégories ont été générées
    if (categoryIds.length === 0) {
        console.error('Aucune catégorie générée.');
        return;
    }

    // Génère et ajoute des produits en utilisant les IDs de catégories générés
    const productIds = await generateAndAddRecords('products', generateFakeProduct, 10, categoryIds);
    console.log('Generated product IDs:', productIds);

    // Vérifie que des produits ont été générés
    if (productIds.length === 0) {
        console.error('Aucun produit généré.');
        return;
    }

    // Génère et ajoute des arrivées de stock en utilisant les IDs de produits générés
    await generateAndAddRecords('stock_arrivals', generateFakeStockArrival, 10, productIds);

    // Utilise l'ID d'utilisateur fourni
    const userIds = ['8sfi29038148yby'];
    console.log('Using user ID:', userIds);

    // Génère et ajoute des commandes en utilisant les IDs de produits générés et l'ID d'utilisateur fourni
    const orderIds = await generateAndAddRecords('orders', generateFakeOrder, 10, productIds, userIds);
    console.log('Generated order IDs:', orderIds);

    // Vérifie que des commandes ont été générées
    if (orderIds.length === 0) {
        console.error('Aucune commande générée.');
        return;
    }

    // Génère et ajoute des factures en utilisant les IDs de commandes générés
    await generateAndAddRecords('invoices', generateFakeInvoice, 10, orderIds);

    // Génère et ajoute des paniers en utilisant les IDs de produits générés et l'ID d'utilisateur fourni
    await generateAndAddRecords('carts', generateFakeCart, 10, productIds, userIds);
};

main();