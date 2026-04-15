import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import service from "../../api/axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { createPaymentOrder } from "../../api/payment";
import dashboardImage from "../../assets/dashboard.png";
import createAgentV1Image from "../../assets/tabs/create-agent-v1.png";
import ownCreatedAgentImage from "../../assets/tabs/own-created-agent.png";
import alreadyCreatedAgentImage from "../../assets/tabs/already-created.png";
import callLogsImg from "../../assets/tabs/call_logs.png";
import createAgentImg from "../../assets/tabs/create_agent.png";
import emailTemplateImg from "../../assets/tabs/how_email_template_work.png";
import whatsappSendImg from "../../assets/tabs/how_whatshapp_message_send.png";
import whatsappLogImg from "../../assets/tabs/whatshapp_log.png";

const plans = [
  {
    id: "trial",
    title: "Richa Trial Pack",
    subtitle: "1 Month Sales Executive Free",
    price: "₹ 18,999/-",
    original: "Rs. 38,000/-",
    link: "richa-trial-pack",
  },
  {
    id: "certified_ai_training",
    title: "Certified AI Training",
    subtitle: "",
    price: "free",
    original: "Rs. 999/-",
    link: "become-ai-certified-by-richa",
  },
  {
    id: "prince",
    title: "Richa Prince Pack",
    subtitle: "",
    price: "₹ 1,99,000/- + GST",
    original: "Rs. 3,98,000/-",
    link: "richa-prince-pack"
  },
  {
    id: "queen",
    title: "Richa Queen Pack",
    subtitle: "5 Sales Executive For 2 Months Free",
    price: "₹ 99,999/-",
    original: "Rs. 1,99,999/-",
    link: "richa-queen-pack",
  },
   {
    id: "queen_2_exec",
    title: "Richa Queen Pack",
    subtitle: "2 Sales Executive Free For 4 Months",
    price: "₹ 99,999/- + GST",
    original: "Rs. 1,99,999/-",
    link: "richa-queen-pack-2-exec"
  },
  {
    id: "queen_1_exec",
    title: "Richa Queen Pack",
    subtitle: "1 Sales Executive For 7 Months",
    price: "₹ 99,999/- + GST",
    original: "Rs. 1,99,999/-",
    link: "richa-queen-pack-1-exec"
  },
  {
    id: "king",
    title: "Richa King Pack",
    subtitle: "4 Sales Executive Free For 1 Year",
    price: "₹ 4,99,999/-",
    original: "Rs. 9,99,999/-",
    link: "richa-king-pack",
  },  
    {
    id: "tithi_ai",
    title: "Tithi AI",
    subtitle: "",
    price: "₹ 24,999/- + GST",
    original: "Rs. 29,999/-",
    link: "tithi-ai"
  },
  {
    id: "demo_call",
    title: "Demo Call Pack",
    subtitle: "Try Richa AI with a Demo Call",
    price: "₹99/-",
    original: "Rs. 299/-",
    link: "paid_demo_trial_richa_ai",
  },
   {
    id: "mini",
    title: "Richa Mini Pack",
    subtitle: "1 Month Sales Executive Free",
    price: "₹ 49,000/- + GST",
    original: "Rs. 98,000/-",
    link: "richa-mini-pack"
  },  
  {
    id: "become_channel_partner",
    title: "Become Channel Partner",
    subtitle: "",
    price: "₹ 9,999 + GST",
    link: "richa-mini-pack"
  },
];

// Simple standalone page (no routing) with description and scheduling UI.
export default function ExamInfo() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const EXAM_FEE = 999;
  
  // Clean email from URL parameter (remove quotes if present)
  const email = useMemo(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) return null;
    // Remove surrounding quotes if present
    return emailParam.replace(/^["']|["']$/g, "").trim();
  }, [searchParams]);
  
  // Check for email parameter and redirect if not present
  useEffect(() => {
    if (!email || email === "") {
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Cashfree) {
      window.cashfree = window.Cashfree({
        mode: "production",
      });
    }
  }, []);
  
  // Don't render content if email is not present (will redirect)
  if (!email || email === "") {
    return null;
  }
  
  const today = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Calculate tomorrow's date
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1); // Add one day
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const scheduleRef = useRef(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRichaInfo, setShowRichaInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [showScheduleSuccess, setShowScheduleSuccess] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const FIXED_TIME = "10:00";

  const loginAndNavigateToExam = async () => {
    const response = await service.post("login", {
      email,
      password: "12345678",
    });

    if (response.data) {
      const data = response.data;

      if (data.token) {
        Cookies.set("CallingAgent", data.token, {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });
        localStorage.setItem("ibcrmtoken", data.token);
      }

      if (data.data?.role) {
        Cookies.set("role", data.data.role, {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });
      }

      if (data.data?.twilio_user !== undefined) {
        Cookies.set("twilio_user", String(data.data.twilio_user || "0"), {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });
      }

      if (data.data?.name) {
        localStorage.setItem("userName", data.data.name);
      }

      navigate(`/exam-start?email=${encodeURIComponent(email)}`);
    }
  };

  // Handle Schedule Submit
  const handleScheduleSubmit = async () => {
    if (!selectedDate || !email) {
      alert("Please select a date and ensure email is available.");
      return;
    }

    setIsSubmittingSchedule(true);
    try {
      // Combine date and time (format: YYYY-MM-DD HH:MM:SS or YYYY-MM-DD HH:MM)
      const dateTime = `${selectedDate} ${FIXED_TIME}:00`;
      
      // Call store-name-date API with email as 'name' and combined date+time as 'date'
      await service.post("store-name-date", {
        name: email, // email is passed as 'name'
        date: dateTime // combined date and time
      });

      // Store scheduled date before resetting
      setScheduledDate(selectedDate);
      // Show success popup instead of alert
      setShowScheduleSuccess(true);
      setShowSchedule(false);
      setSelectedDate(tomorrow);
    } catch (error) {
      console.error("Failed to schedule:", error);
      alert(error.response?.data?.message || "Failed to schedule. Please try again.");
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  // Handle Start Exam button click - complete payment, then login and navigate
  const handleStartExam = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const customerName =
        localStorage.getItem("userName") ||
        Cookies.get("name") ||
        "Exam Candidate";
      const customerPhone = Cookies.get("contact_no") || "";

      if (!customerPhone) {
        throw new Error("Phone number not found. Please sign up again before starting the exam.");
      }

      if (!window.cashfree) {
        throw new Error("Payment gateway is not ready yet. Please refresh and try again.");
      }

      const response = await createPaymentOrder({
        name: customerName,
        email,
        phoneNumber: customerPhone,
        totalPayment: EXAM_FEE,
        orderDesc: "Certified AI Training Exam Fee",
      });
      const paymentSessionId = response?.payment_id || "";

      if (!paymentSessionId) {
        throw new Error("Payment session id was not returned from create order API.");
      }

      const result = await window.cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });

      if (result?.error) {
        throw new Error(result.error?.message || "Payment failed.");
      }

      const isPaymentSuccessful =
        result?.paymentDetails ||
        result?.order?.order_status === "PAID" ||
        result?.transaction?.txStatus === "SUCCESS";

      if (!isPaymentSuccessful) {
        if (result?.redirect) {
          return;
        }
        throw new Error("Payment was not completed.");
      }

      toast.success("Payment successful. Starting your exam...");
      await loginAndNavigateToExam();
    } catch (error) {
      console.error("Exam start error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to start exam. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const tutorialTabs = [
    {
      id: "call-logs",
      title: "Call Logs",
      image: callLogsImg,
      description:
        "The Call Logs page provides a comprehensive view of all call records made by your AI sales agent. This section helps you track and monitor call activity.",
      features: [
        "View all call records in a structured table format",
        "See recipient phone numbers with country codes",
        "Monitor call status and duration for each call",
        "Check timestamps to track when calls were made",
      ],
      howToUse: [
        "Navigate to 'Call log' from the Dashboard sidebar",
        "Click the 'View' button next to any call entry to see more details",
        "Use pagination controls to browse historical call records",
      ],
      route: "/call-logs",
    },
    {
      id: "create-agent",
      title: "Create Agent",
      image: createAgentImg,
      description:
        "The Create Agent page allows you to build and configure new AI sales agents. Each agent can be customized with specific messaging and behavior patterns.",
      features: [
        "Create new AI agents with custom names",
        "Set a welcome message for first interaction",
        "Configure body content using rich text editor",
        "Save agents for future campaigns",
      ],
      howToUse: [
        "Navigate to 'Agents' and click to create a new agent",
        "Enter Name, Welcome Message, and Body content",
        "Click Save and use the agent in calls/messages",
      ],
      route: "/agents/new",
    },
    {
      id: "email-template",
      title: "Email Template",
      image: emailTemplateImg,
      description:
        "The Email Template section helps you manage email templates for your communications. Create, edit, and reuse templates with dynamic variables.",
      features: [
        "Create and edit templates quickly",
        "Use dynamic variables like {{email}}",
        "Preview content before sending",
        "Organize templates by name",
      ],
      howToUse: [
        "Open 'Email Template' from sidebar",
        "Click Add Template and fill template details",
        "Save and reuse for automated communication",
      ],
      route: "/email-template",
    },
    {
      id: "whatsapp-send-message",
      title: "Send WhatsApp Message",
      image: whatsappSendImg,
      description:
        "This page enables individual or bulk WhatsApp messaging to contacts. You can use templates and monitor available messaging minutes.",
      features: [
        "Send individual or bulk WhatsApp messages",
        "Select ready templates for messages",
        "Upload Excel file for bulk contacts",
        "Choose country code and send instantly",
      ],
      howToUse: [
        "Navigate to 'Whatsapp Send Message'",
        "Select template and country code",
        "Add number/upload Excel and click Send Message",
      ],
      route: "/whatsapp-send-message",
    },
    {
      id: "whatsapp-logs",
      title: "WhatsApp Logs",
      image: whatsappLogImg,
      description:
        "The WhatsApp Logs page provides a detailed record of all messages sent through the platform. Track delivery status and communication history.",
      features: [
        "View sender/recipient details",
        "Track message status and timestamps",
        "Filter logs by status",
        "Monitor campaign performance",
      ],
      howToUse: [
        "Open 'Whatsapp Logs' from sidebar",
        "Use filters to check delivery status",
        "Review history to identify performance issues",
      ],
      route: "/whatsapp-logs",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="space-y-5">
          <p className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Digital Marketing + AI Training
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            1. What You Will Learn in This Training Program
          </h1>
          <p className="max-w-5xl text-lg text-slate-600 leading-relaxed">
            This training program is designed to transform beginners into job-ready digital professionals.
            By the end of this course, you will not only understand digital marketing concepts but also learn
            how to apply AI tools to automate and scale real-world business tasks.
          </p>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-3">You will learn:</h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700">
              <li>How digital marketing works in real businesses</li>
              <li>How to generate leads, sales, and traffic</li>
              <li>How to use AI tools to automate marketing tasks</li>
              <li>How to create and manage AI-powered agents</li>
              <li>How to handle real client work and projects</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Career Outcome:</h2>
            <p className="text-slate-700 mb-2">
              If you complete this training seriously, you will be able to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700">
              <li>Work as a freelancer</li>
              <li>Get a digital marketing job</li>
              <li>Start your own online business</li>
              <li>Offer AI automation services</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-300 bg-[#f7f0dc] p-6 shadow-[0_14px_30px_rgba(120,95,45,0.12)]">
            <p className="text-xs tracking-[0.35em] text-amber-900/70 uppercase mb-2">Index</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-2 [font-family:Georgia,Times_New_Roman,serif]">
              2. Table of Contents
            </h2>
            <p className="text-slate-700 mb-6 text-lg [font-family:Georgia,Times_New_Roman,serif]">
              This course is structured step-by-step like a complete guide:
            </p>

            <div className="space-y-3 [font-family:Georgia,Times_New_Roman,serif]">
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">1.</span><span className="whitespace-nowrap">Introduction</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">2.</span><span className="whitespace-nowrap">Basics of Artificial Intelligence</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">3.</span><span className="whitespace-nowrap">Understanding Generative AI</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">4.</span><span className="whitespace-nowrap">Introduction to Richa AI Platform</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">5.</span><span className="whitespace-nowrap">Features and Capabilities of Richa AI</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">6.</span><span className="whitespace-nowrap">Categories and Use Cases</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">7.</span><span className="whitespace-nowrap">Account Setup (Signup Process)</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">8.</span><span className="whitespace-nowrap">Creating Your First AI Agent</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">9.</span><span className="whitespace-nowrap">Two-Way Calling System</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
              <div className="flex items-end gap-3 text-slate-900"><span className="w-8 font-semibold">10.</span><span className="whitespace-nowrap">Complete Dashboard &amp; Button Explanation</span><span className="flex-1 border-b border-dotted border-slate-500/60 mb-1"></span></div>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              3. What is AI (Artificial Intelligence)?
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-4">
              Artificial Intelligence (AI) refers to machines or software that can think, learn, and make decisions like humans.
            </p>

            <p className="text-slate-800 font-semibold mb-2">Instead of manually doing tasks, AI can:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 mb-5">
              <li>Analyze data</li>
              <li>Understand language</li>
              <li>Automate processes</li>
              <li>Provide smart responses</li>
            </ul>

            <p className="text-slate-800 font-semibold mb-2">Example:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700 mb-5">
              <li>Chatbots answering customer questions</li>
              <li>AI tools writing content</li>
              <li>Voice assistants handling calls</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              4. What is Richa AI (Generative AI)?
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-5">
              Richa AI is a Generative AI platform that allows users to create smart AI agents capable of performing tasks automatically.
            </p>

            <h3 className="text-2xl font-bold text-slate-900 mb-2">What is Generative AI?</h3>
            <p className="text-slate-800 font-semibold mb-2">Generative AI is a type of AI that can:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700">
              <li>Generate text</li>
              <li>Create responses</li>
              <li>Simulate human conversation</li>
              <li>Produce content automatically</li>
            </ul>

          </div>

          <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50 p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              5. What Richa AI Can Do
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-4">
              Richa AI is designed to handle multiple business tasks without human effort.
            </p>

            <div className="rounded-2xl border border-teal-200 bg-white/80 p-5 shadow-sm">
              <p className="text-slate-900 font-bold text-xl mb-4">Key Capabilities:</p>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
                  <p className="text-slate-900 font-semibold text-lg">📞 Handle customer calls automatically</p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-cyan-50 px-4 py-3">
                  <p className="text-slate-900 font-semibold text-lg">💬 Respond to queries like a human</p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-sky-50 px-4 py-3">
                  <p className="text-slate-900 font-semibold text-lg">🧠 Understand user intent</p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-blue-50 px-4 py-3">
                  <p className="text-slate-900 font-semibold text-lg">📊 Collect and manage leads</p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-indigo-50 px-4 py-3">
                  <p className="text-slate-900 font-semibold text-lg">📅 Book appointments</p>
                </div>
                <div className="rounded-xl border border-teal-100 bg-purple-50 px-4 py-3">
                  <p className="text-slate-900 font-semibold text-lg">🔁 Automate repetitive tasks</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-rose-50 to-orange-50 p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              6. Which Categories It Is Used In
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-5">
              Richa AI can be used across multiple industries:
            </p>

            <div className="my-5 h-px bg-gradient-to-r from-transparent via-fuchsia-300 to-transparent" />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-fuchsia-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Business &amp; Sales</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Lead generation</li>
                  <li>Customer follow-ups</li>
                  <li>Sales automation</li>
                  <li>Deal pipeline updates</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-rose-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Customer Support</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Answering queries</li>
                  <li>Complaint handling</li>
                  <li>Support automation</li>
                  <li>Ticket pre-classification</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-orange-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Marketing</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Campaign management</li>
                  <li>Engagement automation</li>
                  <li>Funnel optimization</li>
                  <li>Auto follow-up messaging</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-violet-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Education</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Student interaction</li>
                  <li>Course guidance</li>
                  <li>Admission support</li>
                  <li>FAQ automation</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-emerald-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Healthcare</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Appointment booking</li>
                  <li>Patient queries</li>
                  <li>Reminder notifications</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-sky-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Real Estate</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Property inquiry handling</li>
                  <li>Lead qualification</li>
                  <li>Site visit scheduling</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-indigo-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 E-commerce</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Order status replies</li>
                  <li>Cart recovery messaging</li>
                  <li>Post-purchase support</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-pink-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Finance &amp; Insurance</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Policy/service assistance</li>
                  <li>Payment reminders</li>
                  <li>Document follow-ups</li>
                </ul>
              </div>

              <div className="rounded-xl border border-fuchsia-200 bg-white p-4 shadow-sm border-l-4 border-l-amber-500">
                <p className="text-lg font-bold text-slate-900 mb-2">🔹 Travel &amp; Hospitality</p>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  <li>Booking inquiries</li>
                  <li>Itinerary assistance</li>
                  <li>Customer service automation</li>
                </ul>
              </div>
            </div>

            <div className="my-5 h-px bg-gradient-to-r from-transparent via-fuchsia-300 to-transparent" />

            <p className="text-slate-700">
              Through these categories, Richa AI supports faster communication, better lead conversion,
              and continuous customer engagement across industries.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              7. Signup Process
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-4">
              To start using Richa AI, you need to create an account.
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-sm">
                <img
                  src="/dist/assets/richa_signup.png"
                  alt="Richa AI Signup Screenshot"
                  className="w-full rounded-lg border border-slate-200"
                />
                <div className="mt-3 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800">
                  Signup link:{" "}
                  <a
                    href="/login?tab=signup"
                    className="font-semibold underline hover:text-blue-900"
                  >
                    /login?tab=signup
                  </a>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
                <p className="text-slate-900 font-bold text-xl mb-3">Steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>Visit the platform website.</li>
                  <li>Click on <span className="font-semibold">Sign Up</span>.</li>
                  <li>Enter your details:</li>
                </ol>
                <ul className="mt-2 ml-5 list-disc space-y-1 text-slate-700">
                  <li>Name</li>
                  <li>Email</li>
                  <li>Password</li>
                  <li>Contact No</li>
                </ul>
                <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-700" start={4}>
                  <li>Verify your email.</li>
                  <li>Login to your dashboard.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-indigo-50 to-sky-50 p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              8. Create Agent
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-4">
              An AI Agent is your automated assistant.
            </p>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="rounded-xl border border-violet-200 bg-white p-4 shadow-sm">
                <img
                  src={createAgentV1Image}
                  alt="Create Agent screen"
                  className="w-full rounded-lg border border-slate-200"
                />
              </div>

              <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm">
                <p className="text-slate-900 font-bold text-xl mb-3">Steps to Create an Agent:</p>
                <ol className="list-decimal list-inside space-y-2 text-slate-700">
                  <li>Go to Dashboard.</li>
                  <li>Click on Create Agent.</li>
                  <li>Enter agent details:</li>
                </ol>
                <ul className="mt-2 ml-5 list-disc space-y-1 text-slate-700">
                  <li>Agent Name</li>
                  <li>Welcome message</li>
                  <li>Faq content</li>
                </ul>
                <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-700" start={4}>
                  <li>Add instructions (what the agent should do).</li>
                  <li>Save and go to two way call section.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 shadow-sm">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
              9. Two-Way Calls
            </h2>
            <p className="text-slate-700 text-lg leading-relaxed mb-4">
              Two-way calling allows the AI agent to talk and listen like a human on a phone call.
            </p>

            <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm mb-6">
              <p className="text-slate-900 font-bold text-xl mb-3">Features:</p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700">
                <li>AI can call customers</li>
                <li>Customers can respond</li>
                <li>AI understands replies</li>
                <li>Conversation flows naturally</li>
              </ul>
              <p className="mt-4 text-slate-800">
                <span className="font-semibold">Example:</span> AI calls a customer → explains offer → answers questions → books appointment
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Use Created Agent via "Need Assistance?"</h3>
                <p className="text-slate-700 mb-3">
                  If you want to call directly with an already created agent, click the <span className="font-semibold">Need Assistance?</span> button.
                </p>
                <img
                  src={alreadyCreatedAgentImage}
                  alt="Need Assistance button for created agents"
                  className="w-full rounded-lg border border-slate-200"
                />
              </div>

              <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Use Your Own Created Agent Directly</h3>
                <p className="text-slate-700 mb-3">
                  If you have created your own agent, directly select it from the <span className="font-semibold">Agent</span> dropdown and start the call.
                </p>
                <img
                  src={ownCreatedAgentImage}
                  alt="Select own created agent in two-way call"
                  className="w-full rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>
        </header>


          {showSchedule && (
            <div
              id="schedule"
              ref={scheduleRef}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-semibold text-slate-900">Schedule a call</h2>
              <p className="mt-2 text-slate-600">
                Pick a date (no past days). Time is fixed at 10:00 AM.

              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Select date</label>
                  <input
                    type="date"
                    min={tomorrow}
                    value={selectedDate}
                    onChange={(e) => {
                      const selected = e.target.value;
                      // Ensure selected date is not before tomorrow
                      if (selected >= tomorrow) {
                        setSelectedDate(selected);
                      }
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Time</label>
                  <input
                    type="time"
                    value={FIXED_TIME}
                    disabled
                    className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
                  />

                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900">Selected:</span>{" "}
                    {selectedDate || "—"} at 10:00 AM

                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    We’ll ensure previous dates stay unavailable.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleScheduleSubmit}
                  disabled={isSubmittingSchedule || !selectedDate}
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingSchedule ? "Submitting..." : "Confirm Schedule"}
                </button>
              </div>
            </div>
          )}

        <section className="flex flex-col gap-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm w-full">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Tutorial Tabs Explanation</h2>
              <p className="text-gray-600">
                Same tutorial-style display as the Tutorial page with tab-wise explanation.
              </p>
            </div>

            <div className="space-y-8">
              {tutorialTabs.map((tutorial, index) => (
                <div
                  key={tutorial.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {index + 1}. {tutorial.title}
                      </h3>
                      <button
                        onClick={() => navigate(tutorial.route)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Try It Now
                      </button>
                    </div>

                    <div className="mb-6">
                      <img
                        src={tutorial.image}
                        alt={tutorial.title}
                        className="w-full rounded-lg border border-gray-300 shadow-sm"
                      />
                    </div>

                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                      {tutorial.description}
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-2">
                      <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                        <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                          <span className="mr-2">✨</span> Key Features
                        </h4>
                        <ul className="space-y-2 text-gray-700">
                          {tutorial.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-600 mr-2 mt-1">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                        <h4 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                          <span className="mr-2">📖</span> How to Use
                        </h4>
                        <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                          {tutorial.howToUse.map((step, idx) => (
                            <li key={idx} className="pl-2">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Richa AI Training Course Section */}
          {showRichaInfo && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm w-full">
              <div className="space-y-8 text-slate-700 leading-relaxed">
            

                {/* Pricing Plans of Richa AI */}
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Pricing Plans of Richa AI</h3>
                    <p className="text-slate-600">
                      Choose the plan that best fits your needs and unlock the power of AI for your business.
                    </p>
                  </div>
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          navigate(`/login?tab=signup&plan=${plan.id}`);
                        }}
                        className="group flex min-h-[280px] w-full flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left text-slate-900 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="text-lg font-semibold">{plan.title}</h4>
                          {plan.id !== 'queen' && plan.id !== 'king' && plan.id !== 'demo_call' ? null : (
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                              {plan.id === "queen"
                                ? "Best deal"
                                : plan.id === "king"
                                  ? "Popular"
                                  : plan.id === "demo_call"
                                    ? "Demo"
                                    : ""}
                            </span>
                          )}
                        </div>

                        {plan.subtitle && (
                          <p className="mt-1 text-sm text-slate-600">{plan.subtitle}</p>
                        )}

                        <div className="mt-4 flex items-baseline justify-between">
                          <div className="flex flex-col">
                            {plan.original && (
                              <span className="text-sm line-through text-slate-400">{plan.original}</span>
                            )}
                            <span className="text-2xl font-extrabold">{plan.price}</span>
                          </div>
                          {plan.price.includes("GST") ? null : (
                            <span className="text-sm text-slate-500">+GST</span>
                          )}
                        </div>

                        <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
                          <span className="h-2 w-2 rounded-full bg-indigo-500" />
                          <span>Unlock Benefits Pay Now!</span>
                        </div>
                        <div className="mt-auto">
                          <div className="inline-flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700">
                            Get started
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comparison: Richa AI vs Other AI Tools */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Comparison: Richa AI vs Other AI Tools</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-300 px-4 py-3 text-left text-sm font-semibold text-slate-900">Feature</th>
                          <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-indigo-900">Richa AI</th>
                          <th className="border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700">Other Tools</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900">Cost</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-indigo-700">Affordable for India</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-slate-600">Expensive subscriptions</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900">Ease of Use</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-indigo-700">Simple, beginner-friendly</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-slate-600">Complex interfaces</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900">Localization</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-indigo-700">Indian context & languages</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-slate-600">Limited localization</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-900">Learning Focus</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-indigo-700">Education & skill building</td>
                          <td className="border border-slate-300 px-4 py-3 text-sm text-center text-slate-600">General purpose</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Learning Richa AI – Course Modules */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Learning Richa AI – Course Modules</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200">
                      <h4 className="font-bold text-indigo-900 mb-3">📚 Module 1: Basics</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-indigo-700">
                        <li>Understanding AI fundamentals</li>
                        <li>Introduction to Richa AI platform</li>
                        <li>Setting up your account</li>
                        <li>Navigating the interface</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-purple-50 border border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-3">🖐️ Module 2: Hands-on Usage</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                        <li>Creating your first AI conversation</li>
                        <li>Using different features</li>
                        <li>Best practices and tips</li>
                        <li>Common use cases</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-green-50 border border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">💡 Module 3: Prompting Skills</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                        <li>Writing effective prompts</li>
                        <li>Getting better results</li>
                        <li>Advanced techniques</li>
                        <li>Optimizing outputs</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-orange-50 border border-orange-200">
                      <h4 className="font-bold text-orange-900 mb-3">🌍 Module 4: Real-world Applications</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-orange-700">
                        <li>Academic projects and assignments</li>
                        <li>Business and professional tasks</li>
                        <li>Creative content creation</li>
                        <li>Problem-solving scenarios</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Career Opportunities After Learning Richa AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Career Opportunities After Learning Richa AI</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">🤖 AI-Powered Roles</h4>
                      <p className="text-sm text-indigo-700">
                        AI Specialist, Prompt Engineer, AI Content Creator, AI Consultant roles in various industries
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">💼 Freelancing & Consulting</h4>
                      <p className="text-sm text-purple-700">
                        Offer AI services, content creation, and consulting to businesses as a freelancer
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <h4 className="font-bold text-green-900 mb-2">🚀 Entrepreneurship</h4>
                      <p className="text-sm text-green-700">
                        Start your own AI-powered business, create AI tools, or build AI-based solutions
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                      <h4 className="font-bold text-orange-900 mb-2">📈 Corporate Growth</h4>
                      <p className="text-sm text-orange-700">
                        Advance in your current role by leveraging AI skills, leading to promotions and better opportunities
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certification & Assessment */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Certification & Assessment</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-xl">
                      <h4 className="font-bold text-emerald-900 mb-2">🎓 Course Completion Certificate</h4>
                      <p className="text-sm text-slate-700">
                        Receive a recognized certificate upon completing the training program
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-xl">
                      <h4 className="font-bold text-emerald-900 mb-2">✅ Skill Validation</h4>
                      <p className="text-sm text-slate-700">
                        Validate your AI skills through assessments and practical exercises
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-xl">
                      <h4 className="font-bold text-emerald-900 mb-2">💼 Resume & LinkedIn Value</h4>
                      <p className="text-sm text-slate-700">
                        Add certification to your resume and LinkedIn profile to showcase your AI expertise
                      </p>
                    </div>
                  </div>
                </div>

                {/* Future of AI & Richa AI Roadmap */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Future of AI & Richa AI Roadmap</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200">
                      <h4 className="font-bold text-indigo-900 mb-3">🔮 AI Trends</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-indigo-700">
                        <li>AI becoming more integrated into daily life</li>
                        <li>Rising demand for AI-skilled professionals</li>
                        <li>New AI tools and capabilities emerging</li>
                        <li>AI transforming education and work</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-purple-50 border border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-3">🚀 Richa AI Vision</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                        <li>Expanding features and capabilities</li>
                        <li>Better localization for Indian users</li>
                        <li>Enhanced learning and training modules</li>
                        <li>Growing community and support</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-center font-semibold text-slate-900 bg-slate-50 p-4 rounded-xl">
                    Continuous learning is important - AI evolves rapidly, and staying updated ensures you remain competitive and relevant.
                  </p>
                </div>

                {/* Course Summary & Key Takeaways */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white">
                  <h3 className="text-3xl font-bold mb-4 text-center">Course Summary & Key Takeaways</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-semibold mb-2">What You Learned:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                        <li>Fundamentals of AI and Generative AI</li>
                        <li>Introduction to Richa AI platform and features</li>
                        <li>Practical use cases for students, professionals, and businesses</li>
                        <li>Career opportunities and future prospects</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Why Richa AI Matters:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                        <li>Affordable and accessible AI for everyone</li>
                        <li>Designed specifically for Indian users</li>
                        <li>Focus on education and skill development</li>
                        <li>Practical tool for real-world applications</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">Next Steps:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                        <li>Start using Richa AI for your daily tasks</li>
                        <li>Practice with different features and use cases</li>
                        <li>Complete the exam to get certified</li>
                        <li>Share your learning with others</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-8 rounded-2xl text-white text-center">
                  <h3 className="text-3xl font-bold mb-4">Ready to Start Your AI Journey?</h3>
                  <div className="space-y-4 mb-6">
                    <p className="text-lg">
                      Start using Richa AI today and transform how you learn, work, and create.
                    </p>
                    <p className="text-base font-semibold">
                      If you want to get the certificate, just pay Rs. {EXAM_FEE.toLocaleString("en-IN")}/-. After the examination, you will get your certificate.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <a
                        href="https://www.richa.infinitybrains.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
                      >
                        Visit: www.richa.infinitybrains.com
                      </a>
                      <button
                        type="button"
                        className="group relative px-8 py-4 text-base font-bold text-white rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                        onClick={handleStartExam}
                        disabled={isLoading}
                      >
                        {/* Animated background gradient */}
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        
                        {/* Content */}
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Processing Payment...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>Pay Rs. {EXAM_FEE.toLocaleString("en-IN")} & Start Exam</span>
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm opacity-90">
                    Enroll in advanced training programs and become an AI expert. The future belongs to those who learn AI today!
                  </p>
                </div>
              </div>
            </div>
          )}
          
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm w-full">
            <h2 className="text-2xl font-semibold text-slate-900">Exam Description</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              This exam covers core concepts, scenario-based questions, and practical
              reasoning to ensure you're ready for real-world challenges. You can
              start right away, or schedule a call to clarify topics before you begin.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed text-bold">
            once your passed exam your certificate will be generated and you will be sent you on email.
          </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartExam}
                disabled={isLoading}
              >
                {isLoading ? "Processing Payment..." : `Pay Rs. ${EXAM_FEE.toLocaleString("en-IN")} & Start Exam`}
              </button>
              <a
                href="#schedule"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSchedule(true);
                  scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Schedule a Query
              </a>
            </div>
          </div>
          {/* Exam Description Section */}
          
        </section>
      </div>

      {/* Schedule Success Popup Modal */}
      {showScheduleSuccess && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setShowScheduleSuccess(false)}
        >
          <div 
            className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto overflow-x-hidden mx-auto animate-pop-in"
          >
            {/* Decorative SVG Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Confetti/Stars */}
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 300 300">
                <circle cx="40" cy="40" r="2" fill="#3b82f6" opacity="0.6">
                  <animate attributeName="cy" values="40;25;40" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="260" cy="60" r="1.5" fill="#10b981" opacity="0.6">
                  <animate attributeName="cy" values="60;45;60" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="30" r="2" fill="#8b5cf6" opacity="0.6">
                  <animate attributeName="cy" values="30;15;30" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </svg>
              
              {/* Gradient Orbs */}
              <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full blur-2xl opacity-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-5 sm:p-6 md:p-8">
              {/* Close Button */}
              <button
                onClick={() => setShowScheduleSuccess(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors z-20"
                aria-label="Close"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Success Icon */}
              <div className="flex justify-center mb-3 sm:mb-4 mt-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full p-2 sm:p-3">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-slate-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                 Schedule Confirmed!
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl font-semibold text-center text-slate-700 mb-3">
                Your call has been scheduled successfully
              </p>

              {/* Schedule Details */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4 border border-indigo-200">
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-semibold">Date:</span>
                    <span>{scheduledDate ? new Date(scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold">Time:</span>
                    <span>{FIXED_TIME} AM</span>
                  </div>
                </div>
              </div>

              {/* Message */}
              <p className="text-xs sm:text-sm text-center text-slate-600 mb-4 px-2">
                We'll contact you at the scheduled time. Please check your email for confirmation details.
              </p>

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
                <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-indigo-300"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full"></div>
                <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-purple-300"></div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowScheduleSuccess(false)}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Got it
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
