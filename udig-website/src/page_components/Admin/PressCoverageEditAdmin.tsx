import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichEditor";
import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface PressCoverage {
    _id: string;
    title: string;
    description: string;
    contents: string;
    pressname: string;
    readTime?: string;
    dateUploaded?: string;
}

const CATEGORIES = ["Civic Engagement", "Voting", "Advocacy"];

const formSchema = z.object({
    title: z.string().min(1).max(80),
    description: z.string().min(1).max(200),
    category: z.string().min(1),
    pressname: z.string().min(1),
    readTime: z.string().optional(),
    contents: z.string(),
});

export default function PressCoverageEditAdmin() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;
    const [pressCoverage, setPressCoverage] = useState<PressCoverage | null>(null);
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [contentsMissing, setContentsMissing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [readTime, setReadTime] = useState("");

    useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/press-coverage/${id}`)
        .then((res) => res.json())
        .then((data) => {
            console.log("press coverage data:", data);  // add this
            setPressCoverage(data);
            setTitle(data.title);
            setDescription(data.description);
            setContent(data.contents);
            setCategory(data.category);
            setReadTime(data.readTime || "");
            setLoading(false);
        })
        .catch((err) => {
            console.error("Failed to fetch press coverage:", err);
            setLoading(false);
        });
}, [id]);   

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: { title: "", description: "", category: "", readTime: "", contents: "" },
    });

    const onSubmit = async () => {
        if (!content || content === "<p></p>") {
            setContentsMissing(true);
            return;
        }
        setContentsMissing(false);

        try {
            const res = await axios.put(
                `${API_BASE}/presscoverage/${id}`,
                { title, description, contents: content, category, readTime, pressname: pressCoverage?.pressname || ""},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200) navigate(`/about/press-coverage/${id}`);
            if (res.status === 401) alert("Login Expired. Please log in again.");
        } catch (err: any) {
            console.error("Update press coverage failed:", err.response?.data || err.message);
            alert(err.response?.data || "Failed to update press coverage.");
        }
    };

    if (loading) return <p>Loading…</p>;

    return (
        <section>
            <div>
                <h1 className="text-3xl font-bold underline text-yale-blue decoration-brick-ember my-5">
                    Edit Press Coverage
                </h1>
                <form className="flex flex-col items-center" onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldSet>
                        <Controller name="title" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Title</FieldLabel>
                                    <Input {...field} className="bg-white my-5 h-12" placeholder="Title"
                                        value={title} onChange={(e) => setTitle(e.target.value)} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller name="description" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Description</FieldLabel>
                                    <Input {...field} className="bg-white my-5 h-12" placeholder="Description"
                                        value={description} onChange={(e) => setDescription(e.target.value)} />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller name="category" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Category</FieldLabel>
                                    <select {...field} value={category} onChange={(e) => setCategory(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white my-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="">Select a category...</option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Controller name="readTime" control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Read Time (Optional)</FieldLabel>
                                    <Input {...field} className="bg-white my-5 h-12" placeholder="e.g. 5 min read"
                                        value={readTime} onChange={(e) => setReadTime(e.target.value)} />
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
                                        content={pressCoverage?.contents}
                                    />
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )}
                        />
                        <Button type="submit" className="max-w-20 mb-10">Update</Button>
                    </FieldSet>
                </form>
            </div>
        </section>
    );
}
