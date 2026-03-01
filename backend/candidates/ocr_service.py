import os
import base64
import json
import re
import requests
from django.conf import settings


RESUME_EXTRACTION_PROMPT = """
Analyze the given OCR-extracted CV text and extract structured information.

RETURN ONLY A VALID JSON OBJECT. NO MARKDOWN, NO CODE BLOCKS, NO EXTRA TEXT.

The JSON structure must be exactly as follows:
{
    "personal_info": {
        "first_name": "string",
        "last_name": "string",
        "email": "string",
        "phone": "string",
        "linkedin_url": "string",
        "github_url": "string",
        "portfolio_url": "string"
    },
    "education": [
        {
            "degree": "string",
            "institution": "string",
            "start_date": "string",
            "end_date": "string",
            "gpa": "string"
        }
    ],
    "skills": [
        {
            "name": "string",
            "category": "string"
        }
    ],
    "achievements": [
        {
            "title": "string",
            "description": "string",
            "date": "string"
        }
    ]
}

RULES:
- Extract ONLY information present in the text.
- Split full name into first_name and last_name.
- If a field is missing, use null or empty string.
- For Education dates, try to extract Year or Month/Year.
- Categorize skills if possible (e.g. "Language", "Tool").
"""


RESUME_ANALYSIS_PROMPT = """
You are an expert resume analyst and career coach. Analyze the provided resume text and provide a comprehensive analysis.

CRITICAL: RETURN ONLY VALID JSON. NO MARKDOWN CODE BLOCKS. NO EXTRA TEXT.

When including newlines in string values (e.g., in improved_bullet_example), use escaped newlines (\\n) not literal newlines.

The JSON structure MUST be exactly as follows:
{
    "overall_score": 85,
    "ats_score": 78,
    "strengths": [
        "Strong technical skills in multiple programming languages",
        "Clear demonstration of project impact with metrics",
        "Relevant industry certifications"
    ],
    "weaknesses": [
        "Missing quantifiable achievements in some roles",
        "Limited leadership experience mentioned",
        "Skills section could be better organized"
    ],
    "analytics": {
        "keyword_density": "Good - includes relevant industry keywords and technical terms",
        "experience_depth": "Strong - demonstrates 5+ years of progressive experience",
        "skills_balance": "Moderate - good technical skills but soft skills could be more prominent"
    },
    "recommendations": [
        "Add quantifiable metrics to all work experiences (e.g., 'Improved system performance by 40%')",
        "Include more action verbs at the start of bullet points",
        "Add a summary section highlighting key achievements",
        "Reorganize skills by proficiency level or category"
    ],
    "improved_bullet_example": "Before: 'Worked on API development'\\nAfter: 'Architected and deployed RESTful APIs handling 10M+ daily requests, reducing response time by 35% and improving system reliability to 99.9% uptime'"
}

IMPORTANT: In the "improved_bullet_example" field, use \\n (escaped newline) to separate Before and After, NOT literal newlines.

SCORING CRITERIA:
- overall_score (0-100): Holistic assessment of resume quality
- ats_score (0-100): How well the resume will perform in Applicant Tracking Systems

ANALYSIS RULES:
1. Be specific and actionable in all feedback
2. Include 3-5 strengths and 3-5 weaknesses
3. Provide realistic scores based on content quality
4. Make recommendations practical and implementable
5. Use the improved_bullet_example to show concrete improvement
6. Consider format, content, keywords, achievements, and clarity

Analyze the following resume text:
"""


class MistralOCRService:
    """Service class for handling Mistral AI OCR and resume parsing"""
    
    def __init__(self):
        self.api_key = os.getenv('MISTRAL_KEY') or os.getenv('MISTRAL_API_KEY')
        if not self.api_key:
            raise ValueError("MISTRAL_KEY or MISTRAL_API_KEY not found in environment variables")
        
        self.ocr_url = "https://api.mistral.ai/v1/ocr"
        self.chat_url = "https://api.mistral.ai/v1/chat/completions"
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.api_key}'
        }
    
    def extract_text_from_document(self, file_path, mime_type):
        """
        Extract text from document using Mistral OCR
        
        Args:
            file_path: Path to the uploaded file
            mime_type: MIME type of the file (e.g., 'application/pdf', 'image/jpeg')
        
        Returns:
            Extracted text as a string
        """
        try:
            # Read file and encode to base64
            with open(file_path, 'rb') as file:
                file_content = file.read()
                base64_file = base64.b64encode(file_content).decode('utf-8')
            
            # Prepare OCR request
            ocr_payload = {
                "model": "mistral-ocr-latest",
                "document": {
                    "type": "document_url",
                    "document_url": f"data:{mime_type};base64,{base64_file}"
                }
            }
            
            # Call Mistral OCR API
            response = requests.post(
                self.ocr_url,
                headers=self.headers,
                json=ocr_payload,
                timeout=60
            )
            
            if not response.ok:
                raise Exception(f"Mistral OCR API Error: {response.status_code} - {response.text}")
            
            data = response.json()
            
            # Extract text from all pages
            extracted_text = ''
            if data.get('pages') and isinstance(data['pages'], list):
                extracted_text = '\n\n'.join(page.get('markdown', '') for page in data['pages'])
            else:
                # Fallback if structure is different
                extracted_text = json.dumps(data)
            
            return extracted_text
            
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    def parse_resume_text(self, extracted_text):
        """
        Parse extracted text using Mistral LLM to structure resume data
        
        Args:
            extracted_text: Raw text extracted from document
        
        Returns:
            Structured JSON data
        """
        try:
            # Prepare chat completion request
            chat_payload = {
                "model": "mistral-large-latest",
                "messages": [
                    {"role": "system", "content": RESUME_EXTRACTION_PROMPT},
                    {"role": "user", "content": extracted_text}
                ]
            }
            
            # Call Mistral Chat API
            response = requests.post(
                self.chat_url,
                headers=self.headers,
                json=chat_payload,
                timeout=60
            )
            
            if not response.ok:
                raise Exception(f"Mistral Chat API Error: {response.status_code} - {response.text}")
            
            chat_data = response.json()
            parsed_text = chat_data['choices'][0]['message']['content']
            
            # Try to parse as JSON
            try:
                # Remove any markdown code blocks if present
                if '```json' in parsed_text:
                    parsed_text = parsed_text.split('```json')[1].split('```')[0].strip()
                elif '```' in parsed_text:
                    parsed_text = parsed_text.split('```')[1].split('```')[0].strip()
                
                structured_data = json.loads(parsed_text)
                return structured_data
            except json.JSONDecodeError:
                # Return raw text if JSON parsing fails
                return {"raw_text": parsed_text}
            
        except Exception as e:
            raise Exception(f"Resume parsing failed: {str(e)}")
    
    def process_resume(self, file_path, mime_type):
        """
        Complete pipeline: extract text and parse resume
        
        Args:
            file_path: Path to the uploaded file
            mime_type: MIME type of the file
        
        Returns:
            Structured resume data
        """
        # Step 1: Extract text using OCR
        extracted_text = self.extract_text_from_document(file_path, mime_type)
        
        # Step 2: Parse and structure the text
        structured_data = self.parse_resume_text(extracted_text)
        
        return structured_data
    
    def analyze_resume(self, file_path, mime_type):
        """
        Complete pipeline: extract text and analyze resume quality
        
        Args:
            file_path: Path to the uploaded file
            mime_type: MIME type of the file
        
        Returns:
            Analysis data with scores, strengths, weaknesses, and recommendations
        """
        try:
            # Step 1: Extract text using OCR
            extracted_text = self.extract_text_from_document(file_path, mime_type)
            
            # Step 2: Analyze the resume
            chat_payload = {
                "model": "mistral-large-latest",
                "messages": [
                    {"role": "system", "content": RESUME_ANALYSIS_PROMPT},
                    {"role": "user", "content": extracted_text}
                ],
                "temperature": 0.3  # Lower temperature for more consistent analysis
            }
            
            # Call Mistral Chat API
            response = requests.post(
                self.chat_url,
                headers=self.headers,
                json=chat_payload,
                timeout=60
            )
            
            if not response.ok:
                raise Exception(f"Mistral Chat API Error: {response.status_code} - {response.text}")
            
            chat_data = response.json()
            analysis_text = chat_data['choices'][0]['message']['content']
            
            # Parse the JSON response
            try:
                # Remove any markdown code blocks if present
                if '```json' in analysis_text:
                    analysis_text = analysis_text.split('```json')[1].split('```')[0].strip()
                elif '```' in analysis_text:
                    analysis_text = analysis_text.split('```')[1].split('```')[0].strip()
                
                # Remove control characters that break JSON parsing (keep newlines for now)
                analysis_text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', analysis_text)
                
                # Try parsing the JSON
                try:
                    analysis_data = json.loads(analysis_text)
                except json.JSONDecodeError as e:
                    # If parsing fails due to literal newlines, try to fix them
                    # This is a fallback in case the model doesn't follow instructions
                    if 'Invalid control character' in str(e) or 'line' in str(e):
                        # Use Python's string escaping to handle the text
                        # Encode and decode to properly escape special characters
                        import codecs
                        encoded = codecs.encode(analysis_text, 'unicode_escape').decode('ascii')
                        # Remove extra escaping that was added
                        encoded = encoded.replace('\\\\', '\\')
                        analysis_data = json.loads(encoded)
                    else:
                        raise
                
                # Validate required fields
                required_fields = ['overall_score', 'ats_score', 'strengths', 'weaknesses', 
                                 'analytics', 'recommendations', 'improved_bullet_example']
                for field in required_fields:
                    if field not in analysis_data:
                        raise ValueError(f"Missing required field: {field}")
                
                return analysis_data
                
            except (json.JSONDecodeError, ValueError) as e:
                # Return error with raw response for debugging
                raise Exception(f"Failed to parse analysis response: {str(e)}. Raw response: {analysis_text[:500]}")
            
        except Exception as e:
            raise Exception(f"Resume analysis failed: {str(e)}")
