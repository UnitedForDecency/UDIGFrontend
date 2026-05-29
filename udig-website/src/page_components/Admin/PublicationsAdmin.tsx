import { type TokenProp } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RichTextEditor from "@/components/ui/RichEditor";
import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import axios from "axios";

interface UdigCoverage {
    id: string;
    title: string;
    description: string;
    contents: string;
    pressname: string;
    readTime?: string;
    dateUploaded?: string;
    link?: string;
}

const formSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pressname: z.string(),
    readTimeValue: z.string().optional(),
    readTimeUnit: z.string().optional(),
    contents: z.string(),
    link: z.string().optional()
});

export default function PublicationsAdmin({ token }: TokenProp) {
    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const [content, setContent] = useState<string>("");
    const [udigCoverages, setUdigCoverages] = useState<UdigCoverage[]>([]);

    // 🔥 NEW
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingCoverage, setEditingCoverage] = useState<UdigCoverage | null>(null);

    useEffect(() => {
        axios.get(`${API_BASE}/publication`)
            .then((res) => setUdigCoverages(Array.isArray(res.data) ? res.data : []))
            .catch(console.error);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            pressname: "",
            readTimeValue: "",
            readTimeUnit: "minutes",
            contents: "",
            link: ""
        }
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!content || content === "<p></p>") {
            return;
        }


        try {
            const payload = {
                title: data.title,
                description: data.description,
                contents: content,
                pressname: data.pressname,
                readTime: `${data.readTimeValue} ${data.readTimeUnit}`,
                link: data.link?.trim() || undefined
            };

            if (editingCoverage) {
                await axios.put(
                    `${API_BASE}/publication/${editingCoverage.id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setUdigCoverages((prev) =>
                    prev.map((p) =>
                        p.id === editingCoverage.id
                            ? { ...p, ...payload }
                            : p
                    )
                );

                setIsEditOpen(false);
                setEditingCoverage(null);
            } else {
                const res = await axios.post(
                    `${API_BASE}/publication`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                setUdigCoverages((prev) => [{
                    id: res.data.udigCoverageId,
                    ...payload
                }, ...prev]);
            }

            form.reset();
            setContent("");

        } catch (err: any) {
            console.error(err);
            alert("Failed");
        } finally {
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete permanently?")) return;

        await axios.delete(`${API_BASE}/publication/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        setUdigCoverages((prev) => prev.filter((p) => p.id !== id));
    };

    const openEdit = (coverage: UdigCoverage) => {
        setEditingCoverage(coverage);
        setIsEditOpen(true);

        form.reset({
            title: coverage.title,
            description: coverage.description,
            pressname: coverage.pressname,
            readTimeValue: coverage.readTime?.split(" ")[0] || "",
            readTimeUnit: coverage.readTime?.split(" ")[1] || "minutes",
            contents: coverage.contents,
            link: coverage.link || ""
        });

        setContent(coverage.contents);
    };

    return (
        <section>
            <h1 className="text-3xl font-bold my-5">Udig in the News</h1>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mb-10">
                <FieldSet>

                    <Controller name="title" control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Title</FieldLabel>
                                <Input {...field} />
                            </Field>
                        )}
                    />

                    <Controller name="description" control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Input {...field} />
                            </Field>
                        )}
                    />

                    <Controller name="link" control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Link</FieldLabel>
                                <Input {...field} />
                            </Field>
                        )}
                    />

                    <Controller name="pressname" control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>Source</FieldLabel>
                                <Input {...field} />
                            </Field>
                        )}
                    />

                    <Controller name="readTimeValue" control={form.control}
                        render={({ field }) => (
                            <Field>
                                <FieldLabel>How long does it take to read (estimate)</FieldLabel>
                                <Input {...field} />
                            </Field>
                        )}
                    />

                    <Controller name="contents" control={form.control}
                        render={() => (
                            <Field>
                                <FieldLabel>Content</FieldLabel>
                                <RichTextEditor onChange={setContent} />
                            </Field>
                        )}
                    />

                    <Button type="submit">
                        {editingCoverage ? "Update" : "Post"}
                    </Button>
                </FieldSet>
            </form>

            {/* LIST */}
            {udigCoverages.map((c) => (
                <div key={c.id} className="border p-4 mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h3 className="break-words font-semibold">{c.title}</h3>
                        <p className="break-words">{c.description}</p>
                    </div>

                    <div className="flex shrink-0 gap-2 self-start sm:self-auto">
                        <button
                            onClick={() => openEdit(c)}
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(c.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}

            {/* 🔥 MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[600px] relative">

                        <button
                            onClick={() => {
                                setIsEditOpen(false);
                                setEditingCoverage(null);
                            }}
                            className="absolute top-2 right-2 text-gray-500"
                        >
                            ✕
                        </button>

                        <h2 className="text-xl mb-4">Edit Udig Coverages</h2>

                        {/* SAME FORM */}
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldSet>

                                <Controller name="title" control={form.control}
                                    render={({ field }) => <Input {...field} />}
                                />

                                <Controller name="description" control={form.control}
                                    render={({ field }) => <Input {...field} />}
                                />

                                <Controller name="link" control={form.control}
                                    render={({ field }) => <Input {...field} />}
                                />

                                <Controller name="pressname" control={form.control}
                                    render={({ field }) => <Input {...field} />}
                                />

                                <RichTextEditor content={content} onChange={setContent} />

                                <Button type="submit" className="mt-4">
                                    Update
                                </Button>
                            </FieldSet>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}