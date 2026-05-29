import { type TokenProp, notifyApiError } from "@/App";
import { useEffect, useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Essay = {
    id: string | null | undefined;
    title: string;
    author: string;
    content: string;
    featured: string;
    createdAt: Date | null;
    writtenAt: Date | null;
};

type SearchParams = {
    title: string;
    author: string;
    keyword: string;
    year: number | null
};

const FeaturedSuggestions: readonly string[] = [
    "1st",
    "2nd",
    "3rd",
    "Featured"
];

export default function EssaysAdmin({ token }: TokenProp) {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const [essays, setEssays] = useState<Essay[]>([]);
    const [newEssay, setNewEssay] = useState<Essay>({
        id: null,
        title: "",
        author: "",
        content: "",
        featured: "",
        createdAt: null,
        writtenAt: null
    });
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const featuredSuggestionsPopoverRef = useRef<HTMLDivElement>(null);
    const [featuredSuggestionsPopoverOpen, setFeaturedSuggestionsPopoverOpen] = useState(false);

    const [searchParams, setSearchParams] = useState<SearchParams>({
        title: "",
        author: "",
        keyword: "",
        year: null
    });

    const essaysPerPage = 6;

    const authHeaders = {
        headers: {Authorization: `Bearer ${token}`}
    };

    const formatUTCDate = (date: Date): string => {
        const ensureTwoDigits = (num: number): string => {
            return num < 10 ? `0${num}` : num.toString();
        };

        /** `getUTCMonth` is zero-indexed, so we have to convert it to be one-indexed */
        const month = ensureTwoDigits(date.getUTCMonth() + 1);
        const day = ensureTwoDigits(date.getUTCDate());

        return `${date.getUTCFullYear()}-${month}-${day}`;
    };

    /**
     * You might be wondering "Why is this function needed?"
     * 
     * It is needed because dates are serialized to strings
     * when sent over the network, meaning that we have to
     * deserialize them back into date objects in order
     * to use them properly
     * @param essay An essay received from over the network
     * @returns The {@link essay} with its date strings converted into date objects
     */
    const convertStringToDate = (essay: any): any => {
        if(essay.createdAt !== undefined && typeof essay.createdAt === "string") {
            essay.createdAt = new Date(essay.createdAt);
        }

        if(essay.writtenAt !== undefined && typeof essay.writtenAt === "string") {
            essay.writtenAt = new Date(essay.writtenAt);
        }

        return essay;
    };

    const fetchEssays = async (): Promise<void> => {
        try {
            axios.get(
                `${controllerUrl}/essays`,
                authHeaders
            ).then(res => {
                if(res.data !== undefined) {
                    setEssays((res.data as Essay[]).map(e => convertStringToDate(e)));
                } else {
                    setEssays([]);
                }
            }, (err: AxiosError) => {
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

    const resetNewEssay = (): void => {
        setNewEssay({
            id: null,
            title: "",
            author: "",
            content: "",
            featured: "",
            createdAt: null,
            writtenAt: null
        });
    };

    const beginCreatingEssay = (): void => {
        resetNewEssay();
        setNewEssay({...newEssay, id: undefined});
    };

    const addEssay = async (): Promise<void> => {
        // TODO: This needs more proper validation
        // Either that, or we need to implement validation on the back-end
        if(!newEssay.title) {
            alert("Essay title is required.");
            return;
        }

        try {
            setLoading(true);

            const data: any = {
                title: newEssay.title,
                author: newEssay.author,
                content: newEssay.content,
                writtenAt: newEssay.writtenAt!.toISOString()
            };

            if(newEssay.featured !== "") {
                data.featured = newEssay.featured;
            }

            axios.post(
                `${controllerUrl}/essays`,
                data,
                authHeaders
            ).then(res => {
                setEssays(prev => [...prev, convertStringToDate(res.data)]);
                resetNewEssay();
            }, (err: AxiosError) => {
                notifyApiError(err, "add essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginEditingEssay = async (id: string): Promise<void> => {
        if(newEssay.id !== null && !window.confirm("Any changes will be lost!")) return;

        try {
            axios.get(
                `${controllerUrl}/essays/${id}`,
                authHeaders
            ).then(res => {
                const selectedEssay: Essay = {
                    id: id,
                    title: res.data.title,
                    author: res.data.author,
                    content: res.data.content,
                    featured: res.data.featured,
                    createdAt: new Date(res.data.createdAt),
                    writtenAt: new Date(res.data.writtenAt)
                };

                setNewEssay(selectedEssay);
            }, (err: AxiosError) => {
                notifyApiError(err, "get essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const cancelEssayEdit = (): void => {
        if(!window.confirm("Cancel editing? Any changes will be lost!")) return;
        resetNewEssay();
    };

    const saveEssayEdit = async (): Promise<void> => {
        if(newEssay.id === null || newEssay.id === undefined) return;

        try {
            axios.put(
                `${controllerUrl}/essays/${newEssay.id}`,
                newEssay,
                authHeaders
            ).then(res => {
                setEssays(prev => prev.map((e) => e.id === newEssay.id ? convertStringToDate(res.data) : e));
                resetNewEssay();
            }, (err: AxiosError) => {
                notifyApiError(err, "save essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deleteEssay = async (id: string): Promise<void> => {
        if(!window.confirm("Delete this essay permanently?")) return;

        try {
            axios.delete(
                `${controllerUrl}/essays/${id}`,
                authHeaders
            ).then(() => {
                setEssays((prev) => prev.filter((e) => e.id !== id));
            }, (err: AxiosError) => {
                notifyApiError(err, "delete essay");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const searchEssays = async (): Promise<void> => {
        if(searchParams.title === "" && searchParams.author === "" && searchParams.keyword === "" && searchParams.year === null) {
            fetchEssays();
            return;
        }

        const params: any = {}

        if(searchParams.title !== "") params.title = searchParams.title;
        if(searchParams.author !== "") params.author = searchParams.author;
        if(searchParams.keyword !== "") params.keyword = searchParams.keyword;
        if(searchParams.year !== null) params.year = searchParams.year;

        try {
            axios.get(
                `${controllerUrl}/essays/filter`,
                {...authHeaders, params: params}
            ).then(res => {
                if(res.data !== undefined) {
                    setEssays((res.data as Essay[]).map(e => convertStringToDate(e)));
                } else {
                    setEssays([]);
                }
            }, (err: AxiosError) => {
                notifyApiError(err, "search essays");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const clearSearchFilter = async (): Promise<void> => {
        setSearchParams({
            title: "",
            author: "",
            keyword: "",
            year: null
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
                    <search>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Input
                                className="p-2 rounded min-w-30 flex-1"
                                placeholder="Title"
                                value={searchParams.title}
                                onChange={e => setSearchParams({...searchParams, title: e.target.value})}
                            />
                            <Input
                                className="p-2 rounded min-w-30 flex-1"
                                placeholder="Author"
                                value={searchParams.author}
                                onChange={e => setSearchParams({...searchParams, author: e.target.value})}
                            />
                            <Input
                                className="p-2 rounded min-w-30 flex-1"
                                placeholder="Keyword"
                                value={searchParams.keyword}
                                onChange={e => setSearchParams({...searchParams, keyword: e.target.value})}
                            />
                            <Input
                                className="p-2 rounded min-w-30 flex-1"
                                placeholder="Year"
                                value={searchParams.year === null ? "" : searchParams.year}
                                type="number"
                                onChange={e =>
                                    setSearchParams({
                                        ...searchParams,
                                        year: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber
                                    })
                                }
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
                    </search>
                </CardContent>
            </Card>

            {/* Essay List */}
            <Card className="mb-12">
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
                            {essays.slice(pageNumber * essaysPerPage, (pageNumber + 1) * essaysPerPage).map((essay) => (
                                <div
                                    key={essay.id}
                                    className="w-[20rem] min-h-[13rem] border border-gray-200 rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col justify-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {essay.title}
                                            </h3>
                                            <p className="text-gray-500">
                                                {essay.author}
                                            </p>
                                            <p className="text-gray-500">
                                                Written: {essay.writtenAt!.toLocaleDateString(undefined, {timeZone: "UTC"})}
                                            </p>
                                            <p className="text-gray-500">
                                                Submitted: {essay.createdAt!.toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 justify-center">
                                            <button
                                                onClick={() => beginEditingEssay(essay.id!)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteEssay(essay.id!)}
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
                            disabled={loading || (newEssay.id !== null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Essay
                        </button>
                        {/* Next Page */}
                        <button
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={((pageNumber + 1) * essaysPerPage) >= essays.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Essay */}
            {(newEssay.id !== null) && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">{newEssay.id === undefined ? "Create Essay" : "Edit Essay"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Input
                                    className="min-w-30 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Title"
                                    value={newEssay.title}
                                    onChange={e => setNewEssay({...newEssay, title: e.target.value})}
                                />
                                <Input
                                    className="min-w-30 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Author"
                                    value={newEssay.author}
                                    onChange={e => setNewEssay({...newEssay, author: e.target.value})}
                                />
                                <label className="flex items-center">
                                    Written On:
                                    <Input
                                        type="date"
                                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 ml-2 min-w-37 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newEssay.writtenAt === null ? "" : formatUTCDate(newEssay.writtenAt)}
                                        onChange={e => setNewEssay({...newEssay, writtenAt: e.target.valueAsDate})}
                                    />
                                </label>
                                <div className="flex flex-1" style={{anchorName: "--essays-admin-featured-suggestions-anchor"}}>
                                    <div className="min-w-30 flex flex-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <Input
                                            className="border-0 px-3 py-2"
                                            placeholder="Featured"
                                            value={newEssay.featured}
                                            onChange={e => setNewEssay({...newEssay, featured: e.target.value})}
                                        />
                                        <button
                                            className="p-2 cursor-pointer"
                                            popoverTarget="essays-admin-featured-suggestions-popover"
                                        >
                                            {/*
                                                The following SVG tag uses data from "https://www.iconpacks.net/"

                                                Specifically, the data is from the following two SVGs, with links provided:
                                                    "Up Chevron Black": "https://www.iconpacks.net/free-icon/up-chevron-black-16113.html"
                                                    "Down Chevron Black": "https://www.iconpacks.net/free-icon/down-chevron-black-16112.html"

                                                The data used is subject to the terms & conditions listed at "https://www.iconpacks.net/terms/"
                                            */}
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                xmlnsXlink="http://www.w3.org/1999/xlink"
                                                version="1.1"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 256 256"
                                                xmlSpace="preserve"
                                            >
                                                <g
                                                    style={{
                                                        stroke: "none",
                                                        strokeWidth: 0,
                                                        strokeDasharray: "none",
                                                        strokeLinecap: "butt",
                                                        strokeLinejoin: "miter",
                                                        strokeMiterlimit: 10,
                                                        fill: "none",
                                                        fillRule: "nonzero",
                                                        opacity: 1
                                                    }}
                                                    transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
                                                >
                                                    <path
                                                        d={featuredSuggestionsPopoverOpen ? (
                                                            // Up arrow data
                                                            "M 89.028 68.045 l -4.264 3.93 c -1.225 1.129 -3.132 1.051 -4.261 -0.174 l -34.473 -37.4 c -0.555 -0.602 -1.505 -0.602 -2.06 0 l -34.473 37.4 c -1.129 1.225 -3.037 1.302 -4.261 0.174 l -4.263 -3.93 c -1.225 -1.129 -1.302 -3.037 -0.174 -4.261 l 42.04 -45.609 c 1.164 -1.263 3.159 -1.263 4.323 0 l 42.04 45.609 C 90.331 65.008 90.253 66.916 89.028 68.045 z"
                                                        ) : (
                                                            // Down arrow data
                                                            "M 89.028 21.955 l -4.264 -3.93 c -1.225 -1.129 -3.132 -1.051 -4.261 0.174 l -34.473 37.4 c -0.555 0.602 -1.505 0.602 -2.06 0 l -34.473 -37.4 c -1.129 -1.225 -3.037 -1.302 -4.261 -0.174 l -4.263 3.93 c -1.225 1.129 -1.302 3.037 -0.174 4.261 l 42.04 45.609 c 1.164 1.263 3.159 1.263 4.323 0 l 42.04 -45.609 C 90.331 24.992 90.253 23.084 89.028 21.955 z"
                                                        )}
                                                        style={{
                                                            stroke: "none",
                                                            strokeWidth: 1,
                                                            strokeDasharray: "none",
                                                            strokeLinecap: "butt",
                                                            strokeLinejoin: "miter",
                                                            strokeMiterlimit: 10,
                                                            fill: "rgb(0, 0, 0)",
                                                            fillRule: "nonzero",
                                                            opacity: 1
                                                        }}
                                                        transform=" matrix(1 0 0 1 0 0) "
                                                        strokeLinecap="round"
                                                    />
                                                </g>
                                            </svg>
                                        </button>
                                    </div>
                                    <div
                                        id="essays-admin-featured-suggestions-popover"
                                        ref={featuredSuggestionsPopoverRef}
                                        popover="auto"
                                        className="absolute bg-card text-card-foreground rounded-xl border shadow-sm"
                                        style={{
                                            positionAnchor: "--essays-admin-featured-suggestions-anchor",
                                            top: "anchor(bottom)",
                                            left: "anchor(left)"
                                        }}
                                        onToggle={e => {setFeaturedSuggestionsPopoverOpen(e.newState === "open")}}
                                    >
                                        <ul className="text-body font-medium">
                                            {FeaturedSuggestions.map((value: string, index: number) => (
                                                <li className="flex" key={value}>
                                                    <button
                                                        className={
                                                            `hover:bg-gray-200 hover:text-heading cursor-pointer flex-1 rounded-xl pl-3 pr-3 ${
                                                                index === 0 ? (
                                                                    "pt-1 pb-0.5"
                                                                ) : index === (FeaturedSuggestions.length - 1) ? (
                                                                    "pt-0.5 pb-1"
                                                                ) : (
                                                                    "pt-0.5 pb-0.5"
                                                                )
                                                            }`
                                                        }
                                                        onClick={() => {
                                                            if(
                                                                newEssay.featured !== ""
                                                                && !FeaturedSuggestions.includes(newEssay.featured)
                                                                && !window.confirm("Selecting a suggestion will overwrite anything currently in the \"Featured\" field. Continue?")
                                                            ) {
                                                                return;
                                                            }

                                                            setNewEssay({...newEssay, featured: value});
                                                            featuredSuggestionsPopoverRef.current!.hidePopover();
                                                        }}
                                                    >
                                                        {value}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap">
                                <Textarea
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Contents"
                                    value={newEssay.content}
                                    onChange={e => setNewEssay({...newEssay, content: e.target.value})}
                                />
                            </div>
                            {newEssay.id === undefined ? (
                                <button
                                    onClick={addEssay}
                                    disabled={
                                        loading || newEssay.title === "" || newEssay.author === "" || newEssay.content.length < 32 || newEssay.writtenAt === null
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
                                        loading || newEssay.title === "" || newEssay.author === "" || newEssay.content.length < 32 || newEssay.writtenAt === null
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
