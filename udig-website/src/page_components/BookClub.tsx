import { type TokenProp, notifyApiError } from "@/App";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Comment = {
    _id: string;
    userId: string;
    username: string;
    message: string;
    createdAt: string;
};

type BookReview = {
    source: string;
    text: string;
};

type PurchaseLink = {
    text: string;
    link: string;
};

type Book = {
    id: string;
    title: string;
    isbn?: string;
    author?: string;
    description?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
    currentBook?: boolean;
    comments?: Comment[];
    reviews?: BookReview[];
    purchaseLinks?: PurchaseLink[];
};

type MeResponse = {
    id: string;
    username: string;
    role: string;
};

export default function BookClub({ token }: TokenProp) {
    const apiBase = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const { initialBookId } = useParams<{ initialBookId: string }>();

    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);

    const [commentInput, setCommentInput] = useState("");
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    const [userId, setUserId] = useState("");
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        fetchBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialBookId]);

    useEffect(() => {
        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const fetchBooks = async () => {
        try {
            const booksRes = await axios.get(`${apiBase}/books`);

            const fetchedBooks: Book[] = Array.isArray(booksRes.data)
                ? booksRes.data
                : booksRes.data?.books ?? [];

            setBooks(fetchedBooks);

            let nextSelectedBook: Book | undefined;

            if (selectedBook?.id) {
                nextSelectedBook = fetchedBooks.find((b) => b.id === selectedBook.id);
            }

            if (!nextSelectedBook && initialBookId) {
                nextSelectedBook = fetchedBooks.find((b) => b.id === initialBookId);
            }

            if (!nextSelectedBook) {
                nextSelectedBook = fetchedBooks.find((b) => b.currentBook);
            }

            if (!nextSelectedBook && fetchedBooks.length > 0) {
                nextSelectedBook = fetchedBooks[0];
            }

            setSelectedBook(nextSelectedBook);
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occurred: ${err?.message ?? err}`);
        }
    };

    const fetchUserData = async () => {
        if (!token) {
            setUserId("");
            setUserIsAdmin(false);
            setUserLoggedIn(false);
            return;
        }

        try {
            const res = await axios.get<MeResponse>(`${apiBase}/accounts/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUserId(res.data.id);
            setUserIsAdmin(res.data.role === "ADMIN");
            setUserLoggedIn(true);
        } catch (err: any) {
            console.error(err?.message ?? err);
            notifyApiError(err, "fetch user data");
        }
    };

    const getCoverUrl = (book: Book | undefined, size: "M" | "L" = "L") => {
        if (!book?.title) return "";
        return book.isbn
            ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`
            : `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-${size}.jpg`;
    };

    const [reportingComment, setReportingComment] = useState<Comment | null>(null);
    const [reportReason, setReportReason] = useState("");

    const handleReportComment = async () => {
        if (!userLoggedIn || !selectedBook || !reportingComment) return;

        try {
            await axios.post(
                `${apiBase}/reports`,
                {
                    category: "Book Comment",
                    categoryId: selectedBook.id,
                    reporterId: userId,
                    commentId: reportingComment._id,
                    reason: reportReason.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setReportReason("");
            setReportingComment(null);
            alert("Comment reported.");
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "report comment");
        }
    };

    const handleAddComment = async () => {
        if (!userLoggedIn || !selectedBook || commentInput.trim() === "") return;

        try {
            await axios.post(
                `${apiBase}/books/${selectedBook.id}/comments`,
                { content: commentInput.trim() },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCommentInput("");
            await fetchBooks();
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "add comment");
        }
    };

    const handleDeleteComment = async (comment: Comment) => {
        if (!userLoggedIn || !selectedBook) return;
        if (!(userIsAdmin || userId === comment.userId)) return;

        try {
            await axios.delete(
                `${apiBase}/books/${selectedBook.id}/comments/${comment._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            await fetchBooks();
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "delete comment");
        }
    };

    const sortedComments = useMemo(() => {
        return [...(selectedBook?.comments ?? [])].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    }, [selectedBook]);

    if (!books.length) return <p className="text-center mt-20">No books available.</p>;

    return (
        <div className="min-h-screen bg-alice-blue py-10 px-6">
            <Card className="pt-0 border border-golden-bronze">
                <CardHeader className="text-left bg-porcelain rounded-t-xl pt-[2rem] border-b border-golden-bronze">
                    {selectedBook?.currentBook ? (
                        <h2 className="text-3xl font-bold text-yale-blue">
                            UDIG&apos;s Current Read
                            {selectedBook?.startDate &&
                                ` (Since ${new Date(selectedBook.startDate).toLocaleDateString()})`}
                        </h2>
                    ) : (
                        <h2 className="text-3xl font-bold text-yale-blue">
                            Previous UDIG Read
                            {selectedBook?.startDate && selectedBook?.endDate &&
                                ` (From ${new Date(selectedBook.startDate).toLocaleDateString()} to ${new Date(
                                    selectedBook.endDate
                                ).toLocaleDateString()})`}
                        </h2>
                    )}
                </CardHeader>

                <CardContent className="bg-white">
                    <div className="flex flex-wrap justify-center gap-y-[2rem]">
                        <img
                            src={getCoverUrl(selectedBook, "L")}
                            alt={selectedBook?.title}
                            onError={(e) => {
                                e.currentTarget.src = "/placeholder-book.png";
                            }}
                            className="object-contain w-[20rem] border border-golden-bronze bg-yale-blue rounded-lg shadow-xl"
                        />

                        <div className="text-left grow flex flex-col mx-[2rem]">
                            <h1 className="text-3xl text-yale-blue font-bold md:text-left">
                                {selectedBook?.title}
                            </h1>
                            <p className="text-gray-500">{selectedBook?.author}</p>

                            <p className="max-w-[40rem] border border-gray-300 text-graphite rounded-md p-[1rem] my-[1rem]">
                                {selectedBook?.description}
                            </p>

                            {selectedBook?.reviews?.length ? (
                                <Carousel
                                    className="ml-[2rem] mb-[2rem] max-w-[16rem] sm:max-w-[26rem] md:max-w-[36rem]"
                                    opts={{ align: "start", loop: true }}
                                >
                                    <CarouselContent>
                                        {selectedBook.reviews.map((review, index) => (
                                            <CarouselItem key={index} className="basis-full">
                                                <Card className="grow h-[10rem] border-0 text-left border border-gray-300 gap-0">
                                                    <CardHeader>
                                                        <CardTitle className="font-bold text-yale-blue">
                                                            {review.source}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <CardDescription>
                                                            {review.text}
                                                        </CardDescription>
                                                    </CardContent>
                                                </Card>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            ) : null}

                            {selectedBook?.purchaseLinks?.length ? (
                                <>
                                    <p className="text-gray-500">Get it at:</p>
                                    <ul className="flex flex-wrap gap-[2rem]">
                                        {selectedBook.purchaseLinks.map((link, index) => (
                                            <li key={index}>
                                                •{" "}
                                                <a
                                                    href={link.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-blue-500"
                                                >
                                                    <u>{link.text}</u>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}
                        </div>

                        <div className="w-[25rem] 2xl:w-[35rem] bg-porcelain border border-golden-bronze rounded-xl shadow-md p-6 flex flex-col h-[520px]">
                            <h2 className="text-xl font-semibold mb-4">Discussion</h2>

                            {userLoggedIn ? (
                                <div className="flex gap-2 mb-4">
                                    <Textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        maxLength={700}
                                        placeholder="What did you think?"
                                        className="flex-1 border border-golden-bronze rounded-md p-2 resize-none"
                                    />
                                    <button
                                        disabled={commentInput.trim() === ""}
                                        onClick={handleAddComment}
                                        className="bg-brick-ember hover:bg-red-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
                                    >
                                        Post
                                    </button>
                                </div>
                            ) : (
                                <p className="mb-4 text-gray-600">Log in to comment!</p>
                            )}

                            <div className="flex-1 overflow-y-auto pr-2">
                                {sortedComments.length === 0 ? (
                                    <p className="text-gray-500">No comments yet!</p>
                                ) : (
                                    sortedComments.map((comment) => {
                                        const expanded = expandedComments[comment._id];
                                        const longComment = comment.message.length > 250;

                                        return (
                                            <div key={comment._id} className="mb-[1rem]">
                                                <div className="p-3 border border-golden-bronze rounded-md bg-gray-50">
                                                    <div className="flex justify-between gap-4">
                                                    <div className="flex flex-wrap gap-[0.2rem]">
                                                        <p className="text-sm font-semibold text-graphite">
                                                            {comment.username}
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-400">
                                                            {" "} - {new Date(comment.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Dialog
                                                            onOpenChange={(open) => {
                                                                if (!open) {
                                                                    setReportingComment(null);
                                                                    setReportReason("");
                                                                }
                                                            }}
                                                        >
                                                            <DialogTrigger asChild>
                                                                <button
                                                                    onClick={() => {
                                                                        setReportingComment(comment);
                                                                        setReportReason("");
                                                                    }}
                                                                    className="text-sm font-medium text-blue-600 hover:underline focus:outline-none"
                                                                >
                                                                    Report
                                                                </button>
                                                            </DialogTrigger>

                                                            <DialogContent className="sm:max-w-lg">
                                                                <DialogHeader>
                                                                    <DialogTitle>Report Comment</DialogTitle>
                                                                    <DialogDescription>
                                                                        Report this comment from {comment.username}.
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                <div className="space-y-3">
                                                                    <div className="rounded-md border bg-gray-50 p-3 text-sm text-gray-700">
                                                                        {comment.message}
                                                                    </div>

                                                                    <Textarea
                                                                        value={reportReason}
                                                                        onChange={(e) => setReportReason(e.target.value)}
                                                                        placeholder="Why are you reporting this comment?"
                                                                        maxLength={700}
                                                                        className="resize-none"
                                                                    />
                                                                </div>

                                                                <DialogFooter>
                                                                    <Button
                                                                        className="bg-brick-ember hover:bg-red-800"
                                                                        onClick={handleReportComment}
                                                                        disabled={!reportingComment}
                                                                    >
                                                                        Submit Report
                                                                    </Button>

                                                                    <DialogClose asChild>
                                                                        <Button variant="outline">Cancel</Button>
                                                                    </DialogClose>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>

                                                        {userLoggedIn && (userId === comment.userId || userIsAdmin) && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment)}
                                                                className="text-sm font-medium text-brick-ember hover:underline focus:outline-none"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                    <div
                                                        className={`relative text-left text-gray-800 transition-all duration-300 break-words ease-in-out ${
                                                            !expanded && longComment ? "line-clamp-4" : ""
                                                        }`}
                                                    >
                                                        {comment.message}
                                                        {!expanded && longComment && (
                                                            <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                                                        )}
                                                    </div>

                                                    {longComment && (
                                                        <button
                                                            onClick={() =>
                                                                setExpandedComments((prev) => ({
                                                                    ...prev,
                                                                    [comment._id]: !prev[comment._id],
                                                                }))
                                                            }
                                                            className="mt-1 text-sm font-medium text-yale-blue hover:underline focus:outline-none"
                                                        >
                                                            {expanded ? "Show less" : "Read more"}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="max-w-6xl mx-auto mt-16">
                <h2 className="text-xl text-graphite underline font-semibold mb-6 text-center">
                    All Books
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    {books.map((book) => (
                        <div
                            key={book.id}
                            onClick={() => setSelectedBook(book)}
                            className="flex flex-col items-center cursor-pointer group"
                        >
                            <img
                                src={getCoverUrl(book, "M")}
                                alt={book.title}
                                onError={(e) => {
                                    e.currentTarget.src = "/placeholder-book.png";
                                }}
                                className="object-contain w-[8rem] h-[12rem] border border-golden-bronze bg-yale-blue rounded-md shadow group-hover:scale-105 transition"
                            />
                            <p className="mt-2 text-sm text-center text-graphite">{book.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}