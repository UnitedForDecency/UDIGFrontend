import axios from "axios";

export type VolunteerOrg = {
    _id?: string;
    name: string;
    description: string;
    link: string;
    category: string; // like "Voting Rights", "Government Accountability"
};

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL + "/api";

// Get all Volunteer Orgs
export const getVolunteerOrgs = async (token: string): Promise<VolunteerOrg[]> => {
    try {
        const res = await axios.get(`${API_BASE}/volunteer`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Volunteer API Response:", res.data);

        //  normalize response
        if (Array.isArray(res.data)) return res.data;
        if (res.data && Array.isArray(res.data.data)) return res.data.data;

        console.warn("unexpected API response:", res.data);
        return [];
    } catch (err) {
        console.error("Failed to fetch volunteer orgs:", err);
        return [];
    }
};

// Create new org
export const createVolunteerOrg = async (
    org: Omit<VolunteerOrg, "_id">,
    token: string
) => {
    try {
        const res = await axios.post(`${API_BASE}/volunteer`, org, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Create Volunteer Org response:", res.data);
        return res;
    } catch (err) {
        console.error("Failed to create volunteer org:", err);
        throw err;
    }
};

// Update Org
export const updateVolunteerOrg = async (
    id: string,
    updates: Partial<VolunteerOrg>,
    token: string
) => {
    try {
        const res = await axios.put(`${API_BASE}/volunteer/${id}`, updates, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Update Volunteer org response:", res.data);
        return res;
    } catch (err) {
        console.error("Failed to update volunteer org:", err);
        throw err;
    }
};

// Delete Org
export const deleteVolunteerOrg = async (id: string, token: string) => {
    try {
        const res = await axios.delete(`${API_BASE}/volunteer/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log("Delete Volunteer Org response:", res.data);
        return res;
    } catch (err) {
        console.error("Failed to delete volunteer org:", err);
    }
};