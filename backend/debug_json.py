#!/usr/bin/env python
"""Debug JSON parsing issue"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from candidates.ocr_service import MistralOCRService, RESUME_ANALYSIS_PROMPT
import requests
import json
import re

service = MistralOCRService()

sample_text = """
John Doe
Email: john.doe@example.com | Phone: (123) 456-7890

EXPERIENCE
Senior Software Engineer | Tech Corp | 2020-2023
- Developed scalable web applications using React and Python Django
- Led team of 3 developers on critical projects
- Improved system performance by 40% through optimization

EDUCATION
Bachelor of Science in Computer Science | University Name | 2018
GPA: 3.8/4.0

SKILLS
Languages: Python, JavaScript, TypeScript, SQL
"""

chat_payload = {
    "model": "mistral-large-latest",
    "messages": [
        {"role": "system", "content": RESUME_ANALYSIS_PROMPT},
        {"role": "user", "content": sample_text}
    ],
    "temperature": 0.3
}

print("Sending request to Mistral...")
response = requests.post(
    service.chat_url,
    headers=service.headers,
    json=chat_payload,
    timeout=60
)

if response.ok:
    chat_data = response.json()
    analysis_text = chat_data['choices'][0]['message']['content']
    
    print(f"Original length: {len(analysis_text)}")
    
    # Show hex dump around position 2112
    if len(analysis_text) > 2112:
        start = max(0, 2112 - 50)
        end = min(len(analysis_text), 2112 + 50)
        snippet = analysis_text[start:end]
        print(f"\nSnippet around char 2112:")
        print(repr(snippet))
        print("\nHex representation:")
        print(snippet.encode('unicode_escape').decode('utf-8'))
    
    # Apply cleaning steps
    print("\n" + "="*60)
    print("Step 1: Remove markdown blocks")
    if '```json' in analysis_text:
        cleaned = analysis_text.split('```json')[1].split('```')[0].strip()
    elif '```' in analysis_text:
        cleaned = analysis_text.split('```')[1].split('```')[0].strip()
    else:
        cleaned = analysis_text
    
    print(f"Length after markdown removal: {len(cleaned)}")
    
    print("\nStep 2: Remove control characters")
    cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', cleaned)
    print(f"Length after control char removal: {len(cleaned)}")
    
    print("\nStep 3: Parse JSON")
    try:
        data = json.loads(cleaned)
        print("✓ SUCCESS! JSON parsed")
        print(f"\nKeys: {list(data.keys())}")
        print(f"Overall Score: {data.get('overall_score')}")
        print(f"ATS Score: {data.get('ats_score')}")
    except json.JSONDecodeError as e:
        print(f"✗ Still failed: {e}")
        print(f"\nError at position {e.pos}")
        if e.pos < len(cleaned):
            start = max(0, e.pos - 100)
            end = min(len(cleaned), e.pos + 100)
            print("\nContext around error:")
            print(repr(cleaned[start:end]))
            print(f"\nProblematic char: {repr(cleaned[e.pos])}")
            print(f"Hex: {ord(cleaned[e.pos]):02x}")
