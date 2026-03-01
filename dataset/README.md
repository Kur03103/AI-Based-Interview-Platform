# Job Recommendation System - Dataset Module

## Overview

This module contains the trained machine learning model for job recommendations based on resume analysis. The system analyzes candidate skills and matches them with appropriate job positions.

## Files Created

### Model Files

- **`final_model.pkl`** (4.4 MB) - Main model file containing:
  - Random Forest Classifier
  - TF-IDF vectorizers for skills and responsibilities
  - Label encoder for match categories
  - Job profiles data
  - Job-skill matrix
  - Model metadata and training information

### Data Files

- **`job_profiles.csv`** - 28 unique job profiles with requirements
- **`feature_info.json`** - Feature names and label classes for reference
- **`resume_data.csv`** - Original training dataset (9,544 records)

### Analytics Visualizations (in `Images/` folder)

1. **`1_top_skills_distribution.png`** - Top 20 most demanded skills across all resumes
2. **`2_match_score_distribution.png`** - Distribution of match scores and categories
3. **`3_education_experience_analysis.png`** - Education degrees and experience level analysis
4. **`4_confusion_matrix.png`** - Model performance confusion matrix
5. **`5_job_positions_analysis.png`** - Top job positions and skills-score correlation

### Helper Scripts

- **`main.py`** - Training pipeline (data cleaning, preprocessing, training, analytics)
- **`use_model.py`** - Example usage and integration guide

## Model Performance

- **Model Type**: Random Forest Classifier (100 trees)
- **Test Accuracy**: 58.15%
- **Training Accuracy**: 66.84%
- **Total Features**: 200 (TF-IDF vectors)
- **Job Positions**: 28 unique positions
- **Match Categories**: Low, Medium, High, Excellent

## How to Use in Your Backend

### 1. Load the Model

```python
import pickle

# Load the final model
with open('dataset/final_model.pkl', 'rb') as f:
    model_data = pickle.load(f)

# Access components
rf_model = model_data['model']
tfidf_skills = model_data['tfidf_skills']
job_profiles = model_data['job_profiles']
job_skills_matrix = model_data['job_skills_matrix']
metadata = model_data['metadata']
```

### 2. Get Job Recommendations

```python
from sklearn.metrics.pairwise import cosine_similarity

def recommend_jobs(candidate_skills, top_n=5):
    """
    Get job recommendations for a candidate

    Args:
        candidate_skills (str): Candidate's skills (comma or space separated)
        top_n (int): Number of recommendations to return

    Returns:
        list: Job recommendations with match scores
    """
    # Transform candidate skills
    candidate_vector = model_data['tfidf_skills'].transform([candidate_skills.lower()])

    # Calculate similarity
    similarities = cosine_similarity(candidate_vector, model_data['job_skills_matrix'])[0]

    # Get top matches
    top_indices = similarities.argsort()[-top_n:][::-1]

    recommendations = []
    for idx in top_indices:
        job = model_data['job_profiles'].iloc[idx]
        recommendations.append({
            'job_title': job['﻿job_position_name'],
            'match_score': round(float(similarities[idx]) * 100, 2),
            'required_skills': job['skills_required_cleaned'],
            'education': job['educationaL_requirements'],
            'experience': job['experiencere_requirement']
        })

    return recommendations
```

### 3. Example Django Integration

```python
# In your Django views.py or API endpoint

from rest_framework.decorators import api_view
from rest_framework.response import Response
import pickle

# Load model once at startup
MODEL_PATH = 'dataset/final_model.pkl'
with open(MODEL_PATH, 'rb') as f:
    MODEL_DATA = pickle.load(f)

@api_view(['POST'])
def get_recommendations(request):
    """
    API endpoint to get job recommendations

    POST data:
    {
        "skills": "Python, Machine Learning, TensorFlow, Data Analysis"
    }
    """
    candidate_skills = request.data.get('skills', '')

    if not candidate_skills:
        return Response({'error': 'Skills are required'}, status=400)

    # Get recommendations
    recommendations = recommend_jobs(candidate_skills, MODEL_DATA, top_n=10)

    return Response({
        'candidate_skills': candidate_skills,
        'recommendations': recommendations,
        'total': len(recommendations)
    })

@api_view(['GET'])
def get_analytics(request):
    """
    API endpoint to get analytics visualizations

    Returns list of available analytics images
    """
    import os

    images_path = 'dataset/Images'
    images = []

    for filename in os.listdir(images_path):
        if filename.endswith('.png'):
            images.append({
                'name': filename,
                'path': f'/media/analytics/{filename}',
                'title': filename.replace('_', ' ').replace('.png', '').title()
            })

    return Response({'analytics': images})
```

### 4. Integration Steps

1. **Copy Model to Backend**:

   ```bash
   cp dataset/final_model.pkl backend/
   cp -r dataset/Images backend/media/analytics/
   ```

2. **Install Dependencies**:

   ```bash
   pip install scikit-learn==1.3.0
   pip install pandas numpy
   ```

3. **Create Django View**:
   - Add the recommendation function to your views
   - Create API endpoints for recommendations and analytics

4. **Frontend Integration**:
   - Call the API endpoint with candidate skills
   - Display recommendations with match scores
   - Show analytics visualizations in dashboard

## API Response Example

```json
{
  "candidate_skills": "Python, Machine Learning, Deep Learning",
  "recommendations": [
    {
      "job_title": "AI Engineer",
      "match_score": 14.77,
      "required_skills": "python, tensorflow, pytorch, machine learning, deep learning",
      "education": "Bachelor's or Master's in Computer Science",
      "experience": "2-5 years"
    },
    {
      "job_title": "Data Engineer",
      "match_score": 12.85,
      "required_skills": "python, sql, big data, etl, data analytics",
      "education": "Bachelor's in Computer Science",
      "experience": "5-8 years"
    }
  ],
  "total": 2
}
```

## Retraining the Model

To retrain with new data:

```bash
cd dataset
python main.py
```

This will:

1. Clean and preprocess the data
2. Extract TF-IDF features
3. Train Random Forest model
4. Generate 5 analytics visualizations
5. Save everything to `final_model.pkl`

## Analytics Insights

The visualizations provide:

- **Skills Analysis**: Most in-demand skills in the job market
- **Match Distribution**: How candidates score across different categories
- **Education Trends**: Popular degrees and experience levels
- **Model Performance**: Confusion matrix showing prediction accuracy
- **Job Insights**: Top positions and skill-score relationships

## Available Job Positions

The model can recommend from 28 job positions including:

- AI Engineer
- Machine Learning Engineer
- Data Engineer
- Data Scientist
- Software Engineer
- iOS Developer
- DevOps Engineer
- Database Administrator
- Business Analyst
- And 19 more...

## Notes

- Match scores are percentages (0-100%)
- Scores > 50% indicate strong matches
- Scores 20-50% indicate partial matches
- Scores < 20% indicate weak matches
- The model uses TF-IDF cosine similarity for matching

## Support

For questions or issues, refer to:

- `use_model.py` - Complete usage examples
- `main.py` - Training pipeline details
- Model metadata in `final_model.pkl`
