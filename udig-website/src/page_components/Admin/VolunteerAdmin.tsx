import { type TokenProp } from "@/App";
import { useEffect, useState } from "react";
import {
    getVolunteerOrgs,
    createVolunteerOrg,
    updateVolunteerOrg,
    deleteVolunteerOrg,
} from "./volunteerAPI";

export type VolunteerOrg = {
    _id?: string;
    name: string
    description: string;
    link: string;
    category: string;
};

export default function VolunteerAdmin({ token }: TokenProp) {
    const [orgs, setOrgs] = useState<VolunteerOrg[]>([]);
    const [newOrg, setNewOrg] = useState<VolunteerOrg>({
        name: "",
        description: "",
        link: "",
        category: "",
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editOrg, setEditOrg] = useState<Partial<VolunteerOrg>>({});
    const [loading, setLoading] = useState(false);

    // Fetch all volunteer orgs in mount
    useEffect(() => {
        const fetchOrgs = async () => {
            try {
                const data = await getVolunteerOrgs(token);
                setOrgs(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch volunteer orgs:", err);
            }
        };
        fetchOrgs();
    }, [token]);

    // Add new org
    const handleAdd = async () => {
        if (!newOrg.name || !newOrg.category) return alert("Name & Category are required");
        try {
            setLoading(true);
            const res = await createVolunteerOrg(newOrg, token);
            setOrgs((prev) => [...prev, {_id: res.data._id, ...newOrg}]);
        } catch (err) {
            console.error(err);
            alert("Failed to add org");
        } finally {
            setLoading(false);
        }
    };

    // Save edit
    const handleSaveEdit = async () => {
        if (!editingId) return;
        try {
            await updateVolunteerOrg(editingId, editOrg, token);
            setOrgs((prev) =>
                prev.map((o) => (o._id === editingId ? {...o, ...editOrg} : o))
        );
        setEditingId(null);
        setEditOrg({});
        } catch (err) {
            console.error(err);
            alert("Failed to save edit");
        }
    };

    // Delete org
    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this organization permanently?")) return;
        try {
            await deleteVolunteerOrg(id, token);
            setOrgs((prev) => prev.filter((o) => o._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete org");
        }
    };

    return (
<div>
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-yale-blue)]">
                Volunteer Organizations
            </h2>

            {/* Org list */}
            <div className="space-y-2 mb-8">
                {orgs.length === 0 ? (
                    <p>No volunteer organizations found.</p>
                ) : (
                    orgs.map((org) => {
                        const isEditing = editingId === org._id;
                        return (
                            <div
                                key={org._id ?? Math.random()}
                                className="flex flex-wrap items-center gap-2 bg-[var(--color-misty-linen)] p-3 rounded border border-[var(--color-stone-taupe)]"
                            >
                                {isEditing ? (
                                    <>
                                        <input
                                            value={editOrg.name ?? ""}
                                            placeholder="Name"
                                            onChange={(e) =>
                                                setEditOrg({ ...editOrg, name: e.target.value })
                                            }
                                            className="border p-1 rounded"
                                        />
                                        <input
                                            value={editOrg.category ?? ""}
                                            placeholder="Category"
                                            onChange={(e) =>
                                                setEditOrg({ ...editOrg, category: e.target.value })
                                            }
                                            className="border p-1 rounded"
                                        />
                                        <input
                                            value={editOrg.description ?? ""}
                                            placeholder="Description"
                                            onChange={(e) =>
                                                setEditOrg({ ...editOrg, description: e.target.value })
                                            }
                                            className="border p-1 rounded"
                                        />
                                        <input
                                            value={editOrg.link ?? ""}
                                            placeholder="Link"
                                            onChange={(e) =>
                                                setEditOrg({ ...editOrg, link: e.target.value })
                                            }
                                            className="border p-1 rounded"
                                        />
                                        <button
                                            onClick={handleSaveEdit}
                                            className="text-green-700 font-semibold"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1">
                                            {org.name} ({org.category})
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditingId(org._id!);
                                                setEditOrg(org);
                                            }}
                                            className="text-blue-600 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(org._id!)}
                                            className="text-red-600 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add new org */}
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-yale-blue)]">
                Add New Volunteer Organization
            </h3>
            <div className="flex flex-wrap gap-2">
                <input
                    placeholder="Name"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                    className="border p-2 rounded"
                />
                <input
                    placeholder="Category"
                    value={newOrg.category}
                    onChange={(e) => setNewOrg({ ...newOrg, category: e.target.value })}
                    className="border p-2 rounded"
                />
                <input
                    placeholder="Description"
                    value={newOrg.description}
                    onChange={(e) =>
                        setNewOrg({ ...newOrg, description: e.target.value })
                    }
                    className="border p-2 rounded"
                />
                <input
                    placeholder="Link"
                    value={newOrg.link}
                    onChange={(e) => setNewOrg({ ...newOrg, link: e.target.value })}
                    className="border p-2 rounded"
                />
                <button
                    onClick={handleAdd}
                    disabled={loading}
                    className="bg-[var(--color-brick-ember)] text-[var(--color-porcelain)] px-4 py-2 rounded"
                >
                    {loading ? "Adding..." : "Add Organization"}
                </button>
            </div>
        </div>
    );
}