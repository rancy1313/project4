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

from django.db.utils import IntegrityError

from .utils import user_data_backend_validation

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


@api_view(['POST'])
def submit_user_form(request):
    user_info_form = {}
    for data in request.data:
        if data != "allergies" and data != "user_addresses":
            tmp = base64.b64decode(request.data[data]).decode("utf-8")
            user_info_form[data] = tmp

    user_info_form["allergies"] = []
    for allergy in request.data["allergies"]:
        tmp = base64.b64decode(allergy).decode("utf-8")
        user_info_form["allergies"].append(tmp)

    user_info_form["allergies"] = "/".join(user_info_form["allergies"])

    user_addresses_form = {}
    user_addresses_form["user_addresses"] = {}
    for address in request.data["user_addresses"]:
        user_addresses_form["user_addresses"][address] = {}
        for field in request.data["user_addresses"][address]:
            tmp = base64.b64decode(request.data["user_addresses"][address][field]).decode("utf-8")
            user_addresses_form["user_addresses"][address][field] = tmp

    print(user_info_form)
    print(user_addresses_form)

    errors = user_data_backend_validation(user_info_form)

    if errors:
        return Response(errors)
    else:
        user = User.objects.create(username=user_info_form['username'], password=user_info_form['password'])
        return Response({"success": "No errors detected."})

"""
def createNote(request):
    data = request.data
    note = Note.objects.create(
        body=data['body']
    )
    serializer = NoteSerializer(note, many=False)
    return Response(serializer.data)
"""