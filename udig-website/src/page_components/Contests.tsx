import {useEffect, useState} from "react";
import axios, {AxiosError} from "axios";
import {notifyApiError} from "@/App";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx"

type Contest = Readonly<{
    id: string;
    title: string;
    topic: string;
    description: string;
    prize: number;
    startDate: Date;
    endDate: Date;
}>;

type SearchParams = {
    title: string;
    topic: string;
    ongoing: boolean | null;
    keyword: string;
};

function datePassed(date: Date): boolean {
    const currentDate = new Date();

    return date < currentDate;
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
function convertStringToDate(contest: any): any {
    if(contest.startDate !== undefined && typeof contest.startDate === "string") {
        contest.startDate = new Date(contest.startDate);
    }

    if(contest.endDate !== undefined && typeof contest.endDate === "string") {
        contest.endDate = new Date(contest.endDate);
    }

    return contest;
}

export default function Contests() {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const [contests, setContests] = useState<Contest[]>([]);

    const contestsPerPage: number = 9;
    const [contestsPageNumber, setContestsPageNumber] = useState(0);

    const [searchParams, setSearchParams] = useState<SearchParams>({
        title: "",
        topic: "",
        ongoing: null,
        keyword: ""
    });

    const [loading, setLoading] = useState(true);

    const fetchContests = async (): Promise<void> => {
        try {
            return axios.get<Contest[]>(
                `${controllerUrl}/contests`
            ).then(res => {
                const temp: Contest[] = res.data.map(c => convertStringToDate(c));

                if(temp.length > 0) {
                    temp.sort((a, b): number => {
                        if(a.startDate > b.startDate) {
                            return -1;
                        } else if(b.startDate > a.startDate) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                }

                setContests(temp);
                setLoading(false);
            }, (err: AxiosError) => {
                notifyApiError(err, "fetch contests");
            })
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchContests();
    }, []);

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
                {params: params}
            ).then(res => {
                const temp: Contest[] = res.data.map(c => convertStringToDate(c));

                if(temp.length > 0) {
                    temp.sort((a, b): number => {
                        if(a.startDate > b.startDate) {
                            return -1;
                        } else if(b.startDate > a.startDate) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                }

                setContests(temp);
            }, (err: AxiosError) => {
                notifyApiError(err, "search contests");
            });
        } catch(err) {
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
        return fetchContests();
    };

    return (
        <section className="flex flex-col py-12 items-center bg-alice-blue">
            <h1 className="mb-4 text-4xl text-yale-blue">
                Essay Competitions
            </h1>
            <p className="mb-8 text-xl text-center">
                Feeling inspired to do some writing? Consider taking part in an essay contest!
            </p>
            {loading ? (
                <p>Loading&hellip;</p>
            ) : (
                <div className="flex flex-col justify-center">
                    {/* ================= CONTEST SEARCH ================= */}
                    <Card className="max-w-6xl flex-1 pt-3 pb-6 mb-6">
                        <CardContent className="flex flex-1">
                            <search className="flex flex-1 flex-col">
                                <h2 className="text-2xl text-yale-blue mb-3">
                                    Search
                                </h2>
                                <div className="flex flex-wrap justify-center gap-2">
                                    <Label
                                        className="text-base flex-1"
                                        htmlFor="contests-title-search-input"
                                    >
                                        Title:
                                        <Input
                                            id="contests-title-search-input"
                                            className="p-2 rounded min-w-30 flex-1"
                                            value={searchParams.title}
                                            onChange={e => setSearchParams({...searchParams, title: e.target.value})}
                                        />
                                    </Label>
                                    <Label
                                        className="text-base flex-1"
                                        htmlFor="contests-topic-search-input"
                                    >
                                        Topic:
                                        <Input
                                            id="contests-topic-search-input"
                                            className="p-2 rounded min-w-30 flex-1"
                                            value={searchParams.topic}
                                            onChange={e => setSearchParams({...searchParams, topic: e.target.value})}
                                        />
                                    </Label>
                                    <Label className="text-base">
                                        Status:
                                        <Select
                                            value={searchParams.ongoing === null ? "" : String(searchParams.ongoing)}
                                            onValueChange={value => setSearchParams({...searchParams, ongoing: value === "true"})}
                                        >
                                            <SelectTrigger className="min-w-26 max-w-30 flex-1">
                                                <SelectValue />
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
                                    </Label>
                                    <Label
                                        className="text-base flex-1"
                                        htmlFor="contests-keyword-search-input"
                                    >
                                        Keyword:
                                        <Input
                                            id="contests-keyword-search-input"
                                            className="p-2 rounded min-w-30 flex-1"
                                            value={searchParams.keyword}
                                            onChange={e => setSearchParams({...searchParams, keyword: e.target.value})}
                                        />
                                    </Label>
                                    <Button
                                        size="lg"
                                        className="px-4 py-2 rounded text-base text-white cursor-pointer bg-red-600 hover:bg-red-700"
                                        onClick={clearSearchFilter}
                                    >
                                        Clear Filters
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="px-4 py-2 rounded text-base text-white cursor-pointer bg-blue-600 hover:bg-blue-700"
                                        onClick={searchContests}
                                    >
                                        Search
                                    </Button>
                                </div>
                            </search>
                        </CardContent>
                    </Card>
                    {contests.length !== 0 ? (
                        <div className="min-h-96">
                            {/* ================= CONTEST LIST ================= */}
                            <div className="max-w-6xl flex flex-wrap justify-center">
                                {contests.slice(contestsPageNumber * contestsPerPage, ((contestsPageNumber + 1) * contestsPerPage)).map(contest => (
                                    <Card
                                        key={contest.id}
                                        className="w-54 h-65 py-6 m-2 sm:w-85 sm:m-5.25 gap-3 relative text-center wrap-break-word bg-misty-linen border-2 border-golden-bronze"
                                    >
                                        <CardHeader className="block">
                                            <CardTitle className="font-bold text-yale-blue">
                                                {contest.title}
                                            </CardTitle>
                                            <div className="text-sm font-medium text-graphite mt-1">
                                                <p>
                                                    Topic: {contest.topic}
                                                </p>
                                                <p>
                                                    Prize: {contest.prize.toLocaleString(undefined, {style: "currency", currency: "USD"})}
                                                </p>
                                                <p>
                                                    {datePassed(contest.startDate) ? "Started" : "Starts"}: {contest.startDate.toLocaleString()}
                                                </p>
                                                <p>
                                                    {datePassed(contest.endDate) ? "Ended" : "Ends"}: {contest.endDate.toLocaleString()}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                <p className="text-graphite text-sm leading-relaxed">
                                                    {contest.description}
                                                </p>
                                                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-8 bg-linear-to-t from-misty-linen to-transparent" />
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-14 bg-misty-linen" />
                                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-0.5 bg-golden-bronze" />
                                                <Button
                                                    size="sm"
                                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-burnt-crimson hover:bg-oxblood-shadow"
                                                    asChild={true}
                                                >
                                                    <a href={`/programs/contests/${contest.id}`}>Read More</a>
                                                </Button>
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            {/* ================= PAGINATION ================= */}
                            <div className="flex justify-center items-center gap-6 mt-6">
                                <Button
                                    size="lg"
                                    className="px-5 py-2 rounded-full text-white cursor-pointer bg-yale-blue hover:bg-deep-harbor disabled:pointer-events-auto disabled:cursor-not-allowed"
                                    disabled={contestsPageNumber <= 0}
                                    onClick={() => setContestsPageNumber(contestsPageNumber - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm font-medium">
                                    Page {contestsPageNumber + 1} of {Math.ceil(contests.length / contestsPerPage)}
                                </span>
                                <Button
                                    size="lg"
                                    className="px-5 py-2 rounded-full text-white cursor-pointer bg-yale-blue hover:bg-deep-harbor disabled:pointer-events-auto disabled:cursor-not-allowed"
                                    disabled={((contestsPageNumber + 1) * contestsPerPage) >= contests.length}
                                    onClick={() => setContestsPageNumber(contestsPageNumber + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="min-h-96 mt-4 text-xl font-normal">
                            No contests found.
                        </p>
                    )}
                </div>
            )}
        </section>
    );
}
