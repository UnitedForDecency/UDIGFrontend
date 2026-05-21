import { type TokenProp } from "@/App";
import { useEffect, useState } from "react";
import {
    getVolunteerRoles,
    createVolunteerRole,
    updateVolunteerRole,
    deleteVolunteerRole,
    type VolunteerRole,
} from "./volunteerAPI";

export default function VolunteerAdmin({ token }: TokenProp) {
    const [roles, setRoles] = useState<VolunteerRole[]>([]);
    const [newRole, setNewRole] = useState({
        role: "",
    });

    const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<Partial<VolunteerRole>>({});

    const [loadingRole, setLoadingRole] = useState(false);

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                const roleData = await getVolunteerRoles();
                setRoles(Array.isArray(roleData) ? roleData : []);
            } catch (err) {
                console.error("Failed to fetch volunteer roles:", err);
            }
        };

        fetchData();
    }, [token]);

    const handleAddRole = async () => {
        if (!token) return;

        if (!newRole.role.trim()) {
            alert("Role role is required");
            return;
        }

        try {
            setLoadingRole(true);
            const res = await createVolunteerRole(
                {
                    role: newRole.role.trim(),
                },
                token
            );

            const created = res?.data ?? res;
            setRoles((prev) => [...prev, created]);
            setNewRole({
                role: "",
            });
        } catch (err) {
            console.error(err);
            alert("Failed to add role");
        } finally {
            setLoadingRole(false);
        }
    };

    const handleSaveRole = async () => {
        if (!token || !editingRoleId) return;

        const trimmedRole = (editRole.role ?? "").trim();

        if (!trimmedRole) {
            alert("Role role is required");
            return;
        }

        try {
            await updateVolunteerRole(
                editingRoleId,
                {
                    role: trimmedRole,
                },
                token
            );

            setRoles((prev) =>
                prev.map((r) =>
                    r._id === editingRoleId
                        ? {
                              ...r,
                              role: trimmedRole,
                          }
                        : r
                )
            );

            setEditingRoleId(null);
            setEditRole({});
        } catch (err) {
            console.error(err);
            alert("Failed to save role");
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (!token) return;

        if (!window.confirm("Delete this role permanently?")) return;

        try {
            await deleteVolunteerRole(id, token);
            setRoles((prev) => prev.filter((r) => r._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete role");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-[var(--color-yale-blue)]">
                Volunteer Roles
            </h2>

            <div className="space-y-2 mb-8">
                {roles.length === 0 ? (
                    <p>No volunteer roles found.</p>
                ) : (
                    roles.map((role, index) => {
                        const isEditing = editingRoleId === role._id;

                        return (
                            <div
                                key={role._id ?? `${role.role}-${index}`}
                                className="flex flex-wrap items-center gap-2 bg-[var(--color-misty-linen)] p-3 rounded border border-[var(--color-stone-taupe)]"
                            >
                                {isEditing ? (
                                    <>
                                        <input
                                            value={editRole.role ?? ""}
                                            placeholder="Role role"
                                            onChange={(e) =>
                                                setEditRole({
                                                    ...editRole,
                                                    role: e.target.value,
                                                })
                                            }
                                            className="border p-1 rounded"
                                        />
                                        <button
                                            onClick={handleSaveRole}
                                            className="text-green-700 font-semibold"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingRoleId(null);
                                                setEditRole({});
                                            }}
                                            className="text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1">
                                            {role.role}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditingRoleId(role._id ?? null);
                                                setEditRole(role);
                                            }}
                                            className="text-blue-600 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                role._id && handleDeleteRole(role._id)
                                            }
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

            <h3 className="text-lg font-semibold mb-2 text-[var(--color-yale-blue)]">
                Add New Volunteer Role
            </h3>

            <div className="flex flex-wrap gap-2">
                <input
                    placeholder="Role role"
                    value={newRole.role}
                    onChange={(e) =>
                        setNewRole({ ...newRole, role: e.target.value })
                    }
                    className="border p-2 rounded"
                />
                <button
                    onClick={handleAddRole}
                    disabled={loadingRole}
                    className="bg-[var(--color-brick-ember)] text-[var(--color-porcelain)] px-4 py-2 rounded"
                >
                    {loadingRole ? "Adding..." : "Add Role"}
                </button>
            </div>
        </div>
    );
}