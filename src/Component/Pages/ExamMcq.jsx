import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import service from "../../api/axios";

export default function ExamMcq() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [resultMessage, setResultMessage] = useState(null);
  const [marks, setMarks] = useState(null);
  const [totalMarks, setTotalMarks] = useState(null);
  const [showCongratsPopup, setShowCongratsPopup] = useState(false);
  
  // Get email from URL parameter
  const email = useMemo(() => {
    const emailParam = searchParams.get("email");
    if (!emailParam) return null;
    return emailParam.replace(/^["']|["']$/g, "").trim();
  }, [searchParams]);
  
  // Get name from localStorage (stored during login)
  const userName = localStorage.getItem("userName") || "";

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // The token will be automatically added by axios interceptor from localStorage (ibcrmtoken) or cookies
        const response = await service.get("questions");
        
        console.log("Questions API Response:", response.data);
        
        if (response.data) {
          // Transform API response to match component format
          // API format: { question, option_a, option_b, option_c, option_d, correct_answer (or similar) }
          const apiQuestions = Array.isArray(response.data.data) 
            ? response.data.data 
            : Array.isArray(response.data) 
            ? response.data 
            : [];
          
          const transformedQuestions = apiQuestions
            .filter((q) => q && q.question) // Filter out invalid questions
            .map((q) => {
              // Build options array from option_a, option_b, option_c, option_d
              const options = [];
              if (q.option_a) options.push(q.option_a);
              if (q.option_b) options.push(q.option_b);
              if (q.option_c) options.push(q.option_c);
              if (q.option_d) options.push(q.option_d);
              
              // Determine correct answer index
              let correctIndex = 0;
              
              // Check for correct_answer field (could be "a", "b", "c", "d" or index)
              if (q.correct_answer !== undefined && q.correct_answer !== null) {
                const correctAnswer = String(q.correct_answer).toLowerCase().trim();
                
                // If it's a letter (a, b, c, d)
                if (correctAnswer === 'a' || correctAnswer === 'option_a') {
                  correctIndex = 0;
                } else if (correctAnswer === 'b' || correctAnswer === 'option_b') {
                  correctIndex = 1;
                } else if (correctAnswer === 'c' || correctAnswer === 'option_c') {
                  correctIndex = 2;
                } else if (correctAnswer === 'd' || correctAnswer === 'option_d') {
                  correctIndex = 3;
                } else {
                  // Try to find the correct answer text in options
                  const index = options.findIndex(opt => 
                    opt && (opt.toLowerCase() === correctAnswer || 
                           opt.toLowerCase().includes(correctAnswer) ||
                           correctAnswer.includes(opt.toLowerCase()))
                  );
                  if (index >= 0) {
                    correctIndex = index;
                  } else {
                    // Try parsing as number
                    const numIndex = parseInt(correctAnswer);
                    if (!isNaN(numIndex) && numIndex >= 0 && numIndex < options.length) {
                      correctIndex = numIndex;
                    }
                  }
                }
              } else if (q.correct_answer_index !== undefined && q.correct_answer_index !== null) {
                correctIndex = parseInt(q.correct_answer_index) || 0;
              } else if (q.correct !== undefined && q.correct !== null) {
                correctIndex = parseInt(q.correct) || 0;
              }
              
              // Ensure correctIndex is within bounds
              if (correctIndex < 0 || correctIndex >= options.length) {
                correctIndex = 0;
              }
              
              return {
                q: q.question || "",
                a: options,
                correct: correctIndex,
                id: q.id || null
              };
            });
          
          console.log("Transformed Questions:", transformedQuestions);
          
          if (transformedQuestions.length === 0) {
            setError("No questions available. Please contact support.");
          } else {
            setQuestions(transformedQuestions);
          }
        }
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setError(err.response?.data?.message || "Failed to load questions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const score = useMemo(() => {
    return questions.reduce((acc, q, idx) => {
      return acc + (answers[idx] === q.correct ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const handleSelect = (idx, choice) => {
    if (submitted || submitting) return;
    setAnswers((prev) => ({ ...prev, [idx]: choice }));
  };

  // Convert answer index to letter (0 -> "a", 1 -> "b", etc.)
  const getAnswerLetter = (index) => {
    const letters = ["a", "b", "c", "d"];
    return letters[index] || "a";
  };

  // Handle submit exam
  const handleSubmitExam = async () => {
    // Validate all questions are answered
    const unansweredQuestions = questions.filter((q, idx) => answers[idx] === undefined);
    
    if (unansweredQuestions.length > 0) {
      alert(`Please answer all questions. ${unansweredQuestions.length} question(s) remaining.`);
      return;
    }

    setSubmitting(true);
    setSubmittedCount(0);
    setResultMessage(null);

    try {
      // Submit each answer one by one
      for (let idx = 0; idx < questions.length; idx++) {
        const question = questions[idx];
        const answerIndex = answers[idx];
        const answerLetter = getAnswerLetter(answerIndex);

        if (question.id) {
          try {
            // Call answer API for each question
            await service.post(`answer/${question.id}`, {
              user_answer: answerLetter
            });
            
            // Update counter
            setSubmittedCount(idx + 1);
          } catch (err) {
            console.error(`Failed to submit answer for question ${idx + 1}:`, err);
            // Continue with other questions even if one fails
          }
        }
      }

      // After all answers submitted, call generate-marks API
      try {
        const marksResponse = await service.post("generate-marks");
        
        if (marksResponse.data) {
          const responseData = marksResponse.data;
          
          // Extract marks and total marks
          const obtainedMarks = responseData.marks || responseData.obtained_marks || responseData.score || null;
          const totalMarksValue = responseData.total_marks || responseData.total || questions.length || null;
          
          setMarks(obtainedMarks);
          setTotalMarks(totalMarksValue);

          // Set result message
          setResultMessage(responseData.message || "Exam submitted successfully!");
          
          if (responseData.message == "Congratulations! You are passed.") {
            try {
              await service.post("send-certificate", {
                email: email,
                name: userName
              });
              console.log("Send certificate API called successfully");
              // Show congratulations popup
              setShowCongratsPopup(true);
            } catch (certErr) {
              console.error("Failed to call send-certificate API:", certErr);
              // Still show popup even if API fails
              setShowCongratsPopup(true);
            }
          }
        }
      } catch (err) {
        console.error("Failed to generate marks:", err);
        setResultMessage(err.response?.data?.message || "Exam submitted, but failed to generate marks.");
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit exam:", err);
      setError(err.response?.data?.message || "Failed to submit exam. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-10">
        <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-10">
        <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-red-700">
              <p className="font-semibold mb-2">Error loading questions</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Congratulations Popup Modal */}
      {showCongratsPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-3 sm:p-4">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Decorative SVG Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Confetti/Stars */}
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 300 300">
                <circle cx="40" cy="40" r="2" fill="#fbbf24" opacity="0.6">
                  <animate attributeName="cy" values="40;25;40" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="260" cy="60" r="1.5" fill="#3b82f6" opacity="0.6">
                  <animate attributeName="cy" values="60;45;60" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="30" r="2" fill="#10b981" opacity="0.6">
                  <animate attributeName="cy" values="30;15;30" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="80" cy="100" r="1.5" fill="#f59e0b" opacity="0.6">
                  <animate attributeName="cy" values="100;85;100" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="220" cy="120" r="2" fill="#8b5cf6" opacity="0.6">
                  <animate attributeName="cy" values="120;105;120" dur="2.3s" repeatCount="indefinite" />
                </circle>
              </svg>
              
              {/* Gradient Orbs - Smaller */}
              <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-2xl opacity-20"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full blur-2xl opacity-20"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-5 sm:p-6 md:p-8">
              {/* Success Icon */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full p-2 sm:p-3">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-slate-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                🎉 Congratulations!
              </h2>
              
              <p className="text-base sm:text-lg md:text-xl font-semibold text-center text-slate-700 mb-3">
                You have successfully passed!
              </p>

              {/* Motivational Text */}
              <p className="text-xs sm:text-sm text-center text-slate-600 mb-4 px-2">
                Your certificate will be sent to your email shortly. Keep up the excellent work!
              </p>

              {/* Richa Image - Smaller */}
              <div className="flex justify-center mb-4 sm:mb-5">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                  <img 
                    src="/Richa.png" 
                    alt="Richa AI" 
                    className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-contain rounded-full border-3 sm:border-4 border-indigo-200 shadow-lg"
                  />
                </div>
              </div>

              {/* Marks Display */}
              {marks !== null && totalMarks !== null && (
                <div className="text-center mb-4 sm:mb-5">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-indigo-200">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      Score: {marks} / {totalMarks}
                    </span>
                  </div>
                </div>
              )}

              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-2 mb-4 sm:mb-5">
                <div className="h-px w-8 sm:w-12 bg-gradient-to-r from-transparent to-indigo-300"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full"></div>
                <div className="h-px w-8 sm:w-12 bg-gradient-to-l from-transparent to-purple-300"></div>
              </div>

              {/* Continue Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/")}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Continue
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <p className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            MCQ Exam
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">{questions.length} Questions</h1>
          <p className="text-slate-600">
            Select one answer per question. All questions are required. Submit to see your result.
          </p>
          
          {resultMessage && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700 text-sm">
              <p className="font-semibold mb-1">Result:</p>
              <p className="mb-2">{resultMessage}</p>
              {marks !== null && totalMarks !== null && (
                <p className="font-semibold text-emerald-800">
                  Marks: {marks} / {totalMarks}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <span className="mt-1 text-sm font-semibold text-indigo-700">{idx + 1}.</span>
                <p className="text-base font-medium text-slate-900">{q.q}</p>
              </div>
              {answers[idx] === undefined && !submitted && !submitting && (
                <p className="mt-2 text-xs text-red-600">* Required</p>
              )}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {q.a.map((choice, cIdx) => {
                  const selected = answers[idx] === cIdx;
                  const isDisabled = submitted || submitting;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleSelect(idx, cIdx)}
                      disabled={isDisabled}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                          : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300"
                      } ${submitted && q.correct === cIdx ? "ring-2 ring-emerald-300" : ""} ${
                        isDisabled ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleSubmitExam}
            disabled={submitting || submitted}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : submitted ? "Submitted" : "Submit Exam"}
          </button>
          {submitted && !submitting && (
            <div className="text-sm text-slate-600">
              Exam submitted successfully!
            </div>
          )}
        </div>
        {submitting && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 text-indigo-700 text-sm">
              <div className="flex items-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                <span>Submitting answers... {submittedCount} / {questions.length} ✓</span>
              </div>
            </div>
          )}

        {/* Result display at bottom */}
        {resultMessage && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-6 py-4 text-emerald-700">
            <p className="font-bold text-lg mb-2">Exam Result</p>
            <p className="mb-3">{resultMessage}</p>
            {marks !== null && totalMarks !== null && (
              <div className="mt-3 pt-3 border-t border-emerald-200">
                <p className="font-semibold text-emerald-800 text-base">
                  Your Score: {marks} / {totalMarks}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}

