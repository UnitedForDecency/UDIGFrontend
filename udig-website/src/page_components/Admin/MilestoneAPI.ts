import axios from "axios";

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL + "/api";

export interface Milestone {
    _id: string;
    year: string;
    title: string;
    description: string;
    details: string;
    imageUrl?: string;
}

export async function getMilestones(): Promise<Milestone[]> {
    const res = await axios.get(`${API_BASE}/milestones`);
    return res.data;
}

export async function createMilestone(
    data: Omit<Milestone, "_id">,
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

export async function deleteMilestone(id: string, token: string) {
    const res = await axios.delete(`${API_BASE}/milestones/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res;
}