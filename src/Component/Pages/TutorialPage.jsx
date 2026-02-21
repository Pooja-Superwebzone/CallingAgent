import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

// Import tutorial images
import callLogsImg from "../../assets/tabs/call_logs.png";
import createAgentImg from "../../assets/tabs/create_agent.png";
import emailTemplateImg from "../../assets/tabs/how_email_template_work.png";
import whatsappSendImg from "../../assets/tabs/how_whatshapp_message_send.png";
import whatsappLogImg from "../../assets/tabs/whatshapp_log.png";

const TutorialPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!Cookies.get("CallingAgent");

  const tutorials = [
    {
      id: "call-logs",
      title: "Call Logs",
      image: callLogsImg,
      description: `
        The Call Logs page provides a comprehensive view of all call records made by your AI sales agent. 
        This section helps you track and monitor call activity.
      `,
      features: [
        "View all call records in a structured table format",
        "See recipient phone numbers with country codes",
        "Monitor call status and duration for each call",
        "Check timestamps to track when calls were made",
        "Use the 'View' button to see detailed information about specific calls",
        "Navigate through multiple pages using pagination controls (Prev/Next buttons)",
        "Access historical call data - the system shows 'Showing 1 to 10 of [total]' entries"
      ],
      howToUse: [
        "Navigate to 'Call log' from the Dashboard sidebar",
        "The page displays a table with columns: Sr No, To (phone number), Status, Duration (s), Time, and Action",
        "Click the 'View' button next to any call entry to see more details",
        "Use the pagination controls at the bottom to browse through multiple pages of call logs",
        "All call logs are sorted by time, with the most recent calls appearing first"
      ],
      route: "/call-logs"
    },
    {
      id: "create-agent",
      title: "Create Agent",
      image: createAgentImg,
      description: `
        The Create Agent page allows you to build and configure new AI sales agents. 
        Each agent can be customized with specific messaging and behavior patterns.
      `,
      features: [
        "Create new AI sales agents with custom names",
        "Set a welcome message that the agent will use when initiating conversations",
        "Configure the agent's body content using a rich text editor",
        "Use formatting tools including Bold, Italic, and text alignment options",
        "Undo/Redo functionality for easy content editing",
        "Save agents for future use in your sales campaigns"
      ],
      howToUse: [
        "Navigate to 'Agents' from the Dashboard sidebar, then click to create a new agent",
        "Enter a unique name for your agent in the 'Name' field",
        "Write a welcome message that will be used when the agent first contacts prospects",
        "Use the rich text editor to create the main body content for your agent",
        "Apply formatting as needed using the toolbar (Bold, Italic, Alignment, etc.)",
        "Click 'Save' to create the agent, or 'Cancel' to discard changes",
        "After saving, you can use this agent in your calling and messaging campaigns"
      ],
      route: "/agents/new"
    },
    {
      id: "email-template",
      title: "Email Template",
      image: emailTemplateImg,
      description: `
        The Email Template section helps you manage email templates for your sales communications. 
        Create, edit, and reuse professional email templates with dynamic variables.
      `,
      features: [
        "View all existing email templates in a list format",
        "Create new email templates with custom names, subjects, and body content",
        "Edit existing templates to update content",
        "Use dynamic variables like {{email}} for personalization",
        "Preview template content before sending",
        "Organize templates by name for easy identification"
      ],
      howToUse: [
        "Navigate to 'Email Template' from the Dashboard sidebar",
        "Click the 'Add Template' button to create a new email template",
        "In the modal dialog, enter a template name (e.g., 'Parag Shah')",
        "Enter the email subject line",
        "Write the email body content in the body field",
        "Use variables like {{email}} to personalize messages dynamically",
        "Click 'Save' to create the template, or 'Cancel' to close without saving",
        "Click on any existing template name to view and edit its content",
        "Use the edit icon next to template content to modify existing templates"
      ],
      route: "/email-template"
    },
    {
      id: "whatsapp-send-message",
      title: "Send WhatsApp Message",
      image: whatsappSendImg,
      description: `
        The Send WhatsApp Message page enables you to send individual or bulk WhatsApp messages to your contacts. 
        You can use templates and track your remaining messaging minutes.
      `,
      features: [
        "Send WhatsApp messages to individual contacts or bulk recipients",
        "View remaining minutes for Two-way and International messaging",
        "Select from pre-configured message templates",
        "Choose country codes for international messaging",
        "Upload Excel files for bulk messaging",
        "Download Excel template for proper formatting"
      ],
      howToUse: [
        "Navigate to 'Whatsapp Send Message' from the Dashboard sidebar",
        "Check your 'Remaining Minutes' displayed at the top (Two-way and International)",
        "For bulk messaging: Click 'Download Excel' to get a template, fill it with contacts, then click 'Upload Excel'",
        "For individual messaging: Select a template from the 'Template' dropdown",
        "Choose the appropriate country code from the dropdown (e.g., 'India (+91)')",
        "Enter the recipient's phone number in the mobile number field",
        "Click 'Send Message' to send, or 'Clear' to reset the form",
        "Monitor your message delivery through the WhatsApp Logs page"
      ],
      route: "/whatsapp-send-message"
    },
    {
      id: "whatsapp-logs",
      title: "WhatsApp Logs",
      image: whatsappLogImg,
      description: `
        The WhatsApp Logs page provides a detailed record of all WhatsApp messages sent through the platform. 
        Track message delivery status and monitor communication history.
      `,
      features: [
        "View comprehensive logs of all WhatsApp messages",
        "See sender and recipient information for each message",
        "Monitor message delivery status (Delivered, Read, Sent, Undelivered)",
        "Track timestamps for all message events",
        "Filter logs by status using the 'All Statuses' dropdown",
        "Scroll through historical message data"
      ],
      howToUse: [
        "Navigate to 'Whatsapp Logs' from the Dashboard sidebar",
        "The page displays a table with columns: Sr No, From (sender), To (recipient), Status, and Time",
        "Use the 'All Statuses' dropdown in the top right to filter messages by delivery status",
        "Review message statuses to understand delivery success rates",
        "Check timestamps to see when messages were sent and received",
        "Scroll through the table to view historical message logs",
        "Use this information to track campaign performance and identify any delivery issues"
      ],
      route: "/whatsapp-logs"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate("/sendcall");
                  } else {
                    navigate("/");
                  }
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-fuchsia-500 text-white font-bold">
                  AI
                </div>
                <span className="text-lg font-semibold">Richa AI</span>
              </div>
            </div>
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/login?tab=login")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/login?tab=signup")}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                >
                  Signup
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Tutorial</h1>
          <p className="text-gray-600">
            Learn how to use each feature of the Richa AI Sales Agent Dashboard
          </p>
        </div>

      <div className="space-y-12">
        {tutorials.map((tutorial, index) => (
          <div
            key={tutorial.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {index + 1}. {tutorial.title}
                </h2>
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

              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                  {tutorial.description}
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <span className="mr-2">✨</span> Key Features
                    </h3>
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
                    <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                      <span className="mr-2">📖</span> How to Use
                    </h3>
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
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">
          💡 Pro Tips
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li>
            • Use templates consistently across Email and WhatsApp to maintain brand voice
          </li>
          <li>
            • Regularly check your Call Logs and WhatsApp Logs to monitor campaign performance
          </li>
          <li>
            • Create multiple agents with different messaging styles to test what works best
          </li>
          <li>
            • Keep track of your remaining minutes to plan your messaging campaigns effectively
          </li>
          <li>
            • Use the status filters in WhatsApp Logs to quickly identify any delivery issues
          </li>
        </ul>
      </div>

      {/* Call to Action */}
      {!isAuthenticated && (
        <div className="mt-12 p-6 bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-lg text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Ready to Get Started?</h3>
          <p className="mb-6 text-indigo-100">
            Sign up now to start using Richa AI Sales Agent and automate your sales process
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate("/login?tab=signup")}
              className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate("/login?tab=login")}
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition"
            >
              Login
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TutorialPage;
