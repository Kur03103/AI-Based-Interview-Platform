"""
Job Recommendation Service
Uses the trained ML model to provide job recommendations and predictions
"""

import pickle
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import os

class RecommendationService:
    """Service to handle job recommendations and resume analysis"""
    
    def __init__(self):
        # Get the path to the dataset folder
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.dataset_path = os.path.join(base_dir, 'dataset')
        
        # Load the final model
        self.model = self._load_model()
        
    def _load_model(self):
        """Load the trained model and related data"""
        try:
            model_path = os.path.join(self.dataset_path, 'final_model.pkl')
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            print("✓ Recommendation model loaded successfully")
            return model_data
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return None
    
    def get_job_recommendations(self, candidate_skills, top_n=5):
        """
        Get job recommendations based on candidate skills
        
        Parameters:
        - candidate_skills: str, candidate's skills text
        - top_n: int, number of recommendations to return
        
        Returns:
        - list of dict: job recommendations with details
        """
        if not self.model:
            return []
        
        try:
            # Extract components from model
            tfidf_skills = self.model['tfidf_skills']
            job_skills_matrix = self.model['job_skills_matrix']
            job_profiles = self.model['job_profiles']
            
            # Clean and preprocess skills
            candidate_skills = self._clean_text(candidate_skills)
            
            # Transform candidate skills
            candidate_vector = tfidf_skills.transform([candidate_skills])
            
            # Calculate cosine similarity with all jobs
            similarities = cosine_similarity(candidate_vector, job_skills_matrix)[0]
            
            # Get top N jobs
            top_indices = similarities.argsort()[-top_n:][::-1]
            
            recommendations = []
            for idx in top_indices:
                job = job_profiles.iloc[idx]
                match_score = float(similarities[idx])
                
                # Only include if match score is reasonable
                if match_score > 0.01:  # Minimum threshold
                    # Handle column names with BOM character
                    job_title = job.get('job_position_name', job.get('﻿job_position_name', 'N/A'))
                    recommendations.append({
                        'job_title': job_title,
                        'match_score': round(match_score * 100, 2),
                        'required_skills': job.get('skills_required_cleaned', 'N/A'),
                        'responsibilities': job.get('responsibilities', 'N/A')[:200] + '...' if job.get('responsibilities', 'N/A') != 'N/A' else 'N/A',
                        'education_required': job.get('educationaL_requirements', 'N/A'),
                        'experience_required': job.get('experiencere_requirement', 'N/A')
                    })
            
            return recommendations
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return []
    
    def analyze_resume_quality(self, resume_text):
        """
        Analyze resume and provide match category prediction
        
        Parameters:
        - resume_text: str, full resume text
        
        Returns:
        - dict: analysis results
        """
        if not self.model:
            return {
                'match_category': 'Unknown',
                'confidence': 0,
                'probabilities': {},
                'score': 0
            }
        
        try:
            # Extract components from model
            rf_model = self.model['model']
            tfidf_skills = self.model['tfidf_skills']
            tfidf_responsibilities = self.model['tfidf_responsibilities']
            le = self.model['label_encoder']
            
            # Clean text
            resume_text = self._clean_text(resume_text)
            
            # Transform resume text using both transformers
            skills_vector = tfidf_skills.transform([resume_text])
            resp_vector = tfidf_responsibilities.transform([resume_text])
            
            # Combine features (must match training dimensions)
            from scipy.sparse import hstack
            feature_vector = hstack([skills_vector, resp_vector])
            
            # Verify dimensions match
            expected_features = rf_model.n_features_in_
            if feature_vector.shape[1] != expected_features:
                print(f"Warning: Feature dimension mismatch. Expected {expected_features}, got {feature_vector.shape[1]}")
                return {
                    'match_category': 'Unknown',
                    'confidence': 0,
                    'probabilities': {},
                    'score': 0,
                    'quality_assessment': 'Unable to analyze - feature dimension mismatch'
                }
            
            # Predict match category
            prediction = rf_model.predict(feature_vector)[0]
            prediction_proba = rf_model.predict_proba(feature_vector)[0]
            
            # Verify prediction is within bounds
            if prediction >= len(le.classes_):
                print(f"Warning: Prediction index {prediction} out of bounds for {len(le.classes_)} classes")
                prediction = len(le.classes_) - 1
            
            # Get the predicted category
            predicted_category = le.inverse_transform([prediction])[0]
            
            # Create probabilities dictionary - only for valid classes
            num_probs = min(len(prediction_proba), len(le.classes_))
            probabilities = {
                le.classes_[i]: round(float(prediction_proba[i]) * 100, 2)
                for i in range(num_probs)
            }
            
            # Calculate overall score
            score = round(max(prediction_proba) * 100, 2)
            
            return {
                'match_category': predicted_category,
                'confidence': score,
                'probabilities': probabilities,
                'score': score,
                'quality_assessment': self._get_quality_message(predicted_category, score)
            }
        except Exception as e:
            print(f"Error analyzing resume: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'match_category': 'Unknown',
                'confidence': 0,
                'probabilities': {},
                'score': 0,
                'quality_assessment': 'Unable to analyze resume quality'
            }
    
    def get_skill_insights(self, candidate_skills):
        """
        Get insights about candidate skills
        
        Parameters:
        - candidate_skills: str, candidate's skills text
        
        Returns:
        - dict: skill insights
        """
        if not self.model:
            return {}
        
        try:
            # Extract feature names
            feature_names = self.model['tfidf_skills'].get_feature_names_out()
            
            # Transform skills
            skills_vector = self.model['tfidf_skills'].transform([candidate_skills])
            
            # Get top skills
            skills_array = skills_vector.toarray()[0]
            top_indices = skills_array.argsort()[-10:][::-1]
            
            top_skills = []
            for idx in top_indices:
                if skills_array[idx] > 0:
                    top_skills.append({
                        'skill': feature_names[idx],
                        'relevance': round(float(skills_array[idx]), 3)
                    })
            
            return {
                'top_skills': top_skills,
                'total_skills_identified': len([s for s in skills_array if s > 0])
            }
        except Exception as e:
            print(f"Error getting skill insights: {str(e)}")
            return {}
    
    def _clean_text(self, text):
        """Clean and normalize text data"""
        import re
        if not text or text == 'N/A':
            return ''
        text = str(text).lower()
        text = re.sub(r'[^\w\s,]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _get_quality_message(self, category, score):
        """Get quality assessment message based on category"""
        messages = {
            'Excellent': f'Outstanding resume quality! Your profile shows {score}% match with top opportunities.',
            'High': f'Strong resume! You have a {score}% compatibility with available positions.',
            'Medium': f'Good foundation. Your resume shows {score}% match - consider highlighting more relevant skills.',
            'Low': f'Room for improvement. Current match is {score}% - focus on adding more relevant skills and experience.'
        }
        return messages.get(category, f'Resume quality score: {score}%')

# Singleton instance
_recommendation_service = None

def get_recommendation_service():
    """Get or create the recommendation service instance"""
    global _recommendation_service
    if _recommendation_service is None:
        _recommendation_service = RecommendationService()
    return _recommendation_service
