import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Essay {
    _id: string;
    author: string;
    title: string;
    contents: string;
    year: number;
    featured?: boolean;
}

interface Contest {
    _id: string;
    title: string;
    topic: string;
    description: string;
    prize: number;
    ongoing: boolean;
    winner: string;
    startdate: Date;
    enddate: Date;
}

export default function Essays() {
    const navigate = useNavigate();
    const essaysPerPage = 6;

    const currentCompetition = false;
    const currentlyJudging = false;

    const essayTopic = "an example topic";

    const [essays, setEssays] = useState<Essay[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [essayWinnerId, setEssayWinnerId] = useState("Example");
    const [essayWinnerTitle, setEssayWinnerTitle] = useState("Example Title");
    const [essayWinnerAuthor, setEssayWinnerAuthor] = useState("Example Author");
    const [essayWinnerSynopsis, setEssayWinnerSynopsis] = useState("An example synopsis of a long essay. This section previews the tone and ideas of the winning piece while encouraging readers to explore the full essay.")

    const [ongoingContests, setOngoingContests] = useState<Contest[]>([]);

    useEffect(() => {
        async function getEssays() {
            const dbResponse = await fetch(import.meta.env.VITE_MONGO_CONTROLLER_URL + "/essays");
            const essayData = (await dbResponse.json()).essays;
            if (essayData) setEssays(essayData);
            await getFeaturedEssay(essayData);
        }

        async function getFeaturedEssay(essayList: Essay[]) {
            for(let essay of essayList) {
                if(essay.featured) {
                    setEssayWinnerId(essay._id)
                    setEssayWinnerAuthor(essay.author)
                    setEssayWinnerTitle(essay.title)
                    setEssayWinnerSynopsis(essay.contents)
                }
            }
        }
        getEssays();
        
    }, []);

    useEffect(() => {
        async function getOngoingContests() {
            const dbResponse = await fetch(import.meta.env.VITE_MONGO_CONTROLLER_URL + "/essaycontest/contests/ongoing");
            const contestData = (await dbResponse.json()).contests;
            if(contestData) setOngoingContests(contestData);
        }

        getOngoingContests();
    });

    const totalPages = Math.ceil(essays.length / essaysPerPage);
    const start = currentPage * essaysPerPage;
    const currentEssays = essays.slice(start, start + essaysPerPage);

    return (
        <section className="bg-alice-blue py-20">
            {/* ================= HEADER ================= */}
            <div className="text-center max-w-3xl mx-auto px-6 mb-20">
                <h1 className="text-5xl font-bold text-yale-blue mb-6 underline decoration-brick-ember underline-offset-4">
                    Essays from the Community
                </h1>
                <p className="text-xl text-graphite">
                    Voices, ideas, and reflections from people committed to decency in public life.
                </p>
            </div>

            {/* ================= CONTEST CAROUSEL ================= */}
            {ongoingContests.length !== 0 ? (
                <div className="flex flex-col items-center mb-24 px-6">
                    <div
                        className="border-3 border-black shadow-2xl rounded-xl pl-15 pr-15 pt-5 pb-5"
                        style={{backgroundColor: "#C76D6D"}}
                    >
                        <h2 className="text-3xl text-porcelain mb-4">
                            Current Essay Competitions
                        </h2>
                        <p className="text-center mb-8">
                            Feeling inspired to do some writing? Consider taking part in an essay contest!
                        </p>

                        <Carousel
                            className="drop-shadow-2xl md:max-w-300 sm:max-w-[70vw]"
                            opts={{align: "start", loop: true}}
                        >
                            <CarouselContent className="ml-10">
                                {ongoingContests.map((contest) => (
                                    <CarouselItem className="pl-0 max-w-100">
                                        <Card className="w-85 h-65 text-center bg-warm-parchment border-2 border-stone-taupe">
                                            <CardHeader>
                                                <CardTitle className="font-bold text-yale-blue pb-0">{contest.title}</CardTitle>
                                                <p className="text-sm font-medium text-graphite mt-1">
                                                    Topic: {contest.topic}
                                                </p>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription>
                                                    <div className="relative h-26 overflow-hidden">
                                                        <p className="text-graphite text-sm leading-relaxed">
                                                            {contest.description}
                                                        </p>

                                                        <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-warm-parchment to-transparent" />
                                                    </div>

                                                    <div className="text-center">
                                                        <Button size="sm" className="bg-steel-blue-grey" onClick={() => {navigate("/programs/contests/" + contest._id)}}>Read More</Button>
                                                    </div>
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>

                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </div>
            ) : (
                <div />
            )}

            {/* ================= COMPETITION STATUS ================= */}
            {currentCompetition ? (
                <div className="text-center mb-20 px-6">
                    <h2 className="text-3xl text-yale-blue mb-4">
                        Current Essay Competition
                    </h2>
                    <p className="max-w-xl mx-auto">
                        The current topic is <strong>{essayTopic}</strong>. Submit your
                        essay and contribute your perspective.
                    </p>
                    <Button className="mt-8">View Competition</Button>
                </div>
            ) : currentlyJudging ? (
                <div className="text-center mb-20 px-6">
                    <h2 className="text-3xl text-yale-blue mb-4">
                        Submissions Under Review
                    </h2>
                    <p className="max-w-xl mx-auto">
                        Our competition on <strong>{essayTopic}</strong> has concluded. We
                        are currently evaluating submissions.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center mb-24 px-6">
                    <h2 className="text-3xl text-yale-blue mb-4">
                        Latest Winning Essay
                    </h2>
                    <p className="max-w-xl text-center mb-8">
                        Topic: <strong>{essayTopic}</strong> — Congratulations to <strong>{essayWinnerAuthor}</strong>.
                    </p>

                    {/* FEATURE CARD */}
                    <Card className="bg-misty-linen border-2 border-golden-bronze shadow-2xl w-full max-w-3xl">
                        <CardHeader className="text-center font-bold text-3xl text-yale-blue">
                            {essayWinnerTitle}
                        </CardHeader>

                        <CardContent className="text-center space-y-6">
                            {/* FADE TEXT (READABLE) */}
                            <div className="relative max-h-40 overflow-hidden">
                                <p className="text-lg text-graphite">
                                    {essayWinnerSynopsis}
                                </p>

                                {/* fade overlay */}
                                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-misty-linen to-transparent" />
                            </div>

                            <Button className="bg-burnt-crimson" onClick={() => {navigate("/programs/essays/" + essayWinnerId)}}>
                                Read Full Essay
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ================= PREVIOUS WINNERS ================= */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl text-yale-blue mb-3">
                        Previous Competition Winners
                    </h2>
                    <p className="max-w-2xl mx-auto text-graphite">
                        Explore essays from past competitions across a variety of topics.
                    </p>
                </div>

                {/* GRID */}
                <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {currentEssays.map((essay) => (
                        <Card
                            key={essay._id}
                            className="bg-misty-linen border-2 border-golden-bronze shadow-lg hover:scale-105 transition"
                        >
                            <CardHeader className="text-center font-bold text-xl text-yale-blue">
                                {essay.title}
                                <p className="text-sm font-medium text-graphite mt-1">
                                    {essay.author}
                                </p>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* TEXT PREVIEW WITH FADE */}
                                <div className="relative h-23 overflow-hidden">
                                    <p className="text-graphite text-sm leading-relaxed">
                                        {essay.contents}
                                    </p>

                                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-misty-linen to-transparent" />
                                </div>

                                <div className="text-center">
                                    <Button size="sm" className="bg-burnt-crimson" onClick={() => {navigate("/programs/essays/" + essay._id)}}>Read More</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* ================= PAGINATION ================= */}
                <div className="flex justify-center items-center gap-6 mt-16">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                        disabled={currentPage === 0}
                        className="px-5 py-2 rounded-full bg-yale-blue text-white hover:underline disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="text-sm font-medium">
                        Page {currentPage + 1} of {totalPages || 1}
                    </span>

                    <button
                        onClick={() =>
                            setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
                        }
                        disabled={currentPage === totalPages - 1}
                        className="px-5 py-2 rounded-full bg-yale-blue text-white hover:underline disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </section>
    );
}