import { useEffect, useState } from "react";
import axios from "axios";

const VIDEOS_PER_PAGE = 6;

interface Video {
    _id: string;
    title: string;
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

function getEmbedUrl(url: string): string {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
}

export default function VideoGallery() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        async function fetchVideos() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/video`);
                const vids: Video[] = res.data;
                setVideos(vids);
                if (vids.length) setCurrentVideo(vids[0]);
            } catch (err) {
                console.error("Error fetching videos:", err);
            }
        }
        fetchVideos();
    }, []);

    const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
    const start = currentPage * VIDEOS_PER_PAGE;
    const currentVideos = videos.slice(start, start + VIDEOS_PER_PAGE);

    return (
        <section className="bg-misty-linen py-20">

            {/* ================= HEADER ================= */}
            <div className="text-center max-w-3xl mx-auto px-6 mb-20">
                <h1 className="text-5xl font-bold text-yale-blue mb-6 underline decoration-brick-ember underline-offset-4">
                    Video Library
                </h1>
                <p className="text-xl text-graphite">
                    Watch speeches, discussions, and updates from our organization.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6">

                {/* ================= FEATURED VIDEO ================= */}
                {currentVideo && (
                    <div className="bg-white border-2 border-golden-bronze shadow-2xl rounded-xl overflow-hidden mb-16">
                        <iframe
                            key={currentVideo._id}
                            className="w-full aspect-video"
                            src={getEmbedUrl(currentVideo.url)}
                            title={currentVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                )}

                {/* ================= VIDEO GRID ================= */}
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {currentVideos.map((vid) => (
                        <div
                            key={vid._id}
                            onClick={() => setCurrentVideo(vid)}
                            className="cursor-pointer bg-white border-2 border-golden-bronze rounded-xl overflow-hidden shadow hover:shadow-xl hover:scale-105 transition"
                        >
                            <img
                                src={getThumbnail(vid.url)}
                                alt={vid.title}
                                className="w-full aspect-video object-cover"
                            />
                            <div className="p-4">
                                <p className="text-sm font-medium text-graphite line-clamp-2">
                                    {vid.title}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= PAGINATION ================= */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-6">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                            disabled={currentPage === 0}
                            className="px-5 py-2 rounded-full bg-yale-blue text-white hover:underline disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                            className="px-5 py-2 rounded-full bg-yale-blue text-white hover:underline disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}