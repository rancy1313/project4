from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# for age calculation
import datetime


# Each user has extra info associated with their account
class UserInfo(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)

    # user info
    preferred_name = models.CharField(max_length=25)
    dob = models.CharField(max_length=10)
    phone_number = models.CharField(max_length=15, unique=True)
    allergies = models.CharField(max_length=80, null=True)

    """
        Valid characters are uppercase letters (A-Z), lowercase letters (a-z),
        numbers (0-9), period (.), apostrophe ('), hyphen/dash (-), and spaces.
        No other characters are allowed.
    """

    def clean_preferred_name(self):
        restricted_chars = "`~!@#$%^&*()_=+,;:\|][{}/?><]\""
        restricted_chars = set(list(restricted_chars))
        if len(restricted_chars) != len(set(list(self.preferred_name))):
            raise ValidationError("No special chars are allowed besides period (.), hyphen/dash (-),"
                                  " apostrophe ('), and spaces.")

    def clean_dob(self):
        try:
            min_age = 18
            birthdate = datetime.datetime.strptime(self.dob, '%Y-%m-%d')
            today = datetime.datetime.now()
            age = (today - birthdate).days // 365
            if age < min_age:
                raise ValidationError("Must be at least 18 years old to register")
        except ValueError and TypeError:
            raise ValidationError("Please enter age in Year-Month-Day format.")

    def clean_allergies(self):
        allergies = {'Milk', 'Egg', 'Fish', 'Crustacean Shell Fish', 'Tree Nuts', 'Wheat', 'Peanuts', 'Soybeans',
                     'Sesame'}
        if len(set(self.allergies) - allergies) > 0:
            raise ValidationError("There appears to be unlisted allergies submitted.")

    """
    def clean_phone_number(self):
        ????? Needs further investigation
    """


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
