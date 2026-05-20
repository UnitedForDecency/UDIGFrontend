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

interface Guide {
    _id: string;
    title: string;
    description: string;
    contents: string;
    category: string;
    readTime?: string;
}


const formSchema = z.object({
    title: z.string().min(1, "Title is required").max(80, "Title must be at most 80 characters."),
    description: z.string().min(1, "Description is required").max(200, "Description must be at most 200 characters"),
    category: z.string().min(1, "Category is required"),
    readTime: z.string().optional(),
    contents: z.string(),
});

export default function GuidesAdmin({ token }: TokenProp) {
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const [content, setContent] = useState<string>("");
    const [contentsMissing, setContentsMissing] = useState(false);
    const [guides, setGuides] = useState<Guide[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get(`${API_BASE}/guides`)
            .then((res) => setGuides(Array.isArray(res.data) ? res.data : []))
            .catch((err) => console.error("Failed to fetch guides:", err));
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: { title: "", description: "", category: "", readTime: "", contents: "" },
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
                `${API_BASE}/guides`,
                {
                    title: data.title,
                    description: data.description,
                    contents: content,
                    category: data.category,
                    readTime: data.readTime || "",
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 201) {
                setGuides((prev) => [{
                    _id: res.data.guideId,
                    title: data.title,
                    description: data.description,
                    contents: content,
                    category: data.category,
                    readTime: data.readTime || "",
                }, ...prev]);
                form.reset();
                setContent("");
            }

            if (res.status === 401) alert("Login Expired. Please log in again.");
        } catch (err: any) {
            console.error("Add guide failed:", err.response?.data || err.message);
            alert(err.response?.data || "Failed to add guide");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete "${title}" permanently?`)) return;
        try {
            await axios.delete(`${API_BASE}/guides/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGuides((prev) => prev.filter((g) => g._id !== id));
        } catch (err: any) {
            console.error("Delete failed:", err);
            alert("Failed to delete guide");
        }
    };

    return (
        <section>
            <div>
                <h1 className="text-3xl font-bold underline text-yale-blue decoration-brick-ember my-5">
                    Add New Guide
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
                                    <Input {...field} className="bg-white my-5 h-12" placeholder="Brief summary shown on the guides list" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller
                            name="category"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Category</FieldLabel>

                                    <Input
                                        {...field}
                                        className="bg-white my-5 h-12"
                                        placeholder="Type a category (e.g. Voting, Civic Engagement)"
                                    />

                                    <datalist id="category-suggestions">
                                        {guides
                                            .map((g) => g.category)
                                            .filter((v, i, arr) => arr.indexOf(v) === i)
                                            .map((cat) => (
                                                <option key={cat} value={cat} />
                                            ))}
                                    </datalist>

                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller name="readTime" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Read Time (Optional)</FieldLabel>
                                    <Input {...field} className="bg-white my-5 h-12" placeholder="e.g. 5 min read" />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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

                {/* Existing Guides */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-yale-blue mb-6">Existing Guides ({guides.length})</h2>
                    {guides.length === 0 ? (
                        <p className="text-gray-500">No guides yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {guides.map((guide) => (
                                <div key={guide._id}
                                    className="border border-gray-200 rounded-lg p-5 bg-white flex items-start justify-between gap-4 hover:shadow-md transition-shadow">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono uppercase bg-antique-brass/40 text-stone-taupe px-2 py-0.5 rounded">
                                                {guide.category}
                                            </span>
                                            {guide.readTime && <span className="text-xs text-gray-500">{guide.readTime}</span>}
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-900">{guide.title}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{guide.description}</p>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => navigate(`/get-involved/guides/${guide._id}/edit`)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(guide._id, guide.title)}
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
