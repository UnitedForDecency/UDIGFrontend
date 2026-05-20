import { type TokenProp } from "@/App";
import axios from "axios";
import { useEffect, useMemo, useRef, useState } from "react";

export interface ImageType {
    id: string;
    imageData: string;
    url: string;
    type: string;
    section: string;
    createdAt?: string;
    mimetype?: string;
}

/* ---------------- Defaults ---------------- */
const DEFAULT_PAGE_SECTIONS: Record<string, string[]> = {
    home: ["headerCarousel"],
    navbar: ["logo"],
    about: ["visionImages", "missionImages", "storyImages"],
    getInvolved: ["getInvolvedHeaderImage", "communityGallery"],
    impact: ["impactHeaderImage"],
    programs: ["programHeaderImage"],
    milestones: ["2026"],
};

const DEFAULT_PAGE_LABELS: Record<string, string> = {
    home: "Home",
    navbar: "Navbar",
    about: "About",
    getInvolved: "Get Involved",
    impact: "Impact",
    programs: "Programs",
    milestones: "Milestones",
};

const DEFAULT_SECTION_LABELS: Record<string, Record<string, string>> = {
    home: { headerCarousel: "Carousel Images" },
    navbar: { logo: "Logo" },
    about: {
        visionImages: "Vision Section",
        missionImages: "Mission Section",
        storyImages: "Our Story Section",
    },
    getInvolved: {
        getInvolvedHeaderImage: "Header Background",
        communityGallery: "Community Gallery",
    },
    impact: { impactHeaderImage: "Header Background" },
    programs: { programHeaderImage: "Header Background" },
    milestones: { "2026": "2026" },
};

function prettifyLabel(key: string) {
    return key
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---- Sub-components ---- */

function PageTab({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    onRemove: () => void;
}) {
    return (
        <div className={`group flex gap-2 pl-3 pr-1 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 whitespace-nowrap
            ${active
                ? "bg-amber-700 border-amber-700 text-white shadow-sm"
                : "bg-stone-100 border-stone-300 text-stone-500 hover:border-amber-600 hover:text-amber-700"
            }`}
        >
            <span className="cursor-pointer" onClick={onClick}>{label}</span>
        </div>
    );
}

function SectionChip({
    label,
    active,
    onClick,
}: {
    label: string;
    active: boolean;
    onClick: () => void;
    onRemove: () => void;
}) {
    return (
        <div className={`group flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-xs font-medium border transition-all duration-150 m-0.5
            ${active
                ? "bg-amber-700 border-amber-700 text-white"
                : "bg-white border-stone-300 text-stone-500 hover:border-amber-600 hover:text-amber-700"
            }`}
        >
            <span className="cursor-pointer" onClick={onClick}>{label}</span>
        </div>
    );
}

/* ---- Delete Confirmation Modal ---- */
function DeleteModal({
    onCancel,
    onConfirm,
}: {
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
                {/* Red danger header */}
                <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">Permanently Delete Image</h3>
                        <p className="text-red-200 text-xs mt-0.5">This action cannot be undone</p>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-stone-600 text-sm leading-relaxed mb-3">
                        You are about to <span className="font-semibold text-red-600">permanently delete</span> this image from the database.
                    </p>
                    <ul className="space-y-2 mb-5">
                        {[
                            "The image will be removed immediately from the live site",
                            "This cannot be reversed or recovered",
                            "Any pages referencing this image may break",
                        ].map((warning) => (
                            <li key={warning} className="flex items-start gap-2 text-xs text-stone-500">
                                <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {warning}
                            </li>
                        ))}
                    </ul>

                    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
                        <p className="text-xs text-red-700 font-medium">
                            ⚠️ Are you absolutely sure you want to delete this image?
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200 transition"
                        >
                            Cancel, Keep Image
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition shadow-sm shadow-red-200"
                        >
                            Yes, Delete Forever
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ImagesAdmin({ token }: TokenProp) {
    const [file, setFile] = useState<File | null>(null);
    const [page, setPage] = useState("home");
    const [section, setSection] = useState("headerCarousel");
    const [images, setImages] = useState<ImageType[]>([]);
    const [loading, setLoading] = useState(false);
    const [imagesLoading, setImagesLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [showConfirm, setShowConfirm] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);

    const [pageSections, setPageSections] = useState<Record<string, string[]>>(DEFAULT_PAGE_SECTIONS);
    const [pageLabels, setPageLabels] = useState<Record<string, string>>(DEFAULT_PAGE_LABELS);
    const [sectionLabels, setSectionLabels] = useState<Record<string, Record<string, string>>>(DEFAULT_SECTION_LABELS);

    const [quickSectionKey, setQuickSectionKey] = useState("");
    const [quickTypeKey, setQuickTypeKey] = useState("");

    const availablePages = useMemo(() => Object.keys(pageSections), [pageSections]);
    const availableSections = pageSections[page] ?? [];

    useEffect(() => {
        if (availableSections.length === 0) { setSection(""); return; }
        if (!availableSections.includes(section)) setSection(availableSections[0]);
    }, [page, pageSections]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ---------------- Fetch Images ---------------- */
    const fetchImages = async () => {
        if (!section) { setImages([]); return; }
        setImagesLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/section/${section}`);
            const data = await res.json();
            setImages(formatImages(data));
        } catch (err) {
            console.error("Failed to fetch images:", err);
        } finally {
            setImagesLoading(false);
        }
    };

    useEffect(() => { fetchImages(); }, [page, section]); // eslint-disable-line react-hooks/exhaustive-deps

    const formatImages = (data: any[]) =>
        data.map((img) => ({
            ...img,
            url: `data:${img.mimetype || "image/png"};base64,${img.imageData}`,
        }));

    /* ---------------- Upload ---------------- */
    const handleUpload = async () => {
        if (!file || !page || !section) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);
        formData.append("type", page);
        formData.append("section", section);
        try {
            await axios.post(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/upload`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            fetchImages();
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Delete Image ---------------- */
    const confirmDelete = (id: string) => { setImageToDelete(id); setShowConfirm(true); };
    const handleDelete = async () => {
        if (!imageToDelete) return;
        try {
            await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${imageToDelete}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchImages();
        } catch (err) {
            console.error("Delete failed:", err);
        }
        setShowConfirm(false);
        setImageToDelete(null);
    };

    /* ---------------- Add / Remove Type ---------------- */
    const handleAddType = () => {
        const key = quickTypeKey.trim();
        if (!key) return;
        if (!pageSections[key]) {
            setPageSections((prev) => ({ ...prev, [key]: [] }));
            setPageLabels((prev) => ({ ...prev, [key]: prettifyLabel(key) }));
        }
        setPage(key);
        setSection("");
        setQuickTypeKey("");
    };

    const handleRemoveType = (typeKey: string) => {
        if (Object.keys(pageSections).length <= 1) return;
        setPageSections((prev) => { const next = { ...prev }; delete next[typeKey]; return next; });
        setPageLabels((prev) => { const next = { ...prev }; delete next[typeKey]; return next; });
        setSectionLabels((prev) => { const next = { ...prev }; delete next[typeKey]; return next; });
        if (page === typeKey) {
            const remaining = Object.keys(pageSections).filter((k) => k !== typeKey);
            setPage(remaining[0] || "");
        }
    };

    /* ---------------- Add / Remove Section ---------------- */
    const handleAddSection = () => {
        const secKey = quickSectionKey.trim();
        if (!secKey || !page) return;
        setPageSections((prev) => {
            const existing = prev[page] || [];
            if (existing.includes(secKey)) return prev;
            return { ...prev, [page]: [...existing, secKey] };
        });
        setSectionLabels((prev) => ({
            ...prev,
            [page]: { ...(prev[page] || {}), [secKey]: prettifyLabel(secKey) },
        }));
        setSection(secKey);
        setQuickSectionKey("");
    };

    const handleRemoveSection = (secKey: string) => {
        setPageSections((prev) => ({ ...prev, [page]: (prev[page] || []).filter((s) => s !== secKey) }));
        setSectionLabels((prev) => {
            const next = { ...(prev[page] || {}) };
            delete next[secKey];
            return { ...prev, [page]: next };
        });
        if (section === secKey) {
            const remaining = (pageSections[page] || []).filter((s) => s !== secKey);
            setSection(remaining[0] || "");
        }
    };

    /* ---------------- JSX ---------------- */
    return (
        <div className="p-6 bg-stone-50 min-h-screen">
            <h2 className="text-3xl font-serif font-bold mb-1 text-stone-800">Image Manager</h2>
            <p className="text-stone-400 text-sm mb-7">Upload and manage site images by page type and section.</p>

            {/* ===== UPLOAD CARD ===== */}
            <div className="bg-white rounded-xl border border-amber-300 shadow-sm p-6 mb-5 flex flex-col gap-5">
                <h3 className="text-base font-semibold text-stone-700 flex items-center gap-2">
                    <span className="text-lg">📤</span> Upload Image
                </h3>

                {/* Page type tabs */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                        Page Type
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {availablePages.map((p) => (
                            <PageTab
                                key={p}
                                label={pageLabels[p] || prettifyLabel(p)}
                                active={p === page}
                                onClick={() => { setPage(p); setSection(pageSections[p]?.[0] || ""); }}
                                onRemove={() => handleRemoveType(p)}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            value={quickTypeKey}
                            onChange={(e) => setQuickTypeKey(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddType(); }}
                            placeholder="New type key… (e.g. testimonials)"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
                        />
                        <button
                            onClick={handleAddType}
                            disabled={!quickTypeKey.trim()}
                            className="px-4 py-1.5 rounded-lg bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 disabled:opacity-40 transition"
                        >
                            + Add
                        </button>
                    </div>
                </div>

                <hr className="border-stone-100" />

                {/* Section chips */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                        Section
                        <span className="ml-2 normal-case tracking-normal font-normal bg-stone-100 text-stone-400 text-xs px-2 py-0.5 rounded-full">
                            {availableSections.length}
                        </span>
                    </label>
                    <div className="flex flex-wrap mb-2">
                        {availableSections.length ? (
                            availableSections.map((sec) => (
                                <SectionChip
                                    key={sec}
                                    label={sectionLabels[page]?.[sec] || prettifyLabel(sec)}
                                    active={sec === section}
                                    onClick={() => setSection(sec)}
                                    onRemove={() => handleRemoveSection(sec)}
                                />
                            ))
                        ) : (
                            <span className="text-xs text-stone-400 italic m-0.5">No sections yet — add one.</span>
                        )}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            value={quickSectionKey}
                            onChange={(e) => setQuickSectionKey(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") handleAddSection(); }}
                            placeholder="New section key… (e.g. heroImage)"
                            className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
                        />
                        <button
                            onClick={handleAddSection}
                            disabled={!quickSectionKey.trim() || !page}
                            className="px-4 py-1.5 rounded-lg bg-stone-700 text-white text-sm font-medium hover:bg-stone-800 disabled:opacity-40 transition"
                        >
                            + Add
                        </button>
                    </div>
                </div>

                <hr className="border-stone-100" />

                {/* File drop */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
                        Image File
                    </label>
                    <label className="flex items-center justify-center gap-3 border-2 border-dashed border-amber-300 rounded-xl p-5 bg-amber-50 cursor-pointer hover:bg-amber-100 hover:border-amber-500 transition group">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <span className="text-2xl">🖼</span>
                        <div>
                            <p className="text-sm font-medium text-stone-600 group-hover:text-amber-800 transition">
                                {file ? file.name : "Drop image here or browse"}
                            </p>
                            {!file && <p className="text-xs text-stone-400">PNG, JPG, WebP, etc.</p>}
                        </div>
                    </label>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={loading || !file || !page || !section}
                    className="self-start px-6 py-2 rounded-lg bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 disabled:opacity-40 transition shadow-sm"
                >
                    {loading ? "Uploading…" : "⬆ Upload Image"}
                </button>
            </div>

            {/* ===== IMAGE GRID ===== */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-stone-700 flex items-center gap-2">
                        <span>🖼</span>
                        {pageLabels[page] || prettifyLabel(page)}
                        {section && (
                            <span className="text-stone-400 font-normal">
                                / {sectionLabels[page]?.[section] || prettifyLabel(section)}
                            </span>
                        )}
                    </h3>
                    <span className="text-xs bg-stone-100 text-stone-400 px-2.5 py-1 rounded-full font-medium">
                        {images.length} image{images.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {imagesLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-44 rounded-xl border border-stone-100 bg-stone-100 animate-pulse" />
                        ))
                    ) : images.length ? (
                        images.map((img) => (
                            <div
                                key={img.id}
                                className="group rounded-xl border border-amber-200 bg-amber-50 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <img src={img.url} alt="" className="w-full h-32 object-cover" />
                                <div className="p-3">
                                    <p className="text-xs text-stone-400 mb-0.5">
                                        Type: <span className="font-semibold text-stone-600">{img.type}</span>
                                    </p>
                                    <p className="text-xs text-stone-400 mb-3">
                                        Section: <span className="font-semibold text-stone-600">{img.section}</span>
                                    </p>
                                    <button
                                        onClick={() => confirmDelete(img.id)}
                                        className="w-full px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex flex-col items-center py-12 text-stone-300">
                            <svg className="w-12 h-12 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p className="text-sm">No images in this section yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== DELETE MODAL ===== */}
            {showConfirm && (
                <DeleteModal
                    onCancel={() => { setShowConfirm(false); setImageToDelete(null); }}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
}