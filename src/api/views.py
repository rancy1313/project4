from django.http import JsonResponse
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.models import User
from .models import UserInfo

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import NoteSerializer
from .models import Note

from .utils import user_data_backend_validation, is_base64_encoded

import base64


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        # ...

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]

    return Response(routes)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getNotes(request):
    user = request.user
    notes = user.note_set.all()
    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


# username/phone number are unique fields, so we check them when
# a user is submitting a form on registration
@api_view(['POST'])
def validate_unique_fields(request):
    # collect results from filtering
    validation_results = {"username_request": "", "phone_number_request": ""}

    # decode the fields that were base64 encoded
    decoded_username = base64.b64decode(request.data['encoded_username']).decode("utf-8")
    decoded_phone_number = base64.b64decode(request.data['encoded_phone_number']).decode("utf-8")

    # check if there is a user using the username
    user = User.objects.filter(username=decoded_username)

    # if found return found or success
    if user:
        validation_results['username_request'] = "Found"

    user = UserInfo.objects.filter(phone_number=decoded_phone_number)
    if user:
        validation_results['phone_number_request'] = "Found"

    return Response(validation_results)


# this function handles the user form from registration when the front end has checked it for errors
@api_view(['POST'])
def submit_user_form(request):
    # create a user info dictionary to hold the decoded data from the user
    user_info_form = {}

    # loop through the data, decode it, and save it to the user info dict
    for data in request.data:

        # allergies and user addresses are decoded differently
        if data != "allergies" and data != "user_addresses":

            # all data is encoded base 64 when sent to the back end, so we reject any data that is not base 64 encoded
            if not is_base64_encoded(request.data[data]):
                return Response({"error": "Submitted data was rejected."})

            decoded_data = base64.b64decode(request.data[data]).decode("utf-8")
            user_info_form[data] = decoded_data

    # the allergies' field holds a list of allergies, we set it equal to an empty list to append the decoded data
    user_info_form["allergies"] = []

    # loop the allergies field and decode it and append it to the user info dict under allergies
    for allergy in request.data["allergies"]:

        # all data is encoded base 64 when sent to the back end, so we reject any data that is not base 64 encoded
        if not is_base64_encoded(allergy):
            return Response({"error": "Submitted data was rejected."})

        decoded_data = base64.b64decode(allergy).decode("utf-8")
        user_info_form["allergies"].append(decoded_data)

    # we join the list of allergies because we are saving it as one string in the database
    user_info_form["allergies"] = "/".join(user_info_form["allergies"])

    # user addresses are saved in a different dictionary from user info because
    # user addresses are created from a different model
    user_addresses_form = {"user_addresses": {}}

    # loop through data in the user_addresses to decode it and save it to the user_addresses dict
    for address in request.data["user_addresses"]:

        # set each address in user_addresses to an empty dict to collect the data for the address fields
        user_addresses_form["user_addresses"][address] = {}

        for field in request.data["user_addresses"][address]:

            # all data is encoded base 64 when sent to the back end, so we reject any data that is not base 64 encoded
            if not is_base64_encoded(request.data["user_addresses"][address][field]):
                return Response({"error": "Submitted data was rejected."})

            decoded_data = base64.b64decode(request.data["user_addresses"][address][field]).decode("utf-8")
            user_addresses_form["user_addresses"][address][field] = decoded_data

    # pass user_info_form to user_data_backend_validation to see if there are any errors in the data
    errors = user_data_backend_validation(user_info_form)

    # check errors in user_addresses_form

    # if there are errors return the errors toi the front end to let the user know
    if errors:
        return Response(errors)
    else:
        # else create user and direct user to login page on front end
        user = User.objects.create(username=user_info_form['username'], password=user_info_form['password'])
        return Response({"success": "No errors detected."})
