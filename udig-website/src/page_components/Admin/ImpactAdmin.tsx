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
    const [newCard, setNewCard] = useState<Omit<ImpactCard, "id">>({
        title: "",
        summary: "",
        description: ""
    });
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editCard, setEditCard] = useState<Partial<ImpactCard>>({});
    const [loading, setLoading] = useState(false);

    // -------- Fetch Impact Cards safely --------
    useEffect(() => {
        if (!token) return;

        const fetchCards = async () => {
            try {
                const data = await getImpactCards();
                if (!Array.isArray(data)) {
                    console.error("API did not return an array:", data);
                    setCards([]);
                    return;
                }
                setCards(data);
            } catch (err) {
                console.error("Failed to fetch impact cards:", err);
                setCards([]);
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
            setCards((prev) => [...prev, { id: cardId, ...newCard }]);
            setNewCard({ title: "", summary: "", description: "" });
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
            const payload = {
            title: editCard.title ?? "",
            summary: editCard.summary ?? "",
            description: editCard.description ?? ""
        };

            await updateImpactCard(editingCardId, payload, token);

            setCards((prev) =>
                prev.map((c) =>
                    c.id === editingCardId ? {
                    ...c,
                    title: payload.title,
                    summary: payload.summary,
                    description: payload.description
                } : c
                )
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
            setCards((prev) => prev.filter((c) => c.id !== id));
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
                        <input
                            className="w-full border px-3 py-2 rounded"
                            placeholder="Title"
                            value={newCard.title}
                            onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                        />
                        <input
                            className="w-full border px-3 py-2 rounded"
                            placeholder="Summary"
                            value={newCard.summary}
                            onChange={(e) => setNewCard({ ...newCard, summary: e.target.value })}
                        />
                        <textarea
                            className="w-full border px-3 py-2 rounded"
                            placeholder="Description"
                            value={newCard.description}
                            onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
                        />

                        <button
                            onClick={handleAddCard}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded"
                        >
                            Add Impact Card
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Existing Cards */}
            <Card>
                <CardHeader>
                    <CardTitle>Existing Impact Cards ({cards.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {cards.map((card) => {
                        const isEditing = editingCardId === card.id;

                        return (
                            <div key={card.id} className="border p-4 rounded mb-4">
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <input
                                            className="w-full border px-3 py-2 rounded"
                                            value={editCard.title || ""}
                                            onChange={(e) =>
                                                setEditCard(prev => ({
                                                    ...prev,
                                                    title: e.target.value
                                                }))
                                            }
                                        />

                                        <input
                                            className="w-full border px-3 py-2 rounded"
                                            value={editCard.summary || ""}
                                            onChange={(e) =>
                                                setEditCard(prev => ({
                                                    ...prev,
                                                    summary: e.target.value
                                                }))
                                            }
                                        />

                                        <textarea
                                            className="w-full border px-3 py-2 rounded"
                                            value={editCard.description || ""}
                                            onChange={(e) =>
                                                setEditCard(prev => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))
                                            }
                                        />

                                        <button onClick={handleSaveEdit} className="bg-green-600 text-white px-3 py-1 rounded">
                                            Save
                                        </button>

                                        <button
                                            onClick={() => {
                                                setEditingCardId(null);
                                                setEditCard({});
                                            }}
                                            className="ml-2 bg-gray-400 text-white px-3 py-1 rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="font-bold">{card.title}</h3>
                                        <p>{card.summary}</p>
                                        <p className="text-sm text-gray-500">{card.description}</p>

                                        <button
                                            onClick={() => {
                                                setEditingCardId(card.id);
                                                setEditCard({
                                                    title: card.title,
                                                    summary: card.summary,
                                                    description: card.description
                                                });
                                            }}
                                            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(card.id)}
                                            className="ml-2 bg-red-600 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}