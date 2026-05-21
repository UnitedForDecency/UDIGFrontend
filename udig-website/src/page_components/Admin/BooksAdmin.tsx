import { type TokenProp, notifyApiError } from "@/App";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type PurchaseLink = {
    text?: string;
    link?: string;
};

export type Review = {
    text?: string;
    source?: string;
};

export type Comment = {
    commentId: string;
    content: string;
    username: string;
    userId: string;
    createdAt: number;
};

export type Book = {
    id?: string;
    title?: string;
    author?: string;
    isbn?: string;
    year?: number;
    startDate?: string;
    endDate?: string;
    currentBook?: boolean;
    purchaseLinks?: PurchaseLink[];
    reviews?: Review[];
    description?: string;
    comments?: Comment[];
};

const createEmptyBook = (): Book => ({
    title: "",
    author: "",
    isbn: "",
    year: undefined,
    startDate: undefined,
    endDate: undefined,
    currentBook: false,
    purchaseLinks: [],
    reviews: [],
    description: "",
});

const normalizeBooks = (data: unknown): Book[] => {
    if (Array.isArray(data)) return data as Book[];
    if (data && typeof data === "object" && "books" in data) {
        const maybeBooks = (data as { books?: Book[] }).books;
        return Array.isArray(maybeBooks) ? maybeBooks : [];
    }
    return [];
};

export default function BooksAdmin({ token }: TokenProp) {
    const apiBase = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const booksApiUrl = `${apiBase}/books`;

    const [books, setBooks] = useState<Book[]>([]);
    const [newBook, setNewBook] = useState<Book>(createEmptyBook());

    const [editingBookId, setEditingBookId] = useState<string | null>(null);
    const [editingBookIsNew, setEditingBookIsNew] = useState(false);
    const [loading, setLoading] = useState(false);

    const [pageNumber, setPageNumber] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");

    const booksPerPage = 6;

    const authHeaders = useMemo(
        () => ({
            headers: { Authorization: `Bearer ${token}` },
        }),
        [token]
    );

    const resetEditor = useCallback(() => {
        setNewBook(createEmptyBook());
        setEditingBookId(null);
        setEditingBookIsNew(false);
    }, []);

    const fetchBooks = useCallback(async () => {
        try {
            const booksRes = await axios.get(booksApiUrl, authHeaders);
            setBooks(normalizeBooks(booksRes.data));
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "fetch books");
        }
    }, [authHeaders, booksApiUrl]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    const beginCreatingBook = () => {
        setEditingBookIsNew(true);
        setNewBook(createEmptyBook());
        setEditingBookId("new");
    };

    const beginEditingBook = (book: Book) => {
        if (!book.id) return;

        if (editingBookId && !window.confirm("Any changes will be lost!")) {
            return;
        }

        setEditingBookIsNew(false);
        setEditingBookId(book.id);
        setNewBook({
            title: book.title ?? "",
            author: book.author ?? "",
            isbn: book.isbn ?? "",
            year: book.year,
            startDate: book.startDate,
            endDate: book.endDate,
            currentBook: book.currentBook ?? false,
            purchaseLinks: [...(book.purchaseLinks ?? [])],
            reviews: [...(book.reviews ?? [])],
            description: book.description ?? "",
        });
    };

    const cancelBookEdit = () => {
        if (!window.confirm("Cancel editing? Any changes will be lost!")) return;
        resetEditor();
    };

    const updatePurchaseLink = (
        index: number,
        field: keyof PurchaseLink,
        value: string
    ) => {
        setNewBook((prev) => {
            const purchaseLinks = [...(prev.purchaseLinks ?? [])];
            purchaseLinks[index] = {
                ...purchaseLinks[index],
                [field]: value,
            };
            return { ...prev, purchaseLinks };
        });
    };

    const updateReview = (index: number, field: keyof Review, value: string) => {
        setNewBook((prev) => {
            const reviews = [...(prev.reviews ?? [])];
            reviews[index] = {
                ...reviews[index],
                [field]: value,
            };
            return { ...prev, reviews };
        });
    };

    const addBook = async () => {
        if (loading) return;

        try {
            setLoading(true);

            const payload = {
                title: newBook.title,
                author: newBook.author,
                isbn: newBook.isbn,
                year: newBook.year,
                description: newBook.description,
                startDate: newBook.startDate,
                endDate: newBook.endDate,
                currentBook: newBook.currentBook ?? false,
                purchaseLinks: newBook.purchaseLinks ?? [],
                reviews: newBook.reviews ?? [],
            };

            await axios.post(booksApiUrl, payload, authHeaders);
            resetEditor();
            await fetchBooks();
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "add book");
        } finally {
            setLoading(false);
        }
    };

    const saveBookEdit = async () => {
        if (!editingBookId || editingBookId === "new" || loading) return;

        try {
            setLoading(true);

            const res = await axios.patch(
                `${booksApiUrl}/${editingBookId}`,
                newBook,
                authHeaders
            );

            const updatedBook = res.data?.book ?? res.data;

            setBooks((prev) =>
                prev.map((book) =>
                    book.id === editingBookId ? updatedBook : book
                )
            );

            resetEditor();
            await fetchBooks();
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "save book");
        } finally {
            setLoading(false);
        }
    };

    const deleteBook = async (id?: string) => {
        if (!id) return;

        const currentBook = books.find((book) => book.currentBook);
        if (currentBook?.id === id) {
            window.alert(
                "Cannot delete the current book club book. Switch the current bookclub book before deleting."
            );
            return;
        }

        if (!window.confirm("Delete this book permanently?")) return;

        try {
            await axios.delete(`${booksApiUrl}/${id}`, authHeaders);
            setBooks((prev) => prev.filter((book) => book.id !== id));
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "delete book");
        }
    };

    const toggleCurrentBookclubBook = async (book: Book) => {
        if (!book.id) return;

        if (!token) {
            alert("No token found. You must be logged in.");
            return;
        }

        try {
            const oldCurrentBook = books.find((b) => b.currentBook);

            // If this book is already current, remove it from current
            if (book.currentBook) {
                await axios.patch(
                    `${booksApiUrl}/${book.id}`,
                    {
                        ...book,
                        currentBook: false,
                        endDate: new Date().toISOString(),
                    },
                    authHeaders
                );

                await fetchBooks();
                return;
            }

            // Otherwise, clear the old current book first
            if (oldCurrentBook?.id) {
                await axios.patch(
                    `${booksApiUrl}/${oldCurrentBook.id}`,
                    {
                        ...oldCurrentBook,
                        currentBook: false,
                        endDate: new Date().toISOString(),
                    },
                    authHeaders
                );
            }

            await axios.patch(
                `${booksApiUrl}/${book.id}`,
                {
                    ...book,
                    currentBook: true,
                    startDate: new Date().toISOString(),
                    endDate: null,
                },
                authHeaders
            );

            await fetchBooks();
        } catch (err: any) {
            console.error(err);
            notifyApiError(err, "set current book");
        }
    };

    const searchBooks = async () => {
        const keyword = searchKeyword.trim();

        if (!keyword) {
            await fetchBooks();
            setPageNumber(0);
            return;
        }

        try {
            const res = await axios.get(
                `${booksApiUrl}/search/${encodeURIComponent(keyword)}`
            );

            setBooks(normalizeBooks(res.data));
            setPageNumber(0);
        } catch (err: any) {
            console.error(err);

            if (err.response?.status === 404) {
                setBooks([]);
                return;
            }

            notifyApiError(err, "search books");
        }
    };

    const clearSearchFilter = async () => {
        setSearchKeyword("");
        setPageNumber(0);
        await fetchBooks();
    };

    const isFormInvalid =
        loading ||
        !newBook.title ||
        !newBook.author ||
        !newBook.isbn ||
        !newBook.year ||
        !newBook.description ||
        (newBook.purchaseLinks ?? []).some((link) => !link.text || !link.link) ||
        (newBook.reviews ?? []).some((review) => !review.source || !review.text);

    const totalPages = Math.max(1, Math.ceil(books.length / booksPerPage));
    const safePageNumber = Math.min(pageNumber, totalPages - 1);

    useEffect(() => {
        if (pageNumber !== safePageNumber) {
            setPageNumber(safePageNumber);
        }
    }, [pageNumber, safePageNumber]);

    const pagedBooks = useMemo(
        () =>
            books.slice(
                safePageNumber * booksPerPage,
                safePageNumber * booksPerPage + booksPerPage
            ),
        [books, safePageNumber]
    );

    return (
        <div>
            <div>
                <h2 className="text-3xl font-bold text-gray-900 pb-5">
                    Book Management
                </h2>
            </div>

            <Card className="mb-6">
                <CardContent>
                    <div className="flex justify-center gap-2">
                        <Input
                            className="p-2 rounded w-80"
                            placeholder="Keyword"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") searchBooks();
                            }}
                        />
                        <button
                            onClick={clearSearchFilter}
                            disabled={loading}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Clear Filters
                        </button>
                        <button
                            onClick={searchBooks}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Search
                        </button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-15">
                <CardHeader>
                    {books.length !== 0 ? (
                        <CardTitle className="text-xl">
                            Showing page {safePageNumber + 1} of {totalPages}
                        </CardTitle>
                    ) : (
                        <CardTitle className="text-gray-400 text-xl font-normal mt-4">
                            No books found.
                        </CardTitle>
                    )}
                </CardHeader>

                <CardContent>
                    {books.length !== 0 && (
                        <div className="flex flex-wrap justify-center mb-3">
                            {pagedBooks.map((book) => {
                                const isCurrent = !!book.currentBook;

                                return (
                                    <div
                                        key={book.id}
                                        className={[
                                            "w-[20rem] min-h-[10rem] border rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden",
                                            isCurrent
                                                ? "border-golden-bronze border-4"
                                                : "border-gray-200",
                                        ].join(" ")}
                                    >
                                        <div className="flex flex-col justify-center gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                                    {book.title}
                                                </h3>
                                                <p className="text-gray-500">
                                                    {book.author ? `(${book.author})` : "(No author)"}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 flex-shrink-0 justify-center">
                                                <button
                                                    onClick={() => beginEditingBook(book)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteBook(book.id)}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => toggleCurrentBookclubBook(book)}
                                                    className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                                >
                                                    {isCurrent ? "Remove Current" : "Set Current"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex justify-center gap-2 pb-3 mt-3">
                        <button
                            onClick={() => setPageNumber((prev) => Math.max(0, prev - 1))}
                            disabled={safePageNumber <= 0}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Last Page
                        </button>

                        <button
                            onClick={beginCreatingBook}
                            disabled={loading || editingBookId !== null}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Book
                        </button>

                        <button
                            onClick={() =>
                                setPageNumber((prev) =>
                                    (prev + 1) * booksPerPage >= books.length ? prev : prev + 1
                                )
                            }
                            disabled={(safePageNumber + 1) * booksPerPage >= books.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {editingBookId !== null && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">
                            {editingBookIsNew ? "Create Book" : "Edit Book"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <h3 className="flex flex-wrap font-semibold mb-2">
                            Basic information
                        </h3>

                        <div className="space-y-4">
                            <Input
                                className="w-full"
                                placeholder="Book title"
                                value={newBook.title ?? ""}
                                onChange={(e) =>
                                    setNewBook((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                            />

                            <Input
                                className="w-full"
                                placeholder="Book author"
                                value={newBook.author ?? ""}
                                onChange={(e) =>
                                    setNewBook((prev) => ({
                                        ...prev,
                                        author: e.target.value,
                                    }))
                                }
                            />

                            <Input
                                className="w-full"
                                placeholder="ISBN"
                                value={newBook.isbn ?? ""}
                                onChange={(e) =>
                                    setNewBook((prev) => ({
                                        ...prev,
                                        isbn: e.target.value,
                                    }))
                                }
                            />

                            <Input
                                className="w-full"
                                placeholder="Publication year"
                                type="number"
                                value={newBook.year ?? ""}
                                onChange={(e) =>
                                    setNewBook((prev) => ({
                                        ...prev,
                                        year: e.target.value === "" ? undefined : Number(e.target.value),
                                    }))
                                }
                            />

                            <Textarea
                                className="w-full"
                                placeholder="Description"
                                value={newBook.description ?? ""}
                                onChange={(e) =>
                                    setNewBook((prev) => ({
                                        ...prev,
                                        description: e.target.value,
                                    }))
                                }
                            />

                            <h3 className="flex flex-wrap font-semibold mb-2">
                                Purchase links
                            </h3>

                            <div className="w-full border border-gray-300 rounded-md px-3 py-2">
                                {(newBook.purchaseLinks ?? []).map((link, index) => (
                                    <div key={index} className="flex justify-between gap-4 my-3">
                                        <Input
                                            className="max-w-[30%]"
                                            placeholder="Link text"
                                            value={link.text ?? ""}
                                            onChange={(e) =>
                                                updatePurchaseLink(index, "text", e.target.value)
                                            }
                                        />
                                        <Input
                                            className="flex-1"
                                            placeholder="Purchase link"
                                            value={link.link ?? ""}
                                            onChange={(e) =>
                                                updatePurchaseLink(index, "link", e.target.value)
                                            }
                                        />
                                        <button
                                            onClick={() => {
                                                setNewBook((prev) => {
                                                    const updated = [...(prev.purchaseLinks ?? [])];
                                                    updated.splice(index, 1);
                                                    return { ...prev, purchaseLinks: updated };
                                                });
                                            }}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() =>
                                        setNewBook((prev) => ({
                                            ...prev,
                                            purchaseLinks: [
                                                ...(prev.purchaseLinks ?? []),
                                                { text: "", link: "" },
                                            ],
                                        }))
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Add Link
                                </button>
                            </div>

                            <h3 className="flex flex-wrap font-semibold mb-2">
                                Reviews
                            </h3>

                            <div>
                                {(newBook.reviews ?? []).map((review, index) => (
                                    <div
                                        key={index}
                                        className="w-full border border-gray-300 rounded-md p-3 my-3 flex flex-col items-center gap-4"
                                    >
                                        <div className="w-full flex flex-col justify-left gap-4">
                                            <Input
                                                className="border border-gray-300 w-[40%]"
                                                placeholder="Source"
                                                value={review.source ?? ""}
                                                onChange={(e) =>
                                                    updateReview(index, "source", e.target.value)
                                                }
                                            />
                                            <Textarea
                                                className="border border-gray-300"
                                                placeholder="Body"
                                                value={review.text ?? ""}
                                                onChange={(e) =>
                                                    updateReview(index, "text", e.target.value)
                                                }
                                            />
                                        </div>

                                        <button
                                            onClick={() => {
                                                setNewBook((prev) => {
                                                    const updated = [...(prev.reviews ?? [])];
                                                    updated.splice(index, 1);
                                                    return { ...prev, reviews: updated };
                                                });
                                            }}
                                            className="w-[6rem] bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() =>
                                        setNewBook((prev) => ({
                                            ...prev,
                                            reviews: [
                                                ...(prev.reviews ?? []),
                                                { text: "", source: "" },
                                            ],
                                        }))
                                    }
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Add Review
                                </button>
                            </div>

                            {editingBookIsNew ? (
                                <button
                                    onClick={addBook}
                                    disabled={isFormInvalid}
                                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                >
                                    {loading ? "Adding..." : "Add Book"}
                                </button>
                            ) : (
                                <button
                                    onClick={saveBookEdit}
                                    disabled={isFormInvalid}
                                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                >
                                    {loading ? "Saving..." : "Save Book"}
                                </button>
                            )}

                            <button
                                onClick={cancelBookEdit}
                                disabled={loading}
                                className="w-full bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}