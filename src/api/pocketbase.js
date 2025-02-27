import PocketBase from 'pocketbase';

// Remplace l'URL par celle de ton instance PocketBase
const pb = new PocketBase('http://localhost:8090');
// Désactiver l'annulation automatique des requêtes
pb.autoCancellation(false);
export default pb;
