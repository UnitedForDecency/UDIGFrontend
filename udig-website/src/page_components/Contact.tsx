import {
    Field, FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import {Input} from "@/components/ui/input.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Button} from "@/components/ui/button.tsx";
import {SocialIcon} from "react-social-icons";
import {Controller, useForm} from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export default function Contact() {
    const formSchema = z.object({
        name: z
            .string()
            .max(32, "Name must be at most 32 characters."),
        email: z
            .string()
            .max(32, "Email must be at most 32 characters.")
            .email("Invalid email address"),
        message: z
            .string()
            .min(20, "Message must be at least 20 characters.")
            .max(300, "Message must be at most 300 characters."),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    })

    //Function triggered only when all fields have valid values
    async function onSubmit(data: z.infer<typeof formSchema>) {
        const name = data.name;
        const email = data.email;
        const message = data.message;

        const body = {
            "name": name,
            "email": email,
            "message": message
        }

        try {
            //TODO:ENVIRONMENT VARIABLE INSTEAD OF HARDCODED URL
            const response = await fetch(import.meta.env.VITE_EMAIL_SERVICE_URL + "/sendContactEmail", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (response.ok) {
                // console.log("Email sent successfully.")
            } else {
                new Error("Response failed.")
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <section className="bg-alice-blue min-h-screen py-16 px-4">
            <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden md:grid md:grid-cols-2">

            {/* LEFT PANEL */}
            <div className="relative p-12 flex flex-col justify-center bg-gradient-to-br from-brick-ember to-alice-blue">

                {/* Decorative blob */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-yale-blue opacity-10 rounded-full blur-3xl" />

                <div className="relative z-10 max-w-md">

                    <h1 className="text-4xl font-extrabold text-yale-blue mb-4 leading-tight">
                    Let’s talk.
                    </h1>

                    <p className="text-lg text-graphite mb-8 leading-relaxed">
                    Questions, ideas, local tips, or something we should know about in
                    your community — we’re listening.
                    </p>

                    {/* EMAIL CARD */}
                    <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-100">
                    <p className="text-sm uppercase tracking-wide text-stone-taupe mb-1">
                        Email us directly
                    </p>
                    <p className="font-semibold break-all text-yale-blue">
                        rocky.udig@gmail.com
                    </p>
                    </div>

                    {/* SOCIAL */}
                    <div>
                    <p className="text-sm uppercase tracking-wide text-stone-taupe mb-3">
                        Follow along
                    </p>

                    <div className="flex justify-center gap-4 [&>a]:transition-transform [&>a]:hover-translate-y-1 ">
                        <SocialIcon url="https://x.com" bgColor="#C4A75A" fgColor="#2E2E2E" />
                        <SocialIcon url="https://youtube.com" bgColor="#C4A75A" fgColor="#2E2E2E" />
                        <SocialIcon url="https://instagram.com" bgColor="#C4A75A" fgColor="#2E2E2E" />
                        <SocialIcon url="https://tiktok.com" bgColor="#C4A75A" fgColor="#2E2E2E" />
                    </div>
                    </div>

                </div>
            </div>

            {/* RIGHT PANEL — FORM */}
            <div className="p-10 bg-white">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FieldSet>
                    <FieldGroup className="space-y-5">

                    {/* NAME */}
                    <Controller
                        name="name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-lg font-semibold">
                            Name
                            </FieldLabel>
                            <Input
                            {...field}
                            aria-invalid={fieldState.invalid}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yale-blue"
                            required
                            placeholder="Enter your name"
                            />
                            {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                        )}
                    />

                    {/* EMAIL */}
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-lg font-semibold">
                            Email
                            </FieldLabel>
                            <Input
                            {...field}
                            type="email"
                            aria-invalid={fieldState.invalid}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yale-blue"
                            required
                            placeholder="Enter your email"
                            />
                            {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                        )}
                    />

                    {/* MESSAGE */}
                    <Controller
                        name="message"
                        control={form.control}
                        render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel className="text-lg font-semibold">
                            Message
                            </FieldLabel>
                            <Textarea
                            {...field}
                            aria-invalid={fieldState.invalid}
                            required
                            placeholder="Enter your message"
                            className="bg-white border border-gray-300 rounded-lg px-4 py-3 resize-none min-h-[140px] focus:ring-2 focus:ring-yale-blue"
                            />
                            {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                        )}
                    />

                    </FieldGroup>
                </FieldSet>

                {/* SUBMIT BUTTON */}
                <Button
                    type="submit"
                    className="w-full text-lg py-4 rounded-lg bg-yale-blue text-white hover:bg-opacity-90 transition shadow-md"
                >
                    Send Message
                </Button>
                </form>
            </div>

            </div>
        </section>
    );
}