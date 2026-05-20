import { type TokenProp } from "@/App";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import RichTextEditor from "@/components/ui/RichEditor"
import { useState } from "react";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError, FieldLabel, FieldSet } from "@/components/ui/field";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function IssuesAdmin({ token }: TokenProp) {
    const navigate = useNavigate();
    const [content, setContent] = useState<string>("");
    let contentsMissing = false;

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

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (content == "" || content == "<p></p>"){
            contentsMissing = true;
        } else {
            contentsMissing = false;
            const authHeaders = {
                headers: { Authorization: `Bearer ${token}` }
            };
            try {
                const res = await axios.post(
                    import.meta.env.VITE_MONGO_CONTROLLER_URL + "/issues",
                    {
                        title: data.title,
                        description: data.description || null,
                        contents: content
                    },
                    authHeaders
                );
                

                if (res.status == 201) {
                    navigate('/programs/issues/' + res.data.IssueId)
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


    return (
        <section>
            <div>
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
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Button type="submit" className="max-w-20">Post</Button>
                    </FieldSet>
                </form>
            </div>
        </section>
    )
}