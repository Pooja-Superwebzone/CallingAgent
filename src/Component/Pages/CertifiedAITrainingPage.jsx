import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signupTwillioUser } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import CountUp from "./CountUp";
import richaHero from "/Richa.png";

const plan = {
  id: "certified_ai_training",
  title: "Certified AI Training",
  subtitle: "Complete Generative AI Training Program",
  price: "₹5,999/-",
  original: "Rs. 9,999/-",
  link: "become-ai-certified-by-richa",
};

// Calculate discount percentage
const calculateDiscountPercentage = () => {
  const originalPrice = 9999;
  const currentPrice = 5999;
  const discount = originalPrice - currentPrice;
  const percentage = Math.round((discount / originalPrice) * 100);
  return percentage;
};

const discountPercentage = calculateDiscountPercentage();

const getStoredToken = (planId) => {
  if (typeof window === "undefined") return "";
  const planToken = localStorage.getItem(`plan_token_${planId}`) || "";
  const genericToken = localStorage.getItem("signup_token") || "";
  return planToken || genericToken || "";
};

export default function CertifiedAITrainingPage() {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    contact_no: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [storedToken, setStoredToken] = useState("");

  const getCookie = (name) => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  };

  const extractToken = (data) =>
    data?.token ||
    data?.access_token ||
    data?.jwt ||
    data?.api_token ||
    data?.data?.token ||
    data?.data?.access_token ||
    data?.data?.jwt ||
    data?.data?.api_token ||
    data?.data?.data?.token ||
    data?.data?.data?.jwt ||
    data?.data?.data?.api_token ||
    getCookie("token") ||
    getCookie("CallingAgent") ||
    "";

  useEffect(() => {
    setStoredToken(getStoredToken(plan.id));
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white font-bold">
              AI
            </div>
            <span className="text-lg font-semibold">Richa AI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/login?tab=login")}
              className="hidden sm:inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="hidden sm:inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Home
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <section className="grid items-center gap-12 py-8 md:grid-cols-2 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Certified AI Training Program
            </span>

            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Become{" "}
              <span className="bg-gradient-to-r from-indigo-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">
                AI Certified
              </span>{" "}
              with Richa AI
            </h1>

            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Master Generative AI with our comprehensive training program. Learn AI fundamentals, 
              practical applications, and get certified to advance your career.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  <CountUp to={10000000} duration={1800} suffix="+" />
                </div>
                <div className="text-xs text-slate-500">Calls handled</div>
              </div>
              <div className="border-l border-slate-200 h-12" />
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">
                  <CountUp to={4.9} decimals={1} duration={1400} />
                  <span className="ml-1 text-lg">/5</span>
                </div>
                <div className="text-xs text-slate-500">User rating</div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  {discountPercentage}% OFF
                </span>
                <span className="text-sm text-slate-600">
                  <span className="line-through text-slate-400">{plan.original}</span>{" "}
                  <span className="text-emerald-600 font-semibold">Save ₹4,000</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSignup(true)}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-fuchsia-200/60 transition hover:opacity-95"
              >
                Buy Now - {plan.price}
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-200 to-fuchsia-200 blur-2xl opacity-70" />
            <div className="relative rounded-2xl bg-slate-50/70 p-3 border border-slate-200">
              <img
                src={richaHero}
                alt="Richa AI assistant"
                className="h-96 w-full object-cover rounded-2xl shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* Plan Details */}
        <section className="py-12">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              What's Included in This Training
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
                <div className="text-3xl mb-3">📚</div>
                <h3 className="font-semibold text-gray-800 mb-2">Module 1: Basics</h3>
                <p className="text-sm text-gray-700">
                  Understanding AI fundamentals, Introduction to Richa AI platform, Setting up your account
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
                <div className="text-3xl mb-3">🖐️</div>
                <h3 className="font-semibold text-gray-800 mb-2">Module 2: Hands-on Usage</h3>
                <p className="text-sm text-gray-700">
                  Creating your first AI conversation, Using different features, Best practices and tips
                </p>
              </div>
              <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl p-5">
                <div className="text-3xl mb-3">💡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Module 3: Prompting Skills</h3>
                <p className="text-sm text-gray-700">
                  Writing effective prompts, Getting better results, Advanced techniques
                </p>
              </div>
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5">
                <div className="text-3xl mb-3">🌍</div>
                <h3 className="font-semibold text-gray-800 mb-2">Module 4: Real-world Applications</h3>
                <p className="text-sm text-gray-700">
                  Academic projects, Business tasks, Creative content creation, Problem-solving
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-fuchsia-50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Key Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 text-xl">✓</span>
                  <div>
                    <strong className="text-gray-800">Course Completion Certificate</strong>
                    <p className="text-sm text-gray-600">Get a recognized certificate upon completion</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 text-xl">✓</span>
                  <div>
                    <strong className="text-gray-800">Skill Validation</strong>
                    <p className="text-sm text-gray-600">Validate your AI skills through assessments</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 text-xl">✓</span>
                  <div>
                    <strong className="text-gray-800">Resume & LinkedIn Value</strong>
                    <p className="text-sm text-gray-600">Add certification to showcase your expertise</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-green-600 mr-2 text-xl">✓</span>
                  <div>
                    <strong className="text-gray-800">Career Opportunities</strong>
                    <p className="text-sm text-gray-600">Unlock AI-powered roles and freelancing opportunities</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold inline-block">
                  {discountPercentage}% OFF
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSignup(true)}
                className="rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-fuchsia-200/60 transition hover:opacity-95"
              >
                Enroll Now - {plan.price}
              </button>
            </div>
          </div>
        </section>

        {/* Who Should Attend */}
        <section className="py-12">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Who Should Attend This Training?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">👨‍🎓</div>
                <h3 className="font-semibold text-gray-800 mb-2">Students</h3>
                <p className="text-sm text-gray-600">
                  College & university students looking to build future-ready AI skills
                </p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="font-semibold text-gray-800 mb-2">Professionals</h3>
                <p className="text-sm text-gray-600">
                  Working professionals in IT, marketing, HR, operations seeking to upskill
                </p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">👩‍🏫</div>
                <h3 className="font-semibold text-gray-800 mb-2">Educators</h3>
                <p className="text-sm text-gray-600">
                  Teachers & trainers wanting to integrate AI into their teaching methods
                </p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="font-semibold text-gray-800 mb-2">Entrepreneurs</h3>
                <p className="text-sm text-gray-600">
                  Business owners & freelancers looking to leverage AI for growth
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Course Content */}
        <section className="py-12">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 rounded-3xl border border-slate-200 p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Complete Course Content
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Understanding AI & Generative AI</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    What is Artificial Intelligence (AI)?
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Evolution of AI: Traditional Software → Machine Learning → Deep Learning → Generative AI
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Types of Generative AI: Text, Image, Video, Code Generation
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Real-world examples: ChatGPT, DALL·E, Midjourney, GitHub Copilot
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Introduction to Richa AI</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    What is Richa AI and why it was created
                  </li>
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Key features: Conversational AI, Content Creation, Learning & Productivity
                  </li>
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    How Richa AI works: Input → Processing → Output
                  </li>
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Data security and reliability
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Practical Use Cases</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">For Students:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Homework help and study assistance</li>
                      <li>• Essay and assignment writing</li>
                      <li>• Exam preparation</li>
                      <li>• Research and information gathering</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">For Professionals:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Email drafting and communication</li>
                      <li>• Report writing and documentation</li>
                      <li>• Data analysis and insights</li>
                      <li>• Presentation creation</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Career Opportunities</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    AI-Powered Roles: AI Specialist, Prompt Engineer, AI Content Creator
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Freelancing & Consulting opportunities
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Entrepreneurship: Start your own AI-powered business
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Corporate Growth: Advance in your current role
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12">
          <div className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Become AI Certified?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of students and professionals learning AI with Richa AI
            </p>
            <div className="flex items-center justify-center gap-6 mb-8">
              <div>
                <div className="text-3xl font-bold">{plan.price}</div>
                <div className="text-sm opacity-80 line-through">{plan.original}</div>
              </div>
              <div className="text-2xl">→</div>
              <div>
                <div className="text-3xl font-bold">{discountPercentage}% OFF</div>
                <div className="text-sm opacity-80">Save ₹4,000 - Limited Time Offer</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="bg-white text-indigo-600 px-10 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-gray-100 transition"
            >
              Enroll Now - {plan.price}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-sm text-slate-600">
          <span>© {new Date().getFullYear()} Richa AI. All rights reserved.</span>
        </div>
      </footer>

      {/* Signup Modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-600">Sign up to continue</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{plan.title}</h3>
                <p className="text-sm text-slate-600">
                  {plan.subtitle || "Complete signup to proceed to payment."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSignup(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">Business Name</label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Contact No</label>
                <input
                  type="text"
                  value={formValues.contact_no}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) setFormValues((v) => ({ ...v, contact_no: value }));
                  }}
                  maxLength={10}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Enter contact number"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  value={formValues.password}
                  onChange={(e) => setFormValues((v) => ({ ...v, password: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                <input
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={(e) => setFormValues((v) => ({ ...v, confirmPassword: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Re-enter password"
                />
              </div>
              {signupError ? (
                <div className="text-sm text-rose-600 font-medium">{signupError}</div>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Price: <span className="font-semibold text-slate-900">{plan.price}</span>{" "}
                <span className="text-xs text-slate-500">(+GST)</span>
              </div>
              <button
                type="button"
                disabled={
                  submitting ||
                  !formValues.email ||
                  !formValues.name ||
                  !formValues.contact_no ||
                  formValues.contact_no.length !== 10 ||
                  !formValues.password ||
                  formValues.password !== formValues.confirmPassword
                }
                onClick={async () => {
                  try {
                    setSignupError("");
                    setSubmitting(true);
                    const payload = {
                      name: formValues.name,
                      email: formValues.email,
                      contact_no: formValues.contact_no,
                      password: formValues.password,
                      confirmPassword: formValues.confirmPassword,
                      minute: "10",
                    };

                    const data = await signupTwillioUser(payload);
                    const tokenRaw = extractToken(data);
                    const tokenFromStorage = storedToken || getStoredToken(plan.id);
                    const tokenToUse =
                      tokenRaw ||
                      tokenFromStorage ||
                      getCookie("token") ||
                      getCookie("CallingAgent");

                    if (!tokenToUse) {
                      console.warn("Token missing in signup response", data);
                      toast.error("Token missing from signup response");
                      setSubmitting(false);
                      return;
                    }

                    if (typeof window !== "undefined") {
                      localStorage.setItem("signup_token", tokenToUse);
                      localStorage.setItem(`plan_token_${plan.id}`, tokenToUse);
                      setStoredToken(tokenToUse);
                      document.cookie = `token=${encodeURIComponent(
                        tokenToUse
                      )}; path=/; max-age=31536000; SameSite=Strict`;
                      document.cookie = `CallingAgent=${encodeURIComponent(
                        tokenToUse
                      )}; path=/; max-age=31536000; SameSite=Strict`;
                    }
                    const url = new URL(`https://ibcrm.in/`);
                    url.searchParams.set("plan", plan.id);
                    url.searchParams.set("price", plan.price);
                    url.searchParams.set("planTitle", plan.title);
                    if (tokenToUse) url.searchParams.set("token", tokenToUse);
                    setTimeout(() => {
                      window.location.href = `https://ibcrm.in/${plan.link}?email="${formValues.email}"`;
                    }, 50);
                  } catch (err) {
                    const message = err?.message || "Signup failed. Please try again.";
                    setSignupError(message);
                    toast.error(message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Signup & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
