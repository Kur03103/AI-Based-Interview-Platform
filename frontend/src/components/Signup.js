import React, { useState, forwardRef } from "react";
import api from "../api/axios";

const Signup = forwardRef(({ onSignup, onSwitchToLogin }, ref) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Interview signup fields
  const [interviewType, setInterviewType] = useState("technical");
  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [companyName, setCompanyName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!jobRole.trim()) {
      setError("Please enter your target job role");
      setLoading(false);
      return;
    }

    try {
      // Register user first
      await onSignup({
        username,
        email,
        name: name || undefined,
        age: age ? parseInt(age) : undefined,
        password,
        confirm_password: confirmPassword,
      });

      // Get access token and create interview signup
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          await api.post('/api/interview/signup/', {
            interview_type: interviewType,
            job_role: jobRole,
            experience_level: experienceLevel,
            company_name: companyName || undefined,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Interview signup created successfully");
        } catch (interviewError) {
          console.error("Interview signup error (non-blocking):", interviewError);
          // Non-blocking error - user is registered even if interview signup fails
        }
      }
    } catch (err) {
      console.error("Signup error", err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        console.log("Signup error data:", data);
        let msg = "";
        if (typeof data === "object") {
          msg = Object.entries(data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
        } else {
          msg = String(data);
        }
        setError(msg || "Registration failed.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form ref={ref} onSubmit={handleSignup} className="space-y-6 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl mx-auto">
      <div>
        <label
          htmlFor="signup-username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Username
        </label>
        <input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      <div>
        <label
          htmlFor="signup-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Full Name (Optional)
        </label>
        <input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      <div>
        <label
          htmlFor="signup-age"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Age (Optional)
        </label>
        <input
          id="signup-age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="25"
          min="1"
          max="120"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      <div>
        <label
          htmlFor="signup-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      <div>
        <label
          htmlFor="signup-confirm-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Confirm Password
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      {/* Interview Signup Section */}
      <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Interview Preferences
          </h3>
        </div>

        <div>
          <label
            htmlFor="signup-job-role"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Target Job Role (Required)
          </label>
          <input
            id="signup-job-role"
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="e.g., Software Engineer, Data Scientist"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
          />
        </div>

        <div>
          <label
            htmlFor="signup-interview-type"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Interview Type
          </label>
          <select
            id="signup-interview-type"
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
          >
            <option value="technical">Technical Interview</option>
            <option value="behavioral">Behavioral Interview</option>
            <option value="both">Both Technical & Behavioral</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="signup-experience-level"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Experience Level
          </label>
          <select
            id="signup-experience-level"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
          >
            <option value="fresher">Fresher</option>
            <option value="junior">Junior (1-3 years)</option>
            <option value="mid">Mid-Level (3-5 years)</option>
            <option value="senior">Senior (5+ years)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="signup-company-name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Company Name (Optional)
          </label>
          <input
            id="signup-company-name"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g., Google, Microsoft"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-500 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 duration-200 shadow-lg hover:shadow-2xl focus:ring-4 focus:ring-green-200"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>

      <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition duration-200"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
});

Signup.displayName = "Signup";
export default Signup;
