import { type TokenProp, notifyApiError } from "@/App";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { states } from "@/lib/constants"

type Leader = {
    _id?: string;
    name?: string;
    city?: string;
    state?: string;
    imageUrl?: string;
    contact?: string;
}

export default function CommunityAdmin({ token }: TokenProp) {
    const communityApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/leaders`;
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [newLeader, setNewLeader] = useState<Leader>({
        name: "",
        city: "",
        state: "",
        imageUrl: "",
        contact: "",
    });
    const [loading, setLoading] = useState(false);
    const [editingLeaderId, setEditingLeaderId] = useState("");
    const [editingLeaderIsNew, setEditingLeaderIsNew] = useState(false);
    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchLeaders();
    }, [token]);

    const fetchLeaders = async () => {
        try {
            axios.get(
                communityApiUrl,
                authHeaders
            ).then(res => {
                setLeaders(res.data ?? []);
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) return;
                    notifyApiError(err, "fetch leaders");
                }
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const beginCreatingLeader = () => {
        setEditingLeaderIsNew(true);
        setNewLeader({
            name: "",
            city: "",
            state: "",
            imageUrl: "",
            contact: "",
        });
        setEditingLeaderId("New leader, ID not yet assigned");
    }

    const addLeader = async () => {
        try {
            setLoading(true);
            console.log("Adding leader:", newLeader);
            axios.post(
                communityApiUrl,
                {
                    name: newLeader.name,
                    city: newLeader.city,
                    state: newLeader.state,
                    imageUrl: newLeader.imageUrl,
                    contact: newLeader.contact
                },
                authHeaders
            ).then(res => {
                setLeaders(prev => [ ...prev, { _id: res.data.eventId, ...newLeader }]);

                setNewLeader({
                    name: "",
                    city: "",
                    state: "",
                    imageUrl: "",
                    contact: "",
                });
            }).catch((err: AxiosError) => {
                notifyApiError(err, "add leader");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginEditingLeader = async (id?: string) => {
        if (!id) return;
        if (editingLeaderId != "" && !window.confirm("Any changes will be lost!")) return;
        setEditingLeaderIsNew(false);
        try {
            axios.get(
                `${communityApiUrl}/${id}`, authHeaders
            ).then(res => {
                const selectedLeader = {
                    name: res.data.name,
                    city: res.data.city,
                    state: res.data.state,
                    imageUrl: res.data.imageUrl,
                    contact: res.data.contact,
                }
                setNewLeader(selectedLeader);

                setEditingLeaderId(id);
            }).catch((err: AxiosError) => {
                notifyApiError(err, "get leader");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const cancelLeaderEdit = () => {
        if (!window.confirm("Cancel editing? Any changes will be lost!")) return;
        setEditingLeaderId("");
        setNewLeader({
            name: "",
            city: "",
            state: "",
            imageUrl: "",
            contact: ""
        });
    }

    const saveLeaderEdit = async () => {
        if (!editingLeaderId || editingLeaderId == "") return;

        try {
            axios.put(
                `${communityApiUrl}/${editingLeaderId}`, newLeader, authHeaders
            ).then(res => {
                setLeaders((prev) => prev.map((e) => e._id === editingLeaderId ? res.data.event : e));
                setEditingLeaderId("");
                setNewLeader({
                    name: "",
                    city: "",
                    state: "",
                    imageUrl: "",
                    contact: ""
                });
            }).catch((err: AxiosError) => {
                notifyApiError(err, "save leader");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deleteLeader = async (id?: string) => {
        if (!id) return;
        if (!window.confirm("Delete this leader permanently?")) return;

        try {
            axios.delete(
                `${communityApiUrl}/${id}`, authHeaders
            ).then(() => {
                setLeaders((prev) => prev.filter((e) => e._id !== id));
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete leader");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Leaders</h2>

            {/* Event List */}
            <div className="flex flex-wrap gap-2 mb-6">
                {leaders.length === 0 && (
                    <p className="text-gray-500">No leaders yet.</p>
                )}

                {leaders.map(leader => (
                    <div
                        key={leader._id}
                        className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded"
                    >
                        <span>
                            {leader.name}
                        </span>
                        <button
                            onClick={() => beginEditingLeader(leader._id)}
                            className="text-yellow-600 hover:text-yellow-800 text-sm"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteLeader(leader._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
            {
                /* Add Leader */
                (editingLeaderId == "") &&
                <div className="pb-4">
                    <button
                        onClick={beginCreatingLeader}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        Add New Leader
                    </button>
                </div>
            }
            {
                /* Edit Leader */
                (editingLeaderId != "") &&
                <>
                    <h3 className="text-lg font-semibold mb-2">Add Leader</h3>
                    <h3 className="flex flex-wrap font-semibold mb-2">Basic Information</h3>
                    <div className="flex flex-wrap gap-2 pb-4">
                        <Input
                            className="p-2 rounded flex-1 max-w-100"
                            placeholder="Leader name"
                            value={newLeader.name}
                            onChange={e => setNewLeader({ ...newLeader, name: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 pb-4">
                        <Input
                            className="p-2 rounded flex-1 max-w-100"
                            placeholder="City"
                            value={newLeader.city}
                            onChange={e => setNewLeader({ ...newLeader, city: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 pb-4 max-w-100">
                        <Select value={newLeader.state} onValueChange={(value) => setNewLeader({ ...newLeader, state: value })}>
                                <SelectTrigger className="w-full max-w-100">
                                    <SelectValue placeholder="State" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectLabel>State</SelectLabel>
                                        {Object.entries(states).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                    </div>
                    <div className="flex flex-wrap gap-2 pb-4">
                        <Input
                            className="p-2 rounded flex-1 max-w-100"
                            placeholder="Contact info (email, phone, etc)"
                            value={newLeader.contact}
                            onChange={e => setNewLeader({ ...newLeader, contact: e.target.value })}
                        />
                    </div>
                    <div className="flex flex-col gap-2 pb-4 max-w-100">
                        <button
                            type="button"
                            onClick={() => {
                                const input = document.createElement("input");
                                input.type = "file";
                                input.accept = "image/*";

                                input.onchange = (e: Event) => {
                                    const target = e.target as HTMLInputElement;
                                    const file = target.files?.[0];
                                    if (!file) return;

                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        const base64 = reader.result as string;
                                        setNewLeader({ ...newLeader, imageUrl: base64 });
                                    };
                                    reader.readAsDataURL(file);
                                };

                                input.click(); // Open the file picker
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Add Image
                        </button>

                        {/* Preview */}
                        {newLeader.imageUrl && (
                            <img
                                src={newLeader.imageUrl}
                                alt="Leader preview"
                                className="max-w-[200px] max-h-[200px] rounded mt-2 border"
                            />
                        )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 pb-4">
                        {
                            editingLeaderIsNew &&
                            <button
                                onClick={addLeader}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add Leader"}
                            </button>
                        }
                        {
                            !editingLeaderIsNew &&
                            <button
                                onClick={saveLeaderEdit}
                                disabled={loading}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "Saving..." : "Save Leader"}
                            </button>
                        }
                        <button
                            onClick={cancelLeaderEdit}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            }
        </div>
    );
}
