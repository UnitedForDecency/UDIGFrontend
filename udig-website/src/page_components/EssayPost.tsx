import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios, {AxiosError} from "axios";
import {notifyApiError} from "@/App";
import "../styles/IssuePost.css";

type Essay = Readonly<{
    id: string;
    title: string;
    author: string;
    content: string;
    featured: string;
    createdAt: Date;
    writtenAt: Date;
}>;

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
function convertStringToDate(essay: any): any {
    if(essay.createdAt !== undefined && typeof essay.createdAt === "string") {
        essay.createdAt = new Date(essay.createdAt);
    }

    if(essay.writtenAt !== undefined && typeof essay.writtenAt === "string") {
        essay.writtenAt = new Date(essay.writtenAt);
    }

    return essay;
}

export default function EssayPost() {
    const controllerUrl: string = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const {id} = useParams<{id: string}>();

    const [essay, setEssay] = useState<Essay | null>(null);

    const [loading, setLoading] = useState(true);

    const fetchEssay = async (): Promise<void> => {
        try {
            return axios.get<Essay>(
                `${controllerUrl}/essays/${id}`
            ).then(res => {
                setEssay(convertStringToDate(res.data));
                setLoading(false);
            }, (err: AxiosError) => {
                notifyApiError(err, "fetch essay");
            });
        } catch(err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchEssay();
    }, [id]);

    if(loading) return <p>Loading&hellip;</p>;
    if(essay === null) return <p>Essay not found.</p>;

    return (
        <section>
            <div className="flex flex-col items-center wrap-break-word">
                <div className="bg-white w-full shadow-2xl justify-items-start max-w-[75vw] rounded-4xl m-5 p-10 px-15">
                    <h1 className="text-5xl font-bold underline decoration-brick-ember text-yale-blue mb-5">
                        {essay.title}
                    </h1>
                    <p className="text-lg mb-1">
                        {essay.author} &ndash; {essay.featured}
                    </p>
                    <p className="text-lg mb-12">
                        Written: {essay.writtenAt.toLocaleDateString(undefined, {timeZone: "UTC"})} &ndash;
                        Submitted: {essay.createdAt.toLocaleString()}
                    </p>
                    <article className="blog-post">
                        {essay.content}
                    </article>
                </div>
            </div>
        </section>
    );
}
