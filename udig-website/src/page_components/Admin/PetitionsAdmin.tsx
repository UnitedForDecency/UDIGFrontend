import { type TokenProp, notifyApiError } from "@/App";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"
import { localityTypes, petitionTypes, states } from "@/lib/constants"

type Petition = {
    _id?: string;
    name?: string;
    description?: string;
    image?: string;
    link?: string;
    city?: string;
    state?: string;
    locality?: number;
    type?: number;
}

export default function PetitionsAdmin({ token }: TokenProp) {
    const petitionsApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/petitions`;
    const [petitions, setPetitions] = useState<Petition[]>([]);
    const [newPetition, setNewPetition] = useState<Petition>({
        name: "",
        description: "",
        image: "",
        link: "",
        city: "",
        state: "",
        locality: undefined,
        type: undefined
    });
    const [editingPetitionId, setEditingPetitionId] = useState<string | null>(null);
    const [editingPetitionIsNew, setEditingPetitionIsNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);

    const [searchState, setSearchState] = useState("");
    const [searchType, setSearchType] = useState<number | undefined>(undefined);
    const [searchKeyword, setSearchKeyword] = useState("");

    const petitionsPerPage = 6;

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchPetitions();
    }, [token]);

    const fetchPetitions = async () => {
        try {
            axios.get(
                petitionsApiUrl,
                authHeaders
            ).then(res => {
                setPetitions(res.data.petitions ?? []);
            }).catch((err: AxiosError) => {
                if (err.response && err.response.status === 404) return;
                notifyApiError(err, "fetch campaigns");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const resetNewPetition = () => {
        setNewPetition({
            name: "",
            description: "",
            image: "",
            link: "",
            city: "",
            state: "",
            locality: undefined,
            type: undefined
        });
        setEditingPetitionId(null);
    }

    const beginCreatingPetition = () => {
        setEditingPetitionIsNew(true);
        resetNewPetition();
        setEditingPetitionId("New campaign, ID not yet assigned");
    }

    const addPetition = async () => {
        try {
            setLoading(true);

            axios.post(
                petitionsApiUrl,
                {
                    name: newPetition.name,
                    description: newPetition.description,
                    image: newPetition.image,
                    link: newPetition.link,
                    city: newPetition.city,
                    state: newPetition.state,
                    locality: newPetition.locality,
                    type: newPetition.type
                },
                authHeaders
            ).then(res => {
                setPetitions(prev => [...prev, { _id: res.data.petitionId, ...newPetition }]);
                resetNewPetition();
                fetchPetitions();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "add campaign");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginEditingPetition = async (id?: string) => {
        if (!id) return;
        if (editingPetitionId && !window.confirm("Any changes will be lost!")) return;
        setEditingPetitionIsNew(false);
        try {
            axios.get(
                `${petitionsApiUrl}/${id}`,
                authHeaders
            ).then(res => {
                const selectedPetition = {
                    name: res.data.name,
                    description: res.data.description,
                    image: res.data.image,
                    link: res.data.link,
                    city: res.data.city,
                    state: res.data.state,
                    locality: res.data.locality,
                    type: res.data.locality,
                }
                setNewPetition(selectedPetition);
                setEditingPetitionId(id);
            }).catch((err: AxiosError) => {
                notifyApiError(err, "get campaign");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const cancelPetitionEdit = () => {
        if (!window.confirm("Cancel editing? Any changes will be lost!")) return;
        resetNewPetition();
    }

    const savePetitionEdit = async () => {
        if (!editingPetitionId) return;
        try {
            axios.put(
                `${petitionsApiUrl}/${editingPetitionId}`,
                newPetition,
                authHeaders
            ).then(res => {
                setPetitions((prev) => prev.map((p) => p._id === editingPetitionId ? res.data.petition : p));
                resetNewPetition();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "save campaign");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deletePetition = async (id?: string) => {
        if (!id) return;
        if (!window.confirm("Delete this campaign forever?")) return;

        try {
            axios.delete(
                `${petitionsApiUrl}/${id}`,
                authHeaders
            ).then(() => {
                setPetitions(prev => prev.filter(p => p._id !== id));
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete campaign");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const searchPetitions = async () => {
        if (searchState == "" && searchType == undefined && searchKeyword == "") {
            fetchPetitions();
            return;
        }

        const stateParam = searchState == "" ? "NULL" : searchState;
        const typeParam = searchType == undefined ? -1 : searchType;
        const keywordParam = searchKeyword == "" ? "NULL" : searchKeyword;

        try {
            axios.get(
                `${petitionsApiUrl}/filtered/${stateParam}/${typeParam}/${keywordParam}`
            ).then(res => {
                setPetitions(res.data.petitions);
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setPetitions([]);
                        return;
                    }
                    notifyApiError(err, "search campaigns");
                }
            });
        }
        catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
            setPetitions([]);
        }
    };

    const clearSearchFilter = async () => {
        setSearchState("");
        setSearchType(undefined);
        setSearchKeyword("");
        fetchPetitions();
    };

    return (
        <div>
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 pb-5">Petition and Campaign Management</h2>
            </div>

            {/* Petition Search */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex justify-center gap-2">
                        <Select value={searchState} onValueChange={(value) => setSearchState(value)}>
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="State" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    <SelectLabel>State</SelectLabel>
                                    {Object.entries(states).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select value={searchType != undefined ? searchType.toString() : ""} onValueChange={(value) => setSearchType(Number.parseInt(value))}>
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    <SelectLabel>Type</SelectLabel>
                                    {Object.entries(petitionTypes).map(([label, value]) => (
                                        <SelectItem key={value} value={value + ""}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Input
                            className="p-2 rounded w-80"
                            placeholder="Keyword"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                        />
                        <button
                            onClick={clearSearchFilter}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={searchPetitions}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Search
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Petition List */}
            <Card className="mb-15">
                <CardHeader>
                    {
                        petitions.length !== 0 ?
                            <CardTitle className="text-xl">Showing page {pageNumber + 1} of {Math.ceil(petitions.length / petitionsPerPage)}</CardTitle>
                            :
                            <CardTitle className="text-gray-400 text-xl font-normal mt-4">No campaigns found.</CardTitle>
                    }
                </CardHeader>
                <CardContent>
                    {petitions.length !== 0 &&
                        <div className="flex flex-wrap justify-center mb-3">
                            {petitions.slice(pageNumber * petitionsPerPage, (pageNumber + 1 * petitionsPerPage)).map((petition) => (
                                <div
                                    key={petition._id}
                                    className="w-[20rem] h-[10rem] border border-gray-200 rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col justify-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {petition.name}
                                            </h3>
                                            <p className="text-gray-500">
                                                {
                                                    "(" +
                                                    Object.keys(petitionTypes).find(k => petitionTypes[k as keyof typeof petitionTypes] === petition.type)
                                                    + ")"
                                                }
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 justify-center">
                                            <button
                                                onClick={() => {
                                                    beginEditingPetition(petition._id);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deletePetition(petition._id)}
                                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    }
                    <div className="flex justify-center gap-2 pb-3 mt-3">
                        { /* Previous page */}
                        <button
                            onClick={() => setPageNumber(pageNumber - 1)}
                            disabled={pageNumber <= 0}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Last Page
                        </button>
                        { /* Add new event */}
                        <button
                            onClick={beginCreatingPetition}
                            disabled={loading || editingPetitionId != null}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Campaign
                        </button>
                        { /* Next page */}
                        <button
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={((pageNumber + 1) * petitionsPerPage) > petitions.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {
                /* Edit Petition */
                (editingPetitionId != null) &&
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">{editingPetitionId == "New campaign, ID not yet assigned" ? "Create Campaign" : "Edit Campaign"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="flex flex-wrap font-semibold mb-2">Basic Information</h3>
                        <div className="space-y-4">
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Campaign name"
                                    value={newPetition.name}
                                    onChange={e => setNewPetition({ ...newPetition, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Textarea
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Description"
                                    value={newPetition.description}
                                    onChange={e => setNewPetition({ ...newPetition, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Select value={newPetition.type?.toString()} onValueChange={(value) => setNewPetition({ ...newPetition, type: Number.parseInt(value) })}>
                                    <SelectTrigger className="w-full max-w-48">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Type</SelectLabel>
                                            {Object.entries(petitionTypes).map(([label, value]) => (
                                                <SelectItem key={value} value={value + ""}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Image link"
                                    value={newPetition.image}
                                    onChange={e => setNewPetition({ ...newPetition, image: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Campaign link"
                                    value={newPetition.link}
                                        onChange={e => setNewPetition({ ...newPetition, link: e.target.value })}
                                />
                            </div>
                            <h3 className="flex flex-wrap font-semibold mb-2">Location</h3>
                            <div>
                                <Select value={newPetition.locality?.toString()} onValueChange={(value) => setNewPetition({ ...newPetition, locality: Number.parseInt(value) })}>
                                    <SelectTrigger className="w-full max-w-48">
                                        <SelectValue placeholder="Locality" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectGroup>
                                            <SelectLabel>Locality</SelectLabel>
                                            {Object.entries(localityTypes).map(([label, value]) => (
                                                label != "City" &&
                                                <SelectItem key={value} value={value + ""}>
                                                    {label + "-wide"}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            {(newPetition.locality != undefined && newPetition.locality != 2) &&
                                <div className="flex flex-wrap gap-2 pb-4">
                                    <Select value={newPetition.state} onValueChange={(value) => setNewPetition({ ...newPetition, state: value })}>
                                        <SelectTrigger className="w-full max-w-48">
                                            <SelectValue placeholder="State" />
                                        </SelectTrigger>
                                        <SelectContent position="popper">
                                            <SelectGroup>
                                                <SelectLabel>State</SelectLabel>
                                                {Object.entries(states).map(([value, label]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                            {
                                editingPetitionIsNew && (
                                    <button
                                        onClick={addPetition}
                                        disabled={
                                            loading || !newPetition.name || !newPetition.description || newPetition.type === undefined || !newPetition.image || !newPetition.link || newPetition.locality === undefined
                                            || (newPetition.locality != localityTypes.Nation && !newPetition.state)
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
                                            "Add Campaign"
                                        )}
                                    </button>
                                )
                            }
                            {
                                !editingPetitionIsNew && (
                                    <button
                                        onClick={savePetitionEdit}
                                        disabled={
                                            loading || !newPetition.name || !newPetition.description || newPetition.type === undefined || !newPetition.image || !newPetition.link || newPetition.locality === undefined
                                            || (newPetition.locality != localityTypes.Nation && !newPetition.state)
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
                                            "Save Campaign"
                                        )}
                                    </button>
                                )
                            }
                            <button
                                onClick={cancelPetitionEdit}
                                disabled={loading}
                                className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </CardContent>
                </Card>
            }
        </div>
    );
}
