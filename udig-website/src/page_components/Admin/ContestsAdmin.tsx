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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Contest = {
    _id?: string;
    description: string;
    prize: number | null;
    title: string;
    topic: string;
    winner: string;
    startdate: Date | null;
    enddate: Date | null;
};

type SearchParams = {
    title: string;
    topic: string;
    ongoing: boolean | null;
    keyword: string;
};

export default function ContestsAdmin({token}: TokenProp) {
    const [contests, setContests] = useState<Contest[]>([]);
    const [newContest, setNewContest] = useState<Contest>({
        description: "",
        prize: null,
        title: "",
        topic: "",
        winner: "",
        startdate: null,
        enddate: null
    });
    const [loading, setLoading] = useState(false);
    const [editingContestId, setEditingContestId] = useState<string | null | undefined>(null);
    const [pageNumber, setPageNumber] = useState(0);

    const [searchParams, setSearchParams] = useState<SearchParams>({
        title: "",
        topic: "",
        ongoing: null,
        keyword: ""
    });

    const contestsPerPage = 6;

    const authHeaders = {
        headers: {Authorization: `Bearer ${token}`}
    };

    const contestIsOngoing = (startdate: Date, enddate: Date) => {
        const currentDate = new Date();

        return (startdate <= currentDate) && (enddate > currentDate);
    };

    const formatLocalDateTime = (date: Date) => {
        const ensureTwoDigits = (num: number) => {
            return num < 10 ? `0${num}` : num.toString();
        };

        const month = ensureTwoDigits(date.getMonth() + 1);
        const day = ensureTwoDigits(date.getDate());
        const hour = ensureTwoDigits(date.getHours());
        const minute = ensureTwoDigits(date.getMinutes());

        return `${date.getFullYear()}-${month}-${day}T${hour}:${minute}`;
    };

    const fetchContests = async () => {
        try {
            axios.get(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essaycontest/contests`,
                authHeaders
            ).then(res => {
                if(res.data.contests != undefined) {
                    for(let contest of res.data.contests) {
                        contest.startdate = new Date(contest.startdate);
                        contest.enddate = new Date(contest.enddate);
                    }

                    setContests(res.data.contests);
                } else {
                    setContests([]);
                }
            }).catch((err: AxiosError) => {
                if(err.response && err.response.status === 404) return;
                notifyApiError(err, "fetch contests");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchContests();
    }, [token]);

    const resetNewContest = () => {
        setNewContest({
            description: "",
            prize: null,
            title: "",
            topic: "",
            winner: "",
            startdate: null,
            enddate: null
        });
        setEditingContestId(null);
    };

    const beginCreatingContest = () => {
        resetNewContest();
        setEditingContestId(undefined);
    };

    const addContest = async () => {
        try {
            setLoading(true);

            axios.post(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essaycontest/contests`,
                {
                    description: newContest.description,
                    prize: newContest.prize!,
                    title: newContest.title,
                    topic: newContest.topic,
                    winner: newContest.winner,
                    startdate: newContest.startdate!,
                    enddate: newContest.enddate!
                },
                authHeaders
            ).then(res => {
                setContests(prev => [...prev, {_id: res.data.contestId, ...newContest}]);
                resetNewContest();
                fetchContests();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "add contest");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginEditingContest = async (id?: string) => {
        if(!id) return;
        if((editingContestId !== null) && !window.confirm("Any changes will be lost!")) return;

        try {
            axios.get(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essaycontest/contests/${id}`, authHeaders
            ).then(res => {
                const selectedContest: Contest = {
                    description: res.data.description,
                    prize: Number(res.data.prize),
                    title: res.data.title,
                    topic: res.data.topic,
                    winner: res.data.winner,
                    startdate: new Date(res.data.startdate),
                    enddate: new Date(res.data.enddate)
                };

                setNewContest(selectedContest);
                setEditingContestId(id);
            }).catch((err: AxiosError) => {
                notifyApiError(err, "get contest");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const cancelContestEdit = () => {
        if(!window.confirm("Cancel editing? Any changes will be lost!")) return;
        resetNewContest();
    };

    const saveContestEdit = async () => {
        if(editingContestId === null || editingContestId === undefined) return;

        try {
            axios.put(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essaycontest/contests/${editingContestId}`,
                newContest,
                authHeaders
            ).then(res => {
                setContests((prev) => prev.map((e) => e._id === editingContestId ? res.data.contest : e));
                resetNewContest();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "save contest");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deleteContest = async (id?: string) => {
        if(!id) return;
        if(!window.confirm("Delete this essay contest permanently?\nThis will also delete all submissions for this contest!")) return;

        // TODO: Need to ensure that all submissions linked to a contest get deleted along side it
    };

    const searchContests = async () => {
        if(searchParams.title === "" && searchParams.topic === "" && searchParams.ongoing === null && searchParams.keyword === "") {
            fetchContests();
            return;
        }

        const titleParam = searchParams.title === "" ? "NULL" : searchParams.title;
        const topicParam = searchParams.topic === "" ? "NULL" : searchParams.topic;
        const ongoingParam = searchParams.ongoing === null ? "NULL" : String(searchParams.ongoing);
        const keywordParam = searchParams.keyword === "" ? "NULL" : searchParams.keyword;

        try {
            axios.get(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essaycontest/contests/filtered/${titleParam}/${topicParam}/${ongoingParam}/${keywordParam}`
            ).then(res => {
                if(res.data.contests != undefined) {
                    for(let contest of res.data.contests) {
                        contest.startdate = new Date(contest.startdate);
                        contest.enddate = new Date(contest.enddate);
                    }

                    setContests(res.data.contests);
                } else {
                    setContests([]);
                }
            }).catch((err: AxiosError) => {
                if(err.response) {
                    if(err.response.status === 404) {
                        setContests([]);
                        return;
                    }
                    notifyApiError(err, "search contests");
                }
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
            setContests([]);
        }
    };

    const clearSearchFilter = async () => {
        setSearchParams({
            title: "",
            topic: "",
            ongoing: null,
            keyword: ""
        });
        fetchContests();
    };

    return (
        <div>
            {/* Header */}
            <h2 className="text-3xl font-bold text-gray-900 pb-5">Essay Contest Management</h2>

            {/* Contest Search */}
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
                            placeholder="Topic"
                            value={searchParams.topic}
                            onChange={e => setSearchParams({...searchParams, topic: e.target.value})}
                        />
                        <Select
                            value={searchParams.ongoing === null ? "" : String(searchParams.ongoing)}
                            onValueChange={value => setSearchParams({...searchParams, ongoing: value === "true"})}
                        >
                            <SelectTrigger className="w-full max-w-30">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                <SelectGroup>
                                    <SelectLabel>Status</SelectLabel>
                                    <SelectItem key="true" value="true">
                                        Ongoing
                                    </SelectItem>
                                    <SelectItem key="false" value="false">
                                        Ended
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Input
                            className="p-2 rounded flex-1"
                            placeholder="Keyword"
                            value={searchParams.keyword}
                            onChange={e => setSearchParams({...searchParams, keyword: e.target.value})}
                        />
                        <button
                            onClick={clearSearchFilter}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={searchContests}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Search
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Contest List */}
            <Card className="mb-15">
                <CardHeader>
                    {contests.length !== 0 ? (
                        <CardTitle className="text-xl">Showing page {pageNumber + 1} of {Math.ceil(contests.length / contestsPerPage)}</CardTitle>
                    ) : (
                        <CardTitle className="text-gray-400 text-xl font-normal mt-4">No contests found.</CardTitle>
                    )}
                </CardHeader>
                <CardContent>
                    {contests.length !== 0 && (
                        <div className="flex flex-wrap justify-center mb-3">
                            {contests.slice(pageNumber * contestsPerPage, ((pageNumber + 1) * contestsPerPage)).map((contest) => (
                                <div
                                    key={contest._id}
                                    className="w-[20rem] h-[10rem] border border-gray-200 rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col justify-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {contest.title}
                                            </h3>
                                            <p className="text-gray-500">
                                                {contest.topic} - {contestIsOngoing(contest.startdate!, contest.enddate!) ? "Ends" : "Ended"} {contest.enddate!.toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 justify-center">
                                            <button
                                                onClick={() => beginEditingContest(contest._id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteContest(contest._id)}
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
                        {/* Add New Contest */}
                        <button
                            onClick={beginCreatingContest}
                            disabled={loading || (editingContestId !== null)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Contest
                        </button>
                        {/* Next Page */}
                        <button
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={((pageNumber + 1) * contestsPerPage) > contests.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Contest */}
            {(editingContestId !== null) && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">{editingContestId === undefined ? "Create Contest" : "Edit Contest"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Input
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Title"
                                    value={newContest.title}
                                    onChange={e => setNewContest({...newContest, title: e.target.value})}
                                />
                                <Input
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Topic"
                                    value={newContest.topic}
                                    onChange={e => setNewContest({...newContest, topic: e.target.value})}
                                />
                                <Input
                                    type="number"
                                    className="border border-gray-300 rounded-md px-3 py-2 min-w-24 max-w-30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Prize"
                                    value={newContest.prize ?? ""}
                                    onChange={e =>
                                        setNewContest({
                                            ...newContest,
                                            prize: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber
                                        })
                                    }
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <label className="flex items-center">
                                    Start Date:
                                </label>
                                <Input
                                    type="datetime-local"
                                    className="border border-gray-300 rounded-md px-3 py-2 min-w-55 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    value={newContest.startdate === null ? "" : formatLocalDateTime(newContest.startdate)}
                                    onChange={e => {
                                        const date: Date = new Date(e.target.value);

                                        setNewContest({
                                            ...newContest,
                                            startdate: isNaN(date.valueOf()) ? null : date
                                        });
                                    }}
                                />
                                <label className="flex items-center">
                                    End Date:
                                </label>
                                <Input
                                    type="datetime-local"
                                    className="border border-gray-300 rounded-md px-3 py-2 min-w-55 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    value={newContest.enddate === null ? "" : formatLocalDateTime(newContest.enddate)}
                                    onChange={e => {
                                        const date: Date = new Date(e.target.value);

                                        setNewContest({
                                            ...newContest,
                                            enddate: isNaN(date.valueOf()) ? null : date
                                        });
                                    }}
                                />
                            </div>
                            <div className="flex flex-wrap">
                                <Textarea
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Description"
                                    value={newContest.description}
                                    onChange={e => setNewContest({...newContest, description: e.target.value})}
                                />
                            </div>
                            {editingContestId === undefined ? (
                                <button
                                    onClick={addContest}
                                    disabled={
                                        loading
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
                                        "Add Contest"
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={saveContestEdit}
                                    disabled={
                                        loading
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
                                        "Save Contest"
                                    )}
                                </button>
                            )}
                            <button
                                onClick={cancelContestEdit}
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