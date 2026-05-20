import { useEffect, useState } from "react";

export interface ImageType {
    _id: string;
    url: string;
    page: string;
    section: string;
    createdAt?: string;
}

/* ---------------- Section & Label Mapping ---------------- */
const SECTIONS: Record<string, string[]> = {
    home: ["headerCarousel"],
    about: ["visionImages", "missionImages", "storyImages"],
    getInvolved: ["headerImage", "communityGallery"],
    impact: ["headerImage"],
    programs: ["headerImage"],
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
    home: { headerCarousel: "Carousel Images" },
    about: {
        visionImages: "Vision Section",
        missionImages: "Mission Section",
        storyImages: "Our Story Section",
    },
    getInvolved: { headerImage: "Header Background", communityGallery: "Community Gallery" },
    impact: { headerImage: "Header Background" },
    programs: { headerImage: "Header Background" },
};

export default function ImagesAdmin() {
    const [file, setFile] = useState<File | null>(null);
    const [page, setPage] = useState("home");
    const [section, setSection] = useState("headerCarousel");
    const [images, setImages] = useState<ImageType[]>([]);
    const [loading, setLoading] = useState(false);

    // NEW: Modal state
    const [showConfirm, setShowConfirm] = useState(false);
    const [imageToDelete, setImageToDelete] = useState<string | null>(null);

    /* ---------------- Fetch Images ---------------- */
    const fetchImages = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images?page=${page}&section=${section}`
            );
            const data = await res.json();
            setImages(data);
        } catch (err) {
            console.error("Failed to fetch images:", err);
        }
    };

    useEffect(() => {
        fetchImages();
    }, [page, section]);

    /* ---------------- Upload Image ---------------- */
    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("page", page);
        formData.append("section", section);

        try {
            await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images`, {
                method: "POST",
                body: formData,
            });
            setFile(null);
            fetchImages();
        } catch (err) {
            console.error("Upload failed:", err);
        }

        setLoading(false);
    };

    /* ---------------- Delete Image ---------------- */
    const confirmDelete = (id: string) => {
        setImageToDelete(id);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (!imageToDelete) return;

        try {
            await fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${imageToDelete}`, {
                method: "DELETE",
            });
            fetchImages();
        } catch (err) {
            console.error("Delete failed:", err);
        }

        setShowConfirm(false);
        setImageToDelete(null);
    };

    /* ---------------- JSX ---------------- */
    return (
        <div className="p-6 bg-porcelain relative">
            <h2 className="text-2xl font-bold mb-6">Manage Images</h2>

            {/* Upload Panel */}
            <div className="bg-misty-linen p-6 rounded-lg shadow-sm mb-8 border-2 border-golden-bronze">
                <label className="block mb-2 font-semibold">Select Page</label>
                <select
                    value={page}
                    onChange={(e) => {
                        const newPage = e.target.value;
                        setPage(newPage);
                        setSection(SECTIONS[newPage][0]);
                    }}
                    className="w-full px-3 py-2 rounded mb-4 bg-white border border-stone-taupe"
                >
                    {Object.keys(SECTIONS).map((p) => (
                        <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                        </option>
                    ))}
                </select>

                <label className="block mb-2 font-semibold">Select Section</label>
                <select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 rounded mb-4 bg-white border border-stone-taupe"
                >
                    {SECTIONS[page].map((sec) => (
                        <option key={sec} value={sec}>
                            {SECTION_LABELS[page][sec] || sec}
                        </option>
                    ))}
                </select>

                <label className="block mb-2 font-semibold">Upload Image</label>
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mb-4 bg-white p-2 rounded border border-stone-taupe mr-5"
                />

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Uploading..." : "Upload Image"}
                </button>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-3 gap-4">
                {images.map((img) => (
                    <div
                        key={img._id}
                        className="border p-2 rounded shadow-sm border-golden-bronze bg-misty-linen"
                    >
                        <img
                            src={img.url}
                            alt=""
                            className="h-32 w-full object-cover mb-2 rounded"
                        />
                        <div className="text-sm mb-1">
                            Page: <span className="font-semibold">{img.page}</span>
                        </div>
                        <div className="text-sm mb-2">
                            Section:{" "}
                            <span className="font-semibold">{img.section}</span>
                        </div>

                        <button
                            onClick={() => confirmDelete(img._id)}
                            className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600 transition"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4">
                            Confirm Deletion
                        </h3>
                        <p className="mb-6 text-sm text-gray-700">
                            Are you sure you want to delete this image? This action
                            cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}