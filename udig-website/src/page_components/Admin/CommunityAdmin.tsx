import { type TokenProp } from "@/App";
import { useEffect, useMemo, useState } from "react";
import {
    type User,
    getUsers,
    updateUser,
    deleteUser,
} from "./CommunityAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

type EditableRole = "USER" | "VOLUNTEER" | "LEADER" | "ADMIN";

type Supporter = {
    id: string;
    name: string;
    email: string;
    zip: string;
};

export default function CommunityAdmin({ token }: TokenProp) {
    const [users, setUsers] = useState<User[]>([]);
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("All");
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editUser, setEditUser] = useState<Partial<User>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const showingSupporters = selectedRole === "Supporters";

    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [usersData, supportersRes] = await Promise.all([
                    getUsers(token),
                    axios.get(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/supporter`),
                ]);

                setUsers(usersData);
                setSupporters(Array.isArray(supportersRes.data) ? supportersRes.data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    const roles = useMemo(() => {
        const uniqueRoles = Array.from(new Set(users.map((u) => u.role).filter(Boolean)));
        return ["All", ...uniqueRoles, "Supporters"];
    }, [users]);

    const filteredUsers = useMemo(() => {
        if (selectedRole === "All") return users;
        if (showingSupporters) return [];
        return users.filter((user) => user.role === selectedRole);
    }, [users, selectedRole, showingSupporters]);

    const startEdit = (user: User) => {
        setEditingUserId(user.id);
        setEditUser({
            username: user.username,
            email: user.email,
            role: user.role,
            city: user.city,
            state: user.state,
        });
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditUser({});
    };

    const handleSaveUser = async () => {
        if (!token || !editingUserId) return;

        const username = editUser.username?.trim() ?? "";
        const email = editUser.email?.trim() ?? "";
        const city = editUser.city?.trim() ?? "";
        const state = editUser.state?.trim() ?? "";
        const role = (editUser.role?.trim() ?? "") as EditableRole;

        if (!username || !email || !city || !state || !role) {
            alert("All fields are required.");
            return;
        }

        if (!["USER", "VOLUNTEER", "LEADER", "ADMIN"].includes(role)) {
            alert("Invalid role selected.");
            return;
        }

        try {
            setSaving(true);
            await updateUser(editingUserId, { username, email, city, state, role }, token);
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === editingUserId
                        ? { ...u, username, email, city, state, role }
                        : u
                )
            );
            cancelEdit();
        } catch (err) {
            console.error(err);
            alert("Failed to save user");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!token || !window.confirm("Delete this user permanently?")) return;
        try {
            await deleteUser(id, token);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete user");
        }
    };

    const handleDeleteSupporter = async (id: string) => {
        if (!window.confirm("Delete this supporter permanently?")) return;
        try {
            await axios.delete(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/supporter/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSupporters((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete supporter");
        }
    };

    if (!token) return <p className="text-red-500 p-4">Admin token missing. Please log in.</p>;

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Community Management</h2>
                <p className="text-gray-600 mt-2">Manage your community members displayed in the admin table.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <CardTitle className="text-xl">
                            {showingSupporters
                                ? `Supporters (${supporters.length})`
                                : `Existing Users (${filteredUsers.length})`}
                        </CardTitle>

                        <div className="flex gap-2 flex-wrap">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => {
                                        setSelectedRole(role);
                                        cancelEdit();
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        selectedRole === role
                                            ? role === "Supporters"
                                                ? "bg-green-600 text-white"
                                                : "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Loading...</p>
                        </div>
                    ) : showingSupporters ? (
                        // --- Supporters Table ---
                        supporters.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-5xl mb-4">🤝</div>
                                <p className="text-gray-500 text-lg">No supporters yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                                <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                                Name
                                            </th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                                Email
                                            </th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                                Zip
                                            </th>
                                            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {supporters.map((s) => (
                                            <tr key={s.id} className="align-top">
                                                <td className="px-4 py-4 min-w-40">
                                                    <span className="font-medium text-gray-900">{s.name}</span>
                                                </td>
                                                <td className="px-4 py-4 min-w-52">
                                                    <span className="text-gray-700">{s.email}</span>
                                                </td>
                                                <td className="px-4 py-4 min-w-28">
                                                    <span className="text-gray-700">{s.zip}</span>
                                                </td>
                                                <td className="px-4 py-4 min-w-28">
                                                    <button
                                                        onClick={() => handleDeleteSupporter(s.id)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">👤</div>
                            <p className="text-gray-500 text-lg">No community members yet</p>
                        </div>
                    ) : (
                        // --- Users Table ---
                        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
                            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Username</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Email</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Role</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">City</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">State</th>
                                        <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {filteredUsers.map((user) => {
                                        const isEditing = editingUserId === user.id;
                                        const currentRole = (user.role || "USER") as EditableRole;

                                        return (
                                            <tr key={user.id} className="align-top">
                                                <td className="px-4 py-4 min-w-40">
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            value={editUser.username ?? user.username}
                                                            onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-gray-900">{user.username}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 min-w-52">
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            value={editUser.email ?? user.email}
                                                            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{user.email}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 min-w-44">
                                                    {isEditing ? (
                                                        <select
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                                            value={currentRole === "ADMIN" ? "ADMIN" : (editUser.role ?? currentRole)}
                                                            disabled={currentRole === "ADMIN"}
                                                            onChange={(e) => setEditUser({ ...editUser, role: e.target.value as EditableRole })}
                                                        >
                                                            {currentRole === "ADMIN" ? (
                                                                <option value="ADMIN">ADMIN</option>
                                                            ) : (
                                                                <>
                                                                    <option value="USER">USER</option>
                                                                    <option value="VOLUNTEER">VOLUNTEER</option>
                                                                    <option value="LEADER">LEADER</option>
                                                                </>
                                                            )}
                                                        </select>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                                                            {currentRole}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 min-w-36">
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            value={editUser.city ?? user.city}
                                                            onChange={(e) => setEditUser({ ...editUser, city: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{user.city}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 min-w-24">
                                                    {isEditing ? (
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2"
                                                            value={editUser.state ?? user.state}
                                                            onChange={(e) => setEditUser({ ...editUser, state: e.target.value })}
                                                        />
                                                    ) : (
                                                        <span className="text-gray-700">{user.state}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 min-w-40">
                                                    {isEditing ? (
                                                        <div className="flex gap-2 flex-wrap">
                                                            <button
                                                                onClick={handleSaveUser}
                                                                disabled={saving}
                                                                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-60"
                                                            >
                                                                {saving ? "Saving..." : "Save"}
                                                            </button>
                                                            <button
                                                                onClick={cancelEdit}
                                                                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex gap-2 flex-wrap">
                                                            <button
                                                                onClick={() => startEdit(user)}
                                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}