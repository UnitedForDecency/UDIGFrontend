import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_VIDEOS_API_KEY;
const CHANNEL_ID = import.meta.env.VITE_VIDEOS_CHANNEL_ID;
const VIDEOS_PER_PAGE = 6;

interface YouTubeVideo {
    videoId: string;
    title: string;
    thumbnail: string;
}

interface PlaylistItem {
    snippet: {
        resourceId: { videoId: string };
        title: string;
        thumbnails: {
        medium?: { url: string };
        default?: { url: string };
        };
    };
}

export default function VideoGallery() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [currentVideo, setCurrentVideo] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        async function fetchVideos() {
        try {
            const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
            );
            const channelData = await channelRes.json();

            const uploadsPlaylist =
            channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
            if (!uploadsPlaylist) return;

            const playlistRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylist}&maxResults=50&key=${API_KEY}`
            );
            const playlistData = await playlistRes.json();

            const vids: YouTubeVideo[] = playlistData.items.map(
            (item: PlaylistItem) => ({
                videoId: item.snippet.resourceId.videoId,
                title: item.snippet.title,
                thumbnail:
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url ||
                "",
            })
            );

            setVideos(vids);
            if (vids.length) setCurrentVideo(vids[0].videoId);
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
                key={currentVideo}
                className="w-full aspect-video"
                src={`https://www.youtube.com/embed/${currentVideo}?autoplay=1`}
                title="Featured Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                />
            </div>
            )}

            {/* ================= VIDEO GRID ================= */}
            <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
            {currentVideos.map((vid) => (
                <div
                key={vid.videoId}
                onClick={() => setCurrentVideo(vid.videoId)}
                className="cursor-pointer bg-white border-2 border-golden-bronze rounded-xl overflow-hidden shadow hover:shadow-xl hover:scale-105 transition"
                >
                <img
                    src={vid.thumbnail}
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
            <div className="flex justify-center items-center gap-6">
            <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
                className="px-5 py-2 rounded-full bg-yale-blue text-white hover:underline disabled:opacity-40"
            >
                Previous
            </button>

            <span className="text-sm font-medium">
                Page {currentPage + 1} of {totalPages || 1}
            </span>

            <button
                onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                }
                disabled={currentPage === totalPages - 1}
                className="px-5 py-2 rounded-full bg-yale-blue text-white hover:underline disabled:opacity-40"
            >
                Next
            </button>
            </div>
        </div>
        </section>
    );
}