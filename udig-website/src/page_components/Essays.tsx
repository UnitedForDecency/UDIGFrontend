import {useEffect, useState, useRef} from "react";
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
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel.tsx";

type Essay = Readonly<{
    id: string;
    title: string;
    author: string;
    content: string;
    featured: string;
    createdAt: Date;
    writtenAt: Date;
}>;

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
    author: string;
    keyword: string;
    year: number | null
};

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

export default function Essays() {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const [featuredEssays, setFeaturedEssays] = useState<Essay[]>([]);
    const featuredEssay = useRef<Essay | null>(null);

    const maxFeaturedContests: number = 6;
    const [ongoingContests, setOngoingContests] = useState<Contest[]>([]);

    const essaysPerPage: number = 6;
    const [essaysPageNumber, setEssaysPageNumber] = useState(0);

    const [searchParams, setSearchParams] = useState<SearchParams>({
        title: "",
        author: "",
        keyword: "",
        year: null
    });

    const fetchEssays = async (): Promise<void> => {
        try {
            return axios.get<Essay[]>(
                `${controllerUrl}/essays/featured`
            ).then(res => {
                const essays: Essay[] = res.data.map(e => essayConvertStringToDate(e));

                if(essays.length > 0) {
                    essays.sort((a, b): number => {
                        if(a.createdAt > b.createdAt) {
                            return -1;
                        } else if(b.createdAt > a.createdAt) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });

                    featuredEssay.current = essays[0];
                }

                setFeaturedEssays(essays);
            }, (err: AxiosError) => {
                notifyApiError(err, "fetch featured essays");
            });
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const fetchContests = async (): Promise<void> => {
        try {
            return axios.get<Contest[]>(
                `${controllerUrl}/contests/ongoing`
            ).then(res => {
                let contests: Contest[] = res.data.map(e => contestConvertStringToDate(e));

                if(contests.length > 0) {
                    contests.sort((a, b): number => {
                        if(a.startDate > b.startDate) {
                            return -1;
                        } else if(b.startDate > a.startDate) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });

                    if(contests.length > maxFeaturedContests) {
                        contests = contests.slice(0, maxFeaturedContests);
                    }
                }

                setOngoingContests(contests);
            }, (err: AxiosError) => {
                notifyApiError(err, "fetch featured essays");
            });
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchEssays();
        fetchContests();
    }, []);

    const searchEssays = async (): Promise<void> => {
        if(searchParams.title === "" && searchParams.author === "" && searchParams.keyword === "" && searchParams.year === null) {
            return fetchEssays();
        }

        const params: any = {
            featured: String(true)
        };

        if(searchParams.title !== "") params.title = searchParams.title;
        if(searchParams.author !== "") params.author = searchParams.author;
        if(searchParams.keyword !== "") params.keyword = searchParams.keyword;
        if(searchParams.year !== null) params.year = searchParams.year;

        try {
            return axios.get<Essay[]>(
                `${controllerUrl}/essays/filter`,
                {params: params}
            ).then(res => {
                const essays: Essay[] = res.data.map(e => essayConvertStringToDate(e));

                if(essays.length > 0) {
                    essays.sort((a, b): number => {
                        if(a.createdAt > b.createdAt) {
                            return -1;
                        } else if(b.createdAt > a.createdAt) {
                            return 1;
                        } else {
                            return 0;
                        }
                    });
                }

                setFeaturedEssays(essays);
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
        return fetchEssays();
    };

    return (
        <div>
            {/* ================= HEADER ================= */}
            <section className="w-full py-20 items-center bg-alice-blue">
                <h1 className="text-5xl font-bold text-yale-blue mb-6 underline decoration-brick-ember underline-offset-4">
                    Essays from the Community
                </h1>
                <p className="text-xl text-graphite">
                    Voices, ideas, and reflections from people committed to decency in public life.
                </p>
            </section>

            {/* ================= CONTEST CAROUSEL ================= */}
            {ongoingContests.length !== 0 && (
                <section className="pb-24 flex flex-col items-center bg-alice-blue">
                    <h2 className="mb-4 text-4xl text-yale-blue">
                        Current Essay Competitions
                    </h2>
                    <p className="mb-8 text-xl text-center">
                        Feeling inspired to do some writing? Consider taking part in an essay contest!
                    </p>
                    <Carousel
                        className={`drop-shadow-2xl max-w-[70vw] ${
                            ongoingContests.length === 1 ? (
                                "w-58 sm:w-95.5"
                            ) : ongoingContests.length === 2 ? (
                                "w-116 sm:w-191"
                            ) : /* ongoingContests.length >= 3 */ (
                                "w-116 sm:w-286.5"
                            )
                        }`}
                        opts={{align: "start", loop: true}}
                    >
                        <CarouselPrevious />
                        <CarouselContent className="ml-0">
                            {ongoingContests.map(contest => (
                                <CarouselItem
                                    key={contest.id}
                                    className="pl-0 basis-auto"
                                >
                                    <Card className="w-54 h-65 py-6 mx-2 sm:w-85 sm:mx-5.25 gap-3 relative text-center wrap-break-word bg-misty-linen border-2 border-golden-bronze">
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
                                                    Ends: {contest.endDate.toLocaleString()}
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
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselNext />
                    </Carousel>
                </section>
            )}

            {/* ================= FEATURED ESSAY ================= */}
            {featuredEssay.current !== null && (
                <section className="pb-24 flex flex-col items-center bg-alice-blue">
                    <h2 className="mb-4 text-3xl text-yale-blue">
                        Latest Winning Essay
                    </h2>
                    <p className="mb-8 text-center">
                        Congratulations to <strong>{featuredEssay.current.author}</strong>.
                    </p>
                    <Card className="w-xs sm:w-xl md:w-2xl min-h-72 max-h-80 gap-3 overflow-hidden relative text-center wrap-break-word shadow-2xl bg-misty-linen border-2 border-golden-bronze">
                        <CardHeader>
                            <CardTitle className="font-bold text-3xl text-yale-blue">
                                {featuredEssay.current.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                <p className="text-lg text-graphite">
                                    {featuredEssay.current.content}
                                </p>
                                <div className="absolute bottom-15 left-1/2 -translate-x-1/2 w-67 sm:w-131 md:w-155 h-10 bg-linear-to-t from-misty-linen to-transparent" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-67 sm:w-131 md:w-155 h-15 bg-misty-linen" />
                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-67 sm:w-131 md:w-155 h-0.5 bg-golden-bronze" />
                                <Button
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-burnt-crimson hover:bg-oxblood-shadow"
                                    asChild={true}
                                >
                                    <a href={`/programs/essays/${featuredEssay.current.id}`}>Read Full Essay</a>
                                </Button>
                            </CardDescription>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* ================= PREVIOUS WINNERS ================= */}
            <section className="bg-alice-blue pb-20">
                <div className="text-center mb-8">
                    <h2 className="text-3xl text-yale-blue mb-3">
                        Previous Competition Winners
                    </h2>
                    <p className="text-graphite">
                        Explore essays from past competitions across a variety of topics.
                    </p>
                </div>

                {/*
                 * This is a *little* bit of a hack.
                 * 
                 * Normally, this check would be `featuredEssays.length !== 0`,
                 * but I'm reusing `featuredEssays` for the search functionality,
                 * and due to the way this is structured, if the search returns
                 * nothing, then it would say that there are no winning essays at
                 * all, which would be incorrect. As such, we can't use
                 * `featuredEssays.length` for the check. Thankfully,
                 * `featuredEssay.current` should only ever be null when there
                 * aren't any winning essays at all, and since that is what we
                 * want to check for, we use it in the check
                */}
                {featuredEssay.current !== null ? (
                    <div>
                        {/* ================= ESSAY SEARCH ================= */}
                        <div className="flex justify-center">
                            <Card className="max-w-6xl flex-1 pt-3 pb-6 mb-6">
                                <CardContent className="flex flex-1">
                                    <search className="flex flex-1 flex-col">
                                        <h3 className="text-2xl text-yale-blue mb-3">
                                            Search
                                        </h3>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            <Label
                                                className="text-base flex-1"
                                                htmlFor="essays-title-search-input"
                                            >
                                                Title:
                                                <Input
                                                    id="essays-title-search-input"
                                                    className="p-2 rounded min-w-30 flex-1"
                                                    value={searchParams.title}
                                                    onChange={e => setSearchParams({...searchParams, title: e.target.value})}
                                                />
                                            </Label>
                                            <Label
                                                className="text-base flex-1"
                                                htmlFor="essays-author-search-input"
                                            >
                                                Author:
                                                <Input
                                                    id="essays-author-search-input"
                                                    className="p-2 rounded min-w-30 flex-1"
                                                    value={searchParams.author}
                                                    onChange={e => setSearchParams({...searchParams, author: e.target.value})}
                                                />
                                            </Label>
                                            <Label
                                                className="text-base flex-1"
                                                htmlFor="essays-keyword-search-input"
                                            >
                                                Keyword:
                                                <Input
                                                    id="essays-keyword-search-input"
                                                    className="p-2 rounded min-w-30 flex-1"
                                                    value={searchParams.keyword}
                                                    onChange={e => setSearchParams({...searchParams, keyword: e.target.value})}
                                                />
                                            </Label>
                                            <Label
                                                className="text-base flex-1"
                                                htmlFor="essays-year-search-input"
                                            >
                                                Year:
                                                <Input
                                                    id="essays-year-search-input"
                                                    className="p-2 rounded min-w-30 flex-1"
                                                    value={searchParams.year === null ? "" : searchParams.year}
                                                    type="number"
                                                    onChange={e =>
                                                        setSearchParams({
                                                            ...searchParams,
                                                            year: isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber
                                                        })
                                                    }
                                                />
                                            </Label>
                                            <div>
                                                <Button
                                                    size="lg"
                                                    className="px-4 py-2 mr-2 rounded text-base text-white cursor-pointer bg-red-600 hover:bg-red-700"
                                                    onClick={clearSearchFilter}
                                                >
                                                    Clear Filters
                                                </Button>
                                                <Button
                                                    size="lg"
                                                    className="px-4 py-2 rounded text-base text-white cursor-pointer bg-blue-600 hover:bg-blue-700"
                                                    onClick={searchEssays}
                                                >
                                                    Search
                                                </Button>
                                            </div>
                                        </div>
                                    </search>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ================= ESSAY LIST ================= */}
                        <div className="flex justify-center">
                            <div className="max-w-6xl flex flex-wrap justify-center">
                                {featuredEssays.slice(essaysPageNumber * essaysPerPage, ((essaysPageNumber + 1) * essaysPerPage)).map(essay => (
                                    <Card
                                        key={essay.id}
                                        className="w-54 h-65 py-6 m-2 sm:w-85 sm:m-5.25 gap-2 overflow-hidden relative text-center wrap-break-word shadow-lg transition bg-misty-linen border-2 border-golden-bronze hover:scale-105"
                                    >
                                        <CardHeader className="block">
                                            <CardTitle className="font-bold text-xl text-yale-blue">
                                                {essay.title}
                                            </CardTitle>
                                            <div className="font-medium text-sm text-graphite mt-0.5">
                                                <p>
                                                    {essay.author}
                                                </p>
                                                <p>
                                                    {essay.featured}
                                                </p>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>
                                                <p className="text-graphite text-sm leading-relaxed">
                                                    {essay.content}
                                                </p>
                                                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-8 bg-linear-to-t from-misty-linen to-transparent" />
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-14 bg-misty-linen" />
                                                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-41 sm:w-72 h-0.5 bg-golden-bronze" />
                                                <Button
                                                    size="sm"
                                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-burnt-crimson hover:bg-oxblood-shadow"
                                                    asChild={true}
                                                >
                                                    <a href={`/programs/essays/${essay.id}`}>Read More</a>
                                                </Button>
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* ================= PAGINATION ================= */}
                        <div className="flex justify-center items-center gap-6 mt-6">
                            {/* Previous Page */}
                            <Button
                                size="lg"
                                className="px-5 py-2 rounded-full text-white cursor-pointer bg-yale-blue hover:bg-deep-harbor disabled:pointer-events-auto disabled:cursor-not-allowed"
                                disabled={essaysPageNumber <= 0}
                                onClick={() => setEssaysPageNumber(essaysPageNumber - 1)}
                            >
                                Previous
                            </Button>
                            {/* Page Number Display */}
                            <span className="text-sm font-medium">
                                Page {essaysPageNumber + 1} of {Math.ceil(featuredEssays.length / essaysPerPage)}
                            </span>
                            {/* Next Page */}
                            <Button
                                size="lg"
                                className="px-5 py-2 rounded-full text-white cursor-pointer bg-yale-blue hover:bg-deep-harbor disabled:pointer-events-auto disabled:cursor-not-allowed"
                                disabled={((essaysPageNumber + 1) * essaysPerPage) >= featuredEssays.length}
                                onClick={() => setEssaysPageNumber(essaysPageNumber + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                ) : (
                    ongoingContests.length !== 0 ? (
                        <p className="text-primary">
                            No winning essays yet. <br />
                            Consider joining an {
                                <a
                                    className="text-blue-600 hover:underline"
                                    href="/programs/contests"
                                >
                                    essay&nbsp;contest
                                </a>
                            } and seeing if yours will be the first!
                        </p>
                    ) : (
                        <p className="text-primary">
                            No winning essays yet and no ongoing contests. <br />
                            Consider bookmarking the {
                                <a
                                    className="text-blue-600 hover:underline"
                                    href="/programs/contests"
                                >
                                    essay&nbsp;contests
                                </a>
                            } page and checking regularly for updates.
                        </p>
                    )
                )}
            </section>
        </div>
    );
}