import { type TokenProp, notifyApiError } from "@/App";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Essay = {
    _id?: string;
    title?: string;
    author?: string;
    contents?: string;
    year?: number;
};

type SearchParams = {
    title: string;
    author: string;
    keyword: string;
    year: number | undefined
};

export default function EssaysAdmin({ token }: TokenProp) {
    const [essays, setEssays] = useState<Essay[]>([]);
    const [newEssay, setNewEssay] = useState<Essay>({
        title: "",
        author: "",
        contents: "",
        year: undefined
    });
    const [loading, setLoading] = useState(false);
    const [editingEssayId, setEditingEssayId] = useState<string | null | undefined>(null);
    const [pageNumber, setPageNumber] = useState(0);

    const [searchParams, setSearchParams] = useState<SearchParams>({
        title: "",
        author: "",
        keyword: "",
        year: undefined
    });

    const essaysPerPage = 6;

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchEssays = async () => {
        try {
            axios.get(
                import.meta.env.VITE_MONGO_CONTROLLER_URL + "/essays",
                authHeaders
            ).then(res => {
                setEssays(res.data.essays ?? []);
            }).catch((err: AxiosError) => {
                if(err.response && err.response.status === 404) return;
                notifyApiError(err, "fetch essays");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchEssays();
    }, [token]);

    const resetNewEssay = () => {
        setNewEssay({
            title: "",
            author: "",
            contents: "",
            year: undefined
        });
        setEditingEssayId(null);
    };

    const beginCreatingEssay = () => {
        resetNewEssay();
        setEditingEssayId(undefined);
    };

    const addEssay = async () => {
        if (!newEssay.title) {
            alert("Essay title is required.");
            return;
        }

        try {
            setLoading(true);

            axios.post(
                import.meta.env.VITE_MONGO_CONTROLLER_URL + "/essays",
                {
                    title: newEssay.title || undefined,
                    author: newEssay.author || undefined,
                    contents: newEssay.contents || undefined,
                    year: newEssay.year || undefined
                },
                authHeaders
            ).then(res => {
                setEssays(prev => [...prev, {_id: res.data.essayId, ...newEssay}]);
                resetNewEssay();
                fetchEssays();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "add essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginEditingEssay = async (id?: string) => {
        if(!id) return;
        if((editingEssayId !== null) && !window.confirm("Any changes will be lost!")) return;
        
        try {
            axios.get(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essays/${id}`, authHeaders
            ).then(res => {
                const selectedEssay: Essay = {
                    title: res.data.title,
                    author: res.data.author,
                    contents: res.data.contents,
                    year: Number(res.data.year)
                };

                setNewEssay(selectedEssay);
                setEditingEssayId(id);
            }).catch((err: AxiosError) => {
                notifyApiError(err, "get essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const cancelEssayEdit = () => {
        if(!window.confirm("Cancel editing? Any changes will be lost!")) return;
        resetNewEssay();
    };

    const saveEssayEdit = async () => {
        if(editingEssayId === null || editingEssayId === undefined) return;
        
        try {
            axios.put(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essays/${editingEssayId}`,
                newEssay,
                authHeaders
            ).then(res => {
                setEssays((prev) => prev.map((e) => e._id === editingEssayId ? res.data.essay : e));
                resetNewEssay();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "save essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deleteEssay = async (id?: string) => {
        if (!id) return;
        if (!window.confirm("Delete this essay permanently?")) return;

        try {
            axios.delete(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essays/${id}`,
                authHeaders
            ).then(() => {
                setEssays((prev) => prev.filter((e) => e._id !== id));
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const searchEssays = async () => {
        if(searchParams.title === "" && searchParams.author === "" && searchParams.keyword === "" && searchParams.year === undefined) {
            fetchEssays();
            return;
        }

        const titleParam = searchParams.title === "" ? "NULL" : searchParams.title;
        const authorParam = searchParams.author === "" ? "NULL" : searchParams.author;
        const keywordParam = searchParams.keyword === "" ? "NULL" : searchParams.keyword;
        const yearParam = searchParams.year === undefined ? "NULL" : String(searchParams.year);

        try {
            axios.get(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essays/filtered/${titleParam}/${authorParam}/${keywordParam}/${yearParam}`
            ).then(res => {
                setEssays(res.data.essays);
            }).catch((err: AxiosError) => {
                if(err.response) {
                    if(err.response.status === 404) {
                        setEssays([]);
                        return;
                    }
                    notifyApiError(err, "search essays");
                }
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
            setEssays([]);
        }
    };

    const clearSearchFilter = async () => {
        setSearchParams({
            title: "",
            author: "",
            keyword: "",
            year: undefined
        });
        fetchEssays();
    };

    return (
        <div>
            {/* Header */}
            <h2 className="text-3xl font-bold text-gray-900 pb-5">Essay Management</h2>

            {/* Essay Search */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex justify-center gap-2">
                        <Input
                            className="p-2 rounded flex-1"
                            placeholder="Title"
                            value={searchParams.title}
                            onChange={e => setSearchParams({...searchParams, title: e.target.value})}
                        />
                        <Input
                            className="p-2 rounded flex-1"
                            placeholder="Author"
                            value={searchParams.author}
                            onChange={e => setSearchParams({...searchParams, author: e.target.value})}
                        />
                        <Input
                            className="p-2 rounded flex-1"
                            placeholder="Keyword"
                            value={searchParams.keyword}
                            onChange={e => setSearchParams({...searchParams, keyword: e.target.value})}
                        />
                        <Input
                            className="p-2 rounded w-24"
                            placeholder="Year"
                            value={searchParams.year === undefined ? "" : searchParams.year}
                            type="number"
                            onChange={e => setSearchParams({...searchParams, year: (e.target.value ? Number(e.target.value) : undefined)})}
                        />
                        <button
                            onClick={clearSearchFilter}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={searchEssays}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Search
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Essay List */}
            <Card className="mb-15">
                <CardHeader>
                    {essays.length !== 0 ? (
                        <CardTitle className="text-xl">Showing page {pageNumber + 1} of {Math.ceil(essays.length / essaysPerPage)}</CardTitle>
                    ) : (
                        <CardTitle className="text-gray-400 text-xl font-normal mt-4">No essays found.</CardTitle>
                    )}
                </CardHeader>
                <CardContent>
                    {essays.length !== 0 && (
                        <div className="flex flex-wrap justify-center mb-3">
                            {essays.slice(pageNumber * essaysPerPage, ((pageNumber + 1) * essaysPerPage)).map((essay) => (
                                <div
                                    key={essay._id}
                                    className="w-[20rem] h-[10rem] border border-gray-200 rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col justify-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {essay.title}
                                            </h3>
                                            <p className="text-gray-500">
                                                {essay.author} - {essay.year}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 justify-center">
                                            <button
                                                onClick={() => beginEditingEssay(essay._id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteEssay(essay._id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center gap-2 pb-3 mt-3">
                        {/* Previous Page */}
                        <button
                            onClick={() => setPageNumber(pageNumber - 1)}
                            disabled={pageNumber <= 0}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous Page
                        </button>
                        {/* Add New Essay */}
                        <button
                            onClick={beginCreatingEssay}
                            disabled={loading || (editingEssayId !== null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Essay
                        </button>
                        {/* Next Page */}
                        <button
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={((pageNumber + 1) * essaysPerPage) > essays.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Essay */}
            {(editingEssayId !== null) && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">{editingEssayId === undefined ? "Create Essay" : "Edit Essay"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Input
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Title"
                                    value={newEssay.title}
                                    onChange={e => setNewEssay({ ...newEssay, title: e.target.value })}
                                />
                                <Input
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Author"
                                    value={newEssay.author}
                                    onChange={e => setNewEssay({ ...newEssay, author: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                                    placeholder="Year"
                                    value={newEssay.year === undefined ? "" : String(newEssay.year)}
                                    onChange={e =>
                                        setNewEssay({
                                            ...newEssay,
                                            year: e.target.value ? Number(e.target.value) : undefined
                                        })
                                    }
                                />
                            </div>
                            <div className="flex flex-wrap">
                                <Textarea
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Contents"
                                    value={newEssay.contents}
                                    onChange={e => setNewEssay({ ...newEssay, contents: e.target.value })}
                                />
                            </div>
                            {editingEssayId === undefined ? (
                                <button
                                    onClick={addEssay}
                                    disabled={
                                        loading || !newEssay.title || !newEssay.author || !newEssay.contents || newEssay.contents.length < 32 || !newEssay.year
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
                                        "Add Essay"
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={saveEssayEdit}
                                    disabled={
                                        loading || !newEssay.title || !newEssay.author || !newEssay.contents || newEssay.contents.length < 32 || !newEssay.year
                                    }
                                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : (
                                        "Save Essay"
                                    )}
                                </button>
                            )}
                            <button
                                onClick={cancelEssayEdit}
                                disabled={loading}
                                className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
