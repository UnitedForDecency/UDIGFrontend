import { type TokenProp } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
    Field,
    FieldError,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import axios from "axios";

type Issue = {
    id: string;
    title: string;
    description?: string;
    contents: string;
    createdAt?: string;
};

export default function IssuesAdmin({ token }: TokenProp) {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
    const [contentsMissing, setContentsMissing] = useState(false);

    const formSchema = z.object({
        title: z.string().min(1).max(32),
        description: z.string().max(100).optional(),
        contents: z.string(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            contents: "",
        },
    });

    const authHeaders = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    /* ---------------- FETCH ---------------- */
    const getIssues = async () => {
        try {
            const res = await axios.get(
                import.meta.env.VITE_MONGO_CONTROLLER_URL + "/issues",
                authHeaders
            );

            setIssues(res.data);
        } catch (err: any) {
            console.error(err);
        }
    };

    useEffect(() => {
        getIssues();
    }, []);

    /* ---------------- RESET ---------------- */
    const resetForm = () => {
        form.reset({
            title: "",
            description: "",
            contents: "",
        });

        setEditingIssueId(null);
        setContentsMissing(false);
    };

    const openCreate = () => {
        resetForm();
        setShowCreate(true);
    };

    const openEdit = (issue: Issue) => {
        setEditingIssueId(issue.id);

        form.reset({
            title: issue.title,
            description: issue.description || "",
            contents: issue.contents,
        });

        setShowCreate(true);
    };

    /* ---------------- DELETE ---------------- */
    const deleteIssue = async (id: string) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/issues/${id}`,
                authHeaders
            );

            await getIssues();
        } catch (err) {
            console.error(err);
        }
    };

    /* ---------------- SUBMIT ---------------- */
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!data.contents.trim()) {
            setContentsMissing(true);
            return;
        }

        setContentsMissing(false);

        const payload = {
            title: data.title,
            description: data.description || "",
            contents: data.contents,
        };

        try {
            if (editingIssueId) {
                await axios.put(
                    `${import.meta.env.VITE_MONGO_CONTROLLER_URL}/issues/${editingIssueId}`,
                    payload,
                    authHeaders
                );
            } else {
                await axios.post(
                    import.meta.env.VITE_MONGO_CONTROLLER_URL + "/issues",
                    payload,
                    authHeaders
                );
            }

            await getIssues();
            resetForm();
            setShowCreate(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-3xl font-bold">Issues Admin</h1>

                <Button onClick={openCreate}>Create Issue</Button>
            </div>

            {/* MODAL */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] max-w-3xl p-6 rounded-xl">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-bold">
                                {editingIssueId ? "Edit Issue" : "Create Issue"}
                            </h2>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreate(false);
                                    resetForm();
                                }}
                            >
                                Close
                            </Button>
                        </div>

                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldSet className="space-y-4">

                                {/* TITLE */}
                                <Controller
                                    name="title"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <Field>
                                            <FieldLabel>Title</FieldLabel>
                                            <Input {...field} />
                                            {fieldState.error && (
                                                <FieldError
                                                    errors={[fieldState.error]}
                                                />
                                            )}
                                        </Field>
                                    )}
                                />

                                {/* DESCRIPTION */}
                                <Controller
                                    name="description"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Description</FieldLabel>
                                            <Input {...field} />
                                        </Field>
                                    )}
                                />

                                {/* CONTENT */}
                                <Controller
                                    name="contents"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Field>
                                            <FieldLabel>Content</FieldLabel>

                                            {contentsMissing && (
                                                <p className="text-red-500 text-sm">
                                                    Content is required
                                                </p>
                                            )}

                                            <Textarea
                                                {...field}
                                                className="min-h-[200px]"
                                            />
                                        </Field>
                                    )}
                                />

                                <Button type="submit" className="w-full">
                                    {editingIssueId ? "Update" : "Create"}
                                </Button>
                            </FieldSet>
                        </form>
                    </div>
                </div>
            )}

            {/* LIST */}
            <div className="space-y-4">
                {issues.map((issue) => (
                    <div
                        key={issue.id}
                        className="border rounded-xl p-4 bg-white"
                    >
                        <div className="flex justify-between">
                            <div>
                                <h2 className="text-xl font-bold">
                                    {issue.title}
                                </h2>

                                <p className="text-gray-600">
                                    {issue.description}
                                </p>

                                <p className="text-sm text-gray-400">
                                    Created: {new Date(issue.createdAt!).toLocaleString()}
                                </p>

                                <p className="mt-2 whitespace-pre-wrap">
                                    {issue.contents}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => openEdit(issue)}
                                >
                                    Edit
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={() => deleteIssue(issue.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}