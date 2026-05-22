import { type TokenProp } from "@/App";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

type OfficeInfoDTO = {
    id: string;
    name: string;
    officeType: string;
    state: string;
    certLevel: string;
    contactInfo?: Record<string, string>;
    imageId: string;
    isCandidate: boolean;
};

const CERT_LEVEL_OPTIONS = [
    "Certified for Decency",
    "Provisionally Certified",
    "Not Certified",
    "Decertified",
] as const;

const CERT_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    "Certified for Decency":   { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
    "Provisionally Certified": { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-400"   },
    "Not Certified":           { bg: "bg-rose-50",     text: "text-rose-700",    dot: "bg-rose-400"    },
    "Decertified":             { bg: "bg-gray-200",    text: "text-black-200",   dot: "bg-black"       },
};

const CERT_REASONS: Record<string, string> = {
    "Certified for Decency":   "Signed pledge + no verified violations",
    "Provisionally Certified": "Minor concerns under review",
    "Not Certified":           "Refused to sign or significant violations",
    "Decertified":             "Serious or repeated violations after signing",
};

const CONTACT_ICONS: Record<string, string> = {
    phone:   "M2 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    email:   "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    website: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
    address: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    fax:     "M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z",
    notes:   "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    default: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
};

// ── Jurisdiction helpers ─────────────────────────────────

type JurisdictionTier = "Federal" | "State" | "Local";

type DecodedJurisdiction = {
    tier: JurisdictionTier | "";
    state: string;
    locationType: "City" | "County" | "";
    location: string;
};

function decodeJurisdiction(raw: string): DecodedJurisdiction {
    if (!raw || raw === "Unknown") {
        return { tier: "", state: "", locationType: "", location: "" };
    }

    if (raw === "Federal") {
        return { tier: "Federal", state: "", locationType: "", location: "" };
    }

    const parts = raw.split(":");

    if (parts[0] === "Local") {
        return {
            tier: "Local",
            state: parts[1] ?? "",
            locationType: (parts[2] as "City" | "County" | "") ?? "",
            location: parts[3] ?? "",
        };
    }

    if (parts[0] === "State") {
        return {
            tier: "State",
            state: parts[1] ?? "",
            locationType: "",
            location: "",
        };
    }

    return { tier: "State", state: raw, locationType: "", location: "" };
}

function jurisdictionLabel(raw: string): string {
    const j = decodeJurisdiction(raw);

    if (j.tier === "Federal") return "Federal";
    if (j.tier === "State") return j.state || "State";

    if (j.tier === "Local") {
        if (j.location && j.state) return `${j.location}, ${j.state}`;
        if (j.location) return j.location;
        return j.state || "Local";
    }

    return raw;
}

// ── Sub-components ───────────────────────────────────────

function JurisdictionBadge({ raw }: { raw: string }) {
    const j = decodeJurisdiction(raw);
    const tierColors: Record<string, string> = {
        Federal: "bg-violet-50 text-violet-700",
        State: "bg-blue-50 text-blue-700",
        "Local": "bg-cyan-50 text-cyan-700",
    };
    const cls = tierColors[j.tier ?? ""] ?? "bg-slate-100 text-slate-600";
    const label = jurisdictionLabel(raw) || "Unknown";
    return (
        <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}>
            <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {label}
        </span>
    );
}

function StatusBadge({ isCandidate }: { isCandidate: boolean }) {
    return isCandidate ? (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Candidate
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Elected Official
        </span>
    );
}

function getContactIcon(key: string): string {
    const k = key.toLowerCase();
    if (k.includes("phone") || k.includes("tel")) return CONTACT_ICONS.phone;
    if (k.includes("email") || k.includes("mail")) return CONTACT_ICONS.email;
    if (k.includes("web") || k.includes("url") || k.includes("site")) return CONTACT_ICONS.website;
    if (k.includes("address") || k.includes("city") || k.includes("state")) return CONTACT_ICONS.address;
    if (k.includes("fax")) return CONTACT_ICONS.fax;
    if (k.includes("note")) return CONTACT_ICONS.notes;
    return CONTACT_ICONS.default;
}

function ContactInfoCard({ info }: { info: Record<string, string> }) {
    const entries = Object.entries(info).filter(([, v]) => v);
    if (entries.length === 0) return <span className="text-gray-400 text-sm italic">No contact info</span>;
    return (
        <div className="flex flex-col gap-1.5">
            {entries.map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                    <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={getContactIcon(key)} />
                    </svg>
                    <div className="min-w-0">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{key}: </span>
                        {key.toLowerCase().includes("web") || key.toLowerCase().includes("url") || key.toLowerCase().includes("site") ? (
                            <a href={value.startsWith("http") ? value : `https://${value}`} target="_blank" rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all">{value}</a>
                        ) : key.toLowerCase().includes("email") || key.toLowerCase().includes("mail") ? (
                            <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>
                        ) : key.toLowerCase().includes("phone") || key.toLowerCase().includes("tel") || key.toLowerCase().includes("fax") ? (
                            <a href={`tel:${value}`} className="text-slate-700 hover:text-blue-600">{value}</a>
                        ) : (
                            <span className="text-slate-700">{value}</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── CertBadge with portal tooltip (escapes overflow-hidden) ──────────────────

function CertBadge({ level }: { level: string }) {
    const style = CERT_STYLES[level] ?? { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" };
    const reason = CERT_REASONS[level];
    const btnRef = useRef<HTMLButtonElement>(null);
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

    const show = () => {
        if (!btnRef.current) return;
        const r = btnRef.current.getBoundingClientRect();

        setPos({
            top: r.top - 8,
            left: r.left + r.width / 2,
        });
    };

    const hide = () => setPos(null);

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                onClick={() => (pos ? hide() : show())}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium cursor-default select-none shrink-0 ${style.bg} ${style.text}`}
            >
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                {level}
                {reason && (
                    <svg className="h-3 w-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )}
            </button>

            {pos && reason && createPortal(
                <div
                    className="pointer-events-none fixed z-[9999] w-52"
                    style={{
                        top: pos.top,
                        left: pos.left,
                        transform: "translate(-50%, -100%)",
                    }}
                >
                    <div className="rounded-xl border border-slate-200 bg-white shadow-xl px-3 py-2.5">
                        <span className={`block text-xs font-semibold mb-0.5 ${style.text}`}>{level}</span>
                        <span className="block text-xs text-slate-600 leading-snug">{reason}</span>
                    </div>
                    <div className="flex justify-center">
                        <span className="inline-block border-x-4 border-t-4 border-x-transparent border-t-white" style={{ filter: "drop-shadow(0 1px 0 #e2e8f0)" }} />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}

// ── Image loader by ID ───────────────────────────────────

function OfficeImage({ imageId, name }: { imageId: string; name: string }) {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${imageId}`)
            .then((r) => r.json())
            .then((img) => {
                if (alive && img?.imageData)
                    setUrl(`data:${img.mimetype || "image/png"};base64,${img.imageData}`);
            })
            .catch(() => {})
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [imageId]);

    if (loading) {
        return <div className="w-full aspect-[4/3] bg-slate-100 animate-pulse rounded-t-2xl" />;
    }
    if (!url) return null;

    return (
        <div className="w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-slate-100">
            <img
                src={url}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
        </div>
    );
}

// ── Office Card ──────────────────────────────────────────

function OfficeCard({ office }: { office: OfficeInfoDTO }) {
    const [contactOpen, setContactOpen] = useState(false);
    const contactEntries = Object.entries(office.contactInfo ?? {}).filter(([, v]) => v);
    const hasContact = contactEntries.length > 0;

    return (
        <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
            {/* Image (if present) */}
            {office.imageId && (
                <OfficeImage imageId={office.imageId} name={office.name} />
            )}

            {/* Status stripe at top of card when no image */}
            {!office.imageId && (
                <div className={`h-1.5 w-full ${office.isCandidate ? "bg-orange-400" : "bg-indigo-500"}`} />
            )}

            {/* Header */}
            <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900 text-base leading-snug">{office.name}</h3>
                    <CertBadge level={office.certLevel} />
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatusBadge isCandidate={office.isCandidate} />
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {office.officeType}
                    </span>
                    <JurisdictionBadge raw={office.state} />
                </div>
            </div>

            {/* Contact — collapsible */}
            <div className="flex flex-col">
                {hasContact ? (
                    <>
                        <button
                            onClick={() => setContactOpen((v) => !v)}
                            className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            <span className="flex items-center gap-1.5">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Contact Info
                                <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-400 font-medium normal-case tracking-normal">
                                    {contactEntries.length}
                                </span>
                            </span>
                            <svg
                                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${contactOpen ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {contactOpen && (
                            <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                                <ContactInfoCard info={office.contactInfo ?? {}} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-5 py-4">
                        <span className="text-slate-400 text-sm italic">No contact info</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────

export default function OfficeInfo({ token }: TokenProp) {
    const [offices, setOffices] = useState<OfficeInfoDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [selectedType, setSelectedType] = useState("All");
    const [selectedTier, setSelectedTier] = useState("All");
    const [selectedState, setSelectedState] = useState("All");
    const [selectedCert, setSelectedCert] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");

    useEffect(() => {
        if (!token) { setLoading(false); return; }
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await axios.get(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/officeinfo`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data: OfficeInfoDTO[] = Array.isArray(res.data)
                    ? res.data.map((o: any) => ({
                          id: o.id ?? o._id ?? crypto.randomUUID(),
                          name: o.name ?? "Unknown",
                          officeType: typeof o.officeType === "string" ? o.officeType : o.officeType?.type ?? "Unknown",
                          state: o.state ?? "Unknown",
                          certLevel: o.certLevel ?? "Unknown",
                          contactInfo: o.contactInfo ?? {},
                          imageId: o.imageId ?? "",
                          isCandidate: o.isCandidate ?? false,
                      }))
                    : [];
                setOffices(data);
            } catch (err) {
                console.error("Failed to fetch office info:", err);
                setError("Failed to load office information.");
                setOffices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const typeOptions = useMemo(() => {
        const unique = Array.from(new Set(offices.map((o) => o.officeType).filter(Boolean))).sort();
        return ["All", ...unique];
    }, [offices]);

    const tierOptions = useMemo(() => {
        const tiers = Array.from(
            new Set(offices.map((o) => decodeJurisdiction(o.state).tier).filter(Boolean))
        ).sort();

        return ["All", ...tiers];
    }, [offices]);

    const stateOptions = useMemo(() => {
        const states = Array.from(new Set(
            offices.map((o) => decodeJurisdiction(o.state).state).filter(Boolean)
        )).sort();
        return ["All", ...states];
    }, [offices]);

    const certOptions = ["All", ...CERT_LEVEL_OPTIONS];

    const handleTierChange = (tier: string) => {
        setSelectedTier(tier);
        if (tier === "Federal" || tier === "All") setSelectedState("All");
    };

    const showStateFilter = selectedTier === "All" || selectedTier === "State" || selectedTier === "Local";

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return offices.filter((o) => {
            const j = decodeJurisdiction(o.state);
            if (selectedType !== "All" && o.officeType !== selectedType) return false;
            if (selectedCert !== "All" && o.certLevel !== selectedCert) return false;
            if (selectedTier !== "All" && j.tier !== selectedTier) return false;
            if (selectedState !== "All" && j.state !== selectedState) return false;
            if (selectedStatus === "Candidate" && !o.isCandidate) return false;
            if (selectedStatus === "Elected Official" && o.isCandidate) return false;
            if (q) {
                const contactStr = Object.entries(o.contactInfo ?? {}).map(([k, v]) => `${k} ${v}`).join(" ").toLowerCase();
                const jLabel = jurisdictionLabel(o.state).toLowerCase();
                return (
                    o.name.toLowerCase().includes(q) ||
                    o.officeType.toLowerCase().includes(q) ||
                    jLabel.includes(q) ||
                    o.certLevel.toLowerCase().includes(q) ||
                    contactStr.includes(q)
                );
            }
            return true;
        });
    }, [offices, search, selectedType, selectedTier, selectedState, selectedCert, selectedStatus]);

    const hasActiveFilters = search.trim() !== "" || selectedType !== "All" || selectedTier !== "All" || selectedState !== "All" || selectedCert !== "All" || selectedStatus !== "All";

    const clearFilters = () => {
        setSearch("");
        setSelectedType("All");
        setSelectedTier("All");
        setSelectedState("All");
        setSelectedCert("All");
        setSelectedStatus("All");
    };

    const electedCount = offices.filter((o) => !o.isCandidate).length;
    const candidateCount = offices.filter((o) => o.isCandidate).length;

    return (
        <section className="min-h-screen bg-slate-50">
            {/* Hero */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-6 py-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">Directory</p>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Elected Officials and Candidates — Directory and Decency Certifications</h1>
                    <p className="mt-3 text-slate-500 text-lg max-w-xl">
                        Browse certified offices, contact details, and certification status.
                    </p>
                    {!loading && (
                        <div className="flex flex-wrap gap-3 mt-6">
                            <button
                                onClick={() => setSelectedStatus("Elected Official")}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                                    selectedStatus === "Elected Official"
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                }`}
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {electedCount} Elected Official{electedCount !== 1 ? "s" : ""}
                            </button>
                            <button
                                onClick={() => setSelectedStatus("Candidate")}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                                    selectedStatus === "Candidate"
                                        ? "bg-orange-500 text-white border-orange-500"
                                        : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                                }`}
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {candidateCount} Candidate{candidateCount !== 1 ? "s" : ""}
                            </button>
                            {selectedStatus !== "All" && (
                                <button
                                    onClick={() => setSelectedStatus("All")}
                                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors"
                                >
                                    Show all
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
                {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
                        <p className="text-rose-700 font-medium text-sm">{error}</p>
                    </div>
                )}

                {/* Search & Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                            </svg>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Search by name, office type, location, or contact info…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                <option value="All">All Statuses</option>
                                <option value="Elected Official">Elected Officials</option>
                                <option value="Candidate">Candidates</option>
                            </select>

                            <select
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                                {typeOptions.map((t) => <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>)}
                            </select>

                            <select
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedTier} onChange={(e) => handleTierChange(e.target.value)}>
                                {tierOptions.map((t) => <option key={t} value={t}>{t === "All" ? "All Jurisdictions" : t}</option>)}
                            </select>

                            {showStateFilter && stateOptions.length > 1 && (
                                <select
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                                    {stateOptions.map((s) => <option key={s} value={s}>{s === "All" ? "All States" : s}</option>)}
                                </select>
                            )}

                            <select
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedCert} onChange={(e) => setSelectedCert(e.target.value)}>
                                {certOptions.map((c) => <option key={c} value={c}>{c === "All" ? "All Certifications" : c}</option>)}
                            </select>

                            {hasActiveFilters && (
                                <button onClick={clearFilters}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                                    ✕ Clear
                                </button>
                            )}

                            <span className="ml-auto text-sm text-slate-400">
                                {filtered.length}{filtered.length !== offices.length && ` of ${offices.length}`} office{filtered.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center py-24">
                        <div className="h-8 w-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20">
                        <div className="text-4xl mb-4">🏢</div>
                        <p className="text-slate-500">{hasActiveFilters ? "No offices match your search." : "No office information available."}</p>
                        {hasActiveFilters && (
                            <button onClick={clearFilters} className="mt-3 text-sm text-blue-600 hover:underline">Clear filters</button>
                        )}
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="columns-1 sm:columns-2 xl:columns-3 gap-4">
                        {filtered.map((office) => (
                            <div key={office.id} className="break-inside-avoid mb-4"><OfficeCard office={office} /></div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}