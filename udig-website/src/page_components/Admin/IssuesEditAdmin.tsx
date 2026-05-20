import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RichTextEditor from "@/components/ui/RichEditor"
import { useEffect, useState } from "react";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

interface Post {
    _id: string;
    title: string;
    contents: string;
    description: string;
}

export default function IssuesEditAdmin() {
    const id = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<Post | null>(null);
    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")
    
    let contentsMissing = false;

    useEffect(() => {
        fetch(`${import.meta.env.VITE_MONGO_CONTROLLER_URL}/issues/${id.id}`)
            .then((res) => res.json())
            .then((data) => {
            setPost(data);
            setTitle(data.title);
            setContent(data.contents);
            if(data.description !== null) {
                setDescription(data.description);
            }
            setLoading(false);
            
        });
    }, [id]);

    const formSchema = z.object({
        title: z
            .string()
            .max(32, "Title must be at most 32 characters."),
        description: z
            .string()
            .max(100, "Description must be at most 100 characters"),
        contents: z
            .string()
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            title: "",
            description: "",
            contents: "",
        },
    })

    const onSubmit = async () => {
        if (content == "" || content == "<p></p>"){
            contentsMissing = true;
        } else {
            contentsMissing = false;
            const token = localStorage.getItem("token");
            const authHeaders = {
                headers: { Authorization: `Bearer ${token}` }
            };
            try {
                const res = await axios.put(
                    import.meta.env.VITE_MONGO_CONTROLLER_URL + "/issues/" + id.id,
                    {
                        title: title,
                        description: description,
                        contents: content
                    },
                    authHeaders
                );
                

                if (res.status == 200) {
                    navigate('/programs/issues/' + id.id)
                }

                if (res.status == 401) {
                    alert("Login Expired. Please log in again.")
                }
        
            } catch (err: any) {
                console.error("Add issue failed:", err.response?.data || err.message);
                alert(err.response?.data || "Failed to add issue");
            }
        }
    }


    if (loading) return <p>Loading…</p>;
    return (
        <section>
            <div>
                <h1 className="text-3xl font-bold underline text-yale-blue decoration-brick-ember my-5">Edit Issue Post</h1>
                <form className='flex flex-col items-center' onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldSet>
                        <Controller
                            name="title"
                            control={form.control}
                            render={({field, fieldState} ) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Title</FieldLabel>
                                    <Input
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        className="bg-white my-5 h-12"
                                        id="title"
                                        required
                                        placeholder="Title"
                                        onChange={(e) => (setTitle(e.target.value))}
                                        value={title}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="description"
                            control={form.control}
                            render={({field, fieldState} ) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Description (Optional)</FieldLabel>
                                    <Input
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        className="bg-white my-5 h-12"
                                        id="description"
                                        placeholder="Description"
                                        value={description}
                                        onChange={(e) => (setDescription(e.target.value))}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="contents"
                            control={form.control}
                            render={({field, fieldState} ) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel className="text-2xl">Content</FieldLabel>
                                    {contentsMissing ? <FieldError>Contents must not be empty.</FieldError> : <></>}
                                    <RichTextEditor
                                        {...field}
                                        aria-invalid={fieldState.invalid}
                                        onChange={(html) => setContent(html)}
                                        placeholder="Start writing…"
                                        content={post?.contents}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Button type="submit" className="max-w-20 mb-10">Update</Button>
                    </FieldSet>
                </form>
            </div>
        </section>
    )
}