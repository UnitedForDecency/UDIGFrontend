import { type TokenProp, notifyApiError } from "@/App";
import { useEffect, useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Contest = {
    id: string | null | undefined;
    title: string;
    topic: string;
    description: string;
    prize: number | null;
    startDate: Date | null;
    endDate: Date | null;
    submissions: string[] | undefined;
};

type Essay = {
    readonly id: string;
    readonly title: string;
    readonly author: string;
    readonly content: string;
    featured: string;
    readonly createdAt: Date;
    readonly writtenAt: Date;
};

type SearchParams = {
    title: string;
    topic: string;
    ongoing: boolean | null;
    keyword: string;
};

const FeaturedSuggestions: readonly string[] = [
    "1st",
    "2nd",
    "3rd",
    "Featured"
];

function datePassed(date: Date): boolean {
    const currentDate = new Date();

    return date < currentDate;
}

function ensureTwoDigits(num: number): string {
    return num < 10 ? `0${num.toString()}` : num.toString();
}

function formatLocalDateTime(date: Date): string {
    /** `getMonth` is zero-indexed, so we have to convert it to be one-indexed */
    const month = ensureTwoDigits(date.getMonth() + 1);
    const day = ensureTwoDigits(date.getDate());
    const hour = ensureTwoDigits(date.getHours());
    const minute = ensureTwoDigits(date.getMinutes());

    return `${date.getFullYear()}-${month}-${day}T${hour}:${minute}`;
}

function formatUTCDate(date: Date): string {
    /** `getUTCMonth` is zero-indexed, so we have to convert it to be one-indexed */
    const month = ensureTwoDigits(date.getUTCMonth() + 1);
    const day = ensureTwoDigits(date.getUTCDate());

    return `${date.getUTCFullYear()}-${month}-${day}`;
}

/**
 * You might be wondering "Why is this function needed?"
 * 
 * It is needed because dates are serialized to strings
 * when sent over the network, meaning that we have to
 * deserialize them back into date objects in order
 * to use them properly
 * @param contest A contest received from over the network
 * @returns The {@link contest} with its date strings converted into date objects
 */
function contestConvertStringToDate(contest: any): any {
    if(contest.startDate !== undefined && typeof contest.startDate === "string") {
        contest.startDate = new Date(contest.startDate);
    }

    if(contest.endDate !== undefined && typeof contest.endDate === "string") {
        contest.endDate = new Date(contest.endDate);
    }

    return contest;
}

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
function essayConvertStringToDate(essay: any): any {
    if(essay.createdAt !== undefined && typeof essay.createdAt === "string") {
        essay.createdAt = new Date(essay.createdAt);
    }

    if(essay.writtenAt !== undefined && typeof essay.writtenAt === "string") {
        essay.writtenAt = new Date(essay.writtenAt);
    }

    return essay;
}

export default function ContestsAdmin({token}: TokenProp) {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const [contests, setContests] = useState<Contest[]>([]);
    const [newContest, setNewContest] = useState<Contest>({
        id: null,
        description: "",
        prize: null,
        title: "",
        topic: "",
        startDate: null,
        endDate: null,
        submissions: undefined
    });

    const [submissions, setSubmissions] = useState<Essay[]>([]);
    const submissionsContestId = useRef<string>(null);
    const [submissionsVisible, setSubmissionsVisible] = useState(false);
    const [displayedSubmission, setDisplayedSubmission] = useState<Essay | null>(null);
    const originalFeaturedValue = useRef<string>(null);

    const featuredSuggestionsPopoverRef = useRef<HTMLDivElement>(null);
    const [featuredSuggestionsPopoverOpen, setFeaturedSuggestionsPopoverOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const contestsPerPage = 6;
    const submissionsPerPage = 6;
    const [contestsPageNumber, setContestsPageNumber] = useState(0);
    const [submissionsPageNumber, setSubmissionsPageNumber] = useState(0);

    const [searchParams, setSearchParams] = useState<SearchParams>({
        title: "",
        topic: "",
        ongoing: null,
        keyword: ""
    });

    const authHeaders = {
        headers: {Authorization: `Bearer ${token}`}
    };

    const fetchContests = async (): Promise<void> => {
        try {
            return axios.get<Contest[]>(
                `${controllerUrl}/contests`,
                authHeaders
            ).then(res => {
                setContests(res.data.map(c => contestConvertStringToDate(c)));
            }, (err: AxiosError) => {
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

    const resetNewContest = (): void => {
        setNewContest({
            id: null,
            description: "",
            prize: null,
            title: "",
            topic: "",
            startDate: null,
            endDate: null,
            submissions: undefined
        });
    };

    const beginCreatingContest = (): void => {
        resetNewContest();
        setNewContest({...newContest, id: undefined});
    };

    const addContest = async (): Promise<void> => {
        try {
            setLoading(true);

            axios.post<Contest>(
                `${controllerUrl}/contests`,
                {
                    title: newContest.title,
                    topic: newContest.topic,
                    description: newContest.description,
                    prize: newContest.prize!,
                    startDate: newContest.startDate!,
                    endDate: newContest.endDate!
                },
                authHeaders
            ).then(res => {
                setContests(prev => [...prev, contestConvertStringToDate(res.data)]);
                resetNewContest();
            }, (err: AxiosError) => {
                notifyApiError(err, "add contest");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginEditingContest = async (id: string): Promise<void> => {
        if(newContest.id !== null && !window.confirm("Any changes will be lost!")) return;

        try {
            axios.get(
                `${controllerUrl}/contests/${id}`,
                authHeaders
            ).then(res => {
                const selectedContest: Contest = {
                    id: id,
                    title: res.data.title,
                    topic: res.data.topic,
                    description: res.data.description,
                    prize: res.data.prize,
                    startDate: new Date(res.data.startDate),
                    endDate: new Date(res.data.endDate),
                    submissions: res.data.submissions
                };

                setNewContest(selectedContest);
            }, (err: AxiosError) => {
                notifyApiError(err, "get contest");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const cancelContestEdit = (): void => {
        if(!window.confirm("Cancel editing? Any changes will be lost!")) return;
        resetNewContest();
    };

    const saveContestEdit = async (): Promise<void> => {
        if(newContest.id === null || newContest.id === undefined) return;

        try {
            return axios.put<Contest>(
                `${controllerUrl}/contests/${newContest.id}`,
                newContest,
                authHeaders
            ).then(res => {
                setContests(prev => prev.map(c => c.id === newContest.id ? contestConvertStringToDate(res.data) : c));
                resetNewContest();
            }, (err: AxiosError) => {
                notifyApiError(err, "save contest");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deleteContest = async (id: string): Promise<void> => {
        if(!window.confirm("Delete this essay contest permanently?\nThis will also delete all submissions for this contest!")) return;

        try {
            axios.delete(
                `${controllerUrl}/contests/${id}`,
                authHeaders
            ).then(() => {
                setContests(prev => prev.filter(c => c.id !== id));
            }, (err: AxiosError) => {
                notifyApiError(err, "delete contest");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const searchContests = async (): Promise<void> => {
        if(searchParams.title === "" && searchParams.topic === "" && searchParams.ongoing === null && searchParams.keyword === "") {
            return fetchContests();
        }

        const params: any = {};

        if(searchParams.title !== "") params.title = searchParams.title;
        if(searchParams.topic !== "") params.topic = searchParams.topic;
        if(searchParams.ongoing !== null) params.status = String(searchParams.ongoing);
        if(searchParams.keyword !== "") params.keyword = searchParams.keyword;

        try {
            return axios.get<Contest[]>(
                `${controllerUrl}/contests/filter`,
                {...authHeaders, params: params}
            ).then(res => {
                setContests(res.data.map(c => contestConvertStringToDate(c)));
            }, (err: AxiosError) => {
                notifyApiError(err, "search contests");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const clearSearchFilter = async (): Promise<void> => {
        setSearchParams({
            title: "",
            topic: "",
            ongoing: null,
            keyword: ""
        });
        fetchContests();
    };

    const fetchSubmissions = async (id: string): Promise<void> => {
        try {
            return axios.get<Essay[]>(
                `${controllerUrl}/contests/${id}/submissions`,
                authHeaders
            ).then(res => {
                setSubmissions(res.data.map(e => essayConvertStringToDate(e)));
                setSubmissionsVisible(true);
                submissionsContestId.current = id;
            }, (err: AxiosError) => {
                if(err.response !== undefined && err.response.status === 404) {
                    setSubmissions([]);
                    setSubmissionsVisible(true);
                    submissionsContestId.current = id;
                    return;
                }

                notifyApiError(err, "fetch submissions");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const displaySubmissions = async (id: string): Promise<void> => {
        if(!submissionsVisible || hideSubmissions()) {
            return fetchSubmissions(id);
        }
    };

    const displaySubmission = (id: string): void => {
        if(!submissionsVisible) return;

        const submission: Essay | undefined = submissions.find(s => {return s.id === id});

        // Theoretically, this should never be possible to trigger,
        // but we check just in case
        if(submission === undefined) {
            console.error(`Bad submission id: ${id}`);
            alert(`Bad submission id: ${id}`);
            return;
        }

        originalFeaturedValue.current = submission.featured;
        setDisplayedSubmission(submission);
    };

    const updateSubmissionFeatured = async (): Promise<void> => {
        if(displayedSubmission === null || !submissionsVisible) return;

        try {
            return axios.put<Essay>(
                `${controllerUrl}/essays/${displayedSubmission.id}`,
                {featured: displayedSubmission.featured},
                authHeaders
            ).then(res => {
                setSubmissions(prev => prev.map(e => e.id === displayedSubmission.id ? essayConvertStringToDate(res.data) : e));
                setDisplayedSubmission(null);
            }, (err: AxiosError) => {
                notifyApiError(err, "save submission");
            });
        } catch(err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const hideDisplayedSubmission = (): boolean => {
        if(displayedSubmission === null) return true;

        if(
            originalFeaturedValue.current !== displayedSubmission.featured &&
            !window.confirm("\"Featured\" field has unsaved changes. Hiding the submission will lose those changes. Are you sure you want to continue?")
        ) {
            return false;
        }

        setDisplayedSubmission(null);

        return true;
    };

    const hideSubmissions = (): boolean => {
        if(displayedSubmission === null || hideDisplayedSubmission()) {
            setSubmissionsVisible(false);
            setSubmissions([]);
            submissionsContestId.current = null;
            return true;
        }

        return false;
    };

    return (
        <div>
            {/* Header */}
            <h2 className="text-3xl font-bold text-gray-900 pb-5">Essay Contest Management</h2>

            {/* Contest Search */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Input
                            className="p-2 rounded min-w-30 flex-1"
                            placeholder="Title"
                            value={searchParams.title}
                            onChange={e => setSearchParams({...searchParams, title: e.target.value})}
                        />
                        <Input
                            className="p-2 rounded min-w-30 flex-1"
                            placeholder="Topic"
                            value={searchParams.topic}
                            onChange={e => setSearchParams({...searchParams, topic: e.target.value})}
                        />
                        <Select
                            value={searchParams.ongoing === null ? "" : String(searchParams.ongoing)}
                            onValueChange={value => setSearchParams({...searchParams, ongoing: value === "true"})}
                        >
                            <SelectTrigger className="min-w-26 max-w-30 flex-1">
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
                            className="p-2 rounded min-w-30 flex-1"
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
            <Card
                className={submissionsVisible ? "mb-4" : "mb-15"}
            >
                <CardHeader>
                    {contests.length !== 0 ? (
                        <CardTitle className="text-xl">Showing page {contestsPageNumber + 1} of {Math.ceil(contests.length / contestsPerPage)}</CardTitle>
                    ) : (
                        <CardTitle className="text-gray-400 text-xl font-normal mt-4">No contests found.</CardTitle>
                    )}
                </CardHeader>
                <CardContent>
                    {contests.length !== 0 && (
                        <div className="flex flex-wrap justify-center mb-3">
                            {contests.slice(contestsPageNumber * contestsPerPage, ((contestsPageNumber + 1) * contestsPerPage)).map((contest) => (
                                <div
                                    key={contest.id}
                                    className="w-[20rem] min-h-[16rem] border border-gray-200 rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
                                >
                                    <div className="flex flex-col justify-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                {contest.title}
                                            </h3>
                                            <p className="text-gray-500">
                                                {contest.topic}
                                            </p>
                                            <p className="text-gray-500">
                                                {datePassed(contest.startDate!) ? "Started" : "Starts"}: {contest.startDate!.toLocaleString()}
                                            </p>
                                            <p className="text-gray-500">
                                                {datePassed(contest.endDate!) ? "Ended" : "Ends"}: {contest.endDate!.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0 justify-center">
                                            <button
                                                onClick={() => beginEditingContest(contest.id!)}
                                                disabled={submissionsVisible}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteContest(contest.id!)}
                                                disabled={submissionsContestId.current === contest.id}
                                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        <div className="flex flex-shrink-0 justify-center">
                                            <button
                                                onClick={() => displaySubmissions(contest.id!)}
                                                disabled={newContest.id !== null || submissionsContestId.current === contest.id}
                                                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                                            >
                                                View Submissions
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
                            onClick={() => setContestsPageNumber(contestsPageNumber - 1)}
                            disabled={contestsPageNumber <= 0}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous Page
                        </button>
                        {/* Add New Contest */}
                        <button
                            onClick={beginCreatingContest}
                            disabled={loading || newContest.id !== null || submissionsVisible}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Contest
                        </button>
                        {/* Next Page */}
                        <button
                            onClick={() => setContestsPageNumber(contestsPageNumber + 1)}
                            disabled={((contestsPageNumber + 1) * contestsPerPage) >= contests.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Add/Edit Contest */}
            {(newContest.id !== null && !submissionsVisible) && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">{newContest.id === undefined ? "Create Contest" : "Edit Contest"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Input
                                    className="min-w-30 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Title"
                                    value={newContest.title}
                                    onChange={e => setNewContest({...newContest, title: e.target.value})}
                                />
                                <Input
                                    className="min-w-30 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Topic"
                                    value={newContest.topic}
                                    onChange={e => setNewContest({...newContest, topic: e.target.value})}
                                />
                                <Input
                                    type="number"
                                    className="min-w-24 max-w-30 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Prize"
                                    value={newContest.prize ?? ""}
                                    onChange={e =>
                                        setNewContest({
                                            ...newContest,
                                            prize: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber
                                        })
                                    }
                                />
                                <label className="flex items-center">
                                    Start Date:
                                    <Input
                                        type="datetime-local"
                                        className="min-w-55 border border-gray-300 rounded-md px-3 py-2 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                        value={newContest.startDate === null ? "" : formatLocalDateTime(newContest.startDate)}
                                        onChange={e => {
                                            const date: Date = new Date(e.target.value);

                                            setNewContest({
                                                ...newContest,
                                                startDate: isNaN(date.valueOf()) ? null : date
                                            });
                                        }}
                                    />
                                </label>
                                <label className="flex items-center">
                                    End Date:
                                    <Input
                                        type="datetime-local"
                                        className="min-w-55 border border-gray-300 rounded-md px-3 py-2 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                        value={newContest.endDate === null ? "" : formatLocalDateTime(newContest.endDate)}
                                        onChange={e => {
                                            const date: Date = new Date(e.target.value);

                                            setNewContest({
                                                ...newContest,
                                                endDate: isNaN(date.valueOf()) ? null : date
                                            });
                                        }}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-wrap">
                                <Textarea
                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                    placeholder="Description"
                                    value={newContest.description}
                                    onChange={e => setNewContest({...newContest, description: e.target.value})}
                                />
                            </div>
                            {newContest.id === undefined ? (
                                <button
                                    onClick={addContest}
                                    disabled={
                                        loading || newContest.title === "" || newContest.topic === "" || newContest.prize === null ||
                                        newContest.description.length < 32 || newContest.startDate === null || newContest.endDate === null
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
                                        loading || newContest.title === "" || newContest.topic === "" || newContest.prize === null ||
                                        newContest.description.length < 32 || newContest.startDate === null || newContest.endDate === null
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

            {/* Submissions Content */}
            {submissionsVisible && (
                <div>
                    {/* Header */}
                    <h3 className="text-3xl font-bold text-gray-900 pb-5">Contest Submissions</h3>

                    {/* Submissions List */}
                    <Card className="mb-15">
                        <CardHeader>
                            {submissions.length !== 0 ? (
                                <CardTitle className="text-xl">Showing page {submissionsPageNumber + 1} of {Math.ceil(submissions.length / submissionsPerPage)}</CardTitle>
                            ) : (
                                <CardTitle className="text-gray-400 text-xl font-normal mt-4">No submissions found.</CardTitle>
                            )}
                        </CardHeader>
                        <CardContent>
                            {submissions.length !== 0 && (
                                <div className="flex flex-wrap justify-center mb-3">
                                    {submissions.slice(submissionsPageNumber * submissionsPerPage, ((submissionsPageNumber + 1) * submissionsPerPage)).map((submission) => (
                                        <div
                                            key={submission.id}
                                            className="w-[20rem] min-h-[13rem] border border-gray-200 rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex flex-col justify-center gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                        {submission.title}
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        {submission.author}
                                                    </p>
                                                    <p className="text-gray-500">
                                                        Written: {submission.writtenAt.toLocaleDateString(undefined, {timeZone: "UTC"})}
                                                    </p>
                                                    <p className="text-gray-500">
                                                        Submitted: {submission.createdAt.toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 flex-shrink-0 justify-center">
                                                    <button
                                                        onClick={() => displaySubmission(submission.id)}
                                                        className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
                                                    >
                                                        View
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
                                    onClick={() => setSubmissionsPageNumber(submissionsPageNumber - 1)}
                                    disabled={submissionsPageNumber <= 0}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous Page
                                </button>
                                {/* Hide Submissions */}
                                <button
                                    onClick={hideSubmissions}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Hide Submissions
                                </button>
                                {/* Next Page */}
                                <button
                                    onClick={() => setSubmissionsPageNumber(submissionsPageNumber + 1)}
                                    disabled={((submissionsPageNumber + 1) * submissionsPerPage) >= submissions.length}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next Page
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* View Submission */}
                    {displayedSubmission !== null && (
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="text-xl">View Submission</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <Input
                                            className="min-w-30 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                            placeholder="Title"
                                            readOnly={true}
                                            value={displayedSubmission.title}
                                        />
                                        <Input
                                            className="min-w-30 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                                            placeholder="Author"
                                            readOnly={true}
                                            value={displayedSubmission.author}
                                        />
                                        <Label className="text-base select-text">
                                            Written On:
                                            <Input
                                                type="date"
                                                className="flex-1 border border-gray-300 rounded-md px-3 py-2 min-w-29 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                readOnly={true}
                                                value={formatUTCDate(displayedSubmission.writtenAt)}
                                            />
                                        </Label>
                                        <div className="flex flex-1" style={{anchorName: "--contests-admin-featured-suggestions-anchor"}}>
                                            <div className="min-w-30 flex flex-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                <Input
                                                    className="border-0 px-3 py-2"
                                                    placeholder="Featured"
                                                    value={displayedSubmission.featured}
                                                    onChange={e => setDisplayedSubmission({...displayedSubmission, featured: e.target.value})}
                                                />
                                                <button
                                                    className="p-2 cursor-pointer"
                                                    popoverTarget="contests-admin-featured-suggestions-popover"
                                                >
                                                    {featuredSuggestionsPopoverOpen ? (
                                                        <ChevronUp size={20} />
                                                    ) : (
                                                        <ChevronDown size={20} />
                                                    )}
                                                </button>
                                            </div>
                                            <div
                                                id="contests-admin-featured-suggestions-popover"
                                                ref={featuredSuggestionsPopoverRef}
                                                popover="auto"
                                                className="absolute bg-card text-card-foreground rounded-xl border shadow-sm"
                                                style={{
                                                    positionAnchor: "--contests-admin-featured-suggestions-anchor",
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
                                                                        displayedSubmission.featured !== ""
                                                                        && !FeaturedSuggestions.includes(displayedSubmission.featured)
                                                                        && !window.confirm("Selecting a suggestion will overwrite anything currently in the \"Featured\" field. Continue?")
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    setDisplayedSubmission({...displayedSubmission, featured: value});
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
                                            readOnly={true}
                                            value={displayedSubmission.content}
                                        />
                                    </div>
                                    <button
                                        onClick={updateSubmissionFeatured}
                                        disabled={loading}
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
                                            "Save Submission"
                                        )}
                                    </button>
                                    <button
                                        onClick={hideDisplayedSubmission}
                                        disabled={loading}
                                        className="w-full bg-emerald-600 text-white px-6 py-3 rounded-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                    >
                                        Hide
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}