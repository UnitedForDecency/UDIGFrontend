import { type TokenProp } from "@/App";
import { useEffect, useState } from "react";
import axios from "axios";

type PetitionSubmission = {
    id?: string;
    FullName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
};

type PledgeSubmission = {
    id?: string;
    name: string;
    email: string;
    office: string;
    date: string;
};

type Tab = "petitions" | "pledges";

export default function PetitionsAndPledgeSubmissionsAdmin({ token }: TokenProp) {
    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const [tab, setTab] = useState<Tab>("petitions");
    const [loading, setLoading] = useState(false);

    const [petitions, setPetitions] = useState<PetitionSubmission[]>([]);
    const [pledges, setPledges] = useState<PledgeSubmission[]>([]);

    const [selected, setSelected] = useState<string | null>(null);

    useEffect(() => {
    setSelected(null);
    }, [tab]);

    const authHeaders = {
        Authorization: `Bearer ${token}`
    };

    const getName = (item: any) => {
        return item.FullName || item.name || "N/A";
    };

    // ================= FETCH PETITIONS =================
    const fetchPetitions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/petition`, { headers: authHeaders });
            setPetitions(res.data ?? []);
        } catch (err) {
            console.error(err);
            alert("Failed to load petition submissions");
        } finally {
            setLoading(false);
        }
    };

    // ================= FETCH PLEDGES =================
    const fetchPledges = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE}/pledge`, { headers: authHeaders });
            console.log(JSON.stringify(res.data, null, 2));
            setPledges(res.data ?? []);
        } catch (err) {
            console.error(err);
            alert("Failed to load pledge submissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === "petitions") fetchPetitions();
        if (tab === "pledges") fetchPledges();
    }, [tab]);

    // ================= DELETE =================
    const deleteItem = async (id?: string) => {
        if (!id) return;
        if (!window.confirm("Delete this entry permanently?")) return;

        try {
            if (tab === "petitions") {
                await axios.delete(`${API_BASE}/petition/${id}`, { headers: authHeaders });
                setPetitions(prev => prev.filter(p => p.id !== id));
            } else {
                await axios.delete(`${API_BASE}/pledge/${id}`, { headers: authHeaders });
                setPledges(prev => prev.filter(p => p.id !== id));
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete");
        }
    };

    // ================= RENDER =================
    const list = tab === "petitions" ? petitions : pledges;

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">

            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-4">
                Admin Submissions Dashboard
            </h1>

            {/* TABS */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setTab("petitions")}
                    className={`px-4 py-2 rounded ${
                        tab === "petitions"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                    }`}
                >
                    Petitions
                </button>

                <button
                    onClick={() => setTab("pledges")}
                    className={`px-4 py-2 rounded ${
                        tab === "pledges"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200"
                    }`}
                >
                    Pledges
                </button>
            </div>

            {/* LOADING */}
            {loading && (
                <p className="text-gray-500">Loading...</p>
            )}

            {/* EMPTY */}
            {!loading && list.length === 0 && (
                <p className="text-gray-400">No entries found.</p>
            )}

            {/* LIST */}
            <div className="space-y-4">
                {list.map((item: any) => (
                    <div
                        key={item.id}
                        className="border rounded-lg p-5 bg-white shadow-sm"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-start">

                            <div>
                                <p className="font-semibold text-lg">
                                    {getName(item)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {item.email}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() =>
                                        setSelected(
                                            selected === item.id ? null : item.id
                                        )
                                    }
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    View
                                </button>

                                <button
                                    onClick={() => deleteItem(item.id)}
                                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* DETAILS */}
                        {selected === item.id && (
                            <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-1">

                                {tab === "petitions" && (
                                    <>
                                        <p><b>Name:</b> {item.FullName || "N/A"}</p>
                                        <p><b>Phone:</b> {item.phone || "N/A"}</p>
                                        <p><b>Email:</b> {item.email || "N/A"}</p>
                                        <p><b>Address:</b> {item.address || "N/A"}</p>
                                        <p><b>City:</b> {item.city || "N/A"}</p>
                                        <p><b>State:</b> {item.state || "N/A"}</p>
                                    </>
                                )}

                                {tab === "pledges" && (
                                    <>
                                        <p><b>Name:</b> {getName(item)}</p>
                                        <p><b>Email:</b> {item.email || "N/A"}</p>
                                        <p><b>Office:</b> {item.office}</p>
                                        <p>
                                        <b>Created:</b>{" "}
                                        {item.createdAt
                                            ? new Date(item.createdAt).toLocaleString()
                                            : "N/A"}
                                    </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}