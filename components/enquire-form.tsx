import { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"; // Icon for Loading Animation

interface FormData {
  name: string;
  email: string;
  mobile: string;
  message: string;
}

export default function EnquiryForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/sendEnquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Enquiry sent successfully!");
        setFormData({ name: "", email: "", mobile: "", message: "" });
      } else {
        toast.error("Failed to send email.");
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" mx-2 bg-white shadow-lg rounded-2xl p-8 space-y-6">
      <h3 className="text-3xl font-bold text-center text-[#1a237e]">
        Enquire Now
      </h3>
      <p className="text-gray-600 text-ce   nter">
        Fill in the form below, and we will get back to you soon.
      </p>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            className="border border-gray-300 focus:border-[#1a237e] transition-all"
          />
          <Input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="border border-gray-300 focus:border-[#1a237e] transition-all"
          />
        </div>
        <Input
          type="tel"
          name="mobile"
          placeholder="Your Mobile Number"
          value={formData.mobile}
          onChange={handleChange}
          disabled={loading}
          className="border border-gray-300 focus:border-[#1a237e] transition-all"
        />
        <Textarea
          name="message"
          placeholder="Your Message"
          className="min-h-[150px] border border-gray-300 focus:border-[#1a237e] transition-all"
          value={formData.message}
          onChange={handleChange}
          disabled={loading}
        />
        <Button
          type="submit"
          className="w-full md:w-auto px-8 py-3 bg-[#1a237e] hover:bg-[#1a237e]/90 transition-all rounded-lg text-white flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              Sending <Loader2 className="animate-spin h-5 w-5" />
            </>
          ) : (
            "SEND YOUR MESSAGE"
          )}
        </Button>
      </form>
    </div>
  );
}
