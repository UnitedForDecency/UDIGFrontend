import axios from "axios";

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL + "/api";

export interface Leader {
    _id: string;
    name: string;
    title: string;
    bio: string;
    imageUrl?: string;
}

export interface Partner {
    _id: string;
    name: string;
    imageUrl?: string;
}

// ─── Leaders ───────────────────────────────────────────────

export async function getLeaders(): Promise<Leader[]> {
    const res = await axios.get(`${API_BASE}/leadership/leaders`);
    return res.data;
}

export async function createLeader(data: Omit<Leader, "_id">, token: string) {
    return axios.post(`${API_BASE}/leadership/leaders`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function updateLeader(id: string, data: Partial<Leader>, token: string) {
    return axios.put(`${API_BASE}/leadership/leaders/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function deleteLeader(id: string, token: string) {
    return axios.delete(`${API_BASE}/leadership/leaders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// ─── Partners ──────────────────────────────────────────────

export async function getPartners(): Promise<Partner[]> {
    const res = await axios.get(`${API_BASE}/leadership/partners`);
    return res.data;
}

export async function createPartner(data: Omit<Partner, "_id">, token: string) {
    return axios.post(`${API_BASE}/leadership/partners`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function updatePartner(id: string, data: Partial<Partner>, token: string) {
    return axios.put(`${API_BASE}/leadership/partners/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function deletePartner(id: string, token: string) {
    return axios.delete(`${API_BASE}/leadership/partners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}