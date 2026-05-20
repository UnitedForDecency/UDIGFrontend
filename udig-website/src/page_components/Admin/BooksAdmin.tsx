import { type TokenProp, notifyApiError } from "@/App";
import axios, { AxiosError } from "axios";
import { Book } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type Book = {
    _id?: string;
    title?: string;
    author?: string;
    isbn?: string;
    year?: number;
    dateStarted?: number;
    dateEnded?: number;
    purchaseLinks?: PurchaseLink[];
    reviews?: Review[];
    description?: string;
    comments?: Comment[];
};

export type PurchaseLink = {
    text?: string;
    link?: string;
}

export type Review = {
    text?: string;
    source?: string;
}

export type Comment = {
    commentId: string;
    content: string;
    username: string;
    userId: string;
    createdAt: number;
    replies?: Comment[];
};

export default function BooksAdmin({ token }: TokenProp) {
    const booksApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/books`;
    const [books, setBooks] = useState<Book[]>([]);
    const [currentBookId, setCurrentBookId] = useState<string>();
    const [newBook, setNewBook] = useState<Book>({
        title: "",
        author: "",
        isbn: "",
        year: undefined,
        dateStarted: undefined,
        dateEnded: undefined,
        purchaseLinks: [],
        reviews: [],
        description: ""
    });

    const [editingBookId, setEditingBookId] = useState<string | null>(null);
    const [editingBookIsNew, setEditingBookIsNew] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");

    const booksPerPage = 6;

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` },
    };

    const fetchBooks = async () => {
        try {
            axios.get(
                import.meta.env.VITE_MONGO_CONTROLLER_URL + "/global/current-book-id"
            ).then(bookIdRes => {
                axios.get(
                    booksApiUrl,
                    authHeaders
                ).then(booksRes => {
                    setBooks(booksRes.data.books);
                    setCurrentBookId(bookIdRes.data.currentBookId);
                })
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) return; // 404s if there are no books, this isn't an error
                    notifyApiError(err, "fetch books");
                }
            });
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [token])

    const resetNewBook = () => {
        setNewBook({
            title: "",
            author: "",
            isbn: "",
            year: undefined,
            dateStarted: undefined,
            dateEnded: undefined,
            purchaseLinks: [],
            reviews: [],
            description: ""
        });
        setEditingBookId(null);
    }

    const addBook = async () => {
        try {
            setLoading(true);
            axios.post(
                booksApiUrl,
                newBook,
                authHeaders
            ).then(res => {
                setBooks(prev => [...prev, { _id: res.data.bookId, ...newBook }]);
                resetNewBook();
                fetchBooks();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "add book");
            });
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        } finally {
            setLoading(false);
        }
    };

    const beginCreatingBook = () => {
        setEditingBookIsNew(true);
        resetNewBook();
        setEditingBookId("New book, ID not yet assigned");
    }

    const beginEditingBook = async (book: Book) => {
        if (!book || book._id == undefined) return;
        if (editingBookId && !window.confirm("Any changes will be lost!")) return;
        setEditingBookIsNew(false);
        const selectedBook = {
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            year: book.year,
            dateStarted: book.dateStarted,
            dateEnded: book.dateEnded,
            purchaseLinks: book.purchaseLinks,
            reviews: book.reviews,
            description: book.description
        }
        setNewBook(selectedBook);
        if (book._id != undefined) setEditingBookId(book._id);
    };

    const cancelBookEdit = () => {
        if (!window.confirm("Cancel editing? Any changes will be lost!")) return;
        resetNewBook();
    }

    const saveBookEdit = async () => {
        if (!editingBookId) return;

        try {
            axios.put(
                `${booksApiUrl}/${editingBookId}`, newBook, authHeaders
            ).then(res => {
                setBooks((prev) => prev.map((b) => b._id === editingBookId ? res.data.book : b));
                resetNewBook();
            }).catch((err: AxiosError) => {
                notifyApiError(err, "save book");
            });
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const deleteBook = async (id?: string) => {
        if (!id) return;
        if (id == currentBookId) {
            window.alert("Cannot delete the current book club book! Switch the current bookclub book before deleting.");
            return;
        }
        if (!window.confirm("Delete this book permanently?")) return;

        try {
            axios.delete(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/books/${id}`,
                authHeaders
            ).then(() => {
                setBooks((prev) => prev.filter((b) => b._id !== id));
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete book");
            });
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const setCurrentBookclubBook = async (book: Book) => {
        if (currentBookId == book._id) return;
        if (!token) {
            alert("No token found. You must be logged in.");
            return;
        }
        try {
            axios.patch(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/global/current-book-id/${book._id}`,
                authHeaders
            ).then(() => {
                const currentBook = books.find((b: Book) => b._id === currentBookId)
                const oldCurrentBook = {
                    title: currentBook?.title,
                    author: currentBook?.author,
                    isbn: currentBook?.isbn,
                    year: currentBook?.year,
                    dateStarted: currentBook?.dateStarted,
                    dateEnded: Date.now(),
                    purchaseLinks: currentBook?.purchaseLinks,
                    reviews: currentBook?.reviews,
                    description: currentBook?.description
                };

                const newCurrentBook = {
                    title: book.title,
                    author: book.author,
                    isbn: book.isbn,
                    year: book.year,
                    dateStarted: Date.now(),
                    dateEnded: null,
                    purchaseLinks: book.purchaseLinks,
                    reviews: book.reviews,
                    description: book.description
                };

                axios.put(
                    `${booksApiUrl}/${currentBookId}`,
                    oldCurrentBook,
                    authHeaders
                );

                axios.put(
                    `${booksApiUrl}/${book._id}`,
                    newCurrentBook,
                    authHeaders
                ).then(res => {
                    setBooks((prev) => prev.map((b) => b._id === book._id ? res.data.book : b));
                    setCurrentBookId(book._id)
                });
            }).catch((err: AxiosError) => {
                notifyApiError(err, "set current book");
            });
        } catch (err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const searchBooks = async () => {
        if (searchKeyword == "") {
            fetchBooks();
            return;
        }

        try {
            axios.get(
                `${booksApiUrl}/filtered/${searchKeyword}`
            ).then(res => {
                setBooks(res.data.books);
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setBooks([]);
                        return;
                    }
                    notifyApiError(err, "search books");
                }
            });
        }
        catch (err) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
            setBooks([]);
        }
    };

    const clearSearchFilter = async () => {
        setSearchKeyword("");
        fetchBooks();
    };

    function bookListing(book: Book) {
        // give a colored border if it's the current book
        let listingClass = "w-[20rem] h-[10rem] border rounded-lg p-[1.5rem] m-[0.8rem] bg-white hover:shadow-md transition-shadow"
        if (currentBookId == book._id) listingClass += " border-golden-bronze border-6"
        else listingClass += " border-gray-200"

        return (
            <div
                key={book._id}
                className={listingClass}
            >
                <div className="flex flex-col justify-center gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {book.title}
                        </h3>
                        <p className="text-gray-500">
                            {
                                "(" + book.author + ")"
                            }
                        </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 justify-center">
                        <button
                            onClick={() => {
                                beginEditingBook(book);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => deleteBook(book._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setCurrentBookclubBook(book)}
                            disabled={currentBookId == book._id}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors text-sm font-medium"
                        >
                            Set Current
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 pb-5">Book Management</h2>
            </div>

            {/* Book Search */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex justify-center gap-2">
                        <Input
                            className="p-2 rounded w-80"
                            placeholder="Keyword"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
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

            {/* Book List */}
            <Card className="mb-15">
                <CardHeader>
                    {
                        books.length !== 0 ?
                            <CardTitle className="text-xl">Showing page {pageNumber + 1} of {Math.ceil(books.length / booksPerPage)}</CardTitle>
                            :
                            <CardTitle className="text-gray-400 text-xl font-normal mt-4">No books found.</CardTitle>
                    }
                </CardHeader>
                <CardContent>
                    {books.length !== 0 &&
                        <div className="flex flex-wrap justify-center mb-3">
                            {books.slice(pageNumber * booksPerPage, (pageNumber + 1 * booksPerPage)).map((book) => (
                                bookListing(book)
                            ))}
                        </div>
                    }
                    <div className="flex justify-center gap-2 pb-3 mt-3">
                        { /* Previous page */}
                        <button
                            onClick={() => setPageNumber(pageNumber - 1)}
                            disabled={pageNumber <= 0}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Last Page
                        </button>
                        { /* Add new book */}
                        <button
                            onClick={beginCreatingBook}
                            disabled={loading || editingBookId != null}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Add New Book
                        </button>
                        { /* Next page */}
                        <button
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={((pageNumber + 1) * booksPerPage) > books.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>

            {
                /* Edit Book */
                editingBookId != null &&
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-xl">{editingBookId == "New book, ID not yet assigned" ? "Create Book" : "Edit Book"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <h3 className="flex flex-wrap font-semibold mb-2">Basic information</h3>
                        <div className="space-y-4">
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Book title"
                                    value={newBook.title}
                                    onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Book author"
                                    value={newBook.author}
                                    onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="ISBN"
                                    type="number"
                                    value={newBook.isbn}
                                    onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                                />
                            </div>
                            <div>
                                <Input
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Publication year"
                                    type="number"
                                    value={newBook.year}
                                    onChange={e => setNewBook({ ...newBook, year: Number.parseInt(e.target.value)})}
                                />
                            </div>
                            <div>
                                <Textarea
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Description"
                                    value={newBook.description}
                                    onChange={e => setNewBook({ ...newBook, description: e.target.value })}
                                />
                            </div>
                            <h3 className="flex flex-wrap font-semibold mb-2">Purchase links</h3>
                            <div>
                                <div className="w-full border border-gray-300 rounded-md px-3 py-2">
                                    {newBook.purchaseLinks != undefined &&
                                        newBook.purchaseLinks.map((link, index) => (
                                            <div key={index} className="flex justify-between gap-4 my-3">
                                                <Input
                                                    className="max-w-[30%] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Link text"
                                                    value={link.text}
                                                    onChange={e => {
                                                        const newPurchaseLinks = newBook.purchaseLinks ?? [];
                                                        newPurchaseLinks[index].text = e.target.value;
                                                        setNewBook({ ...newBook, purchaseLinks: newPurchaseLinks })
                                                    }}
                                                />
                                                <Input
                                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Purchase link"
                                                    value={link.link}
                                                    onChange={e => {
                                                        const newPurchaseLinks = newBook.purchaseLinks ?? [];
                                                        newPurchaseLinks[index].link = e.target.value;
                                                        setNewBook({ ...newBook, purchaseLinks: newPurchaseLinks })
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newPurchaseLinks = newBook.purchaseLinks ?? [];
                                                        newPurchaseLinks.splice(index, 1)
                                                        setNewBook({ ...newBook, purchaseLinks: newPurchaseLinks })
                                                    }}
                                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))
                                    }
                                    <button
                                            onClick={() => {
                                                const newPurchaseLinks = newBook.purchaseLinks ?? [];
                                                newPurchaseLinks.push({text:"", link:""})
                                                setNewBook({ ...newBook, purchaseLinks: newPurchaseLinks })
                                            }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Add Link
                                    </button>
                                </div>
                            </div>
                            <h3 className="flex flex-wrap font-semibold mb-2">Reviews</h3>
                            <div>
                                {newBook.reviews != undefined &&
                                    newBook.reviews.map((review, index) => (
                                        <div key={index} className="w-full border border-gray-300 rounded-md p-3 my-3 flex flex-col items-center gap-4">
                                            <div className="w-full flex flex-col justify-left gap-4">
                                                <Input
                                                    className="border border-gray-300 w-[40%] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Source"
                                                    value={review.source}
                                                    onChange={e => {
                                                        const newReviews = newBook.reviews ?? [];
                                                        newReviews[index].source = e.target.value;
                                                        setNewBook({ ...newBook, reviews: newReviews })
                                                    }}
                                                />
                                                <Textarea
                                                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Body"
                                                    value={review.text}
                                                    onChange={e => {
                                                        const newReviews = newBook.reviews ?? [];
                                                        newReviews[index].text = e.target.value;
                                                        setNewBook({ ...newBook, reviews: newReviews })
                                                    }}
                                                />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const newReviews = newBook.reviews ?? [];
                                                    newReviews.splice(index, 1);
                                                    setNewBook({ ...newBook, reviews: newReviews })
                                                }}
                                                className="w-[6rem] bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                        ))
                                    }
                                <button
                                    onClick={() => {
                                        const newReviews = newBook.reviews ?? [];
                                        newReviews.push({ text: "", source: "" });
                                        setNewBook({ ...newBook, reviews: newReviews });
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Add Review
                                </button>
                            </div>
                            {
                                editingBookIsNew && (
                                    <button
                                        onClick={addBook}
                                        disabled={
                                            loading || !newBook.title || !newBook.author || !newBook.isbn
                                            || !newBook.year || !newBook.description
                                            || (newBook.purchaseLinks?.find((l: PurchaseLink) => l.link === "") != undefined)
                                            || (newBook.purchaseLinks?.find((l: PurchaseLink) => l.text === "") != undefined)
                                            || (newBook.reviews?.find((r: Review) => r.text === "") != undefined)
                                            || (newBook.reviews?.find((r: Review) => r.source === "") != undefined)
                                        }
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Adding...
                                            </span>
                                        ) : (
                                            "Add Book"
                                        )}
                                    </button>
                                )
                            }
                            {
                                !editingBookIsNew && (
                                    <button
                                        onClick={saveBookEdit}
                                        disabled={
                                            loading || !newBook.title || !newBook.author || !newBook.isbn
                                            || !newBook.year || !newBook.description
                                            || (newBook.purchaseLinks?.find((l: PurchaseLink) => l.link === "") != undefined)
                                            || (newBook.purchaseLinks?.find((l: PurchaseLink) => l.text === "") != undefined)
                                            || (newBook.reviews?.find((r: Review) => r.text === "") != undefined)
                                            || (newBook.reviews?.find((r: Review) => r.source === "") != undefined)
                                        }
                                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : (
                                            "Save Book"
                                        )}
                                    </button>
                                )
                            }
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
            }
        </div>
    );
}
