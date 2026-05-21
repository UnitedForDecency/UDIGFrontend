import axios from "axios";

export type ImpactCard = {
    id: string;
    title: string;
    summary: string;
    description: string;
}

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL + "/api";

export const getImpactCards = async (): Promise<ImpactCard[]> => {
    const res = await axios.get(`${API_BASE}/impact`);
    
    // Handle different response formats
    if (Array.isArray(res.data)) {
        return res.data;
    } else if (res.data && Array.isArray(res.data.data)) {
        return res.data.data;
    } else if (res.data && Array.isArray(res.data.cards)) {
        return res.data.cards;
    } else if (res.data && Array.isArray(res.data.impactCards)) {
        return res.data.impactCards;
    }
    
    console.error("Unexpected API response format:", res.data);
    return [];
};

export const createImpactCard = async (
    card: Omit<ImpactCard, "id">,
    token: string
) => {
    try {
        const response = await axios.post(`${API_BASE}/impact`, card, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response;
    } catch (error) {
        console.error("Create card error:", error);
        if (axios.isAxiosError(error)) {
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);
        }
        throw error;
    }
};

export const updateImpactCard = async (
    id: string,
    updates: Partial<ImpactCard>,
    token: string
) => {
    return axios.put(`${API_BASE}/impact/${id}`, updates, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const deleteImpactCard = async (
    id: string,
    token: string
) => {
    return axios.delete(`${API_BASE}/impact/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};