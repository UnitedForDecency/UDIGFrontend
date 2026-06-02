import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, X, Check } from "lucide-react";

interface Video {
    id: string;
    url: string;
}

function extractYouTubeId(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
        if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    } catch {
        const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match?.[1] ?? null;
    }
    return null;
}

function getThumbnail(url: string): string {
    const id = extractYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : "";
}

const BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

export default function VideoAdmin() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Add form
    const [addUrl, setAddUrl] = useState("");
    const [addError, setAddError] = useState<string | null>(null);
    const [addSuccess, setAddSuccess] = useState(false);
    const [addLoading, setAddLoading] = useState(false);

    // Delete confirmation
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    async function loadVideos() {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${BASE}/video`);
            setVideos(res.data);
        } catch {
            setError("Failed to load videos.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadVideos(); }, []);

    function validateUrl(url: string): string | null {
        if (!url.trim()) return "URL is required.";
        if (!extractYouTubeId(url.trim())) return "Please enter a valid YouTube URL.";
        return null;
    }

    // ── ADD ──────────────────────────────────────────────
    async function handleAdd() {
        const err = validateUrl(addUrl);
        if (err) { setAddError(err); return; }
        setAddError(null);
        setAddLoading(true);
        try {
            await axios.post(`${BASE}/video`, { url: addUrl.trim() });
            setAddUrl("");
            setAddSuccess(true);
            setTimeout(() => setAddSuccess(false), 3000);
            await loadVideos();
        } catch {
            setAddError("Failed to add video. Please try again.");
        } finally {
            setAddLoading(false);
        }
    }

    // ── DELETE ───────────────────────────────────────────
    async function handleDelete(id: string) {
        setDeleteLoading(true);
        try {
            await axios.delete(`${BASE}/video/${id}`);
            setDeletingId(null);
            await loadVideos();
        } catch {
            setError("Failed to delete video.");
        } finally {
            setDeleteLoading(false);
        }
    }

    return (
        <section className="bg-misty-linen min-h-screen py-16 px-6">
            <div className="max-w-4xl mx-auto">

                {/* ── HEADER ── */}
                <h1 className="text-4xl font-bold text-yale-blue mb-2 underline decoration-brick-ember underline-offset-4">
                    Manage Videos
                </h1>
                <p className="text-graphite mb-10">Add or remove videos from the library.</p>

                {/* ── ADD FORM ── */}
                <div className="bg-white border-2 border-golden-bronze rounded-xl p-6 mb-10 shadow">
                    <p className="text-lg font-bold text-yale-blue mb-4 flex items-center gap-2">
                        <Plus size={18} /> Add New Video
                    </p>
                    <div className="flex flex-col gap-3">
                        <Input
                            placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...)"
                            value={addUrl}
                            onChange={(e) => setAddUrl(e.target.value)}
                            className="bg-porcelain rounded-md"
                        />
                        {addError && <p className="text-sm text-red-500">{addError}</p>}
                        {addSuccess && <p className="text-sm text-green-600">Video added successfully!</p>}
                        <Button onClick={handleAdd} disabled={addLoading} className="w-fit">
                            {addLoading ? "Adding..." : "Add Video"}
                        </Button>
                    </div>
                </div>

                {/* ── VIDEO LIST ── */}
                {loading && <p className="text-graphite">Loading videos...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && videos.length === 0 && (
                    <p className="text-graphite italic">No videos yet. Add one above.</p>
                )}

                <div className="flex flex-col gap-4">
                    {videos.map((vid) => {
                        const isDeleting = deletingId === vid.id;
                        const thumb = getThumbnail(vid.url);

                        return (
                            <div
                                key={vid.id}
                                className="bg-white border-2 border-golden-bronze rounded-xl overflow-hidden shadow"
                            >
                                <div className="flex items-center gap-4 p-3">
                                    {thumb && (
                                        <img
                                            src={thumb}
                                            alt=""
                                            className="w-28 aspect-video object-cover rounded-md shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 truncate">{vid.url}</p>
                                    </div>

                                    {isDeleting ? (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-sm text-red-500">Delete?</span>
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleDelete(vid.id)}
                                                disabled={deleteLoading}
                                                className="flex items-center gap-1 px-3 py-1 text-sm"
                                            >
                                                <Check size={14} />
                                                {deleteLoading ? "..." : "Yes"}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => setDeletingId(null)}
                                                className="flex items-center gap-1 px-3 py-1 text-sm"
                                            >
                                                <X size={14} /> No
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="destructive"
                                            onClick={() => setDeletingId(vid.id)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm shrink-0"
                                        >
                                            <Trash2 size={14} /> Delete
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}