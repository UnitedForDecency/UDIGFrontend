import { type TokenProp } from "@/App";
import { useEffect, useMemo, useState } from "react";
import {
    type OfficeInfo,
    type OfficeType,
    getOfficeInfos,
    getOfficeTypes,
    createOfficeInfo,
    createOfficeType,
    updateOfficeInfo,
    deleteOfficeInfo,
    deleteOfficeType,
} from "./OfficeAPI";

const CERT_LEVEL_OPTIONS = [
    "Certified for Decency",
    "Provisionally Certified",
    "Not Certified",
    "Decertified",
] as const;

type CertLevel = (typeof CERT_LEVEL_OPTIONS)[number];

const CERT_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    "Certified for Decency":   { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
    "Provisionally Certified": { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400"   },
    "Not Certified":           { bg: "bg-rose-50",     text: "text-rose-700",    dot: "bg-rose-400"    },
    "Decertified":             { bg: "bg-gray-200",    text: "text-black-200",    dot: "bg-black"    },
};

type ContactInfoForm = {
    phone: string; email: string; website: string;
    address: string; city: string; state: string;
    notes: string; extraDetails: string;
};

type NewOfficeForm = {
    name: string; officeType: string; state: string;
    certLevel: CertLevel | ""; contactInfo: ContactInfoForm;
};

function emptyContactInfoForm(): ContactInfoForm {
    return { phone: "", email: "", website: "", address: "", city: "", state: "", notes: "", extraDetails: "" };
}

function contactInfoToForm(contactInfo?: Record<string, string>): ContactInfoForm {
    const form = emptyContactInfoForm();
    if (!contactInfo) return form;
    const extras: string[] = [];
    for (const [key, value] of Object.entries(contactInfo)) {
        const n = key.toLowerCase();
        if (n === "phone") form.phone = value;
        else if (n === "email") form.email = value;
        else if (n === "website" || n === "web" || n === "url") form.website = value;
        else if (n === "address") form.address = value;
        else if (n === "city") form.city = value;
        else if (n === "state") form.state = value;
        else if (n === "notes" || n === "note") form.notes = value;
        else extras.push(`${key}: ${value}`);
    }
    form.extraDetails = extras.join("\n");
    return form;
}

function formToContactInfo(form: ContactInfoForm): Record<string, string> | undefined {
    const info: Record<string, string> = {};
    const put = (k: string, v: string) => { const t = v.trim(); if (t) info[k] = t; };
    put("phone", form.phone); put("email", form.email); put("website", form.website);
    put("address", form.address); put("city", form.city); put("state", form.state); put("notes", form.notes);
    for (const line of form.extraDetails.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
        const ci = line.indexOf(":");
        if (ci === -1) { info[line] = "Yes"; continue; }
        const k = line.slice(0, ci).trim(); const v = line.slice(ci + 1).trim();
        if (k && v) info[k] = v;
    }
    return Object.keys(info).length > 0 ? info : undefined;
}

// ── Small reusable bits ──────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{children}</label>;
}

function Input({ placeholder, value, onChange }: { placeholder?: string; value: string; onChange: (v: string) => void }) {
    return (
        <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {children}
        </select>
    );
}

function CertBadge({ level }: { level: string }) {
    const s = CERT_STYLES[level] ?? { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {level}
        </span>
    );
}

function ContactInfoDisplay({ info }: { info?: Record<string, string> }) {
    const entries = Object.entries(info ?? {}).filter(([, v]) => v);
    if (entries.length === 0) return <span className="text-slate-400 text-sm italic">None</span>;
    return (
        <div className="flex flex-col gap-1">
            {entries.map(([key, value]) => (
                <div key={key} className="flex items-baseline gap-1.5 text-sm">
                    <span className="shrink-0 text-xs font-semibold text-slate-400 uppercase tracking-wide">{key}:</span>
                    <span className="text-slate-700 break-all">{value}</span>
                </div>
            ))}
        </div>
    );
}

function ContactInfoEditor({ value, onChange }: { value: ContactInfoForm; onChange: (next: ContactInfoForm) => void }) {
    const u = (field: keyof ContactInfoForm, v: string) => onChange({ ...value, [field]: v });
    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Phone</Label><Input placeholder="(555) 000-0000" value={value.phone} onChange={(v) => u("phone", v)} /></div>
                <div><Label>Email</Label><Input placeholder="office@example.gov" value={value.email} onChange={(v) => u("email", v)} /></div>
                <div><Label>Website</Label><Input placeholder="https://example.gov" value={value.website} onChange={(v) => u("website", v)} /></div>
                <div><Label>Address</Label><Input placeholder="123 Main St" value={value.address} onChange={(v) => u("address", v)} /></div>
                <div><Label>City</Label><Input placeholder="City" value={value.city} onChange={(v) => u("city", v)} /></div>
                <div><Label>State</Label><Input placeholder="State" value={value.state} onChange={(v) => u("state", v)} /></div>
            </div>
            <div>
                <Label>Notes</Label>
                <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-16"
                    placeholder="Any notes about this office…"
                    value={value.notes}
                    onChange={(e) => u("notes", e.target.value)}
                />
            </div>
            <div>
                <Label>Extra Details <span className="normal-case font-normal text-slate-400">(key: value, one per line)</span></Label>
                <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                    placeholder={"Fax: 555-000-0001\nExtension: 42"}
                    value={value.extraDetails}
                    onChange={(e) => u("extraDetails", e.target.value)}
                />
            </div>
        </div>
    );
}

// ── Section wrapper ──────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">{title}</h3>
                {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────

export default function OfficeAdmin({ token }: TokenProp) {
    const [officeInfos, setOfficeInfos] = useState<OfficeInfo[]>([]);
    const [officeTypes, setOfficeTypes] = useState<OfficeType[]>([]);
    const [selectedType, setSelectedType] = useState<string>("All");
    const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);
    const [editOffice, setEditOffice] = useState<{ name: string; officeType: string; state: string; certLevel: string }>
        ({ name: "", officeType: "", state: "", certLevel: "" });
    const [editContactInfo, setEditContactInfo] = useState<ContactInfoForm>(emptyContactInfoForm());
    const [newOffice, setNewOffice] = useState<NewOfficeForm>({ name: "", officeType: "", state: "", certLevel: "", contactInfo: emptyContactInfoForm() });
    const [newOfficeType, setNewOfficeType] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
            try {
                setLoading(true); setError(null);
                const [infosData, typesData] = await Promise.all([getOfficeInfos(token), getOfficeTypes(token)]);
                setOfficeInfos(infosData); setOfficeTypes(typesData);
            } catch { setError("Failed to load office data."); } finally { setLoading(false); }
        };
        fetchData();
    }, [token]);

    const typeOptions = useMemo(() => ["All", ...Array.from(new Set(officeTypes.map((t) => t.type).filter(Boolean)))], [officeTypes]);
    const filteredOffices = useMemo(() => selectedType === "All" ? officeInfos : officeInfos.filter((o) => o.officeType === selectedType), [officeInfos, selectedType]);
    const isOfficeTypeInUse = (typeName: string) => officeInfos.some((o) => o.officeType === typeName);

    const startEdit = (office: OfficeInfo) => {
        setEditingOfficeId(office.id);
        setEditOffice({ name: office.name, officeType: office.officeType, state: office.state, certLevel: office.certLevel });
        setEditContactInfo(contactInfoToForm(office.contactInfo));
    };
    const cancelEdit = () => { setEditingOfficeId(null); setEditOffice({ name: "", officeType: "", state: "", certLevel: "" }); setEditContactInfo(emptyContactInfoForm()); };

    const handleAddOfficeType = async () => {
        if (!token || !newOfficeType.trim()) { alert("Office type is required."); return; }
        try { setSaving(true); const created = await createOfficeType({ type: newOfficeType.trim() }, token); setOfficeTypes((p) => [created, ...p]); setNewOfficeType(""); }
        catch { alert("Failed to add office type."); } finally { setSaving(false); }
    };

    const handleDeleteOfficeType = async (id: string, typeName: string) => {
        if (!token) return;
        if (isOfficeTypeInUse(typeName)) { alert("This office type is still being used by one or more offices."); return; }
        if (!window.confirm(`Delete office type "${typeName}"?`)) return;
        try { await deleteOfficeType(id, token); setOfficeTypes((p) => p.filter((t) => t.id !== id)); if (selectedType === typeName) setSelectedType("All"); }
        catch { alert("Failed to delete office type."); }
    };

    const handleAddOffice = async () => {
        if (!token) return;
        const { name, officeType, state, certLevel } = newOffice;
        if (!name.trim() || !officeType.trim() || !state.trim() || !certLevel.trim()) { alert("Name, Office Type, State, and Cert Level are required."); return; }
        try {
            setSaving(true);
            const created = await createOfficeInfo({ name: name.trim(), officeType: officeType.trim(), state: state.trim(), certLevel: certLevel.trim(), contactInfo: formToContactInfo(newOffice.contactInfo) }, token);
            setOfficeInfos((p) => [created, ...p]);
            setNewOffice({ name: "", officeType: "", state: "", certLevel: "", contactInfo: emptyContactInfoForm() });
        } catch { alert("Failed to add office."); } finally { setSaving(false); }
    };

    const handleSaveOffice = async () => {
        if (!token || !editingOfficeId) return;
        const { name, officeType, state, certLevel } = editOffice;
        if (!name.trim() || !officeType.trim() || !state.trim() || !certLevel.trim()) { alert("All fields are required."); return; }
        try {
            setSaving(true);
            const payload = { name: name.trim(), officeType: officeType.trim(), state: state.trim(), certLevel: certLevel.trim(), contactInfo: formToContactInfo(editContactInfo) };
            await updateOfficeInfo(editingOfficeId, payload, token);
            setOfficeInfos((p) => p.map((o) => o.id === editingOfficeId ? { ...o, ...payload } : o));
            cancelEdit();
        } catch { alert("Failed to save office info."); } finally { setSaving(false); }
    };

    const handleDeleteOffice = async (id: string) => {
        if (!token || !window.confirm("Delete this office permanently?")) return;
        try { await deleteOfficeInfo(id, token); setOfficeInfos((p) => p.filter((o) => o.id !== id)); }
        catch { alert("Failed to delete office."); }
    };

    if (!token) return <p className="p-4 text-rose-600 text-sm">Admin token missing. Please log in.</p>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Elected Officals and Candidates</h2>
                <p className="mt-1 text-slate-500 text-sm">Manage office types and office records from one place.</p>
            </div>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4"><p className="text-rose-700 font-medium text-sm">{error}</p></div>}

            {/* ── Add Office Type ── */}
            <Section title="Add Elective Office">
                <div className="flex gap-3">
                    <div className="flex-1"><Input placeholder="e.g. County Clerk, District Court…" value={newOfficeType} onChange={setNewOfficeType} /></div>
                    <button onClick={handleAddOfficeType} disabled={saving}
                        className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors">
                        {saving ? "Adding…" : "Add Type"}
                    </button>
                </div>
            </Section>

            {/* ── Existing Types ── */}
            <Section title={`Elective Offices (${officeTypes.length})`}>
                {officeTypes.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No office types yet.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {officeTypes.map((type) => {
                            const inUse = isOfficeTypeInUse(type.type);
                            return (
                                <div key={type.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${inUse ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-white"}`}>
                                    <span className="font-medium text-slate-700">{type.type}</span>
                                    {inUse
                                        ? <span className="text-xs text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">In use</span>
                                        : (
                                            <button onClick={() => handleDeleteOfficeType(type.id, type.type)}
                                                className="text-slate-400 hover:text-rose-500 transition-colors ml-1">
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Section>

            {/* ── Add New Office ── */}
            <Section title="Add New Elective Office/Candidate" subtitle="Fill in the details to register a new office.">
                <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Office Name</Label><Input placeholder="e.g. Riverside County Clerk" value={newOffice.name} onChange={(v) => setNewOffice({ ...newOffice, name: v })} /></div>
                        <div>
                            <Label>Elective Office</Label>
                            <Select value={newOffice.officeType} onChange={(v) => setNewOffice({ ...newOffice, officeType: v })}>
                                <option value="">Select type…</option>
                                {officeTypes.map((t) => <option key={t.id} value={t.type}>{t.type}</option>)}
                            </Select>
                        </div>
                        <div><Label>State</Label><Input placeholder="e.g. California" value={newOffice.state} onChange={(v) => setNewOffice({ ...newOffice, state: v })} /></div>
                        <div>
                            <Label>Certification Level</Label>
                            <Select value={newOffice.certLevel} onChange={(v) => setNewOffice({ ...newOffice, certLevel: v as CertLevel })}>
                                <option value="">Select level…</option>
                                {CERT_LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">Contact Information</p>
                        <ContactInfoEditor value={newOffice.contactInfo} onChange={(next) => setNewOffice({ ...newOffice, contactInfo: next })} />
                    </div>

                    <div>
                        <button onClick={handleAddOffice} disabled={saving}
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                            {saving ? "Saving…" : "Add Office"}
                        </button>
                    </div>
                </div>
            </Section>

            {/* ── Existing Offices ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-900">Offices ({filteredOffices.length})</h3>
                        {filteredOffices.length !== officeInfos.length && (
                            <p className="text-xs text-slate-400 mt-0.5">Filtered from {officeInfos.length} total</p>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {typeOptions.map((type) => (
                            <button key={type} onClick={() => setSelectedType(type)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    selectedType === type ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}>
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                        </div>
                    ) : filteredOffices.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="text-4xl mb-3">🏢</div>
                            <p className="text-slate-400">No offices yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredOffices.map((office) => {
                                const isEditing = editingOfficeId === office.id;

                                return (
                                    <div key={office.id} className={`rounded-xl border transition-all ${isEditing ? "border-blue-300 bg-blue-50/40 shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                                        {isEditing ? (
                                            /* ── Edit mode ── */
                                            <div className="p-5 space-y-5">
                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <div><Label>Name</Label><Input value={editOffice.name} onChange={(v) => setEditOffice({ ...editOffice, name: v })} /></div>
                                                    <div>
                                                        <Label>Office Type</Label>
                                                        <Select value={editOffice.officeType} onChange={(v) => setEditOffice({ ...editOffice, officeType: v })}>
                                                            <option value="">Select type…</option>
                                                            {officeTypes.map((t) => <option key={t.id} value={t.type}>{t.type}</option>)}
                                                        </Select>
                                                    </div>
                                                    <div><Label>State</Label><Input value={editOffice.state} onChange={(v) => setEditOffice({ ...editOffice, state: v })} /></div>
                                                    <div>
                                                        <Label>Certification Level</Label>
                                                        <Select value={editOffice.certLevel} onChange={(v) => setEditOffice({ ...editOffice, certLevel: v })}>
                                                            <option value="">Select level…</option>
                                                            {CERT_LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                                                        </Select>
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">Contact Information</p>
                                                    <ContactInfoEditor value={editContactInfo} onChange={setEditContactInfo} />
                                                </div>

                                                <div className="flex gap-2 pt-1">
                                                    <button onClick={handleSaveOffice} disabled={saving}
                                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                                                        {saving ? "Saving…" : "Save Changes"}
                                                    </button>
                                                    <button onClick={cancelEdit}
                                                        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── View mode ── */
                                            <div className="p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                                                {/* Left: identity */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                        <span className="font-semibold text-slate-900">{office.name}</span>
                                                        <CertBadge level={office.certLevel} />
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <span className="text-xs font-medium bg-blue-50 text-blue-700 rounded-md px-2 py-0.5">{office.officeType || "Unknown"}</span>
                                                        <span className="text-xs font-medium bg-slate-100 text-slate-600 rounded-md px-2 py-0.5">{office.state}</span>
                                                    </div>
                                                    <ContactInfoDisplay info={office.contactInfo} />
                                                </div>

                                                {/* Right: actions */}
                                                <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                                                    <button onClick={() => startEdit(office)}
                                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors">
                                                        Edit
                                                    </button>
                                                    <button onClick={() => handleDeleteOffice(office.id)}
                                                        className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition-colors">
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}