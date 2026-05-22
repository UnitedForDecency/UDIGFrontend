import { type TokenProp } from "@/App";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";
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
    "Decertified":             { bg: "bg-gray-200",    text: "text-black-200",   dot: "bg-black"       },
};

// ── Jurisdiction ─────────────────────────────────────────

type JurisdictionTier = "Federal" | "State" | "Local";
const JURISDICTION_TIERS: JurisdictionTier[] = ["Federal", "State", "Local"];

const US_STATES = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
    "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
    "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
    "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
    "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
    "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
    "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
    "Wisconsin","Wyoming","District of Columbia",
];

type JurisdictionForm = {
    tier: JurisdictionTier | "";
    state: string;
    locationType: "City" | "County" | "";
    location: string;
};
function emptyJurisdiction(): JurisdictionForm {
    return {
        tier: "",
        state: "",
        locationType: "",
        location: ""
    };
}

function encodeJurisdiction(j: JurisdictionForm): string {
    if (j.tier === "Federal") return "Federal";
    if (j.tier === "State") return `State:${j.state}`;

    if (j.tier === "Local") {
        if (!j.state) return "";
        if (!j.locationType || !j.location) return `Local:${j.state}`;
        return `Local:${j.state}:${j.locationType}:${j.location}`;
    }

    return "";
}

function decodeJurisdiction(raw: string): JurisdictionForm {
    if (!raw) return emptyJurisdiction();

    if (raw === "Federal") {
        return { tier: "Federal", state: "", locationType: "", location: "" };
    }

    if (raw.startsWith("State:")) {
        return {
            tier: "State",
            state: raw.slice(6),
            locationType: "",
            location: ""
        };
    }

    if (raw.startsWith("Local:")) {
        const [, state = "", locationType = "", location = ""] = raw.split(":");
        return {
            tier: "Local",
            state,
            locationType: locationType as "City" | "County" | "",
            location
        };
    }

    return emptyJurisdiction();
}

function jurisdictionLabel(raw: string): string {
    const j = decodeJurisdiction(raw);

    if (j.tier === "Federal") return "Federal";
    if (j.tier === "State") return j.state || "State";

    if (j.tier === "Local") {
        if (!j.state) return "Local";
        if (!j.location) return `${j.state} Local`;

        return `${j.location} (${j.locationType}), ${j.state}`;
    }

    return raw;
}

// ── Contact info ─────────────────────────────────────────

type ContactInfoForm = {
    phone: string; email: string; website: string;
    address: string; notes: string; extraDetails: string;
};

type NewOfficeForm = {
    name: string; officeType: string; jurisdiction: JurisdictionForm;
    certLevel: CertLevel | ""; contactInfo: ContactInfoForm; isCandidate: boolean;
};

function emptyContactInfoForm(): ContactInfoForm {
    return { phone: "", email: "", website: "", address: "", notes: "", extraDetails: "" };
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
    put("address", form.address); put("notes", form.notes);
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
            placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)}
        />
    );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
    return (
        <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={value} onChange={(e) => onChange(e.target.value)}
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

function StatusBadge({ isCandidate }: { isCandidate: boolean }) {
    return isCandidate ? (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Candidate
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Elected Official
        </span>
    );
}

/** Two-button toggle: "Elected Official" | "Candidate" */
function StatusToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div>
            <Label>Status</Label>
            <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden">
                <button
                    type="button"
                    onClick={() => onChange(false)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                        !value
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Elected Official
                </button>
                <button
                    type="button"
                    onClick={() => onChange(true)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${
                        value
                            ? "bg-orange-500 text-white"
                            : "bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Candidate
                </button>
            </div>
        </div>
    );
}

function JurisdictionBadge({ raw }: { raw: string }) {
    const j = decodeJurisdiction(raw);
    const tierColors: Record<string, string> = {
        Federal: "bg-violet-50 text-violet-700",
        State: "bg-blue-50 text-blue-700",
        Local: "bg-cyan-50 text-cyan-700",
    };
    const cls = tierColors[j.tier ?? ""] ?? "bg-slate-100 text-slate-600";
    return (
        <span className={`text-xs font-medium rounded-md px-2 py-0.5 ${cls}`}>
            {jurisdictionLabel(raw) || "Unknown"}
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
            </div>
            <div>
                <Label>Notes</Label>
                <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-16"
                    placeholder="Any notes about this office…"
                    value={value.notes} onChange={(e) => u("notes", e.target.value)}
                />
            </div>
            <div>
                <Label>Extra Details <span className="normal-case font-normal text-slate-400">(key: value, one per line)</span></Label>
                <textarea
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 font-mono placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                    placeholder={"Fax: 555-000-0001\nExtension: 42"}
                    value={value.extraDetails} onChange={(e) => u("extraDetails", e.target.value)}
                />
            </div>
        </div>
    );
}

function JurisdictionEditor({ value, onChange }: { value: JurisdictionForm; onChange: (next: JurisdictionForm) => void }) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            <div>
                <Label>Jurisdiction Level</Label>
                <Select
                    value={value.tier}
                    onChange={(t) =>
                        onChange({
                            tier: t as JurisdictionTier | "",
                            state: "",
                            locationType: "",
                            location: "",
                        })
                    }
                >
                    <option value="">Select level…</option>
                    {JURISDICTION_TIERS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </Select>
            </div>

            {(value.tier === "State" || value.tier === "Local") && (
                <div>
                    <Label>State</Label>
                    <Select
                        value={value.state}
                        onChange={(s) => onChange({ ...value, state: s })}
                    >
                        <option value="">Select state…</option>
                        {US_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </Select>
                </div>
            )}

            {value.tier === "Local" && (
                <>
                    <div>
                        <Label>Type</Label>
                        <Select
                            value={value.locationType}
                            onChange={(t) =>
                                onChange({
                                    ...value,
                                    locationType: t as "City" | "County" | "",
                                })
                            }
                        >
                            <option value="">Select type…</option>
                            <option value="City">City</option>
                            <option value="County">County</option>
                        </Select>
                    </div>

                    <div>
                        <Label>City / County Name</Label>
                        <Input
                            placeholder="e.g. Salt Lake City or Weber County"
                            value={value.location}
                            onChange={(c) => onChange({ ...value, location: c })}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

// ── Image helpers ─────────────────────────────────────────

function sanitiseSectionKey(name: string, id: string): string {
    const safeName = name.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
    const safeId = id.replace(/[^a-zA-Z0-9]/g, "").slice(-8);
    return `${safeName}_${safeId}`;
}

async function uploadImageForOffice(file: File, officeName: string, officeId: string, token: string): Promise<string> {
    const sectionKey = sanitiseSectionKey(officeName, officeId);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("type", "electiveOffices");
    formData.append("section", sectionKey);
    const res = await axios.post(
        `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/upload`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const id: string = res.data?.id ?? res.data?._id ?? "";
    if (!id) throw new Error("No image ID returned from upload");
    return id;
}

async function deleteImage(imageId: string, token: string): Promise<void> {
    await axios.delete(
        `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
}

function FilePicker({
    file,
    onChange,
    currentImageId,
}: {
    file: File | null;
    onChange: (f: File | null) => void;
    currentImageId?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 cursor-pointer hover:bg-amber-100 hover:border-amber-500 transition group">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
                <svg className="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-600 group-hover:text-amber-800 transition truncate">
                        {file ? file.name : currentImageId ? "Replace existing image…" : "Choose image (optional)"}
                    </p>
                    <p className="text-xs text-slate-400">
                        {file ? "Will upload when you save" : currentImageId ? "An image is already set — pick a new one to replace it" : "PNG, JPG, WebP — uploaded when you save"}
                    </p>
                </div>
                {file && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); onChange(null); if (inputRef.current) inputRef.current.value = ""; }}
                        className="shrink-0 text-slate-400 hover:text-rose-500 transition"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </label>
        </div>
    );
}

function OfficeThumb({ imageId }: { imageId: string }) {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        let alive = true;
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${imageId}`)
            .then((r) => r.json())
            .then((img) => { if (alive && img?.imageData) setUrl(`data:${img.mimetype || "image/png"};base64,${img.imageData}`); })
            .catch(() => {});
        return () => { alive = false; };
    }, [imageId]);
    if (!url) return <div className="h-14 w-14 rounded-lg bg-slate-100 animate-pulse shrink-0" />;
    return <img src={url} alt="" className="h-14 w-14 rounded-lg object-cover border border-slate-200 shrink-0" />;
}

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
    const [searchTerm, setSearchTerm] = useState("");

    const [newOffice, setNewOffice] = useState<NewOfficeForm>({
        name: "", officeType: "", jurisdiction: emptyJurisdiction(),
        certLevel: "", contactInfo: emptyContactInfoForm(), isCandidate: false,
    });
    const [newOfficeFile, setNewOfficeFile] = useState<File | null>(null);

    const [editingOfficeId, setEditingOfficeId] = useState<string | null>(null);
    const [editOffice, setEditOffice] = useState<{
        name: string; officeType: string; jurisdiction: JurisdictionForm;
        certLevel: string; imageId: string; isCandidate: boolean;
    }>({ name: "", officeType: "", jurisdiction: emptyJurisdiction(), certLevel: "", imageId: "", isCandidate: false });
    const [editContactInfo, setEditContactInfo] = useState<ContactInfoForm>(emptyContactInfoForm());
    const [editFile, setEditFile] = useState<File | null>(null);

    const [newOfficeType, setNewOfficeType] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState("All");
    const [selectedState, setSelectedState] = useState("All");

    useEffect(() => {
        if (!token) return;
        const load = async () => {
            try {
                setLoading(true); setError(null);
                const [infosData, typesData] = await Promise.all([getOfficeInfos(token), getOfficeTypes(token)]);
                setOfficeInfos(infosData); setOfficeTypes(typesData);
            } catch { setError("Failed to load office data."); } finally { setLoading(false); }
        };
        load();
    }, [token]);

    const typeOptions = useMemo(() =>
        ["All", ...Array.from(new Set(officeTypes.map((t) => t.type).filter(Boolean)))], [officeTypes]);
    const tierOptions = useMemo(() => {
        const tiers = Array.from(
            new Set(
                officeInfos
                    .map((o) => decodeJurisdiction(o.state).tier)
                    .filter(Boolean)
            )
        ).sort();

        return ["All", ...tiers];
    }, [officeInfos]);

    const stateOptions = useMemo(() => {
        const states = Array.from(
            new Set(
                officeInfos
                    .map((o) => decodeJurisdiction(o.state).state)
                    .filter(Boolean)
            )
        ).sort();

        return ["All", ...states];
    }, [officeInfos]);
    const filteredOffices = useMemo(() => {
        return officeInfos.filter((office) => {
            const jurisdiction = decodeJurisdiction(office.state);

            const matchesType =
                selectedType === "All" ||
                office.officeType === selectedType;

            const matchesTier =
                selectedTier === "All" ||
                jurisdiction.tier === selectedTier;

            const matchesState =
                selectedState === "All" ||
                jurisdiction.state === selectedState;

            const search = searchTerm.toLowerCase();

            const matchesSearch =
                office.name.toLowerCase().includes(search) ||
                office.officeType.toLowerCase().includes(search) ||
                office.certLevel.toLowerCase().includes(search) ||
                jurisdictionLabel(office.state).toLowerCase().includes(search);

            return (
                matchesType &&
                matchesTier &&
                matchesState &&
                matchesSearch
            );
        });
    }, [
        officeInfos,
        selectedType,
        selectedTier,
        selectedState,
        searchTerm,
    ]);
    const isOfficeTypeInUse = (name: string) => officeInfos.some((o) => o.officeType === name);
    const handleTierChange = (tier: string) => {
        setSelectedTier(tier);

        if (tier === "Federal" || tier === "All") {
            setSelectedState("All");
        }
    };

    const showStateFilter =
        selectedTier === "All" ||
        selectedTier === "State" ||
        selectedTier === "Local";

    const startEdit = (office: OfficeInfo) => {
        setEditingOfficeId(office.id);
        setEditOffice({
            name: office.name, officeType: office.officeType,
            jurisdiction: decodeJurisdiction(office.state),
            certLevel: office.certLevel, imageId: office.imageId,
            isCandidate: office.isCandidate,
        });
        setEditContactInfo(contactInfoToForm(office.contactInfo));
        setEditFile(null);
    };
    const cancelEdit = () => {
        setEditingOfficeId(null);
        setEditOffice({ name: "", officeType: "", jurisdiction: emptyJurisdiction(), certLevel: "", imageId: "", isCandidate: false });
        setEditContactInfo(emptyContactInfoForm());
        setEditFile(null);
    };

    const handleAddOfficeType = async () => {
        if (!token || !newOfficeType.trim()) { alert("Office type is required."); return; }
        try { setSaving(true); const c = await createOfficeType({ type: newOfficeType.trim() }, token); setOfficeTypes((p) => [c, ...p]); setNewOfficeType(""); }
        catch { alert("Failed to add office type."); } finally { setSaving(false); }
    };

    const handleDeleteOfficeType = async (id: string, typeName: string) => {
        if (!token) return;
        if (isOfficeTypeInUse(typeName)) { alert("This office type is still in use."); return; }
        if (!window.confirm(`Delete office type "${typeName}"?`)) return;
        try { await deleteOfficeType(id, token); setOfficeTypes((p) => p.filter((t) => t.id !== id)); if (selectedType === typeName) setSelectedType("All"); }
        catch { alert("Failed to delete office type."); }
    };

    const validateJurisdiction = (j: JurisdictionForm): string | null => {
        if (!j.tier) return "Jurisdiction level is required.";

        if (j.tier === "State" || j.tier === "Local") {
            if (!j.state) return "State is required.";
        }

        if (j.tier === "Local") {
            if (!j.locationType) return "City or County type is required.";
            if (!j.location.trim()) return "City or County name is required.";
        }

        return null;
    };

    const handleAddOffice = async () => {
        if (!token) return;
        const { name, officeType, jurisdiction, certLevel, isCandidate } = newOffice;
        if (!name.trim() || !officeType.trim() || !certLevel.trim()) { alert("Name, Office Type, and Cert Level are required."); return; }
        const jErr = validateJurisdiction(jurisdiction);
        if (jErr) { alert(jErr); return; }
        try {
            setSaving(true);
            const created = await createOfficeInfo({
                name: name.trim(), officeType: officeType.trim(),
                state: encodeJurisdiction(jurisdiction), certLevel: certLevel.trim(),
                contactInfo: formToContactInfo(newOffice.contactInfo),
                imageId: "", isCandidate,
            }, token);

            let finalImageId = "";
            if (newOfficeFile) {
                try {
                    finalImageId = await uploadImageForOffice(newOfficeFile, name.trim(), created.id, token);
                    await updateOfficeInfo(created.id, { imageId: finalImageId }, token);
                } catch {
                    alert("Office saved but image upload failed. You can add an image by editing the record.");
                }
            }

            setOfficeInfos((p) => [{ ...created, imageId: finalImageId }, ...p]);
            setNewOffice({ name: "", officeType: "", jurisdiction: emptyJurisdiction(), certLevel: "", contactInfo: emptyContactInfoForm(), isCandidate: false });
            setNewOfficeFile(null);
        } catch { alert("Failed to add office."); } finally { setSaving(false); }
    };

    const handleSaveOffice = async () => {
        if (!token || !editingOfficeId) return;
        const { name, officeType, jurisdiction, certLevel, isCandidate } = editOffice;
        if (!name.trim() || !officeType.trim() || !certLevel.trim()) { alert("All fields are required."); return; }
        const jErr = validateJurisdiction(jurisdiction);
        if (jErr) { alert(jErr); return; }
        try {
            setSaving(true);

            let imageId = editOffice.imageId;
            if (editFile) {
                try {
                    if (imageId) await deleteImage(imageId, token).catch(() => {});
                    imageId = await uploadImageForOffice(editFile, name.trim(), editingOfficeId, token);
                } catch {
                    alert("Image upload failed. Other changes will still be saved.");
                }
            }

            const payload = {
                name: name.trim(), officeType: officeType.trim(),
                state: encodeJurisdiction(jurisdiction), certLevel: certLevel.trim(),
                contactInfo: formToContactInfo(editContactInfo),
                imageId, isCandidate,
            };
            await updateOfficeInfo(editingOfficeId, payload, token);
            setOfficeInfos((p) => p.map((o) => o.id === editingOfficeId ? { ...o, ...payload } : o));
            cancelEdit();
        } catch { alert("Failed to save office info."); } finally { setSaving(false); }
    };

    const handleDeleteOffice = async (id: string) => {
        if (!token || !window.confirm("Delete this office permanently?")) return;
        try {
            const office = officeInfos.find((o) => o.id === id);
            if (office?.imageId) {
                await deleteImage(office.imageId, token).catch(() => {});
            }
            await deleteOfficeInfo(id, token);
            setOfficeInfos((p) => p.filter((o) => o.id !== id));
        } catch { alert("Failed to delete office."); }
    };

    if (!token) return <p className="p-4 text-rose-600 text-sm">Admin token missing. Please log in.</p>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Elected Officials and Candidates</h2>
                <p className="mt-1 text-slate-500 text-sm">Manage office types and office records from one place.</p>
            </div>

            {error && <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4"><p className="text-rose-700 font-medium text-sm">{error}</p></div>}

            <Section title="Add Elective Office">
                <div className="flex gap-3">
                    <div className="flex-1"><Input placeholder="e.g. U.S. President, U.S. Senators…" value={newOfficeType} onChange={setNewOfficeType} /></div>
                    <button onClick={handleAddOfficeType} disabled={saving}
                        className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors">
                        {saving ? "Adding…" : "Add Type"}
                    </button>
                </div>
            </Section>

            <Section title={`Elective Offices (${officeTypes.length})`}>
                {officeTypes.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">No office types yet.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {officeTypes.map((type) => {
                            const inUse = isOfficeTypeInUse(type.type);
                            return (
                                <div key={type.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50">
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

            <Section title="Add New Elective Office/Candidate" subtitle="Fill in the details to register a new office.">
                <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div><Label>Name</Label><Input placeholder="e.g. Donald J. Trump" value={newOffice.name} onChange={(v) => setNewOffice({ ...newOffice, name: v })} /></div>
                        <div>
                            <Label>Elective Office</Label>
                            <Select value={newOffice.officeType} onChange={(v) => setNewOffice({ ...newOffice, officeType: v })}>
                                <option value="">Select type…</option>
                                {officeTypes.map((t) => <option key={t.id} value={t.type}>{t.type}</option>)}
                            </Select>
                        </div>
                        <div>
                            <Label>Certification Level</Label>
                            <Select value={newOffice.certLevel} onChange={(v) => setNewOffice({ ...newOffice, certLevel: v as CertLevel })}>
                                <option value="">Select level…</option>
                                {CERT_LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                            </Select>
                        </div>
                        <div>
                            <StatusToggle
                                value={newOffice.isCandidate}
                                onChange={(v) => setNewOffice({ ...newOffice, isCandidate: v })}
                            />
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">Jurisdiction</p>
                        <JurisdictionEditor value={newOffice.jurisdiction} onChange={(j) => setNewOffice({ ...newOffice, jurisdiction: j })} />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Office / Candidate Image</p>
                        <FilePicker file={newOfficeFile} onChange={setNewOfficeFile} />
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">Contact Information</p>
                        <ContactInfoEditor value={newOffice.contactInfo} onChange={(next) => setNewOffice({ ...newOffice, contactInfo: next })} />
                    </div>

                    <button onClick={handleAddOffice} disabled={saving}
                        className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                        {saving ? "Saving…" : "Add Office"}
                    </button>
                </div>
            </Section>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-900">
                                    Offices ({filteredOffices.length})
                                </h3>

                                {filteredOffices.length !== officeInfos.length && (
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Filtered from {officeInfos.length} total
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <div className="flex flex-wrap gap-2">
                                    {typeOptions.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                                selectedType === type
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <select
                                        value={selectedTier}
                                        onChange={(e) => handleTierChange(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {tierOptions.map((tier) => (
                                            <option key={tier} value={tier}>
                                                {tier === "All" ? "All Jurisdictions" : tier}
                                            </option>
                                        ))}
                                    </select>

                                    {showStateFilter && (
                                        <select
                                            value={selectedState}
                                            onChange={(e) => setSelectedState(e.target.value)}
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {stateOptions.map((state) => (
                                                <option key={state} value={state}>
                                                    {state === "All" ? "All States" : state}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search offices, names, states, certification..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <svg
                                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
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
                                                    <div>
                                                        <Label>Certification Level</Label>
                                                        <Select value={editOffice.certLevel} onChange={(v) => setEditOffice({ ...editOffice, certLevel: v })}>
                                                            <option value="">Select level…</option>
                                                            {CERT_LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <StatusToggle
                                                            value={editOffice.isCandidate}
                                                            onChange={(v) => setEditOffice({ ...editOffice, isCandidate: v })}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">Jurisdiction</p>
                                                    <JurisdictionEditor value={editOffice.jurisdiction} onChange={(j) => setEditOffice({ ...editOffice, jurisdiction: j })} />
                                                </div>

                                                <div className="rounded-xl border border-slate-200 bg-white p-4">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Office / Candidate Image</p>
                                                    <FilePicker
                                                        file={editFile}
                                                        onChange={setEditFile}
                                                        currentImageId={editOffice.imageId}
                                                    />
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
                                            <div className="p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                                                {office.imageId
                                                    ? <OfficeThumb imageId={office.imageId} />
                                                    : (
                                                        <div className="h-14 w-14 rounded-lg border-2 border-dashed border-slate-200 bg-slate-100 flex items-center justify-center shrink-0">
                                                            <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                        <span className="font-semibold text-slate-900">{office.name}</span>
                                                        <StatusBadge isCandidate={office.isCandidate} />
                                                        <CertBadge level={office.certLevel} />
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <span className="text-xs font-medium bg-blue-50 text-blue-700 rounded-md px-2 py-0.5">{office.officeType || "Unknown"}</span>
                                                        <JurisdictionBadge raw={office.state} />
                                                    </div>
                                                    <ContactInfoDisplay info={office.contactInfo} />
                                                </div>

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