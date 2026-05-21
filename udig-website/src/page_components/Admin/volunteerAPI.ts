import axios from "axios";

export type VolunteerRole = {
    _id?: string;
    role: string;
};

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL || "http://localhost:3001";
const VOLUNTEER_ROLE_BASE = `${API_BASE}/volunteer`;

export const getVolunteerRoles = () =>
    axios
        .get<VolunteerRole[]>(VOLUNTEER_ROLE_BASE)
        .then((res) => res.data);

export const getVolunteerRoleById = (id: string) =>
    axios
        .get<VolunteerRole>(`${VOLUNTEER_ROLE_BASE}/${id}`)
        .then((res) => res.data);

export const createVolunteerRole = (role: VolunteerRole, token: string) =>
    axios.post(VOLUNTEER_ROLE_BASE, role, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const updateVolunteerRole = (
    id: string,
    role: Partial<VolunteerRole>,
    token: string
) =>
    axios.patch(`${VOLUNTEER_ROLE_BASE}/${id}`, role, {
        headers: { Authorization: `Bearer ${token}` },
    });

export const deleteVolunteerRole = (id: string, token: string) =>
    axios.delete(`${VOLUNTEER_ROLE_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });