import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import "../styles/IssuePost.css"

interface Essay {
    _id: string;
    title: string;
    author: string;
    contents: string;
    year: number;
}

const EssayPost = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Essay | null>(null);
    const [loading, setLoading] = useState(true);

useEffect(() => {
    fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/essays/${id}`)
        .then((res) => res.json())
        .then((data) => {
        setPost(data);
        setLoading(false);
    });
}, [id]);

if (loading) return <p>Loading…</p>;
 if (!post) return <p>Post not found.</p>;

    return (
        <section>
            <div className="flex flex-col items-center">
                <div className="bg-white w-full shadow-2xl justify-items-start max-w-[75vw] rounded-4xl m-5 p-10 px-15">
                    <h1 className="text-5xl font-bold underline decoration-brick-ember text-yale-blue mb-5">{post.title}</h1>
                    <p className="mb-20 text-lg">{post.author} - {post.year}</p>
                    <article
                        className="blog-post wrap-break-word"
                        dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(post.contents, {
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

export default EssayPost;