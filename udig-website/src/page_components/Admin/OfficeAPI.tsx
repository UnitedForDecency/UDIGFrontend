import axios from "axios";

const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

export interface OfficeType {
    id: string;
    type: string;
}

export interface OfficeInfo {
    id: string;
    name: string;
    // The backend DTO sends officeType as a plain string
    officeType: string;
    state: string;
    certLevel: string;
    // Map<string,string> serializes to a plain object over JSON
    contactInfo?: Record<string, string>;
}

type ApiOfficeType = {
    id?: string;
    _id?: string;
    type?: string;
};

type ApiOfficeInfo = {
    id?: string;
    _id?: string;
    name?: string;
    officeType?: string;
    state?: string;
    certLevel?: string;
    contactInfo?: Record<string, string> | null;
};

function mapOfficeType(raw: ApiOfficeType): OfficeType | null {
    const id = raw.id ?? raw._id;
    if (!id) return null;
    return { id, type: raw.type ?? "" };
}

function mapOfficeInfo(raw: ApiOfficeInfo): OfficeInfo | null {
    const id = raw.id ?? raw._id;
    if (!id) return null;

    return {
        id,
        name: raw.name ?? "",
        // Backend DTO sends a plain string
        officeType: typeof raw.officeType === "string" ? raw.officeType : "",
        state: raw.state ?? "",
        certLevel: raw.certLevel ?? "",
        contactInfo: raw.contactInfo ?? {},
    };
}

// ─── Office Types ────────────────────────────────────────

export async function getOfficeTypes(token: string): Promise<OfficeType[]> {
    const res = await axios.get(`${API_BASE}/officetype`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map(mapOfficeType).filter((t): t is OfficeType => t !== null);
}

export async function createOfficeType(
    data: { type: string },
    token: string
): Promise<OfficeType> {
    const res = await axios.post(`${API_BASE}/officetype`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    // Backend returns the DTO directly
    const mapped = mapOfficeType(res.data as ApiOfficeType);
    return (
        mapped ?? {
            id: res.data?.id ?? res.data?._id ?? crypto.randomUUID(),
            type: data.type,
        }
    );
}

export async function updateOfficeType(
    id: string,
    data: Partial<OfficeType>,
    token: string
) {
    return axios.patch(`${API_BASE}/officetype/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function deleteOfficeType(id: string, token: string) {
    // NOTE: The backend delete route has a bug — it uses req.params.id but
    // the param is named :officeTypeId. This call will still hit the right
    // URL; the fix needs to happen server-side.
    return axios.delete(`${API_BASE}/officetype/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

// ─── Office Info ─────────────────────────────────────────

export async function getOfficeInfos(token: string): Promise<OfficeInfo[]> {
    const res = await axios.get(`${API_BASE}/officeinfo`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map(mapOfficeInfo).filter((info): info is OfficeInfo => info !== null);
}

export async function createOfficeInfo(
    data: {
        name: string;
        officeType: string;
        state: string;
        certLevel: string;
        contactInfo?: Record<string, string>;
    },
    token: string
): Promise<OfficeInfo> {
    const res = await axios.post(`${API_BASE}/officeinfo`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const mapped = mapOfficeInfo(res.data as ApiOfficeInfo);
    return (
        mapped ?? {
            id: res.data?.id ?? res.data?._id ?? crypto.randomUUID(),
            name: data.name,
            officeType: data.officeType,
            state: data.state,
            certLevel: data.certLevel,
            contactInfo: data.contactInfo ?? {},
        }
    );
}

export async function updateOfficeInfo(
    id: string,
    data: Partial<Omit<OfficeInfo, "id">>,
    token: string
) {
    return axios.patch(`${API_BASE}/officeinfo/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function deleteOfficeInfo(id: string, token: string) {
    // Route is DELETE /office/:officeId — matches correctly
    return axios.delete(`${API_BASE}/officeinfo/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
}