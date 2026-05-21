    import { type TokenProp, notifyApiError } from "@/App";
    import { useEffect, useMemo, useState } from "react";
    import axios, { AxiosError } from "axios";
    import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    } from "@/components/ui/card";
    import { Input } from "@/components/ui/input";
    import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";

    type Report = {
    _id?: string;
    id?: string;
    category: string;
    categoryId?: string;
    commentId?: string;
    reporterId: string;
    content: string;
    reason?: string;
    createdAt?: string | Date;
    reportedAt?: string | Date;
    };

    type Account = {
    _id?: string;
    id?: string;
    username?: string;
    displayName?: string;
    name?: string;
    email?: string;
    };

    type SocialPost = {
    _id?: string;
    id?: string;
    userId?: string;
    username?: string;
    title?: string;
    hyperlink?: string | null;
    description?: string;
    state?: string;
    city?: string | null;
    createdAt?: Date;
    };

    type BookComment = {
        _id?: string;
        commentId?: string;
        userId: string;
        username: string;
        content: string;
        createdAt?: string | Date;
    };

    type BookItem = {
    _id?: string;
    id?: string;
    title?: string;
    author?: string;
    isbn?: string;
    description?: string;
    year?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    comments?: BookComment[];
    };

    type TargetKind = "social" | "book";

    type TargetRecord = {
    kind: TargetKind;
    loading: boolean;
    error?: string;
    data?: SocialPost | BookItem;
    };

    const reportsPerPage = 6;

    function getReportId(report: Report) {
    return report._id ?? report.id ?? "";
    }

    function getAccountLabel(account?: Account, fallback = "Unknown user") {
    if (!account) return fallback;
    return account.displayName || account.username || account.name || account.email || fallback;
    }

    function getTargetKind(category?: string): TargetKind | null {
    const value = (category ?? "").toLowerCase();

    if (value.includes("social")) return "social";
    if (value.includes("book")) return "book";

    return null;
    }

    function getTargetId(report: Report) {
    return report.categoryId ?? "";
    }

    function getTargetKey(kind: TargetKind, id: string) {
    return `${kind}:${id}`;
    }

    function getTargetEndpoint(kind: TargetKind, id: string, apiBase: string) {
    return kind === "social" ? `${apiBase}/social/${id}` : `${apiBase}/books/${id}`;
    }

    function formatDate(value?: string | Date) {
    if (!value) return "N/A";
    const date = value instanceof Date ? value : new Date(value);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
    }

    function ReportCard({
    report,
    reporter,
    target,
    onDeleteReport,
    onDeleteTarget,
    }: {
    report: Report;
    reporter?: Account;
    target?: TargetRecord;
    onDeleteReport: (id: string) => void;
    onDeleteTarget: (kind: TargetKind, id: string, commentId?: string) => void;
    }) {
    const reportId = getReportId(report);
    const reportedAt = report.reportedAt ?? report.createdAt;
    const targetId = getTargetId(report);
    const targetKind = getTargetKind(report.category);

    const targetTitle =
        target?.kind === "social"
        ? (target.data as SocialPost | undefined)?.title ?? "Social post"
        : target?.kind === "book"
            ? (target.data as BookItem | undefined)?.title ?? "Book"
            : "Unknown target";

    const renderTargetPreview = () => {
        if (!targetKind || !targetId) {
        return (
            <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-500">
            No linked content id was found for this report.
            </div>
        );
        }

        if (!target || target.loading) {
        return (
            <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-500">
            Loading reported content...
            </div>
        );
        }

        if (target.error) {
        return (
            <div className="rounded-xl border bg-red-50 p-4 text-sm text-red-700">
            {target.error}
            </div>
        );
        }

        if (target.kind === "social") {
        const social = target.data as SocialPost | undefined;

        return (
            <div className="space-y-3 rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Social post
                </p>
                <h4 className="text-lg font-semibold text-gray-900">
                    {social?.title || "Untitled post"}
                </h4>
                </div>
                <span className="rounded-full border bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Username: {social?.username || "Unknown"}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Owner
                </p>
                <p className="mt-1 text-gray-900">{social?.username || "Unknown"}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Location
                </p>
                <p className="mt-1 text-gray-900">
                    {social?.city || "No city"} {social?.state ? `, ${social.state}` : ""}
                </p>
                </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Description
                </p>
                <p className="break-words text-sm text-gray-800">
                {social?.description || "No description provided."}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created
                </p>
                <p className="mt-1 text-gray-800">{formatDate(social?.createdAt)}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Hyperlink
                </p>
                {social?.hyperlink ? (
                    <a
                    href={social.hyperlink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block break-words text-blue-700 hover:underline"
                    >
                    Open linked content
                    </a>
                ) : (
                    <p className="mt-1 text-gray-500">No hyperlink provided.</p>
                )}
                </div>
            </div>
            </div>
        );
        }

            const book = target.data as BookItem | undefined;

        const reportedComment = book?.comments?.find((c: any) => {
        const reportCommentId = String(report.commentId ?? "").trim();

        const possibleIds = [
            c.commentId,
            c._id,
            c.id,
        ]
            .filter(Boolean)
            .map((v) => String(v).trim());

        return possibleIds.includes(reportCommentId);
        });

        return (
        <div className="space-y-3 rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Book
                </p>
                <h4 className="text-lg font-semibold text-gray-900">
                {book?.title || "Untitled book"}
                </h4>
            </div>
            <span className="rounded-full border bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Book ID: {book?._id ?? book?.id ?? "N/A"}
            </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Author
                </p>
                <p className="mt-1 text-gray-900">{book?.author || "Unknown author"}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Year / ISBN
                </p>
                <p className="mt-1 text-gray-900">
                {book?.year ?? "N/A"}{" "}
                {book?.isbn ? <span className="text-gray-500">• {book.isbn}</span> : null}
                </p>
            </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Book description
            </p>
            <p className="break-words text-sm text-gray-800">
                {book?.description || "No description provided."}
            </p>
            </div>

            <div className="rounded-lg border bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Reported comment
            </p>

            {reportedComment ? (
                <div className="rounded-lg border bg-white p-3">
                    <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="font-medium text-gray-900">{reportedComment.username}</p>
                        <p className="text-xs text-gray-500">User ID: {reportedComment.userId}</p>
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(reportedComment.createdAt)}</p>
                    </div>

                    <p className="mt-3 break-words text-sm text-gray-800">
                    {reportedComment.content}
                    </p>
                </div>
                ) : (
                <p className="text-sm text-gray-500">
                    Could not find the reported comment on this book.
                </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
            <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Created
                </p>
                <p className="mt-1 text-gray-800">{formatDate(book?.createdAt)}</p>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Updated
                </p>
                <p className="mt-1 text-gray-800">{formatDate(book?.updatedAt)}</p>
            </div>
            </div>
        </div>
        );
    };

    return (
        <Dialog>
        <DialogTrigger asChild>
            <Card className="w-full overflow-hidden border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
            <CardHeader className="space-y-3 border-b bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                    {report.category || "Unknown category"}
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm text-gray-500">
                    Reported {formatDate(reportedAt)}
                    </CardDescription>
                </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div className="rounded-lg bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Reporter
                    </p>
                    <p className="mt-1 font-medium text-blue-700">
                    {getAccountLabel(reporter, "Unknown reporter")}
                    </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Report target
                    </p>
                    <p className="mt-1 font-medium text-gray-900">{targetTitle}</p>
                </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 p-4">
                <div className="rounded-lg border bg-white p-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Report reason / message
                </p>
                <p className="max-h-28 overflow-y-auto break-words text-sm text-gray-800">
                    {report.reason?.trim() ? report.reason : report.content || "No reason provided."}
                </p>
                </div>
            </CardContent>
            </Card>
        </DialogTrigger>

        <DialogContent
            className="max-h-[85vh] w-[95vw] overflow-y-auto sm:max-w-4xl"
            aria-describedby={undefined}
        >
            <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-gray-900">
                Report Details
            </DialogTitle>
            <p className="text-sm text-gray-500">
                {report.category || "Unknown category"} • Reported{" "}
                {formatDate(reportedAt)}
            </p>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-xl border bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Reporter information
                </h3>
                <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-700">
                    {getAccountLabel(reporter, "Unknown reporter")}
                </p>
                <p className="text-gray-600">
                    Report message:{" "}
                    {report.reason?.trim() ? report.reason : "No reason provided."}
                </p>
                </div>
            </section>

            <section className="rounded-xl border bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Reported content
                </h3>
                {renderTargetPreview()}
            </section>
            </div>

            <DialogFooter className="gap-2 sm:justify-center">
            {getTargetKind(report.category) && getTargetId(report) ? (
                <Button
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() =>
                    onDeleteTarget(
                        getTargetKind(report.category)!,
                        getTargetId(report),
                        report.commentId
                    )
                    }
                >
                Delete Reported Content
                </Button>
            ) : null}

            <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => onDeleteReport(reportId)}
            >
                Delete Report
            </Button>

            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
    }

    export default function ReportsAdmin({ token }: TokenProp) {
    const apiBase = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const reportsApiUrl = `${apiBase}/reports`;
    const accountsApiUrl = `${apiBase}/accounts`;

    const [reports, setReports] = useState<Report[]>([]);
    const [pageNumber, setPageNumber] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [accountsById, setAccountsById] = useState<Record<string, Account>>({});
    const [targetsByKey, setTargetsByKey] = useState<Record<string, TargetRecord>>({});

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` },
    };

    const totalReports = reports.length;
    const totalPages = Math.max(1, Math.ceil(totalReports / reportsPerPage));

    const visibleReports = useMemo(() => {
        const start = pageNumber * reportsPerPage;
        const end = (pageNumber + 1) * reportsPerPage;
        return reports.slice(start, end);
    }, [reports, pageNumber]);

    const normalizeReports = (data: any): Report[] => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.reports)) return data.reports;
        return [];
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        const uniqueReporterIds = new Set<string>();
        const targetRequests: Array<{ key: string; kind: TargetKind; id: string }> = [];

        for (const report of reports) {
        if (report.reporterId) uniqueReporterIds.add(report.reporterId);

        const kind = getTargetKind(report.category);
        const id = getTargetId(report);

        if (kind && id) {
            const key = getTargetKey(kind, id);
            targetRequests.push({ key, kind, id });
        }
        }

        const missingReporterIds = [...uniqueReporterIds].filter((id) => !accountsById[id]);

        const uniqueTargets = targetRequests.filter((item, index, self) => {
        return self.findIndex((x) => x.key === item.key) === index;
        });

        const missingTargets = uniqueTargets.filter((item) => !targetsByKey[item.key]);

        let cancelled = false;

        const loadAccounts = async () => {
        if (missingReporterIds.length === 0 && missingTargets.length === 0) return;

        try {
            if (missingReporterIds.length > 0) {
            const accountResults = await Promise.all(
                missingReporterIds.map(async (id) => {
                try {
                    const res = await axios.get(`${accountsApiUrl}/${id}`, authHeaders);
                    return { id, account: res.data?.account ?? res.data };
                } catch {
                    return { id, account: undefined };
                }
                })
            );

            if (cancelled) return;

            setAccountsById((prev) => {
                const next = { ...prev };
                for (const item of accountResults) {
                if (item.account) next[item.id] = item.account;
                }
                return next;
            });
            }

            if (missingTargets.length > 0) {
            missingTargets.forEach((item) => {
                setTargetsByKey((prev) => ({
                ...prev,
                [item.key]: { kind: item.kind, loading: true },
                }));
            });

            const targetResults = await Promise.all(
                missingTargets.map(async (item) => {
                try {
                    const res = await axios.get(
                    getTargetEndpoint(item.kind, item.id, apiBase),
                    authHeaders
                    );
                    return {
                    key: item.key,
                    kind: item.kind,
                    data: res.data?.data ?? res.data?.post ?? res.data?.book ?? res.data,
                    };
                } catch (err) {
                    return {
                    key: item.key,
                    kind: item.kind,
                    error:
                        (err as AxiosError)?.response?.status === 404
                        ? "Reported content not found."
                        : "Failed to load reported content.",
                    };
                }
                })
            );

            if (cancelled) return;

            setTargetsByKey((prev) => {
                const next = { ...prev };
                for (const item of targetResults) {
                next[item.key] = {
                    kind: item.kind,
                    loading: false,
                    data: item.data,
                    error: item.error,
                };
                }
                return next;
            });
            }
        } catch {
            // ignore batch load issues
        }
        };

        loadAccounts();

        return () => {
        cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reports, token]);

    async function fetchReports() {
        try {
        const res = await axios.get(reportsApiUrl, authHeaders);
        setReports(normalizeReports(res.data));
        setPageNumber(0);
        } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
            setReports([]);
            return;
        }
        notifyApiError(error, "fetch reports");
        }
    }

    async function deleteReport(id: string) {
        if (!id) return;

        if (
        !window.confirm(
            "Delete this report permanently? You will no longer be able to see it in user moderation logs!"
        )
        ) {
        return;
        }

        try {
        await axios.delete(`${reportsApiUrl}/${id}`, authHeaders);
        setReports((prev) => prev.filter((r) => getReportId(r) !== id));
        } catch (err) {
        notifyApiError(err as AxiosError, "delete report");
        }
    }

    async function deleteTarget(kind: TargetKind, id: string, commentId?: string) {
        if (!id) return;

        const relatedReports = reports.filter((report) => {
            const sameCategory =
                getTargetKind(report.category) === kind &&
                getTargetId(report) === id;

            if (!sameCategory) return false;

            // For book comments, only delete reports tied to this specific comment
            if (kind === "book") {
                return report.commentId === commentId;
            }

            return true;
        });

        try {
            if (kind === "social") {
                if (!window.confirm("Delete this social post permanently?")) return;

                await axios.delete(`${apiBase}/social/${id}`, authHeaders);
            } else {
                if (!commentId) {
                    alert("Missing comment id. Cannot delete the reported comment.");
                    return;
                }

                if (!window.confirm("Delete this reported book comment permanently?")) return;

                await axios.delete(
                    `${apiBase}/books/${id}/comments/${commentId}`,
                    authHeaders
                );
            }

            // Delete associated reports
            await Promise.all(
                relatedReports.map((report) =>
                    axios.delete(
                        `${reportsApiUrl}/${getReportId(report)}`,
                        authHeaders
                    )
                )
            );

            // Remove cached target
            setTargetsByKey((prev) => {
                const next = { ...prev };
                delete next[getTargetKey(kind, id)];
                return next;
            });

            // Remove reports locally
            setReports((prev) =>
                prev.filter((report) => {
                    const sameCategory =
                        getTargetKind(report.category) === kind &&
                        getTargetId(report) === id;

                    if (!sameCategory) return true;

                    if (kind === "book") {
                        return report.commentId !== commentId;
                    }

                    return false;
                })
            );
        } catch (err) {
            notifyApiError(
                err as AxiosError,
                kind === "social"
                    ? "delete social post"
                    : "delete book comment"
            );
        }
    }

    async function searchReports() {
        if (!searchKeyword.trim()) {
        await fetchReports();
        return;
        }

        try {
        const res = await axios.get(
            `${reportsApiUrl}/filtered/${encodeURIComponent(searchKeyword.trim())}`,
            authHeaders
        );

        setReports(normalizeReports(res.data));
        setPageNumber(0);
        } catch (err) {
        const error = err as AxiosError;
        if (error.response?.status === 404) {
            setReports([]);
            return;
        }
        notifyApiError(error, "search reports");
        }
    }

    async function clearSearchFilter() {
        setSearchKeyword("");
        await fetchReports();
    }

    return (
        <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">Report Management</h2>
            <p className="mt-1 text-sm text-gray-500">
            Review reports, inspect the reported content, and delete the underlying item when needed.
            </p>
        </div>

        <Card>
            <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total reports
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{totalReports}</p>
                </div>

                <div className="rounded-xl border bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Current page
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                    {totalReports === 0 ? 0 : pageNumber + 1}/{totalPages}
                </p>
                </div>
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardContent className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
                <Input
                className="w-full md:w-96"
                placeholder="Search by user, post, or keyword..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") searchReports();
                }}
                />

                <div className="flex gap-2">
                <Button variant="outline" onClick={clearSearchFilter}>
                    Clear Filter
                </Button>
                <Button onClick={searchReports}>Search</Button>
                </div>
            </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="border-b bg-gray-50">
            {reports.length !== 0 ? (
                <CardTitle className="text-xl">
                Showing page {pageNumber + 1} of {totalPages}
                </CardTitle>
            ) : (
                <CardTitle className="text-xl font-normal text-gray-400">
                No reports found.
                </CardTitle>
            )}
            </CardHeader>

            <CardContent className="p-4">
            {reports.length !== 0 && (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {visibleReports.map((report) => {
                    const reportId = getReportId(report);
                    const kind = getTargetKind(report.category);
                    const targetId = getTargetId(report);
                    const targetKey = kind && targetId ? getTargetKey(kind, targetId) : "";
                    const target = targetKey ? targetsByKey[targetKey] : undefined;

                    return (
                    <ReportCard
                        key={reportId}
                        report={report}
                        reporter={accountsById[report.reporterId]}
                        target={target}
                        onDeleteReport={deleteReport}
                        onDeleteTarget={deleteTarget}
                    />
                    );
                })}
                </div>
            )}

            <div className="mt-6 flex justify-center gap-2">
                <Button
                variant="outline"
                onClick={() => setPageNumber((p) => Math.max(0, p - 1))}
                disabled={pageNumber <= 0}
                >
                Last Page
                </Button>

                <Button
                variant="outline"
                onClick={() => setPageNumber((p) => p + 1)}
                disabled={pageNumber + 1 >= totalPages}
                >
                Next Page
                </Button>
            </div>
            </CardContent>
        </Card>
        </div>
    );
    }