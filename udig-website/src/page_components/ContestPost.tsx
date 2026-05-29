import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios, {AxiosError} from "axios";
import {notifyApiError} from "@/App";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import "../styles/IssuePost.css";

type Contest = Readonly<{
    id: string;
    title: string;
    topic: string;
    description: string;
    prize: number;
    startDate: Date;
    endDate: Date;
}>;

type Essay = {
    title: string;
    author: string;
    content: string;
    writtenAt: Date | null;
};

function datePassed(date: Date): boolean {
    const currentDate = new Date();

    return date < currentDate;
}

function contestIsOngoing(startDate: Date, endDate: Date): boolean {
    const currentDate = new Date();

    return (startDate <= currentDate) && (endDate > currentDate);
}

function ensureTwoDigits(num: number): string {
    return num < 10 ? `0${num.toString()}` : num.toString();
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
function convertStringToDate(contest: any): any {
    if(contest.startDate !== undefined && typeof contest.startDate === "string") {
        contest.startDate = new Date(contest.startDate);
    }

    if(contest.endDate !== undefined && typeof contest.endDate === "string") {
        contest.endDate = new Date(contest.endDate);
    }

    return contest;
}

export default function ContestPost() {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const {id} = useParams<{id: string}>();

    const [contest, setContest] = useState<Contest | null>(null);

    const [submission, setSubmission] = useState<Essay>({
        title: "",
        author: "",
        content: "",
        writtenAt: null
    });
    const [submissionVisible, setSubmissionVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [loading, setLoading] = useState(true);

    const fetchContest = async (): Promise<void> => {
        try {
            return axios.get<Contest>(
                `${controllerUrl}/contests/${id}`
            ).then(res => {
                setContest(convertStringToDate(res.data));
                setLoading(false);
            }, (err: AxiosError) => {
                notifyApiError(err, "fetch contest");
            });
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchContest();
    }, [id]);

    const resetSubmission = (): void => {
        setSubmission({
            title: "",
            author: "",
            content: "",
            writtenAt: null
        });
    };

    const isSubmissionEmpty = (): boolean => {
        return submission.title === "" &&
            submission.author === "" &&
            submission.content === "" &&
            submission.writtenAt === null;
    };

    const submitEssay = async (): Promise<void> => {
        if(!submission.title) {
            alert("Essay title is required.");
            return;
        }

        try {
            setSubmitting(true);

            axios.post(
                `${controllerUrl}/contests/${id}/submit`,
                {
                    title: submission.title,
                    author: submission.author,
                    content: submission.content,
                    writtenAt: submission.writtenAt!.toISOString()
                }
            ).then(() => {
                alert("Essay submitted successfully");

                setSubmissionVisible(false);
                resetSubmission();
            }, (err: AxiosError) => {
                notifyApiError(err, "submit essay");
            });
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setSubmitting(false);
        }
    };

    const cancelSubmission = (): void => {
        if(
            !isSubmissionEmpty() &&
            !window.confirm("Cancel submission? Any changes will be lost!")
        ) {
            return;
        }

        setSubmissionVisible(false);
        resetSubmission();
    };

    if(loading) return <p>Loading&hellip;</p>;
    if(contest === null) return <p>Contest not found.</p>;

    return (
        <section>
            <div className="flex flex-col items-center">
                <div className="bg-white w-full shadow-2xl justify-items-start wrap-break-word max-w-[75vw] rounded-4xl m-5 p-10 px-15">
                    <h1 className="text-5xl font-bold underline decoration-brick-ember text-yale-blue mb-5">
                        {contest.title}
                    </h1>
                    <p className="text-lg mb-1">
                        Topic: {contest.topic} &ndash; Prize: {contest.prize.toLocaleString(undefined, {style: "currency", currency: "USD"})}
                    </p>
                    <p className="text-lg mb-12">
                        {datePassed(contest.startDate) ? "Started" : "Starts"}: {contest.startDate.toLocaleString()} &ndash; {
                        datePassed(contest.endDate) ? "Ended" : "Ends"}: {contest.endDate.toLocaleString()}
                    </p>
                    <article className="blog-post">
                        {contest.description}
                    </article>
                    {contestIsOngoing(contest.startDate, contest.endDate) ? (
                        <Button
                            className="mt-5 text-white cursor-pointer bg-burnt-crimson hover:bg-oxblood-shadow disabled:pointer-events-auto disabled:cursor-not-allowed"
                            disabled={submissionVisible || submitting}
                            onClick={() => {setSubmissionVisible(true)}}
                        >
                            Submit an Essay
                        </Button>
                    ) : (
                        datePassed(contest.endDate) ? (
                            <p className="mt-5"><strong>This contest has ended</strong></p>
                        ) : (
                            (!datePassed(contest.startDate)) ? (
                                <p className="mt-5"><strong>This contest has not started yet</strong></p>
                            ) : (
                                <p className="mt-5"><strong>This contest is not open for submissions</strong></p>
                            )
                        )
                    )}
                </div>
                {submissionVisible && (
                    <div className="bg-white w-full shadow-2xl justify-items-start max-w-[75vw] rounded-4xl m-5 p-5 sm:px-10">
                        <h3 className="text-lg font-semibold mb-2">
                            Submit an Essay
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <Label
                                className="flex-1 text-base"
                                htmlFor="contest-post-submission-title-input"
                            >
                                Title:
                                <Input
                                    id="contest-post-submission-title-input"
                                    className="min-w-30 flex-1 rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={submission.title}
                                    onChange={e => setSubmission({...submission, title: e.target.value})}
                                />
                            </Label>
                            <Label
                                className="flex-1 text-base"
                                htmlFor="contest-post-submission-author-input"
                            >
                                Author:
                                <Input
                                    id="contest-post-submission-author-input"
                                    className="min-w-30 flex-1 rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={submission.author}
                                    onChange={e => setSubmission({...submission, author: e.target.value})}
                                />
                            </Label>
                            <Label
                                className="text-base"
                                htmlFor="contest-post-submission-written-at-input"
                            >
                                Written On:
                                <Input
                                    id="contest-post-submission-written-at-input"
                                    className="w-37 rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="date"
                                    value={submission.writtenAt === null ? "" : formatUTCDate(submission.writtenAt)}
                                    onChange={e => setSubmission({...submission, writtenAt: e.target.valueAsDate})}
                                />
                            </Label>
                        </div>
                        <div className="flex flex-wrap pt-2">
                            <label
                                className="sr-only"
                                htmlFor="contest-post-submission-content-input"
                            >
                                Contents
                            </label>
                            <Textarea
                                id="contest-post-submission-content-input"
                                className="flex-1 rounded-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Contents"
                                value={submission.content}
                                onChange={e => setSubmission({...submission, content: e.target.value})}
                            />
                        </div>
                        <div className="flex justify-center pt-5 gap-2">
                            <Button
                                className="px-4 py-2 rounded text-white cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:pointer-events-auto disabled:cursor-not-allowed"
                                disabled={
                                    submitting || submission.title === "" || submission.author === "" || submission.content.length < 32 || submission.writtenAt === null
                                }
                                onClick={submitEssay}
                            >
                                {/* `\u2026` is equal to `&hellip;` */}
                                {submitting ? "Submitting\u2026" : "Submit"}
                            </Button>
                            <Button
                                className="px-4 py-2 rounded text-white cursor-pointer bg-red-600 hover:bg-red-700 disabled:pointer-events-auto disabled:cursor-not-allowed"
                                disabled={submitting}
                                onClick={cancelSubmission}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
