from django.db import models
from django.contrib.auth.models import User


# Each user has extra info associated with their account
class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

    # user info
    preferred_name = models.CharField(max_length=25)
    dob = models.CharField(max_length=10)
    phone_number = models.CharField(max_length=10, unique=True)
    allergies = models.CharField(max_length=80, null=True)


# a user can save multiple addresses
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # address info
    address_name = models.CharField(max_length=20)
    city = models.CharField(max_length=20)
    address = models.CharField(max_length=20)
    zipcode = models.CharField(max_length=10)


class Note(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    body = models.TextField()