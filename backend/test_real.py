#!/usr/bin/env python
"""Test using the actual service - simpler test"""
import os
import sys
import django
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Create a simple PDF for testing
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Create temp PDF
temp_pdf = tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False)
c = canvas.Canvas(temp_pdf.name, pagesize=letter)
c.drawString(100, 750, "JOHN DOE")
c.drawString(100, 730, "Software Engineer")
c.drawString(100, 710, "Email: john@example.com | Phone: 123-456-7890")
c.drawString(100, 680, "EXPERIENCE")
c.drawString(100, 660, "Senior Engineer at Tech Corp (2020-2023)")
c.drawString(100, 640, "- Developed web applications using Python and React")
c.drawString(100, 620, "- Led team of 3 developers")
c.drawString(100, 600, "- Improved performance by 40%")
c.drawString(100, 570, "EDUCATION")
c.drawString(100, 550, "BS Computer Science, University (2018)")
c.drawString(100, 520, "SKILLS")
c.drawString(100, 500, "Python, JavaScript, React, Django, AWS")
c.save()

print(f"Created test PDF: {temp_pdf.name}")
print("="*60)

try:
    from candidates.ocr_service import MistralOCRService
    
    service = MistralOCRService()
    print("Testing analyze_resume method...")
    
    result = service.analyze_resume(temp_pdf.name, 'application/pdf')
    
    print("\n✓✓✓ SUCCESS! ✓✓✓\n")
    print("Analysis Results:")
    print(f"  Overall Score: {result['overall_score']}")
    print(f"  ATS Score: {result['ats_score']}")
    print(f"  Strengths ({len(result['strengths'])}):")
    for i, s in enumerate(result['strengths'][:3], 1):
        print(f"    {i}. {s}")
    print(f"  Weaknesses ({len(result['weaknesses'])}):")
    for i, w in enumerate(result['weaknesses'][:3], 1):
        print(f"    {i}. {w}")
    print(f"  Recommendations ({len(result['recommendations'])}):")
    for i, r in enumerate(result['recommendations'][:3], 1):
        print(f"    {i}. {r}")
    
    if result.get('improved_bullet_example'):
        print(f"\n  Example Improvement:")
        lines = result['improved_bullet_example'].split('\\n')
        for line in lines:
            print(f"    {line}")
    
except Exception as e:
    print(f"\n✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
finally:
    # Clean up
    os.remove(temp_pdf.name)
    print(f"\nCleaned up test file")
