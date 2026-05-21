import axios from "axios";

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    city: string;
    state: string;
}

type ApiUser = {
    id?: string;
    _id?: string;
    username?: string;
    email?: string;
    role?: string;
    city?: string;
    state?: string;
};

function mapApiUser(user: ApiUser): User | null {
    const id = user.id ?? user._id;
    if (!id) return null;

    return {
        id,
        username: user.username ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        city: user.city ?? "",
        state: user.state ?? "",
    };
}

// ─── Users ───────────────────────────────────────────────

export async function getUsers(token: string): Promise<User[]> {
    const res = await axios.get(`${API_BASE}/accounts`, { headers: { Authorization: `Bearer ${token}` }});
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map(mapApiUser).filter((u): u is User => u !== null);
}

export async function updateUser(id: string, data: Partial<User>, token: string) {
    return axios.patch(`${API_BASE}/accounts/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function deleteUser(id: string, token: string) {
    return axios.delete(`${API_BASE}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}