import React, { useState } from 'react';
import axios from 'axios';
import api from '../api/axios';

export default function ResumeUpload() {
    const [file, setFile] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [resumeData, setResumeData] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setError('');
            setExtractedText('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setLoading(true);
        setError('');
        setExtractedText('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/ocr/extract', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            let responseText = response.data.text;
            let parsedData;

            try {
                // Check if response is an object (already parsed by axios)
                if (typeof responseText === 'object') {
                    parsedData = responseText;
                } else {
                    // It's a string, try to clean it if it has markdown code blocks
                    const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
                    parsedData = JSON.parse(cleanedText);
                }
            } catch (e) {
                console.warn('JSON Parse failed, falling back to raw text:', e);
                parsedData = null;
            }

            if (parsedData) {
                setResumeData(parsedData);
                setExtractedText(formatResumeToText(parsedData));
            } else {
                // Fallback to raw text if parsing fails completely
                setExtractedText(response.data.text);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.error || 'Failed to extract text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFile(null);
        setFileName('');
        setExtractedText('');
        setResumeData(null);
        setError('');
    };


    const handleSaveToSystem = async () => {
        if (!resumeData) return;

        // Flatten the data to match the backend Serializer expectations
        const payload = {
            ...resumeData.personal_info, // Spread personal_info fields to top level
            education: resumeData.education,
            skills: resumeData.skills,
            achievements: resumeData.achievements
        };

        try {
            // Use the authenticated 'api' instance instead of raw 'axios'
            // The baseURL is already set to http://127.0.0.1:8000 in api/axios.js
            const response = await api.post('/api/cv/save/', payload);
            alert('CV saved to system successfully! Person ID: ' + response.data.person_id);
        } catch (err) {
            console.error('Save error:', err);
            // Better error message handling
            let errorMessage = err.message;
            if (err.response && err.response.data) {
                if (err.response.data.details) {
                    errorMessage = JSON.stringify(err.response.data.details, null, 2);
                } else if (err.response.data.error) {
                    errorMessage = err.response.data.error;
                } else {
                    errorMessage = JSON.stringify(err.response.data, null, 2);
                }
            }
            alert('Failed to save CV:\n' + errorMessage);
        }
    };

    const formatResumeToText = (data) => {
        if (!data) return '';
        let text = '';

        // Personal Info
        if (data.personal_info) {
            text += 'Personal Information\n';
            const pi = data.personal_info;
            if (pi.first_name || pi.last_name) text += `Name: ${pi.first_name || ''} ${pi.last_name || ''}\n`;
            if (pi.email) text += `Email: ${pi.email}\n`;
            if (pi.phone) text += `Phone: ${pi.phone}\n`;
            if (pi.linkedin_url) text += `LinkedIn: ${pi.linkedin_url}\n`;
            if (pi.github_url) text += `GitHub: ${pi.github_url}\n`;
            if (pi.portfolio_url) text += `Portfolio: ${pi.portfolio_url}\n`;
            text += '\n';
        }

        // Education
        if (data.education && data.education.length > 0) {
            text += 'Education\n';
            data.education.forEach(edu => {
                if (edu.degree) text += `${edu.degree}\n`;
                if (edu.institution) text += `${edu.institution} (${edu.start_date || ''} - ${edu.end_date || ''})\n`;
                if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
                text += '\n';
            });
        }

        // Skills
        if (data.skills && data.skills.length > 0) {
            text += 'Skills\n';
            const categories = {};
            data.skills.forEach(skill => {
                const cat = skill.category || 'Other';
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(skill.name);
            });
            Object.keys(categories).forEach(cat => {
                text += `${cat}: ${categories[cat].join(', ')}\n`;
            });
            text += '\n';
        }

        // Achievements
        if (data.achievements && data.achievements.length > 0) {
            text += 'Achievements & Certifications\n';
            data.achievements.forEach(ach => {
                text += `• ${ach.title}`;
                if (ach.date) text += ` (${ach.date})`;
                text += '\n';
                if (ach.description) text += `  ${ach.description}\n`;
            });
        }

        return text;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Resume</h2>
                <p className="text-gray-600">Upload your CV to extract text using AI-powered OCR</p>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="space-y-6">
                    {/* File Input */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Select Resume (PDF or Image)
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="hidden"
                                id="resume-upload"
                            />
                            <label
                                htmlFor="resume-upload"
                                className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                            >
                                <div className="text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-600">
                                        {fileName || 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${loading || !file
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 shadow-lg'
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Extracting Text...
                                </span>
                            ) : (
                                'Extract Text'
                            )}
                        </button>

                        {(file || extractedText) && (
                            <button
                                onClick={handleClear}
                                className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-200"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm font-medium">❌ {error}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Extracted Text Display */}
            {extractedText && (
                <div className="bg-white rounded-xl shadow-lg p-8 animate-fadeIn">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Extracted Text</h3>
                        <button
                            onClick={() => navigator.clipboard.writeText(extractedText)}
                            className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                        >
                            📋 Copy to Clipboard
                        </button>
                        {resumeData && (
                            <button
                                onClick={handleSaveToSystem}
                                className="ml-4 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md"
                            >
                                💾 Save to System
                            </button>
                        )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto border border-gray-200">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                            {extractedText}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
