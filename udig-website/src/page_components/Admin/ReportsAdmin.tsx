import { type TokenProp, notifyApiError  } from "@/App";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button.tsx";

type Report = {
    _id?: string;
    commentId?: string;
    reporterId?: string;
    reporterName?: string;
    subjectId?: string;
    subjectName?: string;
    content?: string;
    postedOn?: string;
    reason?: string;
    category?: string;
    resolved?: boolean;
}

export default function ReportsAdmin({ token }: TokenProp) {
    const reportsApiUrl = `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/reports`;
    const [reports, setReports] = useState<Report[]>([]);
    const [pageNumber, setPageNumber] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState("");

    const reportsPerPage = 6;

    const authHeaders = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        fetchReports();
    }, [token]);

    const fetchReports = async () => {
        try {
            axios.get(
                reportsApiUrl,
                authHeaders
            ).then(res => {
                const unresolvedReports = res.data.reports.filter((r: any) => r.resolved === false) || [];
                const resolvedReports = res.data.reports.filter((r: any) => r.resolved === true) || [];
                setReports(unresolvedReports.concat(resolvedReports));
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) return; // 404s if there are no reports, this isn't an error
                    notifyApiError(err, "fetch reports");
                }
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const toggleResolved = async (id: string, resolved: boolean) => {
        if (!id) return;

        try {
            axios.put(
                `${reportsApiUrl}/${id}`,
                { resolved: resolved }, 
                authHeaders
            ).then(() => {
                fetchReports();
            }).catch((err: AxiosError) => {
                notifyApiError(err, `${resolved ? "resolve" : "reopen"} report`);
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };
    
    const deleteReport = async (id?: string) => {
        if (!id) return;
        if (!window.confirm("Delete this report permanently? You will no longer be able to see it in user moderation logs!")) return;

        try {
            axios.delete(
                `${reportsApiUrl}/${id}`, 
                authHeaders
            ).then(() => {
                setReports((prev) => prev.filter((r) => r._id !== id));
            }).catch((err: AxiosError) => {
                notifyApiError(err, "delete report");
            });
        } catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
        }
    };

    const searchReports = async () => {
        if (!searchKeyword || searchKeyword.trim() == "") fetchReports();

        try {
            axios.get(
                `${reportsApiUrl}/filtered/${searchKeyword}`
            ).then(res => {
                setReports(res.data.reports);
            }).catch((err: AxiosError) => {
                if (err.response) {
                    if (err.response.status === 404) {
                        setReports([]);
                        return;
                    }
                    notifyApiError(err, "searc reports");
                }
            });
        }
        catch (err: any) {
            console.error(err);
            alert(`An unexpected error occured: ${err}`);
            setReports([]);
        }
    };

    const clearSearchFilter = async () => {
        setSearchKeyword("");
        fetchReports();
    };

    function ReportListing(report: any) {
        let reportedOnLink = "http://localhost:5173/";
        switch (report.category)
        {
            case "book":
                reportedOnLink += "programs/bookclub/";
                break;
        }
        reportedOnLink += report.postedOn;

        return (
            <Dialog>
                <div className="flex justify-center">
                    <DialogTrigger asChild>
                        <Card className={`w-[20rem] h-[18rem] drop-shadow-2xl m-3 py-5 bg-porcelain text-left border-t-6 border-t-${report.resolved ? "yale-blue" : "brick-ember"}`}>
                            <CardHeader>
                                <CardTitle className="space-y-[0.3rem]">
                                    <p className={`font-bold text-${report.resolved ? "gray-400" : "yale-blue"}`}>Posted by: {report.subjectName}</p>
                                    <p className="text-gray-400">(User {report.subjectId})</p>
                                </CardTitle>
                                <CardDescription>
                                    <div className={`border rounded-lg h-[10rem] w-[16.5rem] overflow-y-auto ${report.resolved ? "text-gray-400" : ""}`}>
                                        <p className="p-[0.8rem] break-words"> {report.content}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-gray-400 mt-3">(Reported on {new Date(report.reportedAt).toLocaleDateString()})</p>

                                    </div>
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </DialogTrigger>
                    <DialogContent className="w-[70%] max-h-[70%] overflow-y-scroll overflow-x-hidden gap-0" aria-describedby={undefined}>
                        <DialogHeader className="gap-0">
                            <DialogTitle className={`font-bold text-${ report.resolved ? "gray-500" : "brick-ember"}`}>{ report.resolved ? "Resolved Report" : "Comment Report"}</DialogTitle>
                            <p className="font-bold text-yale-blue">
                                Posted by {report.subjectName} on {" "}
                                <a target="_blank" href={reportedOnLink} className="hover:underline focus:outline-none">{ report.postedOnName }</a>
                            </p> 
                                                                                    
                            <p className="text-gray-400">(User {report.subjectId})</p>
                        </DialogHeader>
                        <div className="flex-1 border rounded-lg h-[8rem] overflow-y-auto mt-2">
                            <p className="p-[0.8rem] break-words"> {report.content}</p>
                        </div>
                        <p className="font-bold text-yale-blue mt-5">Reported by: {report.reporterName}</p>
                        <p className="text-gray-400">(User {report.reporterId})</p>
                        {
                            report.reason && report.reason.trim() !== "" ? 
                                <> 
                                    <p className="text-yale-blue">Provided reason:</p>
                                    <div className="flex-1 border rounded-lg h-[6rem] overflow-y-auto mt-1">
                                        <p className="p-[0.8rem] break-words"> {report.reason}</p>
                                    </div>
                                </>
                                :
                                <p className="text-gray-400">No reason provided.</p>
                        }
                        <DialogFooter className="sm:justify-center mt-4">
                            {
                                report.resolved ? 
                                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toggleResolved(report._id, false)}>
                                    Reopen Report
                                </Button>
                                :
                                 <DialogClose asChild>
                                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => toggleResolved(report._id, true)}>
                                        Mark Resolved
                                    </Button>                        
                                </DialogClose>
                            }
                            <Button className="bg-red-600 hover:bg-red-700" onClick={() => deleteReport(report._id)}>
                                Delete
                            </Button>
                            <DialogClose asChild>
                                <Button>
                                    Close
                                </Button>                            
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </div>
            </Dialog>
        );
    }

    return (
        <div>
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 pb-5">Report Management</h2>
            </div>

            {/* Report Search */}
            <Card className="mb-6">
                <CardContent>
                    <div className="flex justify-center gap-2">
                        <Input
                            className="p-2 rounded w-80"
                            placeholder="User"
                            value={searchKeyword}
                            onChange={e => setSearchKeyword(e.target.value)}
                        />
                        <button
                            onClick={clearSearchFilter}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                            Clear Filter
                        </button>
                        <button
                            onClick={searchReports}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Report List */}
            <Card className="mb-15">
                <CardHeader>
                    {
                        reports.length !== 0 ?
                            <CardTitle className="text-xl">Showing page {pageNumber + 1} of {Math.ceil(reports.length / reportsPerPage)}</CardTitle>
                            :
                            <CardTitle className="text-gray-400 text-xl font-normal mt-4">No reports found.</CardTitle>
                    }
                </CardHeader>
                <CardContent>
                    { reports.length !== 0 &&
                        <div className="flex flex-wrap justify-center mb-3">
                            {reports.slice(pageNumber * reportsPerPage, (pageNumber + 1 * reportsPerPage)).map((report) => (
                                <div key={report._id}>
                                    {ReportListing(report)}
                                </div>
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
                        { /* Next page */}
                        <button
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={((pageNumber + 1) * reportsPerPage) > reports.length}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Next Page
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
