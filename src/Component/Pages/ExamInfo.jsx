import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import service from "../../api/axios";
import Cookies from "js-cookie";
import dashboardImage from "../../assets/dashboard.png";

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
    price: "₹5,999/-",
    original: "Rs. 9,999/-",
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
  const [showRichaInfo, setShowRichaInfo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [showScheduleSuccess, setShowScheduleSuccess] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);
  const FIXED_TIME = "10:00";

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

  // Handle Start Exam button click - login and navigate
  const handleStartExam = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      // Call login API with email and static password (email is already cleaned)
      const response = await service.post("login", {
        email: email,
        password: "12345678"
      });

      // Store authentication data in cookies and localStorage
      if (response.data) {
        const data = response.data;
        
        if (data.token) {
          // Store in cookies (existing functionality)
          Cookies.set("CallingAgent", data.token, {
            expires: 365,
            secure: true,
            sameSite: "Strict",
          });
          
          // Store in localStorage as ibcrmtoken for ibcrm API calls
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

        // Navigate to exam page with email parameter (email is already cleaned)
        navigate(`/exam-start?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="space-y-3">
          <p className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Exam & Query Scheduling
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Prepare with confidence — pick your exam flow and get help fast.
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            Review the exam description, start immediately, or schedule a 1:1 call.
            Choose a date (no past days) and we’ll lock in a perfect 10:00 AM slot for you.
          </p>
        
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
          {/* Richa AI Training Course Section */}
          {showRichaInfo && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm w-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
                    Richa AI – Complete Generative AI Training Program
                  </h2>
                  <p className="text-xl font-bold text-indigo-600">Learn AI the Smart Way</p>
                  <p className="text-sm text-slate-500 mt-1">Powered by Infinity Brains | www.richa.infinitybrains.com</p>
                </div>
                <button
                  onClick={() => setShowRichaInfo(false)}
                  className="text-slate-400 hover:text-slate-600 transition"
                  aria-label="Close Richa information"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Richa Dashboard Image */}
              <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-lg">
                <img
                  src={dashboardImage}
                  alt="Richa AI Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="space-y-8 text-slate-700 leading-relaxed">
                {/* Course Overview */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Course Overview</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">What This Training Covers:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        <li>Understanding AI and Generative AI fundamentals</li>
                        <li>Introduction to Richa AI platform</li>
                        <li>Practical use cases and applications</li>
                        <li>Hands-on learning and skill development</li>
                        <li>Career opportunities and future prospects</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">Who Should Attend:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                        <li>College & university students</li>
                        <li>Working professionals (IT, marketing, HR, operations)</li>
                        <li>Educators & trainers</li>
                        <li>Business owners & freelancers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* What is AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">What is Artificial Intelligence (AI)?</h3>
                  <p className="mb-3">
                    Artificial Intelligence (AI) is technology that enables machines to learn, think, and make decisions like humans. It's the science of making computers smart enough to perform tasks that typically require human intelligence.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl mb-3">
                    <h4 className="font-semibold text-slate-900 mb-2">Examples of AI in Daily Life:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                      <li>Google Maps navigation and route optimization</li>
                      <li>Netflix recommendations based on your preferences</li>
                      <li>Chatbots on websites for customer support</li>
                      <li>Voice assistants like Siri, Alexa, and Google Assistant</li>
                      <li>Email spam filters and auto-correct features</li>
                    </ul>
                  </div>
                  <p className="font-semibold text-slate-900">
                    AI vs Human Intelligence: AI complements human capabilities by processing vast amounts of data quickly, while humans provide creativity, empathy, and strategic thinking.
                  </p>
                </div>

                {/* Evolution of AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Evolution of AI</h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-2">Traditional Software</h4>
                      <p className="text-sm text-blue-700">
                        Rule-based programs following fixed instructions
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">Machine Learning</h4>
                      <p className="text-sm text-indigo-700">
                        Systems that learn from data and improve over time
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">Deep Learning</h4>
                      <p className="text-sm text-purple-700">
                        Neural networks that mimic the human brain
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <h4 className="font-bold text-green-900 mb-2">Generative AI</h4>
                      <p className="text-sm text-green-700">
                        AI that creates new content - text, images, videos, code
                      </p>
                    </div>
                  </div>
                </div>

                {/* What is Generative AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">What is Generative AI?</h3>
                  <p className="mb-3">
                    Generative AI is a type of artificial intelligence that can create new, original content rather than just analyzing or processing existing data. It generates text, images, videos, code, and more based on patterns it has learned.
                  </p>
                  <div className="bg-slate-50 p-4 rounded-xl mb-3">
                    <h4 className="font-semibold text-slate-900 mb-2">Types of Generation:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                      <li><strong>Text Generation:</strong> Articles, emails, stories, code</li>
                      <li><strong>Image Generation:</strong> Art, designs, photos</li>
                      <li><strong>Video Generation:</strong> Animated content, presentations</li>
                      <li><strong>Code Generation:</strong> Programming code, scripts</li>
                    </ul>
                  </div>
                  <p className="mb-3">
                    <strong>Popular Examples:</strong> ChatGPT (text), DALL·E (images), Midjourney (art), GitHub Copilot (code)
                  </p>
                </div>

                {/* Introduction to Richa AI */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Introduction to Richa AI</h3>
                  <div className="space-y-3">
                    <p className="mb-3">
                      <strong>What is Richa AI:</strong> Richa AI is a comprehensive generative AI platform designed specifically for Indian users and businesses. It's an intelligent assistant that helps with learning, productivity, content creation, and business growth.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-xl">
                        <h4 className="font-semibold text-indigo-900 mb-2">Vision & Purpose</h4>
                        <p className="text-sm text-slate-700">
                          To make advanced AI accessible, affordable, and practical for everyone - from students to entrepreneurs
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-xl">
                        <h4 className="font-semibold text-purple-900 mb-2">Built for India</h4>
                        <p className="text-sm text-slate-700">
                          Designed with Indian context, languages, and business needs in mind. Localized solutions for local challenges
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Richa AI Was Created */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Richa AI Was Created</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                      <h4 className="font-bold text-red-900 mb-2">Problems with Existing AI Tools</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                        <li>High costs and subscription fees</li>
                        <li>Language barriers and limited localization</li>
                        <li>Complex interfaces difficult for beginners</li>
                        <li>Limited focus on practical learning</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <h4 className="font-bold text-green-900 mb-2">How Richa AI Solves Them</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                        <li>Affordable pricing for Indian market</li>
                        <li>Multi-language support and Indian context</li>
                        <li>Simple, user-friendly interface</li>
                        <li>Focus on education and skill development</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* How Richa AI Works */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">How Richa AI Works</h3>
                  <div className="bg-slate-50 p-6 rounded-xl mb-4">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="font-semibold text-indigo-600">Input</p>
                        <p className="text-sm text-slate-600 mt-1">Your question or request</p>
                      </div>
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="font-semibold text-purple-600">AI Processing</p>
                        <p className="text-sm text-slate-600 mt-1">Advanced algorithms analyze</p>
                      </div>
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <div className="text-center p-4 bg-white rounded-lg">
                        <p className="font-semibold text-green-600">Output</p>
                        <p className="text-sm text-slate-600 mt-1">Intelligent response</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 text-center">
                      <strong>Data Security & Reliability:</strong> Your data is processed securely with privacy protection. Richa AI uses reliable infrastructure to ensure consistent performance.
                    </p>
                  </div>
                </div>

                {/* Key Features of Richa AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Key Features of Richa AI</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">💬 Conversational AI</h4>
                      <p className="text-sm text-indigo-700">
                        Natural language conversations for learning, problem-solving, and assistance
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">✍️ Content Creation</h4>
                      <p className="text-sm text-purple-700">
                        Generate articles, emails, social media posts, and creative content
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <h4 className="font-bold text-green-900 mb-2">📚 Learning & Productivity</h4>
                      <p className="text-sm text-green-700">
                        Study assistance, research help, and productivity tools for students and professionals
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                      <h4 className="font-bold text-orange-900 mb-2">💼 Business & Career</h4>
                      <p className="text-sm text-orange-700">
                        Business strategy, marketing ideas, career guidance, and professional development
                      </p>
                    </div>
                  </div>
                </div>

                {/* Use Cases of Richa AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Use Cases of Richa AI</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-blue-50 border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3">👨‍🎓 For Students</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                        <li>Homework help and study assistance</li>
                        <li>Essay and assignment writing</li>
                        <li>Exam preparation and practice</li>
                        <li>Research and information gathering</li>
                        <li>Learning new concepts and subjects</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200">
                      <h4 className="font-bold text-indigo-900 mb-3">💼 For Working Professionals</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-indigo-700">
                        <li>Email drafting and communication</li>
                        <li>Report writing and documentation</li>
                        <li>Data analysis and insights</li>
                        <li>Presentation creation</li>
                        <li>Skill development and upskilling</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-purple-50 border border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-3">👩‍🏫 For Teachers & Trainers</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                        <li>Lesson plan creation</li>
                        <li>Educational content development</li>
                        <li>Assessment and quiz generation</li>
                        <li>Student feedback and evaluation</li>
                        <li>Teaching material preparation</li>
                      </ul>
                    </div>
                    <div className="p-5 rounded-xl bg-green-50 border border-green-200">
                      <h4 className="font-bold text-green-900 mb-3">🚀 For Entrepreneurs & Startups</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                        <li>Business plan development</li>
                        <li>Marketing content creation</li>
                        <li>Customer communication</li>
                        <li>Market research and analysis</li>
                        <li>Productivity and automation</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Why Students Should Learn Richa AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Students Should Learn Richa AI</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">🎯 Skill Development</h4>
                      <p className="text-sm text-indigo-700">
                        Build future-ready skills that employers value. AI literacy is becoming essential in every field.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">💼 Career Readiness</h4>
                      <p className="text-sm text-purple-700">
                        Stand out in job applications. AI skills give you a competitive edge in the job market.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <h4 className="font-bold text-green-900 mb-2">⚡ Productivity Improvement</h4>
                      <p className="text-sm text-green-700">
                        Complete assignments faster, learn more effectively, and manage time better with AI assistance.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                      <h4 className="font-bold text-orange-900 mb-2">🔮 Future Job Relevance</h4>
                      <p className="text-sm text-orange-700">
                        AI is transforming industries. Learning AI now prepares you for tomorrow's job market.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Why Working Professionals Need Richa AI */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Why Working Professionals Need Richa AI</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-2">⏱️ Time-Saving</h4>
                      <p className="text-sm text-blue-700">
                        Automate repetitive tasks, draft emails faster, and focus on high-value work that matters.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">🧠 Smart Decision-Making</h4>
                      <p className="text-sm text-indigo-700">
                        Get data-driven insights and analysis to make better business decisions quickly.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">📈 Upskilling & Reskilling</h4>
                      <p className="text-sm text-purple-700">
                        Stay relevant in your career by learning AI tools and adapting to technological changes.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <h4 className="font-bold text-green-900 mb-2">🏆 Competitive Advantage</h4>
                      <p className="text-sm text-green-700">
                        Use AI to outperform competitors, deliver better results, and advance your career faster.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Richa AI for Businesses & Startups */}
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Richa AI for Businesses & Startups</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                      <h4 className="font-bold text-indigo-900 mb-2">📢 Marketing & Content</h4>
                      <p className="text-sm text-indigo-700">
                        Create engaging social media posts, blog articles, and marketing campaigns without hiring expensive agencies.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                      <h4 className="font-bold text-purple-900 mb-2">💬 Customer Support</h4>
                      <p className="text-sm text-purple-700">
                        Provide 24/7 customer assistance, answer queries instantly, and improve customer satisfaction.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                      <h4 className="font-bold text-green-900 mb-2">⚙️ Operations & Automation</h4>
                      <p className="text-sm text-green-700">
                        Automate routine tasks, streamline workflows, and reduce manual work for your team.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                      <h4 className="font-bold text-orange-900 mb-2">💰 Cost Efficiency</h4>
                      <p className="text-sm text-orange-700">
                        Reduce operational costs, minimize hiring needs, and maximize ROI with AI-powered solutions.
                      </p>
                    </div>
                  </div>
                </div>

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
                              <span>Logging in...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>Start Exam</span>
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
              {/* <button
                type="button"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleStartExam}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Start Exam"}
              </button> */}
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
              {!showRichaInfo && (
                <button
                  onClick={() => setShowRichaInfo(true)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                >
                  View Richa Information
                </button>
              )}
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

