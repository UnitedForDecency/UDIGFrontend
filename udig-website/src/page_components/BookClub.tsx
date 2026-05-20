import { type TokenProp, notifyApiError } from "@/App";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea"
import { type Book, type Comment } from "@/page_components/Admin/BooksAdmin";

export default function BookClub({ token }: TokenProp) {
    const apiBase = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const { initialBookId } = useParams<{ initialBookId: string }>();
    const [books, setBooks] = useState<Book[]>([]);
    const [selectedBook, setSelectedBook] = useState<Book>();
    const [currentBookId, setCurrentBookId] = useState("");

    const [commentInput, setCommentInput] = useState("");
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
    const [shownReplies, setShownReplies] = useState<Record<string, boolean>>({});
    const [replyInput, setReplyInput] = useState("");
    const [reportInput, setReportInput] = useState("");
    const [replyingCommentId, setReplyingCommentId] = useState("");

    const [userId, setUserId] = useState("");
    const [username, setUsername] = useState("");
    const [userIsAdmin, setUserIsAdmin] = useState(false);
    const [userLoggedIn, setUserLoggedIn] = useState(false);

    useEffect(() => {
        fetchBooks();
    }, []);

    useEffect(() => {
        fetchUserData();
    }, [token]);

    const fetchBooks = async () => {
        try {
            axios.get(
                `${apiBase}/global/current-book-id`
            ).then(bookIdRes => {
                axios.get(
                    `${apiBase}/books`
                ).then(booksRes => {
                    const fetchedBooks = booksRes.data.books ?? [];
                    let currentSelectedBook = fetchedBooks.find((b: Book) => b._id === selectedBook?._id);
                    let initialBook = undefined;
                    if (currentSelectedBook) setSelectedBook(currentSelectedBook);
                    else if (initialBookId) {
                        initialBook = fetchedBooks.find((b: Book) => b._id === initialBookId);
                        if (initialBook != undefined) setSelectedBook(initialBook);
                    }
                    if (!currentSelectedBook && !initialBook) setSelectedBook(fetchedBooks.find((b: Book) => b._id === bookIdRes.data.currentBookId));
                    setCurrentBookId(bookIdRes.data.currentBookId);
                    setBooks(fetchedBooks);
                })
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) return; // 404s if there are no books, this isn't an error
                    notifyApiError(err, "fetch books");
                }
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const fetchUserData = async () => {
        if (!token) {
            setUserId("");
            setUsername("");
            setUserIsAdmin(false);
            setUserLoggedIn(false);
            return;
        }
        try {
            axios.get(
                `${apiBase}/accounts/token/${token}`
            ).then(res => {
                setUserId(res.data.userId);
                setUsername(res.data.username);
                setUserIsAdmin(res.data.isAdmin);
                setUserLoggedIn(true);
            }).catch((err: AxiosError) => {
                notifyApiError(err, "fetch user data");

            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const getCoverUrl = (book: Book | undefined, size: "M" | "L" = "L") => {
        if (book == undefined || book.title == undefined) return "";
        return book.isbn
            ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-${size}.jpg`
            : `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-${size}.jpg`;
    }

    const handleAddComment = async () => {
        if (!userLoggedIn || !selectedBook || !commentInput || commentInput.trim() == "") return;
        try {
            const commentId = selectedBook._id + "_" + crypto.randomUUID();
            axios.post(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/books/comments`,
                {
                    userId: userId,
                    username: username,
                    content: commentInput.trim(),
                    commentId: commentId
                }
            ).then(() => {
                axios.put(
                    `${apiBase}/accounts/comments/log/${token}`,
                    {
                        content: commentInput.trim(),
                        commentId: commentId,
                        category: "book",
                        postedOn: selectedBook.title
                    }
                );

                setCommentInput("");
                fetchBooks();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "add comment");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const handleDeleteComment = async (comment: Comment) => {
        if (!userLoggedIn || !selectedBook || !(userIsAdmin || userId === comment.userId)) return;
        try {
            axios.delete(
                `${apiBase}/books/comments/${comment.commentId}/${token}`
            ).then(() => {
                axios.put(`${apiBase}/accounts/comments/deleted/${token}/${comment.commentId}/book`);
                fetchBooks();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete comment");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const handleAddReply = async (parentComment: Comment) => {
        if (!userLoggedIn || parentComment === undefined || !selectedBook || !parentComment || !replyInput || replyInput.trim() === "") return;
        try {
            const commentId = parentComment.commentId + "_" + crypto.randomUUID();
            axios.post(
                `${apiBase}/books/comments`,
                {
                    userId: userId,
                    username: username,
                    content: replyInput.trim(),
                    commentId: commentId
                }
            ).then(() => {
                axios.put(
                    `${apiBase}/accounts/comments/log/${token}`,
                    {
                        content: replyInput.trim(),
                        commentId: commentId,
                        category: "book",
                        postedOn: selectedBook.title
                    }
                );
                setReplyInput("");
                setReplyingCommentId("");
                fetchBooks();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "post reply");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const switchReplyingComment = (commentId: string) => {
        if (replyingCommentId === commentId) return;
        if (replyInput.trim() != "" && !window.confirm("Discard current comment?")) return;
        setReplyInput("");
        setReplyingCommentId(commentId);
        setShownReplies((prev) => ({ ...prev, [commentId]: true }))
    }

    const fileReport = async (comment: any) => {
        if (!userLoggedIn || !token || !comment.commentId || !comment.userId || !comment.username) return;
        try {
            axios.post(
                `${apiBase}/reports/`,
                {
                    commentId: comment.commentId,
                    reporterId: userId,
                    reporterName: username,
                    subjectId: comment.userId,
                    subjectName: comment.username,
                    content: comment.content,
                    postedOn: selectedBook?._id,
                    postedOnName: selectedBook?.title,
                    reason: reportInput || "",
                    category: "book"
                }
            ).catch((err: AxiosError) => {
                notifyApiError(err, "file report");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    }

    if (!books.length) return <p className="text-center mt-20">No books available.</p>;

    return (
        <div className="min-h-screen bg-alice-blue py-10 px-6">
            {/* Top Section */}
            <Card className="pt-0 border border-golden-bronze">
                <CardHeader className="text-left bg-porcelain rounded-t-xl pt-[2rem] border-b border-golden-bronze">
                    {
                        selectedBook?._id === currentBookId &&
                        <h2 className="text-3xl font-bold text-yale-blue">
                            UDIG's Current Read
                            {selectedBook !== undefined && selectedBook.dateStarted !== undefined &&
                                " (Since " + new Date(selectedBook?.dateStarted).toLocaleDateString() + ")"
                            }
                        </h2>
                    }
                    {
                        selectedBook?._id !== currentBookId &&
                        <h2 className="text-3xl font-bold text-yale-blue">
                            Previous UDIG Read
                                {selectedBook !== undefined && selectedBook.dateStarted !== undefined && selectedBook.dateEnded !== undefined &&
                                    " (From " + new Date(selectedBook?.dateStarted).toLocaleDateString() + " to " + new Date(selectedBook?.dateEnded).toLocaleDateString() + ")"
                            }
                        </h2>
                    }
                </CardHeader>
                <CardContent className="bg-white">
                    <div className="flex flex-wrap justify-center gap-y-[2rem]">
                        <img
                            src={getCoverUrl(selectedBook, "L")}
                            alt={selectedBook?.title}
                            onError={(e) => { e.currentTarget.src = "/placeholder-book.png"; }}
                            className="object-contain w-[20rem] border border-golden-bronze bg-yale-blue rounded-lg shadow-xl"
                        />
                        { /* Book Information */}
                        <div className="text-left grow flex flex-col mx-[2rem]">
                            { /* Basic Info */ }
                            <h1 className="text-3xl text-yale-blue font-bold md:text-left">{selectedBook?.title}</h1>
                            <p className="text-gray-500">{selectedBook?.author}</p>
                            <p className="max-w-[40rem] border border-gray-300 text-graphite rounded-md p-[1rem] my-[1rem]">
                                { selectedBook?.description }
                            </p>
                            { /* Review Carousel */}
                            {
                                selectedBook != undefined && selectedBook.reviews != undefined && selectedBook.reviews.length > 0 &&
                                <Carousel className="ml-[2rem] mb-[2rem] max-w-[16rem] sm:max-w-[26rem] md:max-w-[36rem]" opts={{
                                    align: "start",
                                    loop: true,
                                }}>
                                    <CarouselContent>
                                        {
                                            selectedBook.reviews.map((review, index) => (
                                                <CarouselItem key={index} className="basis-1/1">
                                                    <Card className="grow h-[10rem] border-0 text-left border border-gray-300 gap-0">
                                                        <CardHeader>
                                                            <CardTitle className="font-bold text-yale-blue">{review.source}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <CardDescription>
                                                                {
                                                                    review.text != undefined &&
                                                                    <>
                                                                        <div
                                                                            className={`relative text-gray-800 transition-all duration-300 ease-in-out ${(window.innerWidth < 768 ? "line-clamp-3" : review.text.length > 250 ? "line-clamp-4" : "")
                                                                                }`}
                                                                        >
                                                                            {review.text}
                                                                            {(window.innerWidth < 768 || review.text.length > 250) && (
                                                                                <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                                                                            )}
                                                                        </div>
                                                                        {
                                                                            (window.innerWidth < 768 || review.text.length > 250) &&
                                                                            
                                                                            <Dialog>
                                                                                <div className="flex justify-center">
                                                                                    <DialogTrigger asChild>
                                                                                        <button className="text-center mt-1 text-sm font-medium text-yale-blue hover:underline focus:outline-none">Read more</button>
                                                                                    </DialogTrigger>
                                                                                    <DialogContent className="max-w-[70%] max-h-[70%] overflow-y-scroll">
                                                                                        <DialogHeader>
                                                                                            <DialogTitle className="font-bold text-yale-blue">{review.source}</DialogTitle>
                                                                                            <DialogDescription>
                                                                                                {review.text}
                                                                                            </DialogDescription>
                                                                                        </DialogHeader>
                                                                                        <DialogFooter className="sm:justify-center mt-4">
                                                                                            <DialogClose asChild>
                                                                                                <Button>Done</Button>
                                                                                            </DialogClose>
                                                                                        </DialogFooter>
                                                                                    </DialogContent>
                                                                                </div>
                                                                            </Dialog>
                                                                        }
                                                                    </>
                                                                }
                                                            </CardDescription>
                                                        </CardContent>
                                                    </Card>
                                                </CarouselItem>
                                            ))
                                        }
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                </Carousel>
                            }
                            { /* Purchase Links */}
                            {
                                selectedBook != undefined && selectedBook.purchaseLinks != undefined && selectedBook.purchaseLinks.length > 0 &&
                                <>
                                    <p className="text-gray-500">Get it at:</p>
                                    <ul className="flex flex-wrap gap-[2rem]">
                                        {
                                            selectedBook.purchaseLinks.map((link, index) => (
                                                <li key={index}>• <a href={link.link} target="_blank" className="text-blue-500"><u>{link.text}</u></a></li>
                                            ))
                                        }
                                    </ul>
                                </>
                            }
                        </div>
                        { /* Comments */}
                        <div className="w-[25rem] 2xl:w-[35rem] bg-porcelain border border-golden-bronze rounded-xl shadow-md p-6 flex flex-col h-[520px]">
                            <h2 className="text-xl font-semibold mb-4">Discussion</h2>

                            {/* Comment input */}
                            {
                                userLoggedIn &&
                                <div className="flex gap-2 mb-4">
                                    <Textarea
                                        value={commentInput}
                                        onChange={(e) => setCommentInput(e.target.value)}
                                        maxLength={700}
                                        placeholder="What did you think?"
                                        className="flex-1 border border-golden-bronze rounded-md p-2 resize-none"
                                    />
                                    <button
                                        disabled={commentInput.trim() == "" }
                                        onClick={handleAddComment}
                                        className="bg-brick-ember hover:bg-red-800 disabled:bg-gray-400 text-white px-4 py-2 rounded-md"
                                    >
                                        Post
                                    </button>
                                </div>
                            }
                            {
                                !userLoggedIn &&
                                "Log in to comment!"
                            }
                            {/* Comments list */}
                            <div className="flex-1 overflow-y-auto pr-2">
                                {(selectedBook === undefined || selectedBook.comments === undefined || selectedBook.comments.length === 0) && <p className="text-gray-500">No comments yet!</p>}
                                {selectedBook?.comments?.sort(
                                    (a, b) => {
                                        const dateA = a.createdAt;
                                        const dateB = b.createdAt;
                                        if (dateA < dateB) {
                                            return 1;
                                        }
                                        if (dateA > dateB) {
                                            return -1;
                                        }
                                        // same time, ordering doesn't matter
                                        return 0;
                                    }
                                ).map((comment) =>
                                    <div className="mb-[1rem]">
                                        <div key={comment.commentId} className="p-3 border border-golden-bronze rounded-md bg-gray-50">
                                            <div className="flex justify-between">
                                                <div className="flex flex-wrap gap-[0.2rem]">
                                                    <p className="text-sm font-semibold text-graphite">{comment.username}</p>
                                                    <p className="text-sm font-semibold text-gray-400"> - {new Date(comment.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                {
                                                    userLoggedIn &&
                                                    <div className="flex gap-2">
                                                        {
                                                            userId !== comment.userId &&
                                                            <Dialog>
                                                                <div className="flex justify-center">
                                                                    <DialogTrigger asChild>
                                                                        <button
                                                                            onClick={() => setReportInput("")}
                                                                            aria-expanded={expandedComments[comment.commentId]}
                                                                            className="text-sm font-medium text-brick-ember hover:underline focus:outline-none"
                                                                        >
                                                                            Report
                                                                        </button>
                                                                    </DialogTrigger>
                                                                    <DialogContent className="w-[70%] max-h-[70%] overflow-y-scroll overflow-x-hidden gap-y-3">
                                                                        <DialogHeader>
                                                                            <DialogTitle className="font-bold text-brick-ember">Report Comment</DialogTitle>
                                                                        </DialogHeader>
                                                                        <p>{`Report by: ${username}`}</p>
                                                                        <p>{`Commenter: ${comment.username}`}</p>
                                                                        <p>Text:</p>
                                                                        <div className="min-w-0 break-words w-full border rounded-md p-2">{comment.content}</div>
                                                                        <p>Reason (optional):</p>
                                                                        <Textarea
                                                                            placeholder="Your reason for reporting"
                                                                            value={reportInput}
                                                                            onChange={(e) => setReportInput(e.target.value)}
                                                                            className="flex-1 rounded-md p-2 text-sm resize-none"
                                                                        />
                                                                        <DialogFooter className="sm:justify-center mt-4">
                                                                            <DialogClose asChild>
                                                                                <Button onClick={() => fileReport(comment)} className="bg-brick-ember hover:bg-red-800">
                                                                                    Report
                                                                                </Button>
                                                                            </DialogClose>
                                                                            <DialogClose asChild>
                                                                                <Button>Cancel</Button>
                                                                            </DialogClose>
                                                                        </DialogFooter>
                                                                    </DialogContent>
                                                                </div>
                                                            </Dialog>
                                                        }
                                                        {
                                                            (userId === comment.userId || userIsAdmin === true) &&
                                                            <button
                                                                onClick={() => handleDeleteComment(comment)}
                                                                aria-expanded={expandedComments[comment.commentId]}
                                                                className="text-sm font-medium text-brick-ember hover:underline focus:outline-none"
                                                            >
                                                                Delete
                                                            </button>
                                                        }
                                                    </div>
                                                }
                                            </div>
                                            <div
                                                className={
                                                    `relative text-left text-gray-800 transition-all duration-300 wrap-break-word ease-in-out ${!expandedComments[comment.commentId] && comment.content.length > 250 ? "line-clamp-4" : ""}`
                                                }
                                            >
                                                {comment.content}
                                                {!expandedComments[comment.commentId] && comment.content.length > 250 && (
                                                    <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                                                )}
                                            </div>

                                            <div className="mt-1 grid">
                                                <div className="flex justify-end col-1 row-1">
                                                    {
                                                        userLoggedIn &&
                                                        <button
                                                            onClick={() => {
                                                                if (replyingCommentId !== comment.commentId) switchReplyingComment(comment.commentId);
                                                                else switchReplyingComment("");
                                                            }}
                                                            className="text-sm font-medium text-yale-blue hover:underline focus:outline-none"
                                                        >
                                                            {replyingCommentId === comment.commentId ? "Cancel" : "Reply"}
                                                        </button>
                                                    }
                                                </div>
                                                <div className="col-1 row-1 pointer-events-none">
                                                    {comment.commentId !== undefined && comment.content.length > 250 && (
                                                        <button
                                                            onClick={() => setExpandedComments((prev) => ({ ...prev, [comment.commentId]: !prev[comment.commentId] }))}
                                                            aria-expanded={expandedComments[comment.commentId]}
                                                            className="pointer-events-auto mx-[0.4rem] text-sm font-medium text-yale-blue hover:underline focus:outline-none"
                                                        >
                                                            {expandedComments[comment.commentId] ? "Show less" : "Read more"}
                                                        </button>
                                                    )}
                                                    {comment.replies != undefined && comment.replies.length != 0 && (
                                                        <button
                                                            onClick={() => setShownReplies((prev) => ({ ...prev, [comment.commentId]: !prev[comment.commentId] }))}
                                                            className="pointer-events-auto mx-[0.4rem] text-sm font-medium text-yale-blue hover:underline focus:outline-none"
                                                        >
                                                            {shownReplies[comment.commentId] ? "Hide replies" : `Show replies (${comment.replies.length})`}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-end">
                                            {
                                                replyingCommentId === comment.commentId && userLoggedIn &&
                                                <div className="w-[80%]">
                                                    <div className="w-[100%] mt-[0.5rem] p-3 border border-golden-bronze rounded-md bg-gray-50">
                                                        <div className="flex flex-wrap gap-[0.2rem] mb-[0.5rem]">
                                                            <p className="text-sm font-semibold text-graphite">{username}</p>
                                                            <p className="text-sm font-semibold text-gray-400"> - {new Date().toLocaleDateString()}</p>
                                                        </div>
                                                        <Textarea
                                                            placeholder="Add a reply..."
                                                            value={replyInput}
                                                            maxLength={700}
                                                            onChange={(e) => setReplyInput(e.target.value)}
                                                            className="flex-1 border border-golden-bronze rounded-md p-2 text-sm resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            disabled={replyInput.trim() == ""}
                                                            onClick={() => handleAddReply(comment)}
                                                            className="mt-[0.5rem] disabled:bg-gray-400 bg-brick-ember hover:bg-red-800 disabled:bg-gray-400 text-white px-3 py-1 rounded-md text-md"
                                                        >
                                                            Reply
                                                        </button>
                                                    </div>
                                                </div>
                                            }
                                            {
                                                shownReplies[comment.commentId] && comment?.replies?.sort(
                                                    (a, b) => {
                                                        const dateA = a.createdAt;
                                                        const dateB = b.createdAt;
                                                        if (dateA < dateB) {
                                                            return 1;
                                                        }
                                                        if (dateA > dateB) {
                                                            return -1;
                                                        }
                                                        // same time, ordering doesn't matter
                                                        return 0;
                                                    }
                                                ).map((reply) =>
                                                    <div className="mt-[0.5rem] w-[80%]">
                                                        <div key={reply.commentId} className="p-3 border border-golden-bronze rounded-md bg-gray-50">
                                                            <div className="flex justify-between">
                                                                <div className="flex flex-wrap gap-[0.2rem]">
                                                                    <p className="text-sm font-semibold text-graphite">{reply.username}</p>
                                                                    <p className="text-sm font-semibold text-gray-400"> - {new Date(reply.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                                {
                                                                    userLoggedIn &&
                                                                    <div className="flex gap-2">
                                                                        {
                                                                            userId !== reply.userId &&
                                                                                <Dialog>
                                                                                    <div className="flex justify-center">
                                                                                        <DialogTrigger asChild>
                                                                                            <button
                                                                                                onClick={() => setReportInput("")}
                                                                                                aria-expanded={expandedComments[reply.commentId]}
                                                                                                className="text-sm font-medium text-brick-ember hover:underline focus:outline-none"
                                                                                            >
                                                                                                Report
                                                                                            </button>
                                                                                        </DialogTrigger>
                                                                                        <DialogContent className="w-[70%] max-h-[70%] overflow-y-scroll overflow-x-hidden gap-y-3">
                                                                                            <DialogHeader>
                                                                                                <DialogTitle className="font-bold text-brick-ember">Report Comment</DialogTitle>
                                                                                            </DialogHeader>
                                                                                            <p>{`Report by: ${username}`}</p>
                                                                                            <p>{`Commenter: ${reply.username}`}</p>
                                                                                            <p>Text:</p>
                                                                                            <div className="min-w-0 break-words w-full border rounded-md p-2">{reply.content}</div>
                                                                                            <p>Reason (optional):</p>
                                                                                            <Textarea
                                                                                                placeholder="Your reason for reporting"
                                                                                                value={reportInput}
                                                                                                onChange={(e) => setReportInput(e.target.value)}
                                                                                                className="flex-1 rounded-md p-2 text-sm resize-none"
                                                                                            />
                                                                                            <DialogFooter className="sm:justify-center mt-4">
                                                                                                <DialogClose asChild>
                                                                                                    <Button onClick={() => fileReport(reply)} className="bg-brick-ember hover:bg-red-800">
                                                                                                        Report
                                                                                                    </Button>
                                                                                                </DialogClose>
                                                                                                <DialogClose asChild>
                                                                                                    <Button>Cancel</Button>
                                                                                                </DialogClose>
                                                                                            </DialogFooter>
                                                                                        </DialogContent>
                                                                                    </div>
                                                                                </Dialog>
                                                                        }
                                                                        {
                                                                                (userId === reply.userId || userIsAdmin === true) &&
                                                                            <button
                                                                                onClick={() => handleDeleteComment(reply)}
                                                                                aria-expanded={expandedComments[reply.commentId]}
                                                                                className="text-sm font-medium text-brick-ember hover:underline focus:outline-none"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        }
                                                                    </div>
                                                                }
                                                            </div>
                                                            <div
                                                                className={
                                                                    `relative text-left text-gray-800 transition-all duration-300 wrap-break-word ease-in-out ${!expandedComments[reply.commentId] && reply.content.length > 150 ? "line-clamp-4" : ""}`
                                                                }
                                                            >
                                                                {reply.content}
                                                                {!expandedComments[reply.commentId] && reply.content.length > 150 && (
                                                                    <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                                                                )}
                                                            </div>

                                                            <div className="col-1 row-1 pointer-events-none">
                                                                {reply.commentId !== undefined && reply.content.length > 150 && (
                                                                    <button
                                                                        onClick={() => setExpandedComments((prev) => ({ ...prev, [reply.commentId]: !prev[reply.commentId] }))}
                                                                        aria-expanded={expandedComments[reply.commentId]}
                                                                        className="pointer-events-auto text-sm font-medium text-yale-blue hover:underline focus:outline-none"
                                                                    >
                                                                        {expandedComments[reply.commentId] ? "Read less" : "Read more"}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Bottom — Previous Books */}
            <div className="max-w-6xl mx-auto mt-16">
                <h2 className="text-xl text-graphite underline font-semibold mb-6 text-center">All Books</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                    {books.map((book) => {
                        return (
                            <div
                                key={book._id}
                                onClick={() => setSelectedBook(book)}
                                className="flex flex-col items-center cursor-pointer group"
                            >
                                <img
                                    src={getCoverUrl(book, "M")}
                                    alt={book.title}
                                    onError={(e) => { e.currentTarget.src = "/placeholder-book.png"; }}
                                    className="object-contain w-[8rem] h-[12rem] border border-golden-bronze bg-yale-blue rounded-md shadow group-hover:scale-105 transition"
                                />
                                <p className="mt-2 text-sm text-center text-graphite">{book.title}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
