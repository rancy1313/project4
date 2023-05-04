from django.contrib.auth.models import User
import re

# for age calculation
import datetime
# for base 64 check
import base64


# change errors to be a list and change the name of the error to match to the field
# set the errors on the front end if there are any


# validate user form on the backend before creating an instance of the user data
def user_data_backend_validation(user_info_form):

    # will hold all errors detected to pass on the front end and reset the errors
    errors = {}

    # username validation

    if user_info_form["username"] == "":
        errors["username"] = "Username cannot be empty."

    user = User.objects.filter(username=user_info_form['username'])

    if user:
        errors["username"] = "Username is taken."

    if len(user_info_form["username"]) > 25:
        errors["username"] = "Username must be under 25 characters."

        """
            Valid characters are uppercase letters (A-Z), lowercase letters (a-z),
            numbers (0-9), period (.), apostrophe ('), hyphen/dash (-), and spaces.
            No other characters are allowed. - Government 
        """

    # preferred name validation
    restricted_chars_basic = set("`~!@#$%^&*()_=+,;:\|][{}/?><]\"")

    # if the length of the difference is lower than the length of the restricted chars set,
    # then that means there are restricted chars in that field
    if len(restricted_chars_basic - set(user_info_form["username"])) < len(restricted_chars_basic):
        errors["username"] = "No special chars are allowed besides period (.), hyphen/dash " \
                                                    "(-), apostrophe ('), and spaces."

    # password validation to only accept secure passwords

    # we make a list to append the password errors because there can be multiple password errors at once
    password_errors = []

    if (8 > len(user_info_form["password"]) or len(user_info_form["password"]) > 25):
        password_errors.append("Password must be between 8 - 25 characters.")

    has_capital = re.search(r"[A-Z]", user_info_form["password"])
    if not has_capital:
        password_errors.append("Password must contain at least one capital letter.")

    has_lower_case = re.search(r"[a-z]", user_info_form["password"])
    if not has_lower_case:
        password_errors.append("Password must contain at least one lower case letter.")

    has_digit = any(char.isdigit() for char in user_info_form["password"])
    if not has_digit:
        password_errors.append("Password must contain at least one digit.")

    accepted_chars = set("$%^&*_+=~`|/,;:!@")

    if len(accepted_chars - set(user_info_form["password"])) == len(accepted_chars):
        password_errors.append("Password must contain at least one special character.")

    restricted_chars = set("'\"<>?#\\-.{}[]()")

    if len(restricted_chars - set(user_info_form["password"])) != len(restricted_chars):
        password_errors.append("Restricted char detected.")

    # search from re library returns true if more than two chars are consecutively together => "ooo"
    repeating_chars = re.search(r"(.)\1{2,}", user_info_form["password"])

    if repeating_chars:
        password_errors.append("Password must not contain more than 3 consecutively repeating characters.")

    # if there are any password errors then create key, value pair for it in the errors
    if password_errors:
        errors["password"] = password_errors

    # preferred name validation

    if user_info_form["preferred_name"] == "":
        errors["preferred_name"] = "Preferred name cannot be empty."

    if len(user_info_form["preferred_name"]) > 25:
        errors["preferred_name"] = "Preferred name must be under 25 characters."

    # follows username restricted chars
    # if the length of the difference is lower than the length of the restricted chars set,
    # then that means there are restricted chars in that field
    if len(restricted_chars_basic - set(user_info_form["preferred_name"])) < len(restricted_chars_basic):
        errors["preferred_name"] = "No special chars are allowed besides period (.), hyphen/dash " \
                                                    "(-), apostrophe ('), and spaces."

    # Date of birth validation

    try:
        # calculate age
        min_age = 18
        birthdate = datetime.datetime.strptime(user_info_form["dob"], '%Y-%m-%d')
        today = datetime.datetime.now()
        age = (today - birthdate).days // 365

        # if age lower that minimum age raise error
        if age < min_age:
            errors["dob"] = "Must be at least 18 years old to register."

    except ValueError:
        # user cannot format the date wrong or have it be of wrong type
        errors["dob"] = "Please enter age in Year-Month-Day format."
    except TypeError:
        # user cannot format the date wrong or have it be of wrong type
        errors["dob"] = "Please enter age in Year-Month-Day format."

    # allergies validation

    allergies = {'Milk', 'Egg', 'Fish', 'Crustacean Shell Fish', 'Tree Nuts', 'Wheat', 'Peanuts', 'Soybeans', 'Sesame', 'None'}

    # if there are any unique elements from doing the difference, then there is unlisted allergies
    if len(set(user_info_form["allergies"]) - allergies) > 0:
        errors["allergies"] = "There appears to be unlisted allergies submitted."

    # I am still considering how to validate the phone number field

    return errors


# this function is to check if the data sent from the front end was encoded in base 64.
# If it was not, then we reject the data
def is_base64_encoded(string):
    try:
        # Attempt to decode the string as base64
        base64.b64decode(string).decode("utf-8")
        return True
    except (base64.binascii.Error, UnicodeDecodeError):
        return False


# this function is to validate the Preferred name and allergies if a user
# wants to update their personal info
def validate_user_update_info(user_info_form):

    # hold all possible errors
    errors = {}

    # username validation

    if user_info_form["username"] == "":
        errors["username"] = "Username cannot be empty."

    user = User.objects.filter(username=user_info_form['username'])

    if not user:
        errors["username"] = "Account with that username not found."

    if len(user_info_form["username"]) > 25:
        errors["username"] = "Username must be under 25 characters."

        """
            Valid characters are uppercase letters (A-Z), lowercase letters (a-z),
            numbers (0-9), period (.), apostrophe ('), hyphen/dash (-), and spaces.
            No other characters are allowed. - Government 
        """

    # preferred name validation
    restricted_chars_basic = set("`~!@#$%^&*()_=+,;:\|][{}/?><]\"")

    # if the length of the difference is lower than the length of the restricted chars set,
    # then that means there are restricted chars in that field
    if len(restricted_chars_basic - set(user_info_form["username"])) < len(restricted_chars_basic):
        errors["username"] = "No special chars are allowed besides period (.), hyphen/dash " \
                             "(-), apostrophe ('), and spaces."

    # preferred name validation

    if user_info_form["preferred_name"] == "":
        errors["preferred_name"] = "Preferred name cannot be empty."

    if len(user_info_form["preferred_name"]) > 25:
        errors["preferred_name"] = "Preferred name must be under 25 characters."

    restricted_chars_basic = set("`~!@#$%^&*()_=+,;:\|][{}/?><]\"")

    # if the length of the difference is lower than the length of the restricted chars set,
    # then that means there are restricted chars in that field
    if len(restricted_chars_basic - set(user_info_form["preferred_name"])) < len(restricted_chars_basic):
        errors["preferred_name"] = "No special chars are allowed besides period (.), hyphen/dash " \
                                   "(-), apostrophe ('), and spaces."

    # allergies validation

    allergies = {'Milk', 'Egg', 'Fish', 'Crustacean Shell Fish', 'Tree Nuts', 'Wheat', 'Peanuts', 'Soybeans',
                 'Sesame', 'None'}

    # if there are any unique elements from doing the difference, then there is unlisted allergies
    if len(set(user_info_form["allergies"]) - allergies) > 0:
        errors["allergies"] = "There appears to be unlisted allergies submitted."

    return errors



