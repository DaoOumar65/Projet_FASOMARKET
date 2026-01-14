const API_BASE = 'http://localhost:8000/api';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Accept': 'application/json'
});

export const vendorService = {
    // Dashboard
    getDashboard: async () => {
        const response = await fetch(`${API_BASE}/vendor/dashboard`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Produits (utilise l'API existante)
    getProducts: async () => {
        const response = await fetch(`${API_BASE}/produits`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    createProduct: async (data) => {
        const response = await fetch(`${API_BASE}/produits`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    updateProduct: async (id, data) => {
        const response = await fetch(`${API_BASE}/produits/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    deleteProduct: async (id) => {
        const response = await fetch(`${API_BASE}/produits/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    // Commandes
    getOrders: async (statut = 'all') => {
        const url = statut === 'all' 
            ? `${API_BASE}/vendor/orders` 
            : `${API_BASE}/vendor/orders?statut=${statut}`;
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getOrderDetails: async (id) => {
        const response = await fetch(`${API_BASE}/commandes/${id}`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    updateOrderStatus: async (id, statut) => {
        const response = await fetch(`${API_BASE}/commandes/${id}/statut`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ statut })
        });
        return response.json();
    },

    // Boutiques (utilise l'API existante)
    getShops: async () => {
        const response = await fetch(`${API_BASE}/boutiques`, {
            headers: getAuthHeaders()
        });
        return response.json();
    },

    createShop: async (data) => {
        const response = await fetch(`${API_BASE}/boutiques`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return response.json();
    },

    // Clients
    getClients: async () => {
        const response = await fetch(`${API_BASE}/vendor/clients`, {
            headers: getAuthHeaders()
        });
        return response.json();
    }
};