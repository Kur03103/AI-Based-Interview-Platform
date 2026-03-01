"""
Job Recommendation System - Training Pipeline
This file handles data cleaning, preprocessing, model training, analytics, and saving
"""

import pandas as pd
import numpy as np
import pickle
import json
import re
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

# Set style for visualizations
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (12, 8)

# Create Images directory if it doesn't exist
os.makedirs('Images', exist_ok=True)

# ============================================
# PHASE 1: DATA LOADING
# ============================================
print("=" * 60)
print("PHASE 1: DATA LOADING")
print("=" * 60)

# Load the resume dataset
df = pd.read_csv('resume_data.csv', encoding='utf-8')
print("✓ Dataset loaded successfully!")
print(f"  - Total records: {len(df)}")
print(f"  - Total columns: {len(df.columns)}")
print("\nColumn names:")
for col in df.columns:
    print(f"  • {col}")

# ============================================
# PHASE 2: DATA CLEANING
# ============================================
print("\n" + "=" * 60)
print("PHASE 2: DATA CLEANING")
print("=" * 60)

# Function to clean text data
def clean_text(text):
    """Clean and normalize text data"""
    if pd.isna(text) or text == 'N/A':
        return ''
    text = str(text)
    text = text.lower()
    text = re.sub(r'[^\w\s,]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

# Function to parse list strings
def parse_list_string(text):
    """Parse string representation of lists"""
    if pd.isna(text) or text == 'N/A' or text == '':
        return []
    try:
        # Remove brackets and quotes, split by comma
        text = str(text).strip('[]').replace("'", "").replace('"', '')
        items = [item.strip() for item in text.split(',') if item.strip()]
        return items
    except Exception:
        return []

# Store original shape
original_shape = df.shape
print(f"Original dataset shape: {original_shape}")

# Remove duplicates
df = df.drop_duplicates()
print(f"✓ Duplicates removed: {original_shape[0] - len(df)} records")

# Handle missing values in key columns
print("\nHandling missing values...")
for col in df.columns:
    missing_count = df[col].isna().sum()
    if missing_count > 0:
        print(f"  • {col}: {missing_count} missing values")
        if df[col].dtype == 'object':
            df[col] = df[col].fillna('N/A')
        else:
            df[col] = df[col].fillna(0)

print("✓ Missing values handled")
print(f"Final dataset shape: {df.shape}")

# ============================================
# PHASE 3: PREPROCESSING & FEATURE ENGINEERING
# ============================================
print("\n" + "=" * 60)
print("PHASE 3: PREPROCESSING & FEATURE ENGINEERING")
print("=" * 60)

# Clean text columns
text_columns = ['skills', 'career_objective', 'educational_institution_name', 
                'degree_names', 'major_field_of_studies', 'professional_company_names',
                'positions', 'responsibilities', 'skills_required']

print("Cleaning text columns...")
for col in text_columns:
    if col in df.columns:
        df[col + '_cleaned'] = df[col].apply(clean_text)
        print(f"  ✓ Cleaned: {col}")

# Parse list columns
print("\nParsing list-based columns...")
list_columns = ['skills', 'degree_names', 'positions']
for col in list_columns:
    if col in df.columns:
        df[col + '_list'] = df[col].apply(parse_list_string)
        df[col + '_count'] = df[col + '_list'].apply(len)
        print(f"  ✓ Parsed: {col} (avg count: {df[col + '_count'].mean():.2f})")

# Create combined skill text
print("\nCreating combined feature sets...")
df['all_skills'] = df['skills_cleaned'] + ' ' + df['skills_required_cleaned']
df['all_experience'] = df['positions_cleaned'] + ' ' + df['responsibilities_cleaned']
df['all_education'] = df['degree_names_cleaned'] + ' ' + df['major_field_of_studies_cleaned']

# Create feature for years of experience (estimated from position count)
df['experience_level'] = df['positions_list'].apply(len)

# Create matched score category
if 'matched_score' in df.columns:
    df['matched_score'] = pd.to_numeric(df['matched_score'], errors='coerce')
    df['matched_score'] = df['matched_score'].fillna(0)
    df['match_category'] = pd.cut(df['matched_score'], 
                                   bins=[0, 0.4, 0.6, 0.8, 1.0],
                                   labels=['Low', 'Medium', 'High', 'Excellent'])
    print("  ✓ Match score categories created")
    print(f"    Distribution:\n{df['match_category'].value_counts()}")

# ============================================
# PHASE 4: FEATURE EXTRACTION (TF-IDF)
# ============================================
print("\n" + "=" * 60)
print("PHASE 4: FEATURE EXTRACTION (TF-IDF)")
print("=" * 60)

# TF-IDF for skills
print("Creating TF-IDF vectors for skills...")
tfidf_skills = TfidfVectorizer(max_features=100, ngram_range=(1, 2))
skills_matrix = tfidf_skills.fit_transform(df['all_skills'].fillna(''))
print(f"  ✓ Skills TF-IDF matrix: {skills_matrix.shape}")

# TF-IDF for job descriptions/responsibilities
print("Creating TF-IDF vectors for responsibilities...")
tfidf_responsibilities = TfidfVectorizer(max_features=100, ngram_range=(1, 2))
responsibilities_matrix = tfidf_responsibilities.fit_transform(df['all_experience'].fillna(''))
print(f"  ✓ Responsibilities TF-IDF matrix: {responsibilities_matrix.shape}")

# Combine features
print("Combining all features...")
feature_matrix = hstack([skills_matrix, responsibilities_matrix])
print(f"  ✓ Combined feature matrix: {feature_matrix.shape}")

# ============================================
# PHASE 5: TRAIN-TEST SPLIT
# ============================================
print("\n" + "=" * 60)
print("PHASE 5: TRAIN-TEST SPLIT")
print("=" * 60)

# Prepare target variable
if 'match_category' in df.columns:
    # Encode the match category
    le = LabelEncoder()
    y = le.fit_transform(df['match_category'].astype(str))
    
    # Check class distribution
    unique, counts = np.unique(y, return_counts=True)
    print(f"Class distribution: {dict(zip(unique, counts))}")
    
    # Split the data (without stratify if classes are imbalanced)
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            feature_matrix, y, test_size=0.2, random_state=42, stratify=y
        )
    except ValueError:
        print("  ⚠ Cannot use stratification due to small class sizes, using random split...")
        X_train, X_test, y_train, y_test = train_test_split(
            feature_matrix, y, test_size=0.2, random_state=42
        )
    
    print("✓ Data split completed:")
    print(f"  • Training set: {X_train.shape[0]} samples")
    print(f"  • Test set: {X_test.shape[0]} samples")
    print(f"  • Features: {X_train.shape[1]}")
    print(f"  • Classes: {len(le.classes_)} - {list(le.classes_)}")

# ============================================
# PHASE 6: MODEL TRAINING
# ============================================
print("\n" + "=" * 60)
print("PHASE 6: MODEL TRAINING")
print("=" * 60)

# Train Random Forest Classifier
print("Training Random Forest Classifier...")
rf_model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)
print("  ✓ Random Forest trained")

# Make predictions
y_pred_train = rf_model.predict(X_train)
y_pred_test = rf_model.predict(X_test)

# Evaluate
train_accuracy = accuracy_score(y_train, y_pred_train)
test_accuracy = accuracy_score(y_test, y_pred_test)

print("\n📊 Model Performance:")
print(f"  • Training Accuracy: {train_accuracy:.4f} ({train_accuracy*100:.2f}%)")
print(f"  • Test Accuracy: {test_accuracy:.4f} ({test_accuracy*100:.2f}%)")

print("\n📈 Classification Report:")
print(classification_report(y_test, y_pred_test, target_names=le.classes_))

# ============================================
# PHASE 7: BUILD RECOMMENDATION SYSTEM
# ============================================
print("\n" + "=" * 60)
print("PHASE 7: BUILD RECOMMENDATION SYSTEM")
print("=" * 60)

print("Building job recommendation system...")

# Create job profiles
job_profiles = df[['﻿job_position_name', 'skills_required_cleaned', 'responsibilities', 
                    'educationaL_requirements', 'experiencere_requirement']].copy()
job_profiles = job_profiles.drop_duplicates(subset=['﻿job_position_name'])
job_profiles = job_profiles.reset_index(drop=True)

print(f"  ✓ Created {len(job_profiles)} unique job profiles")

# Create job-skill matrix
job_skills_matrix = tfidf_skills.transform(job_profiles['skills_required_cleaned'].fillna(''))
print(f"  ✓ Job-skill matrix created: {job_skills_matrix.shape}")

# ============================================
# PHASE 8: ANALYTICS & VISUALIZATIONS
# ============================================
print("\n" + "=" * 60)
print("PHASE 8: ANALYTICS & VISUALIZATIONS")
print("=" * 60)

# Visualization 1: Skills Distribution (Top 20 Skills)
print("Creating Visualization 1: Top Skills Distribution...")
all_skills_list = []
for skills in df['skills_list']:
    all_skills_list.extend([s.lower().strip() for s in skills if s])

skills_series = pd.Series(all_skills_list)
top_skills = skills_series.value_counts().head(20)

plt.figure(figsize=(14, 8))
top_skills.plot(kind='barh', color='steelblue', edgecolor='navy')
plt.xlabel('Frequency', fontsize=12, fontweight='bold')
plt.ylabel('Skills', fontsize=12, fontweight='bold')
plt.title('Top 20 Most Demanded Skills', fontsize=16, fontweight='bold', pad=20)
plt.gca().invert_yaxis()
plt.tight_layout()
plt.savefig('Images/1_top_skills_distribution.png', dpi=300, bbox_inches='tight')
plt.close()
print("  ✓ Saved: Images/1_top_skills_distribution.png")

# Visualization 2: Match Score Distribution
print("Creating Visualization 2: Match Score Distribution...")
plt.figure(figsize=(12, 8))
plt.subplot(2, 1, 1)
df['matched_score'].hist(bins=30, color='coral', edgecolor='darkred', alpha=0.7)
plt.xlabel('Match Score', fontsize=12, fontweight='bold')
plt.ylabel('Frequency', fontsize=12, fontweight='bold')
plt.title('Distribution of Match Scores', fontsize=14, fontweight='bold')
plt.grid(axis='y', alpha=0.3)

plt.subplot(2, 1, 2)
match_category_counts = df['match_category'].value_counts()
colors = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4ecdc4']
match_category_counts.plot(kind='bar', color=colors, edgecolor='black')
plt.xlabel('Match Category', fontsize=12, fontweight='bold')
plt.ylabel('Count', fontsize=12, fontweight='bold')
plt.title('Candidates by Match Category', fontsize=14, fontweight='bold')
plt.xticks(rotation=0)
plt.tight_layout()
plt.savefig('Images/2_match_score_distribution.png', dpi=300, bbox_inches='tight')
plt.close()
print("  ✓ Saved: Images/2_match_score_distribution.png")

# Visualization 3: Education & Experience Analysis
print("Creating Visualization 3: Education & Experience Analysis...")
plt.figure(figsize=(14, 8))

plt.subplot(1, 2, 1)
degree_counts = df['degree_names_cleaned'].value_counts().head(10)
degree_counts.plot(kind='pie', autopct='%1.1f%%', startangle=90, 
                   colors=sns.color_palette('pastel'))
plt.title('Top 10 Degree Distributions', fontsize=14, fontweight='bold', pad=20)
plt.ylabel('')

plt.subplot(1, 2, 2)
exp_level_counts = df['experience_level'].value_counts().sort_index()
plt.bar(exp_level_counts.index, exp_level_counts.values, color='teal', edgecolor='black')
plt.xlabel('Experience Level (Number of Positions)', fontsize=12, fontweight='bold')
plt.ylabel('Count', fontsize=12, fontweight='bold')
plt.title('Experience Level Distribution', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('Images/3_education_experience_analysis.png', dpi=300, bbox_inches='tight')
plt.close()
print("  ✓ Saved: Images/3_education_experience_analysis.png")

# Visualization 4: Confusion Matrix
print("Creating Visualization 4: Model Confusion Matrix...")
plt.figure(figsize=(10, 8))
cm = confusion_matrix(y_test, y_pred_test)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=le.classes_, yticklabels=le.classes_,
            cbar_kws={'label': 'Count'})
plt.xlabel('Predicted Category', fontsize=12, fontweight='bold')
plt.ylabel('Actual Category', fontsize=12, fontweight='bold')
plt.title(f'Confusion Matrix - Test Accuracy: {test_accuracy*100:.2f}%', 
          fontsize=14, fontweight='bold', pad=20)
plt.tight_layout()
plt.savefig('Images/4_confusion_matrix.png', dpi=300, bbox_inches='tight')
plt.close()
print("  ✓ Saved: Images/4_confusion_matrix.png")

# Visualization 5: Job Positions & Skills Required Analysis
print("Creating Visualization 5: Job Positions Analysis...")
plt.figure(figsize=(14, 10))

# Top job positions
plt.subplot(2, 1, 1)
job_position_counts = df['﻿job_position_name'].value_counts().head(15)
job_position_counts.plot(kind='barh', color='purple', alpha=0.7, edgecolor='darkviolet')
plt.xlabel('Number of Candidates', fontsize=12, fontweight='bold')
plt.ylabel('Job Position', fontsize=12, fontweight='bold')
plt.title('Top 15 Job Positions', fontsize=14, fontweight='bold')
plt.gca().invert_yaxis()

# Skills vs Match Score correlation
plt.subplot(2, 1, 2)
skill_match_relation = df.groupby('skills_count')['matched_score'].mean().sort_index()
plt.plot(skill_match_relation.index, skill_match_relation.values, 
         marker='o', linewidth=2, markersize=8, color='green')
plt.xlabel('Number of Skills', fontsize=12, fontweight='bold')
plt.ylabel('Average Match Score', fontsize=12, fontweight='bold')
plt.title('Relationship: Skills Count vs Match Score', fontsize=14, fontweight='bold')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('Images/5_job_positions_analysis.png', dpi=300, bbox_inches='tight')
plt.close()
print("  ✓ Saved: Images/5_job_positions_analysis.png")

print("\n✓ All 5 visualizations created successfully in 'Images/' folder")

# ============================================
# PHASE 9: SAVE FINAL MODEL
# ============================================
print("\n" + "=" * 60)
print("PHASE 9: SAVE FINAL MODEL")
print("=" * 60)

# Create comprehensive model package
final_model = {
    # Core model
    'model': rf_model,
    
    # Transformers
    'tfidf_skills': tfidf_skills,
    'tfidf_responsibilities': tfidf_responsibilities,
    'label_encoder': le,
    'scaler': StandardScaler(),
    
    # Data
    'job_profiles': job_profiles,
    'job_skills_matrix': job_skills_matrix,
    
    # Metadata
    'metadata': {
        'model_type': 'Random Forest Classifier',
        'training_date': pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S'),
        'training_samples': X_train.shape[0],
        'test_samples': X_test.shape[0],
        'train_accuracy': float(train_accuracy),
        'test_accuracy': float(test_accuracy),
        'n_features': X_train.shape[1],
        'n_classes': len(le.classes_),
        'classes': le.classes_.tolist(),
        'job_positions_count': len(job_profiles)
    },
    
    # Feature info
    'features': {
        'skills_features': tfidf_skills.get_feature_names_out().tolist(),
        'responsibility_features': tfidf_responsibilities.get_feature_names_out().tolist(),
        'label_classes': le.classes_.tolist()
    }
}

# Save as single pickle file
with open('final_model.pkl', 'wb') as f:
    pickle.dump(final_model, f)

print("✓ Saved: final_model.pkl")
print(f"  • File size: {os.path.getsize('final_model.pkl') / (1024*1024):.2f} MB")

# Save job profiles CSV for reference
job_profiles.to_csv('job_profiles.csv', index=False)
print("✓ Saved: job_profiles.csv (for reference)")

# Save feature info JSON
with open('feature_info.json', 'w') as f:
    json.dump(final_model['features'], f, indent=2)
print("✓ Saved: feature_info.json (for reference)")


# ============================================
# PHASE 10: TEST RECOMMENDATION SYSTEM
# ============================================
print("\n" + "=" * 60)
print("PHASE 10: TEST RECOMMENDATION SYSTEM")
print("=" * 60)

def get_job_recommendations(candidate_skills, model_data, top_n=5):
    """
    Get job recommendations based on candidate skills
    
    Parameters:
    - candidate_skills: str, candidate's skills text
    - model_data: dict, loaded model data
    - top_n: int, number of recommendations to return
    
    Returns:
    - list of dict: job recommendations with details
    """
    tfidf_skills = model_data['tfidf_skills']
    job_skills_matrix = model_data['job_skills_matrix']
    job_profiles = model_data['job_profiles']
    
    # Transform candidate skills
    candidate_vector = tfidf_skills.transform([candidate_skills])
    
    # Calculate cosine similarity with all jobs
    similarities = cosine_similarity(candidate_vector, job_skills_matrix)[0]
    
    # Get top N jobs
    top_indices = similarities.argsort()[-top_n:][::-1]
    
    recommendations = []
    for idx in top_indices:
        job = job_profiles.iloc[idx]
        recommendations.append({
            'job_title': job['﻿job_position_name'],
            'match_score': float(similarities[idx]),
            'required_skills': job['skills_required_cleaned'],
            'education_required': job['educationaL_requirements'],
            'experience_required': job['experiencere_requirement']
        })
    
    return recommendations

# Test the recommendation function
print("Testing recommendation system...")
test_skills = "Python Machine Learning Data Analysis Deep Learning TensorFlow"
recommendations = get_job_recommendations(test_skills, final_model, top_n=5)

print(f"\nTest Input: '{test_skills}'")
print("\nTop 5 Recommended Jobs:")
for i, rec in enumerate(recommendations, 1):
    print(f"  {i}. {rec['job_title']}")
    print(f"     Match Score: {rec['match_score']:.3f}")
    print(f"     Required Skills: {rec['required_skills'][:100]}...")
    print()

# ============================================
# SUMMARY
# ============================================
print("\n" + "=" * 60)
print("🎉 TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
print("=" * 60)

print("\n📦 Saved Files:")
print("  Models:")
print("    1. final_model.pkl (Main model file with all components)")
print("\n  Data Files:")
print("    2. job_profiles.csv (Job profiles data)")
print("    3. feature_info.json (Feature information)")
print("\n  Analytics (in Images/ folder):")
print("    4. Images/1_top_skills_distribution.png")
print("    5. Images/2_match_score_distribution.png")
print("    6. Images/3_education_experience_analysis.png")
print("    7. Images/4_confusion_matrix.png")
print("    8. Images/5_job_positions_analysis.png")

print("\n📊 Model Summary:")
print(f"  • Model Type: Random Forest with {rf_model.n_estimators} trees")
print(f"  • Total Features: {X_train.shape[1]}")
print(f"  • Training Accuracy: {train_accuracy*100:.2f}%")
print(f"  • Test Accuracy: {test_accuracy*100:.2f}%")
print(f"  • Job Profiles: {len(job_profiles)}")
print("  • Visualizations: 5 analytics charts created")

print("\n🚀 Next Steps:")
print("  1. Load final_model.pkl in your backend")
print("  2. Use the model for job recommendations")
print("  3. Use analytics visualizations in your dashboard")
print("  4. Integrate the recommendation system with your API")

print("\n💡 How to Load the Model:")
print("  ```python")
print("  import pickle")
print("  with open('final_model.pkl', 'rb') as f:")
print("      model_data = pickle.load(f)")
print("  # Access components:")
print("  # model_data['model'] - Random Forest model")
print("  # model_data['tfidf_skills'] - Skills vectorizer")
print("  # model_data['job_profiles'] - Job data")
print("  # model_data['metadata'] - Training info")
print("  ```")

print("\n" + "=" * 60)
print("✨ All tasks completed successfully!")
print("=" * 60 + "\n")
