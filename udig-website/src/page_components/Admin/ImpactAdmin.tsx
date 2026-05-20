import { type TokenProp } from "@/App";
import { useEffect, useState } from "react";
import {
    type ImpactCard,
    getImpactCards,
    createImpactCard,
    updateImpactCard,
    deleteImpactCard
} from "./impactAPI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImpactAdmin({ token }: TokenProp) {
    const [cards, setCards] = useState<ImpactCard[]>([]);
    const [newCard, setNewCard] = useState<Omit<ImpactCard, "_id">>({
        title: "",
        description: "",
        details: ""
    });
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editCard, setEditCard] = useState<Partial<ImpactCard>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // -------- Fetch Impact Cards safely --------
    useEffect(() => {
        if (!token) return;

        const fetchCards = async () => {
            try {
                const data = await getImpactCards();
                if (!Array.isArray(data)) {
                    console.error("API did not return an array:", data);
                    setCards([]);
                    setError("Failed to load impact cards.");
                    return;
                }
                const validCards = data.filter(c => c._id);
                setCards(validCards);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch impact cards:", err);
                setCards([]);
                setError("Failed to load impact cards.");
            }
        };
        fetchCards();
    }, [token]);

    const handleAddCard = async () => {
        if (!token) {
            alert("Cannot add card: missing token");
            return;
        }
        if (!newCard.title) return alert("Title is required!");

        try {
            setLoading(true);
            const res = await createImpactCard(newCard, token);
            const cardId = res?.data?.cardId;
            if (!cardId) throw new Error("API did not return cardId");
            setCards((prev) => [...prev, { _id: cardId, ...newCard }]);
            setNewCard({ title: "", description: "", details: "" });
        } catch (err) {
            console.error("Failed to add card:", err);
            alert("Failed to add card");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!token || !editingCardId) return;
        try {
            await updateImpactCard(editingCardId, editCard, token);
            setCards((prev) =>
                prev.map((c) => (c._id === editingCardId ? { ...c, ...editCard } : c))
            );
            setEditingCardId(null);
            setEditCard({});
        } catch (err) {
            console.error("Failed to save edit:", err);
            alert("Failed to save edit");
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) return;
        if (!window.confirm("Delete this impact card permanently?")) return;

        try {
            await deleteImpactCard(id, token);
            setCards((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete card");
        }
    };

    if (!token) {
        return (
            <div className="p-4">
                <p className="text-red-500">Admin token missing. Please log in to manage impact cards.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Impact Cards Management</h2>
                <p className="text-gray-600 mt-2">Create and manage impact highlights for your organization</p>
            </div>

            {/* Add New Card Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Add New Impact Card</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Community Outreach Program"
                                value={newCard.title}
                                onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <input
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Brief summary shown on card"
                                value={newCard.description}
                                onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Details <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Full content displayed in modal popup"
                                rows={5}
                                value={newCard.details}
                                onChange={(e) => setNewCard({ ...newCard, details: e.target.value })}
                            />
                        </div>
                        <button
                            onClick={handleAddCard}
                            disabled={loading || !newCard.title || !newCard.description || !newCard.details}
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
                                "Add Impact Card"
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

            {/* Existing Cards */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Existing Impact Cards ({cards.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {cards.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">📋</div>
                            <p className="text-gray-500 text-lg">No impact cards yet</p>
                            <p className="text-gray-400 text-sm mt-1">Create your first card below</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {cards.map((card) => {
                                const isEditing = editingCardId === card._id;
                                return (
                                    <div
                                        key={card._id}
                                        className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
                                    >
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Title
                                                    </label>
                                                    <input
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={editCard.title ?? card.title}
                                                        placeholder="Title"
                                                        onChange={(e) =>
                                                            setEditCard({ ...editCard, title: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <input
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={editCard.description ?? card.description}
                                                        placeholder="Brief summary"
                                                        onChange={(e) =>
                                                            setEditCard({ ...editCard, description: e.target.value })
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Details
                                                    </label>
                                                    <textarea
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        value={editCard.details ?? card.details}
                                                        placeholder="Full content for modal"
                                                        rows={4}
                                                        onChange={(e) =>
                                                            setEditCard({ ...editCard, details: e.target.value })
                                                        }
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
                                                            setEditingCardId(null);
                                                            setEditCard({});
                                                        }}
                                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                        {card.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {card.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {card.details}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCardId(card._id);
                                                            setEditCard(card);
                                                        }}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(card._id)}
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