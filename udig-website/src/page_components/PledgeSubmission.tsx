import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { type TokenProp } from "@/App";

const formSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    office: z.string().min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function PledgeSubmissionPage({ token }: TokenProp) {
    const API_BASE = import.meta.env.VITE_MONGO_CONTROLLER_URL;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            office: "",
        },
    });

    const onSubmit = async (data: FormData) => {
        if (!token){
            alert("You must be logged in");
            return
        }
        try {
            await axios.post(`${API_BASE}/pledge`, data, {headers: {
                    Authorization: `Bearer ${token}`,
                }});

            alert("Pledge submitted successfully!");
            form.reset();
        } catch (err) {
            console.error(err);
            alert("Failed to submit pledge");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 text-left">
            <div className="wsite-section-elements">

                <div className="paragraph text-sm">
                    <p>
                        UDIG WILL PROVIDE TO ELECTED OFFICIALS AND CANDIDATES FOR ELECTIVE OFFICE THE FOLLOWING PLEDGE, TO BE SIGNED AND RETURNED TO UDIG:
                    </p>
                    <br />
                </div>

                <h2 className="wsite-content-title text-center font-bold text-red-500 text-2xl">
                    PLEDGE OF DECENCY, INTEGRITY, AND ACCOUNTABILITY
                </h2>

                <br />

                <div className="text-center font-bold text-lg">
                    <p>For Elected Officials and Candidates</p>
                    <p>for Public Office</p>
                    <br />
                </div>

                <div className="space-y-6">

                    <p>
                        I, the undersigned, recognizing that public office is a solemn public trust, do hereby voluntarily pledge to the people I serve that I will uphold the highest standards of decency, integrity, and accountability in both word and action.
                    </p>

                    <p><strong>1. Ethical Leadership and Integrity</strong></p>
                    <div className="pl-6">
                        <p>
                            I pledge to conduct myself with honesty, transparency, and fidelity to the public interest. I will not engage in corruption, self-dealing, or the use of public office for personal or financial gain beyond my compensation.
                        </p>
                    </div>

                    <p><strong>2. Constitutional Duty and War Powers</strong></p>
                    <div className="pl-6">
                        <p>
                            I pledge to uphold and defend the Constitution of the United States, including the balance of powers and system of checks and balances. I affirm that the authority to decide whether the nation will engage in war resides solely with Congress, except in cases of direct or imminent attack, and I will oppose any unlawful or unconstitutional exercise of war-making authority.
                        </p>
                    </div>

                    <p><strong>3. Civility and Respectful Conduct</strong></p>
                    <div className="pl-6">
                        <p>
                            I pledge to conduct myself with civility, restraint, and respect toward colleagues, constituents, and critics alike. I will reject inflammatory rhetoric, personal attacks, and conduct that degrades public discourse.
                        </p>
                    </div>

                    <p><strong>4. Compassion and Human Dignity</strong></p>
                    <div className="pl-6">
                        <p>
                            I pledge to exercise leadership with compassion and respect for the dignity and well-being of all people, including those with whom I disagree.
                        </p>
                    </div>

                    <p><strong>5. Tolerance of Dissent and Commitment to Truth</strong></p>
                    <div className="pl-6">
                        <p>
                            I pledge to respect the right of others to express dissenting views. I will engage in honest, fact-based dialogue and will not use my office to intimidate, silence, or retaliate against critics or political opponents.
                        </p>
                    </div>

                    <p><strong>6. Accountability and Consequences</strong></p>
                    <div className="pl-6">
                        <p>
                            I acknowledge that this pledge constitutes a public commitment to those I serve. Should I fail to uphold these standards:
                        </p>

                        <ul className="list-disc pl-6 space-y-1 mt-2">
                            <li>I accept that I may be subject to public censure and formal accountability proceedings where applicable.</li>
                            <li>I recognize the legitimacy of recall efforts, where permitted by law.</li>
                            <li>I support appropriate legal and ethical consequences for misconduct, including penalties for corruption or abuse of power.</li>
                            <li>I accept that voters and the news media are entitled to be informed about my conduct and to hold me accountable, including through the electoral process.</li>
                        </ul>
                    </div>

                    <p><strong>7. Ongoing Commitment</strong></p>
                    <div className="pl-6">
                        <p>
                            I pledge to continually evaluate my conduct against these principles and to correct course where I fall short, recognizing that maintaining public trust requires constant vigilance and humility.
                        </p>
                    </div>

                </div>
            </div>

            {/* ================= FORM SECTION ================= */}
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-12 border border-gray-300 rounded-xl p-8 shadow-md bg-white"
            >
                <h3 className="text-xl font-semibold mb-6">
                    Submit Signed Pledge Information
                </h3>

                <FieldSet>
                    <div className="grid gap-4">

                        <Controller
                            name="fullName"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Full Name</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Email (For internal use only) </FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />

                        <Controller
                            name="office"
                            control={form.control}
                            render={({ field }) => (
                                <Field>
                                    <FieldLabel>Office Sought/Held</FieldLabel>
                                    <Input {...field} />
                                </Field>
                            )}
                        />
                    </div>

                    <Button type="submit" className="mt-6 w-full">
                        Submit Pledge
                    </Button>
                </FieldSet>
            </form>
        </div>
    );
}