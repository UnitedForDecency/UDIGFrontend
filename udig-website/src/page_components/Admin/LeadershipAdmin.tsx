import { type TokenProp } from "@/App";
import { useEffect, useState, useRef } from "react";
import {
    type Leader, type Partner,
    getLeaders, createLeader, updateLeader, deleteLeader,
    getPartners, createPartner, updatePartner, deletePartner,
} from "./LeaderAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LeadershipAdmin({ token }: TokenProp) {

    // ─── Leaders state ─────────────────────────────────────
    const [leaders, setLeaders] = useState<Leader[]>([]);
    const [newLeader, setNewLeader] = useState<Omit<Leader, "_id">>({ name: "", title: "", bio: "", imageUrl: "" });
    const [leaderImagePreview, setLeaderImagePreview] = useState("");
    const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
    const [editLeader, setEditLeader] = useState<Partial<Leader>>({});
    const [editLeaderImagePreview, setEditLeaderImagePreview] = useState("");
    const leaderFileRef = useRef<HTMLInputElement>(null);
    const editLeaderFileRef = useRef<HTMLInputElement>(null);

    // ─── Partners state ────────────────────────────────────
    const [partners, setPartners] = useState<Partner[]>([]);
    const [newPartner, setNewPartner] = useState<Omit<Partner, "_id">>({ name: "", imageUrl: "" });
    const [partnerImagePreview, setPartnerImagePreview] = useState("");
    const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
    const [editPartner, setEditPartner] = useState<Partial<Partner>>({});
    const [editPartnerImagePreview, setEditPartnerImagePreview] = useState("");
    const partnerFileRef = useRef<HTMLInputElement>(null);
    const editPartnerFileRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            try {
                const [leadersData, partnersData] = await Promise.all([getLeaders(), getPartners()]);
                setLeaders(Array.isArray(leadersData) ? leadersData.filter(l => l._id) : []);
                setPartners(Array.isArray(partnersData) ? partnersData.filter(p => p._id) : []);
            } catch (err) {
                setError("Failed to load data.");
            }
        };
        fetchData();
    }, [token]);

    const toBase64 = (file: File, onDone: (b64: string) => void) => {
        const reader = new FileReader();
        reader.onloadend = () => onDone(reader.result as string);
        reader.readAsDataURL(file);
    };

    // ─── Leader handlers ───────────────────────────────────

    const handleAddLeader = async () => {
    if (!token) return alert("Missing token");
    if (!newLeader.name || !newLeader.title || !newLeader.bio) 
        return alert("Name, Title, and Bio are required!");

    try {
        setLoading(true);

        const leaderToSend = {
            ...newLeader,
        };

        const res = await createLeader(leaderToSend, token);
        const leaderId = res?.data?.leaderId;

        if (!leaderId) throw new Error("API did not return leaderId");

        setLeaders(prev => [...prev, { _id: leaderId, ...leaderToSend }]);

        setNewLeader({ name: "", title: "", bio: "", imageUrl: "" });
        setLeaderImagePreview("");

    } catch (err) {
        console.error(err);
        alert("Failed to add leader");
    } finally {
        setLoading(false);
    }
};

    const handleSaveLeader = async () => {
        if (!token || !editingLeaderId) return;
        try {
            await updateLeader(editingLeaderId, editLeader, token);
            setLeaders(prev => prev.map(l => l._id === editingLeaderId ? { ...l, ...editLeader } : l));
            setEditingLeaderId(null);
            setEditLeader({});
            setEditLeaderImagePreview("");
        } catch { alert("Failed to save leader"); }
    };

    const handleDeleteLeader = async (id: string) => {
        if (!token || !window.confirm("Delete this leader permanently?")) return;
        try {
            await deleteLeader(id, token);
            setLeaders(prev => prev.filter(l => l._id !== id));
        } catch { alert("Failed to delete leader"); }
    };

    // ─── Partner handlers ──────────────────────────────────

    const handleAddPartner = async () => {
        if (!token) return alert("Missing token");
        if (!newPartner.name) return alert("Name is required!");
        try {
            setLoading(true);
            const res = await createPartner(newPartner, token);
            const partnerId = res?.data?.partnerId;
            if (!partnerId) throw new Error("API did not return partnerId");
            setPartners(prev => [...prev, { _id: partnerId, ...newPartner }]);
            setNewPartner({ name: "", imageUrl: "" });
            setPartnerImagePreview("");
        } catch (err) {
            alert("Failed to add partner");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePartner = async () => {
        if (!token || !editingPartnerId) return;
        try {
            await updatePartner(editingPartnerId, editPartner, token);
            setPartners(prev => prev.map(p => p._id === editingPartnerId ? { ...p, ...editPartner } : p));
            setEditingPartnerId(null);
            setEditPartner({});
            setEditPartnerImagePreview("");
        } catch { alert("Failed to save partner"); }
    };

    const handleDeletePartner = async (id: string) => {
        if (!token || !window.confirm("Delete this partner permanently?")) return;
        try {
            await deletePartner(id, token);
            setPartners(prev => prev.filter(p => p._id !== id));
        } catch { alert("Failed to delete partner"); }
    };

    if (!token) return <p className="text-red-500 p-4">Admin token missing. Please log in.</p>;

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Leadership Management</h2>
                <p className="text-gray-600 mt-2">Manage leaders and partners displayed on the Leadership page</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-800 font-medium">{error}</p></div>}

            {/* ── Add Leader ── */}
            <Card>
                <CardHeader><CardTitle className="text-xl">Add New Leader</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Rocky Anderson" value={newLeader.name}
                                    onChange={e => setNewLeader({ ...newLeader, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Founder" value={newLeader.title}
                                    onChange={e => setNewLeader({ ...newLeader, title: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio <span className="text-red-500">*</span></label>
                            <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief biography" rows={4} value={newLeader.bio}
                                onChange={e => setNewLeader({ ...newLeader, bio: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                onClick={() => leaderFileRef.current?.click()}>
                                {leaderImagePreview ? (
                                    <div className="space-y-2">
                                        <img src={leaderImagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-full mx-auto" />
                                        <p className="text-sm text-gray-500">Click to change photo</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-4xl text-gray-300">👤</div>
                                        <p className="text-gray-500 text-sm">Click to upload a photo</p>
                                    </div>
                                )}
                            </div>
                            <input ref={leaderFileRef} type="file" accept="image/*" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (!f) return; toBase64(f, b64 => { setLeaderImagePreview(b64); setNewLeader({ ...newLeader, imageUrl: b64 }); }); }} />
                        </div>
                        <button onClick={handleAddLeader} disabled={loading || !newLeader.name || !newLeader.title || !newLeader.bio}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg">
                            {loading ? "Adding..." : "Add Leader"}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Existing Leaders ── */}
            <Card>
                <CardHeader><CardTitle className="text-xl">Existing Leaders ({leaders.length})</CardTitle></CardHeader>
                <CardContent>
                    {leaders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">👤</div>
                            <p className="text-gray-500 text-lg">No leaders yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leaders.map(leader => {
                                const isEditing = editingLeaderId === leader._id;
                                return (
                                    <div key={leader._id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                        <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={editLeader.name ?? leader.name}
                                                            onChange={e => setEditLeader({ ...editLeader, name: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                        <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={editLeader.title ?? leader.title}
                                                            onChange={e => setEditLeader({ ...editLeader, title: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                                    <textarea className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={editLeader.bio ?? leader.bio} rows={4}
                                                        onChange={e => setEditLeader({ ...editLeader, bio: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                                        onClick={() => editLeaderFileRef.current?.click()}>
                                                        {editLeaderImagePreview || leader.imageUrl ? (
                                                            <div className="space-y-2">
                                                                <img src={editLeaderImagePreview || leader.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-full mx-auto" />
                                                                <p className="text-sm text-gray-500">Click to change</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-400 text-sm">Click to upload photo</p>
                                                        )}
                                                    </div>
                                                    <input ref={editLeaderFileRef} type="file" accept="image/*" className="hidden"
                                                        onChange={e => { const f = e.target.files?.[0]; if (!f) return; toBase64(f, b64 => { setEditLeaderImagePreview(b64); setEditLeader({ ...editLeader, imageUrl: b64 }); }); }} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={handleSaveLeader} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium">Save Changes</button>
                                                    <button onClick={() => { setEditingLeaderId(null); setEditLeader({}); setEditLeaderImagePreview(""); }}
                                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    {leader.imageUrl ? (
                                                        <img src={leader.imageUrl} alt={leader.name} className="w-16 h-16 object-cover rounded-full flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-gray-400 text-2xl">👤</span>
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-lg text-gray-900">{leader.name}</h3>
                                                        <p className="text-sm text-gray-600 mb-1">{leader.title}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-2">{leader.bio}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => { setEditingLeaderId(leader._id); setEditLeader(leader); setEditLeaderImagePreview(""); }}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">Edit</button>
                                                    <button onClick={() => handleDeleteLeader(leader._id)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Add Partner ── */}
            <Card>
                <CardHeader><CardTitle className="text-xl">Add New Partner</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name <span className="text-red-500">*</span></label>
                            <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Neumont University" value={newPartner.name}
                                onChange={e => setNewPartner({ ...newPartner, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo / Image</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                onClick={() => partnerFileRef.current?.click()}>
                                {partnerImagePreview ? (
                                    <div className="space-y-2">
                                        <img src={partnerImagePreview} alt="Preview" className="w-36 h-36 object-cover rounded-full mx-auto" />
                                        <p className="text-sm text-gray-500">Click to change</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-4xl text-gray-300">🤝</div>
                                        <p className="text-gray-500 text-sm">Click to upload a logo</p>
                                    </div>
                                )}
                            </div>
                            <input ref={partnerFileRef} type="file" accept="image/*" className="hidden"
                                onChange={e => { const f = e.target.files?.[0]; if (!f) return; toBase64(f, b64 => { setPartnerImagePreview(b64); setNewPartner({ ...newPartner, imageUrl: b64 }); }); }} />
                        </div>
                        <button onClick={handleAddPartner} disabled={loading || !newPartner.name}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg">
                            {loading ? "Adding..." : "Add Partner"}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* ── Existing Partners ── */}
            <Card>
                <CardHeader><CardTitle className="text-xl">Existing Partners ({partners.length})</CardTitle></CardHeader>
                <CardContent>
                    {partners.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">🤝</div>
                            <p className="text-gray-500 text-lg">No partners yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {partners.map(partner => {
                                const isEditing = editingPartnerId === partner._id;
                                return (
                                    <div key={partner._id} className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                    <input className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={editPartner.name ?? partner.name}
                                                        onChange={e => setEditPartner({ ...editPartner, name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo / Image</label>
                                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                                        onClick={() => editPartnerFileRef.current?.click()}>
                                                        {editPartnerImagePreview || partner.imageUrl ? (
                                                            <div className="space-y-2">
                                                                <img src={editPartnerImagePreview || partner.imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-full mx-auto" />
                                                                <p className="text-sm text-gray-500">Click to change</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-400 text-sm">Click to upload logo</p>
                                                        )}
                                                    </div>
                                                    <input ref={editPartnerFileRef} type="file" accept="image/*" className="hidden"
                                                        onChange={e => { const f = e.target.files?.[0]; if (!f) return; toBase64(f, b64 => { setEditPartnerImagePreview(b64); setEditPartner({ ...editPartner, imageUrl: b64 }); }); }} />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={handleSavePartner} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium">Save Changes</button>
                                                    <button onClick={() => { setEditingPartnerId(null); setEditPartner({}); setEditPartnerImagePreview(""); }}
                                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    {partner.imageUrl ? (
                                                        <img src={partner.imageUrl} alt={partner.name} className="w-16 h-16 object-cover rounded-full flex-shrink-0" />
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-gray-400 text-2xl">🤝</span>
                                                        </div>
                                                    )}
                                                    <h3 className="font-semibold text-lg text-gray-900">{partner.name}</h3>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button onClick={() => { setEditingPartnerId(partner._id); setEditPartner(partner); setEditPartnerImagePreview(""); }}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">Edit</button>
                                                    <button onClick={() => handleDeletePartner(partner._id)}
                                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium">Delete</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
