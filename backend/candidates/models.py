from django.db import models

class Person(models.Model):
    first_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    linkedin_url = models.URLField(max_length=500, blank=True, null=True)
    github_url = models.URLField(max_length=500, blank=True, null=True)
    portfolio_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"

class Education(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='education')
    degree = models.CharField(max_length=255, blank=True, null=True)
    institution = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.CharField(max_length=50, blank=True, null=True) # Accepting string to be flexible with "2021" or "Sept 2021"
    end_date = models.CharField(max_length=50, blank=True, null=True)
    gpa = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.degree} at {self.institution}"

class Skill(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='skills')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=255, blank=True, null=True) # e.g. "Languages", "Frameworks"

    def __str__(self):
        return f"{self.name} ({self.category})"

class Achievement(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    date = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.title
