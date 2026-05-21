import { type TokenProp } from "@/App";
import { useEffect, useState, useRef } from "react";
import {
    type Milestone,
    getMilestones,
    createMilestone,
    updateMilestone,
    deleteMilestone,
} from "./MilestoneAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

export default function AdminMilestone({ token }: TokenProp) {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [newMilestone, setNewMilestone] = useState<Omit<Milestone, "id">>({
        year: "",
        title: "",
        summary: "",
        description: "",
        imageId: "",
    });
    const [imagePreview, setImagePreview] = useState<string>("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMilestone, setEditMilestone] = useState<Partial<Milestone>>({});
    const [editImagePreview, setEditImagePreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [images, setImages] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!token) return;
        const fetchMilestones = async () => {
            try {
                const data = await getMilestones();
                if (!Array.isArray(data)) {
                    setMilestones([]);
                    setError("Failed to load milestones.");
                    return;
                }
                setMilestones(data.filter((m) => m.id));
                setError(null);
                setFile(null);
            } catch (err) {
                console.error("Failed to fetch milestones:", err);
                setMilestones([]);
                setError("Failed to load milestones.");
            }
        };
        fetchMilestones();
    }, [token]);

    // Convert uploaded file to base64
    const handleImageUpload = (file: File, isEdit = false) => {
        setFile(file);

        const previewUrl = URL.createObjectURL(file);

        if (isEdit) {
            setEditImagePreview(previewUrl);
        } else {
            setImagePreview(previewUrl);
        }
    };

    const handleAddMilestone = async () => {
        if (!token) return alert("Missing token");
        if (!newMilestone.year || !newMilestone.title) {
            return alert("Year and Title are required!");
        }

        try {
            setLoading(true);

            let imageId = "";

            if (file) {
                const formData = new FormData();
                formData.append("image", file);
                formData.append("type", "milestone");
                formData.append("section", newMilestone.year);

                const uploadRes = await axios.post(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/upload`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                imageId = uploadRes.data?.id || "";
            }

            const payload = {
                ...newMilestone,
                imageId,
            };

            const res = await createMilestone(payload, token);
            const milestoneId = res?.data?.milestoneId;

            setMilestones((prev) => [
                ...prev,
                { id: milestoneId, ...payload },
            ]);

            setNewMilestone({
                year: "",
                title: "",
                summary: "",
                description: "",
                imageId: "",
            });

            setFile(null);
            setImagePreview("");
        } catch (err) {
            console.error(err);
            alert("Failed to add milestone");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!token || !editingId) return;

        try {
            let imageId = editMilestone.imageId; // default = existing image


            if (file) {
                const formData = new FormData();
                formData.append("image", file);
                formData.append("type", "milestone");
                formData.append("section", editMilestone.year || "");

                const uploadRes = await axios.post(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/upload`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                imageId = uploadRes.data?.id || imageId;

                // (optional) delete old image
                if (editMilestone.imageId) {
                    await axios.delete(
                        `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${editMilestone.imageId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                }
            }

            const updated = {
                ...editMilestone,
                imageId,
            };

            await updateMilestone(editingId, updated, token);

            setMilestones((prev) =>
                prev.map((m) =>
                    m.id === editingId ? { ...m, ...updated } : m
                )
            );

            setEditingId(null);
            setEditMilestone({});
            setEditImagePreview("");
            setFile(null);

        } catch (err) {
            console.error("Failed to save edit:", err);
            alert("Failed to save edit");
        }
    };

    const handleDelete = async (id: string, imageId: string) => {
        if (!token) return;
        if (!window.confirm("Delete this milestone permanently?")) return;
        try {
            await deleteMilestone(id, imageId, token);
            setMilestones((prev) => prev.filter((m) => m.id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete milestone");
        }
    };

    useEffect(() => {
        const loadImages = async () => {
            const newImages: Record<string, string> = {};

            for (const m of milestones) {
                if (!m.imageId) continue;

                try {
                    const res = await fetch(
                        `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/images/${m.imageId}`
                    );
                    const data = await res.json();

                    newImages[m.imageId] = formatImages(data);
                } catch (err) {
                    console.error("Failed to fetch image:", err);
                }
            }

            setImages(newImages);
        };

        if (milestones.length > 0) {
            loadImages();
        }
    }, [milestones]);

    const formatImages = (data: any): string => {
        if (!data) return "";

        return `data:${data.mimetype || "image/png"};base64,${data.imageData}`;
    };

    if (!token) {
        return (
            <div className="p-4">
                <p className="text-red-500">Admin token missing. Please log in to manage milestones.</p>
            </div>
        );
    }
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Milestone Cards Management</h2>
                <p className="text-gray-600 mt-2">Create and manage history milestones for the Our Story timeline</p>
            </div>

            {/* Add New Milestone Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Add New Milestone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., 2026"
                                    value={newMilestone.year}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, year: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Organization Founded"
                                    value={newMilestone.title}
                                    onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                summary <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief summary shown on the timeline card"
                                value={newMilestone.summary}
                                onChange={(e) => setNewMilestone({ ...newMilestone, summary: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Full content displayed in the modal popup"
                                rows={5}
                                value={newMilestone.description}
                                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image
                            </label>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {imagePreview ? (
                                    <div className="space-y-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-md mx-auto"
                                        />
                                        <p className="text-sm text-gray-500">Click to change image</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-4xl text-gray-300">🖼️</div>
                                        <p className="text-gray-500 text-sm">Click to upload an image</p>
                                        <p className="text-gray-400 text-xs">PNG, JPG, WEBP supported</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    handleImageUpload(file);
                                }}
                            />
                        </div>

                        <button
                            onClick={handleAddMilestone}
                            disabled={
                                loading ||
                                !newMilestone.year ||
                                !newMilestone.title ||
                                !newMilestone.summary ||
                                !newMilestone.description
                            }
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Adding...
                                </span>
                            ) : (
                                "Add Milestone"
                            )}
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 font-medium">{error}</p>
                </div>
            )}

            {/* Existing Milestones */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Existing Milestones ({milestones.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {milestones.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">🏛️</div>
                            <p className="text-gray-500 text-lg">No milestones yet</p>
                            <p className="text-gray-400 text-sm mt-1">Create your first milestone above</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {milestones.map((milestone) => {
                                const isEditing = editingId === milestone.id;
                                return (
                                    <div
                                        key={milestone.id}
                                        className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
                                    >
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={editMilestone.year ?? milestone.year}
                                                            onChange={(e) => setEditMilestone({ ...editMilestone, year: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                                        <input
                                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            value={editMilestone.title ?? milestone.title}
                                                            onChange={(e) => setEditMilestone({ ...editMilestone, title: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">summary</label>
                                                    <input
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={editMilestone.summary ?? milestone.summary}
                                                        onChange={(e) => setEditMilestone({ ...editMilestone, summary: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">description</label>
                                                    <textarea
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={editMilestone.description ?? milestone.description}
                                                        rows={4}
                                                        onChange={(e) => setEditMilestone({ ...editMilestone, description: e.target.value })}
                                                    />
                                                </div>

                                                {/* Edit Image Upload */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                                                    <div
                                                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
                                                        onClick={() => editFileInputRef.current?.click()}
                                                    >
                                                        {editImagePreview || milestone.imageId ? (
                                                            <div className="space-y-2">
                                                                <img
                                                                    src={
                                                                        editImagePreview ||
                                                                        (milestone.imageId ? images[milestone.imageId] : "")
                                                                    }
                                                                    alt="Preview"
                                                                    className="w-full h-40 object-cover rounded-md mx-auto"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-1">
                                                                <div className="text-3xl text-gray-300">🖼️</div>
                                                                <p className="text-gray-500 text-sm">Click to upload an image</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <input
                                                        ref={editFileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            handleImageUpload(file, true);
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setEditMilestone({});
                                                            setEditImagePreview("");
                                                        }}
                                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    {milestone.imageId && images[milestone.imageId] && (
                                                        <img
                                                            src={images[milestone.imageId]}
                                                            alt={milestone.title}
                                                            className="w-20 h-16 object-cover rounded-md"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                            {milestone.year} — {milestone.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mb-1">{milestone.summary}</p>
                                                        <p className="text-xs text-gray-500 line-clamp-2">{milestone.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(milestone.id);
                                                            setEditMilestone(milestone);
                                                            setEditImagePreview("");
                                                        }}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            milestone.imageId && handleDelete(milestone.id, milestone.imageId)
                                                        }
                                                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                                    >
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
                </CardContent>
            </Card>
        </div>
    );
}
