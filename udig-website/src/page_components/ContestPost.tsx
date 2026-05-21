import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { type TokenProp } from "@/App";
import DOMPurify from "dompurify";
import axios from "axios";
import "../styles/IssuePost.css"

type Essay = {
    title?: string;
    year?: number;
    contents?: string;
};

interface Contest {
    _id: string;
    title: string;
    topic: string;
    description: string;
    prize: number;
    winner: string;
    startdate: Date;
    enddate: Date;
}

export default function ContestPost({ token }: TokenProp) {
    const {id} = useParams<{id: string}>();
    const [userId, setUserId] = useState("");
    const [contest, setContest] = useState<Contest | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitEssayVisible, setSubmitEssayVisible] = useState(false);
    const [submittedEssay, setSubmittedEssay] = useState<Essay>({
        title: "",
        year: undefined,
        contents: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const contestIsOngoing = (startdate: Date, enddate: Date) => {
        const currentDate = new Date();

        return (startdate <= currentDate) && (enddate > currentDate);
    };

    useEffect(() => {
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essaycontest/contests/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if(data.startdate != undefined) data.startdate = new Date(data.startdate);
                if(data.enddate != undefined) data.enddate = new Date(data.enddate);

                setContest(data);
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/accounts/token/${token}`)
            .then((res) => res.json())
            .then((data) => {
                setUserId(data.userId);
            });
    });

    const submitEssay = async () => {
        if(!submittedEssay.title) {
            alert("Essay title is required.");
            return;
        }

        try {
            setSubmitting(true);

            await axios.post(
                import.meta.env.VITE_MONGO_CONTROLLER_URL + "/essaycontest/submission",
                {
                    title: submittedEssay.title || undefined,
                    year: submittedEssay.year || undefined,
                    contents: submittedEssay.contents || undefined,
                    userId: userId,
                    contestId: id
                },
                authHeaders
            );

            alert("Essay submitted successfully");

            setSubmitEssayVisible(false);
            setSubmittedEssay({
                title: "",
                year: undefined,
                contents: ""
            });
        } catch(err: any) {
            console.error("Add essay failed:", err.response?.data || err.message);
            alert(err.response?.data?.message?.msg || "Failed to add essay");
        } finally {
            setSubmitting(false);
        }
    };

    const cancelSubmission = () => {
        if(!window.confirm("Cancel submission? Any changes will be lost!")) return;
        setSubmitEssayVisible(false);
        setSubmittedEssay({
            title: "",
            year: undefined,
            contents: ""
        });
    };

    if(loading) return <p>Loading...</p>;
    if(contest == null) return <p>Contest not found.</p>;

    return (
        <section>
            <div className="flex flex-col items-center">
                <div className="bg-white w-full shadow-2xl justify-items-start max-w-[75vw] rounded-4xl m-5 p-10 px-15">
                    <h1 className="text-5xl font-bold underline decoration-brick-ember text-yale-blue mb-5">{contest.title}</h1>
                    <p className="mb-2 text-lg">
                        Topic: {contest.topic} - Started: {contest.startdate.toLocaleDateString()} - {contestIsOngoing(contest.startdate, contest.enddate) ? (
                            "Ends:"
                        ) : (
                            "Ended:"
                        )} {contest.enddate.toLocaleDateString()}
                    </p>
                    <p className="mb-10 text-lg">Prize: {contest.prize.toLocaleString(undefined, {style: "currency", currency: "USD"})}</p>
                    <article
                        className="blog-post wrap-break-word"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(contest.description, {
                                ADD_TAGS: ["iframe"],
                                ADD_ATTR: ["allowfullscreen", "frameborder", "src", "width", "height"],
                            })
                        }}
                    />
                    {contestIsOngoing(contest.startdate, contest.enddate) ? (
                        token !== null ? (
                            <Button
                                className="mt-5 bg-burnt-crimson"
                                onClick={() => {setSubmitEssayVisible(true)}}
                            >
                                Submit an Essay
                            </Button>
                        ) : (
                            <p className="mt-5"><strong>You must be logged in to submit an essay</strong></p>
                        )
                    ) : (
                        <p className="mt-5"><strong>This contest has ended</strong></p>
                    )}
                </div>
                {(token !== null && submitEssayVisible) && (
                    <div className="bg-white w-full shadow-2xl justify-items-start max-w-[75vw] rounded-4xl m-5 p-10 px-15">
                        <h3 className="text-lg font-semibold mb-2">Submit Essay</h3>
                        <div className="flex flex-wrap gap-2">
                            <Input
                                className="border p-2 rounded flex-1"
                                placeholder="Title"
                                value={submittedEssay.title}
                                onChange={e => setSubmittedEssay({...submittedEssay, title: e.target.value})}
                            />
                            <Input
                                className="border p-2 rounded w-24"
                                type="number"
                                placeholder="Year"
                                value={submittedEssay.year ?? ""}
                                onChange={e => setSubmittedEssay({...submittedEssay, year: e.target.value ? Number(e.target.value) : undefined})}
                            />
                        </div>
                        <div className="flex flex-wrap pt-2">
                            <Textarea
                                className="border p-2 rounded flex-1"
                                placeholder="Contents"
                                value={submittedEssay.contents}
                                onChange={e => setSubmittedEssay({...submittedEssay, contents: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-center p-2 gap-2">
                            <Button
                                onClick={submitEssay}
                                disabled={submitting}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit"}
                            </Button>
                            <Button
                                onClick={cancelSubmission}
                                disabled={submitting}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
