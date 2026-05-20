import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { DeleteIcon, EditIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface Post {
    _id: string;
    title: string;
    contents: string;
    description: string;
    dateUploaded: Date;
}

export default function Issues() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const [token, setToken] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const POSTS_PER_PAGE = 6;

    let firstInit = true;

    useEffect(() => {
        onInit();
        firstInit = false;
    }, []);

    async function onInit() {
        if (firstInit) {
            await checkToken();
            setPosts(await getAllPosts());
            setLoading(false);
        }
    }

    async function checkToken() {
        const storedToken = localStorage.getItem("token");
        const storedAdmin = localStorage.getItem("isAdmin") === "true";
        const expiry = localStorage.getItem("expiry");

        if (storedToken && expiry && Date.now() < Number(expiry)) {
            setToken(storedToken);
            setIsAdmin(storedAdmin);
            setIsLoggedIn(true);
        } else {
            setToken(null);
            setIsAdmin(false);
        }
    }

    async function getAllPosts() {
        const url = import.meta.env.VITE_MONGO_CONTROLLER_URL;
        const response = await fetch(url + "/issues");
        return await response.json();
    }

    async function deletePost(id: string, title: string) {
        if (window.confirm("Delete this post permanently? " + title)) {
            const url = import.meta.env.VITE_MONGO_CONTROLLER_URL;
            const authHeaders = {
                headers: { Authorization: `Bearer ${token}` },
            };

            try {
                await axios.delete(`${url}/issues/${id}`, authHeaders);
                setPosts((prev) => prev.filter((p) => p._id !== id));
            } catch (err: any) {
                console.error("Delete failed:", err);
                alert("Failed to delete post: " + err.response.data.message);
            }
        }
    }

    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const start = currentPage * POSTS_PER_PAGE;
    const currentPosts = posts.slice(start, start + POSTS_PER_PAGE);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsModalOpen(false);
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    useEffect(() => {
        document.body.style.overflow = isModalOpen ? "hidden" : "auto";
    }, [isModalOpen]);

    if (loading) return <p>Loading…</p>;

    return (
        <section>
            <div className="flex flex-col items-center">
                <h1 className="text-4xl my-5 font-bold underline decoration-brick-ember text-yale-blue">
                    Current Issues
                </h1>

                <Separator className="max-w-[75vw]" />

                {/* POSTS */}
                <div className="flex flex-col items-center">
                    {currentPosts.map((post) => (
                        <div
                            key={post._id}
                            onClick={() => {
                                setSelectedPost(post);
                                setIsModalOpen(true);
                            }}
                            className="cursor-pointer shadow-2xl bg-white rounded-4xl m-5 p-5 w-[80vw] items-center hover:shadow-xl transition"
                        >
                            <div>
                                <p className="text-2xl underline decoration-brick-ember text-yale-blue">
                                    {post.title}
                                </p>

                                <p className="text-lg">{post.description}</p>

                                <p>
                                    Uploaded {new Date(post.dateUploaded).toLocaleDateString()}
                                </p>
                            </div>

                            {/* ADMIN ACTIONS */}
                            {isAdmin && (
                                <div className="m-3 flex items-center gap-3">
                                    {post.title !== "Decency: UDIG's Goal" && (
                                        <Button
                                            className="text-brick-ember bg-white hover:bg-porcelain"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deletePost(post._id, post.title);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </Button>
                                    )}

                                    <a
                                        href={"/programs/issues/" + post._id + "/edit"}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <EditIcon className="text-black bg-white hover:bg-porcelain" />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* PAGINATION */}
                <div className="flex justify-center items-center gap-6 mb-10">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                        disabled={currentPage === 0}
                        className="px-5 py-2 rounded-full bg-muted text-muted-foreground hover:underline disabled:opacity-40"
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
                        className="px-5 py-2 rounded-full bg-muted text-muted-foreground hover:underline disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>

                {/* MODAL */}
                {isModalOpen && selectedPost && (
                    <div
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-[90vw] max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl p-8 relative"
                        >
                            {/* CLOSE */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                            >
                                ✕
                            </button>

                            {/* HEADER */}
                            <h2 className="text-3xl font-bold text-yale-blue mb-4">
                                {selectedPost.title}
                            </h2>

                            <p className="text-sm text-gray-500 mb-6">
                                Uploaded{" "}
                                {new Date(selectedPost.dateUploaded).toLocaleDateString()}
                            </p>

                            {/* CONTENT */}
                            <article className="prose max-w-none whitespace-pre-wrap">
                                {selectedPost.contents}
                            </article>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}