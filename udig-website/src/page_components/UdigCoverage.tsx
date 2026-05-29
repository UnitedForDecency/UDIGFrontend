import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import DOMPurify from "dompurify";

const PAGE_SIZE = 4;

interface UdigCoverage {
    id: string;
    title: string;
    description: string;
    contents: string;
    pressname: string;
    readTime?: string;
    dateUploaded?: string;
    link?: string;
}

export default function UdigCoverage() {
    const [udigcoverage, setUdigCoverage] = useState<UdigCoverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("ALL");
    const [page, setPage] = useState(1);

    const [selectedCoverage, setSelectedCoverage] = useState<UdigCoverage | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    // Fetch data
    useEffect(() => {
        axios.get(`${API_BASE}/press`)
            .then((res) => setUdigCoverage(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error("Failed to fetch udigcoverage:", err))
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
        return ["ALL", ...Array.from(new Set(udigcoverage.map((g) => g.pressname)))];
    }, [udigcoverage]);

    const filtered = useMemo(() => {
        return udigcoverage.filter((item) => {
            const matchesCategory =
                activeCategory === "ALL" || item.pressname === activeCategory;

            const matchesSearch =
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [search, activeCategory, udigcoverage]);

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
                        UDIG in the News
                    </h1>
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
                                key={item.id}
                                onClick={() => {
                                    setSelectedCoverage(item);
                                    setIsModalOpen(true);
                                }}
                                className="cursor-pointer block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 group"
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="min-w-0 flex-1 text-left">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <span className="text-xs font-mono uppercase tracking-wide bg-antique-brass/40 text-stone-taupe px-2 py-0.5 rounded">
                                                {item.pressname}
                                            </span>
                                            {item.readTime && (
                                                <span className="text-xs text-graphite">
                                                    {item.readTime}
                                                </span>
                                            )}
                                        </div>

                                        <h2 className="line-clamp-2 text-xl font-semibold text-yale-blue mb-2 group-hover:text-brick-ember transition-colors leading-snug break-words [overflow-wrap:anywhere]">
                                            {item.title}
                                        </h2>

                                        <p className="line-clamp-3 text-sm text-graphite leading-relaxed break-words [overflow-wrap:anywhere]">
                                            {item.description}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-xl text-steel-blue-grey group-hover:text-brick-ember transition-colors mt-1">
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
                        className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-5xl rounded-2xl shadow-xl p-8 sm:p-12 relative overflow-hidden"
                        >
                            {/* CLOSE */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-5 right-5 text-gray-400 hover:text-black text-2xl leading-none"
                            >
                                ✕
                            </button>

                            {/* HEADER */}
                            <div className="mb-8 pr-8">
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span className="text-xs font-mono uppercase bg-antique-brass/40 text-stone-taupe px-2 py-0.5 rounded">
                                        {selectedCoverage.pressname}
                                    </span>
                                    {selectedCoverage.readTime && (
                                        <span className="text-xs text-graphite">
                                            {selectedCoverage.readTime}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-bold text-yale-blue mb-3 break-words [overflow-wrap:anywhere] leading-tight">
                                    {selectedCoverage.title}
                                </h2>

                                <p className="text-base text-graphite leading-relaxed break-words [overflow-wrap:anywhere]">
                                    {selectedCoverage.description}
                                </p>

                                {selectedCoverage.link && (
                                    <a
                                        href={selectedCoverage.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-yale-blue hover:underline mt-3 inline-block"
                                    >
                                        View original source →
                                    </a>
                                )}
                            </div>

                            <hr className="border-gray-100 mb-8" />

                            {/* CONTENT */}
                            <article
                                className="prose prose-lg max-w-none
                                    prose-p:text-graphite prose-p:leading-[1.85]
                                    prose-p:break-words prose-headings:text-yale-blue
                                    prose-a:text-yale-blue prose-a:underline
                                    [&_*]:max-w-full [&_*]:[overflow-wrap:break-word] [&_*]:[word-break:break-word]
                                    [&_iframe]:w-full [&_iframe]:rounded-lg [&_iframe]:my-4"
                                dangerouslySetInnerHTML={{
                                    __html: DOMPurify.sanitize(
                                        selectedCoverage.contents
                                            .split(/\n\s*\n/)
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