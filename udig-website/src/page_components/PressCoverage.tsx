import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const PAGE_SIZE = 4;

interface PressCoverage {
    _id: string;
    title: string;
    description: string;
    contents: string;
    pressname: string;
    readTime?: string;
    dateUploaded?: string;
}

export default function PressCoverage() {
    const [presscoverage, setPressCoverage] = useState<PressCoverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [page, setPage] = useState(1);

    const [selectedCoverage, setSelectedCoverage] = useState<PressCoverage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    // Fetch data
    useEffect(() => {
        axios.get(`${API_BASE}/presscoverage`)
            .then((res) => setPressCoverage(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error("Failed to fetch presscoverage:", err))
            .finally(() => setLoading(false));
    }, []);

    // ESC to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsModalOpen(false);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    // Lock scroll
    useEffect(() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    }, [isModalOpen]);

    const categories = useMemo(() => {
        return ["ALL", ...Array.from(new Set(presscoverage.map((g) => g.pressname)))];
    }, [presscoverage]);

    const filtered = useMemo(() => {
        return presscoverage.filter((item) => {
            const matchesCategory =
                activeCategory === "ALL" || item.pressname === activeCategory;

            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [search, activeCategory, presscoverage]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="bg-misty-linen min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-6">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <p className="text-xs uppercase tracking-widest text-stone-taupe mb-3 font-medium">
                        Resources
                    </p>
                    <h1 className="text-5xl font-bold text-yale-blue mb-3">
                        Press Coverage
                    </h1>
                    <p className="text-lg text-graphite max-w-2xl mx-auto">
                        The times UDIG has been featured in the press.
                    </p>
                </div>

                {/* SEARCH + FILTER */}
                <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
                    <input
                        type="text"
                        placeholder="Search press coverage..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yale-blue transition-shadow mb-5"
                    />

                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setActiveCategory(cat);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    activeCategory === cat
                                        ? "bg-yale-blue text-white shadow-sm"
                                        : "bg-steel-blue-grey/50 text-graphite hover:bg-faded-denim"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="flex justify-center py-24">
                        <div className="w-10 h-10 border-4 border-golden-bronze border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* CARDS */}
                {!loading && paginated.length > 0 && (
                    <div className="space-y-5">
                        {paginated.map((item) => (
                            <div
                                key={item._id}
                                onClick={() => {
                                    setSelectedCoverage(item);
                                    setIsModalOpen(true);
                                }}
                                className="cursor-pointer block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono uppercase tracking-wide bg-antique-brass/40 text-stone-taupe px-2 py-0.5 rounded">
                                                {item.pressname}
                                            </span>
                                            {item.readTime && (
                                                <span className="text-xs text-graphite">
                                                    {item.readTime}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="text-xl font-semibold text-yale-blue mb-1 group-hover:text-brick-ember transition-colors">
                                            {item.title}
                                        </h2>

                                        <p className="text-sm text-graphite leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>

                                    <span className="text-xl text-steel-blue-grey group-hover:text-brick-ember transition-colors">
                                        →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* EMPTY */}
                {!loading && paginated.length === 0 && (
                    <p className="text-muted-foreground text-sm py-12 text-center">
                        No press coverages found.
                    </p>
                )}

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-12">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="text-sm text-steel-blue-grey hover:text-yale-blue disabled:opacity-30"
                        >
                            ← Previous
                        </button>

                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="text-sm text-steel-blue-grey hover:text-yale-blue disabled:opacity-30"
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* MODAL */}
                {isModalOpen && selectedCoverage && (
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl p-8 relative"
                        >
                            {/* CLOSE */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >
                                ✕
                            </button>

                            {/* HEADER */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-xs font-mono uppercase bg-antique-brass/40 text-stone-taupe px-2 py-0.5 rounded">
                                        {selectedCoverage.pressname}
                                    </span>
                                    {selectedCoverage.readTime && (
                                        <span className="text-xs text-graphite">
                                            {selectedCoverage.readTime}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-3xl font-bold text-yale-blue mb-2">
                                    {selectedCoverage.title}
                                </h2>

                                <p className="text-sm text-graphite">
                                    {selectedCoverage.description}
                                </p>
                            </div>

                            {/* CONTENT */}
                            <article
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        selectedCoverage.contents
                                            .split(/\n\s*\n/) // split by empty lines
                                            .map((p) => `<p>${p.trim()}</p>`)
                                            .join(""),
                                        {
                                            ADD_TAGS: ["iframe"],
                                            ADD_ATTR: ["allowfullscreen", "frameborder", "src", "width", "height"],
                                        }
                                    ),
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}