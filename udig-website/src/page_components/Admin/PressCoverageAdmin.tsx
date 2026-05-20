import { type TokenProp } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichEditor";
import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface PressCoverage {
    _id: string;
    title: string;
    description: string;
    contents: string;
    pressname: string;
    readTime?: string;
    dateUploaded?: string;
}


const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(80, "Title must be at most 80 characters."),
    description: z.string().min(1, "Description is required").max(200, "Description must be at most 200 characters"),
    pressname: z.string().min(1, "Press name is required"),
    readTimeValue: z.string().optional(),
    readTimeUnit: z.string().optional(),
    contents: z.string(),
});

export default function PressCoverageAdmin({ token }: TokenProp) {
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const [content, setContent] = useState<string>("");
    const [contentsMissing, setContentsMissing] = useState(false);
    const [pressCoverages, setPressCoverages] = useState<PressCoverage[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE}/presscoverage`)
            .then((res) => setPressCoverages(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error("Failed to fetch press coverage:", err));
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
        title: "",
        description: "",
        pressname: "",
        readTimeValue: "",
        readTimeUnit: "minutes",
        contents: ""
    }
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!content || content === "<p></p>") {
            setContentsMissing(true);
            return;
        }
        setContentsMissing(false);

        try {
            setLoading(true);
            const res = await axios.post(
                `${API_BASE}/presscoverage`,
                {
                    title: data.title,
                    description: data.description,
                    contents: content,
                    pressname: data.pressname,
                    readTime: `${data.readTimeValue} ${data.readTimeUnit}`,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 201) {
                setPressCoverages((prev) => [{
                    _id: res.data.pressCoverageId,
                    title: data.title,
                    description: data.description,
                    contents: content,
                    pressname: data.pressname,
                    readTime: `${data.readTimeValue} ${data.readTimeUnit}`,
                }, ...prev]);
                form.reset();
                setContent("");
            }

            if (res.status === 401) alert("Login Expired. Please log in again.");
        } catch (err: any) {
            console.error("Add press coverage failed:", err.response?.data || err.message);
            alert(err.response?.data || "Failed to add press coverage");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete "${title}" permanently?`)) return;
        try {
            await axios.delete(`${API_BASE}/presscoverage/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPressCoverages((prev) => prev.filter((g) => g._id !== id));
        } catch (err: any) {
            console.error("Delete failed:", err);
            alert("Failed to delete press coverage");
        }
    };

    return (
        <section>
            <div>
                <h1 className="text-3xl font-bold underline text-yale-blue decoration-brick-ember my-5">
                    Add New Press Coverage
                </h1>
                <form className="flex flex-col items-center" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldSet>
                        <Controller name="title" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Title</FieldLabel>
                                    <Input {...field} className="bg-white my-5 h-12" placeholder="Title" required />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller name="description" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Description</FieldLabel>
                                    <Input {...field} className="bg-white my-5 h-12" placeholder="Brief summary shown on the press coverage list" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="pressname"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Press Name</FieldLabel>

                                    <Input
                                        {...field}
                                        className="bg-white my-5 h-12"
                                        placeholder="Type a press name (e.g. The New York Times, The Washington Post)"
                                    />

                                    <datalist id="pressname-suggestions">
                                        {pressCoverages
                                            .map((g) => g.pressname)
                                            .filter((v, i, arr) => arr.indexOf(v) === i)
                                            .map((cat) => (
                                                <option key={cat} value={cat} />
                                            ))}
                                    </datalist>

                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="readTimeValue"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel className="text-2xl">Read Time (Optional)</FieldLabel>

                                    <div className="flex gap-2 my-5">
                                        {/* Number input */}
                                        <Input
                                            {...field}
                                            type="number"
                                            min="1"
                                            className="bg-white h-12 w-24"
                                            placeholder="5"
                                        />

                                        {/* Dropdown */}
                                        <Controller
                                            name="readTimeUnit"
                                            control={form.control}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="h-12 px-3 border rounded-md bg-white"
                                                >
                                                    <option value="seconds">Seconds</option>
                                                    <option value="minutes">Minutes</option>
                                                    <option value="hours">Hours</option>
                                                </select>
                                            )}
                                        />
                                    </div>
                                </Field>
                            )}
                        />
                        <Controller name="contents" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Content</FieldLabel>
                                    {contentsMissing && <FieldError>Contents must not be empty.</FieldError>}
                                    <RichTextEditor {...field}
                                        aria-invalid={fieldState.invalid}
                                        onChange={(html) => setContent(html)}
                                        placeholder="Start writing…"
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Button type="submit" disabled={loading} className="max-w-20">
                            {loading ? "Posting..." : "Post"}
                        </Button>
                    </FieldSet>
                </form>

                {/* Existing Press Coverages */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-yale-blue mb-6">Existing Press Coverages ({pressCoverages.length})</h2>
                    {pressCoverages.length === 0 ? (
                        <p className="text-gray-500">No press coverages yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {pressCoverages.map((coverage) => (
                                <div key={coverage._id}
                                    className="border border-gray-200 rounded-lg p-5 bg-white flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono uppercase bg-antique-brass/40 text-stone-taupe px-2 py-0.5 rounded">
                                                {coverage.pressname}
                                            </span>
                                            {coverage.readTime && <span className="text-xs text-gray-500">{coverage.readTime}</span>}
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-900">{coverage.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{coverage.description}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => navigate(`/about/press-coverages/${coverage._id}/edit`)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(coverage._id, coverage.title)}
                                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
