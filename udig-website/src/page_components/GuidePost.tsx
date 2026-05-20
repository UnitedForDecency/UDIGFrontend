import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import DOMPurify from "dompurify";

interface Guide {
    _id: string;
    title: string;
    description: string;
    contents: string;
    category: string;
    readTime?: string;
    dateUploaded?: string;
}

const GuidePost = () => {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [guide, setGuide] = useState<Guide | null>(location.state?.guide ?? null);
    const [loading, setLoading] = useState(!location.state?.guide);
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (location.state?.guide) return;
        if (!id) return;
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/guides/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setGuide(data);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Loading…</p>;
    if (!guide) return <p>Guide not found.</p>;

    return (
        <section>
            <div className="flex flex-col items-center">
                <div className="bg-white w-full shadow-2xl justify-items-start max-w-[75vw] rounded-4xl m-5 p-10 px-15">
                    <h1 className="text-5xl font-bold underline decoration-brick-ember text-yale-blue mb-20">{guide.title}</h1>
                    <article
                        className="blog-post wrap-break-word"
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(guide.contents, {
                                ADD_TAGS: ["iframe"],
                                ADD_ATTR: ["allowfullscreen", "frameborder", "src", "width", "height"],
                            }),
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default GuidePost;
