from django.contrib.auth.models import User
import re
import base64

# for age calculation
import datetime


# validate user form on the backend before creating an instance of the user data
def user_data_backend_validation(user_info_form):
    errors = {}

    # username validation

    if user_info_form["username"] == "":
        errors["empty"] = "Username cannot be empty."

    user = User.objects.filter(username=user_info_form['username'])
    if user:
        errors["taken"] = "Username is taken."

    if len(user_info_form["username"]) > 25:
        errors["username_length"] = "Username must be under 25 characters."

    # password validation to only accept secure passwords

    if len(user_info_form["password"]) < 8:
        errors["length"] = "Password must be at least 8 characters."

    has_capital = re.search(r"[A-Z]", user_info_form["password"])
    if not has_capital:
        errors["has_capital"] = "Password must contain at least one capital letter."

    has_lower_case = re.search(r"[a-z]", user_info_form["password"])
    if not has_lower_case:
        errors["has_lower_case"] = "Password must contain at least one lower case letter."

    has_digit = any(char.isdigit() for char in user_info_form["password"])
    if not has_digit:
        errors["has_digit"] = "Password must contain at least one digit."

    restricted_chars = set("`~!@#$%^&*()_=+,;:\|][{}/?><]\"")
    if len(restricted_chars - set(user_info_form["password"])) == len(restricted_chars):
        errors["restricted_chars"] = "Password must contain at least one special character."

    repeating_chars = re.search(r"(.)\1{2,}", user_info_form["password"])
    if repeating_chars:
        errors["repeating_chars"] = "Password must not contain more than 3 consecutively repeating characters."

    """
        Valid characters are uppercase letters (A-Z), lowercase letters (a-z),
        numbers (0-9), period (.), apostrophe ('), hyphen/dash (-), and spaces.
        No other characters are allowed.
    """

    # preferred name validation
    restricted_chars = set("`~!@#$%^&*()_=+,;:\|][{}/?><]\"")

    # if the length of the difference is lower than the length of the restricted chars set,
    # then that means there are restricted chars in that field
    if len(restricted_chars - set(user_info_form["preferred_name"])) < len(restricted_chars):
        errors["restricted_chars_preferred_name"] = "No special chars are allowed besides period (.), hyphen/dash " \
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
            errors["min_age"] = "Must be at least 18 years old to register."

    except ValueError:
        # user cannot format the date wrong or have it be of wrong type
        errors["ValueError"] = "Please enter age in Year-Month-Day format."
    except TypeError:
        # user cannot format the date wrong or have it be of wrong type
        errors["TypeError"] = "Please enter age in Year-Month-Day format."

    # allergies validation

    allergies = {'Milk', 'Egg', 'Fish', 'Crustacean Shell Fish', 'Tree Nuts', 'Wheat', 'Peanuts', 'Soybeans', 'Sesame'}

    if len(set(user_info_form["allergies"]) - allergies) > 0:
        errors["allergies"] = "here appears to be unlisted allergies submitted."

    # I am still considering how to validate the phone number field

    return errors


def is_base64_encoded(string):
    try:
        # Attempt to decode the string as base64
        base64.b64decode(string)
        return True

    except:
        # If an error occurs, the string is not base64 encoded
        return False
