from rest_framework import serializers
from .models import Person, Education, Skill, Achievement, ResumeReport

class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['degree', 'institution', 'start_date', 'end_date', 'gpa']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['name', 'category']

class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['title', 'description', 'date']

class PersonSerializer(serializers.ModelSerializer):
    education = EducationSerializer(many=True, required=False)
    skills = SkillSerializer(many=True, required=False)
    achievements = AchievementSerializer(many=True, required=False)

    class Meta:
        model = Person
        fields = ['first_name', 'last_name', 'email', 'phone', 'linkedin_url', 'github_url', 'portfolio_url', 'education', 'skills', 'achievements']

    def create(self, validated_data):
        education_data = validated_data.pop('education', [])
        skills_data = validated_data.pop('skills', [])
        achievements_data = validated_data.pop('achievements', [])

        person = Person.objects.create(**validated_data)

        for edu_item in education_data:
            Education.objects.create(person=person, **edu_item)

        for skill_item in skills_data:
            Skill.objects.create(person=person, **skill_item)

        for achieve_item in achievements_data:
            Achievement.objects.create(person=person, **achieve_item)

        return person


class ResumeReportSerializer(serializers.ModelSerializer):
    """
    Serializer for ResumeReport model.
    """
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = ResumeReport
        fields = [
            'id',
            'user',
            'username',
            'email',
            'resume_file_name',
            'resume_file_url',
            'overall_score',
            'ats_score',
            'strengths',
            'weaknesses',
            'analytics',
            'recommendations',
            'improved_bullet_example',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'username',
            'email',
            'created_at',
            'updated_at',
        ]
