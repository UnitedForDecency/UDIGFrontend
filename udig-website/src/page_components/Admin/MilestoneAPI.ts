import axios from "axios";

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL + "/api";
const BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

export interface Milestone {
    id: string;
    year: string;
    title: string;
    summary: string;
    description: string;
    imageId?: string;
}

export async function getMilestones(): Promise<Milestone[]> {
    const res = await axios.get(`${API_BASE}/milestones`);
    return res.data;
}

export async function createMilestone(
    data: Omit<Milestone, "id">,
    token: string
) {
    const res = await axios.post(`${API_BASE}/milestones`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res;
}

export async function updateMilestone(
    id: string,
    data: Partial<Milestone>,
    token: string
) {
    const res = await axios.put(`${API_BASE}/milestones/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res;
}

export async function deleteMilestone(id: string, imageId: string, token: string) {
    await axios.delete(`${BASE}/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
    })
    
    const res = await axios.delete(`${API_BASE}/milestones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res;
}