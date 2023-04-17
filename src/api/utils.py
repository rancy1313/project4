from django.db.utils import IntegrityError
from django.contrib.auth.models import User
import re


# validate user form on the backend before creating an instance of the user data
def user_data_backend_validation(user_info_form):
    errors = {}

    if user_info_form["username"] == "":
        errors["empty"] = "Username cannot be empty."

    user = User.objects.filter(username=user_info_form['username'])
    if user:
        errors["taken"] = "Username is taken."

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

    return errors
