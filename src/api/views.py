from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.contrib.auth.models import User
from .models import UserInfo, Address
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .utils import user_data_backend_validation, is_base64_encoded, validate_user_update_info
import base64
from rest_framework import serializers

# used to create a custom endpoint to refresh tokens after updating userInfo
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

# blacklist old refresh tokens
from rest_framework_simplejwt.exceptions import TokenError


# we create a custom endpoint to pass the user's username to retrieve the user b/c token/refresh
# only accepts a refresh token
class MyTokenRefreshView(APIView):
    # this will pass the username and refresh token and return an updated refresh token
    def post(self, request):
        serializer = MyTokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        return Response(data, status=status.HTTP_200_OK)


class MyTokenRefreshSerializer(TokenRefreshSerializer):
    # save the username
    def __init__(self, *args, **kwargs):
        self.user_username = kwargs["data"]["username"]
        super().__init__(*args, **kwargs)

    # validate take two positional arguments when it is called so we pass the attrs even if we don't use it
    def validate(self, attrs):

        # try to get user with the username that was passed
        try:
            user = User.objects.get(username=self.user_username)
        except User.DoesNotExist:
            raise serializers.ValidationError('User not found')

        # blacklist the old refresh token bc we are using a custom refresh route now
        try:
            old_refresh_token = attrs["refresh"]
            refresh_token = RefreshToken(old_refresh_token)
            refresh_token.blacklist()
        # token does not exist
        except TokenError:
            raise serializers.ValidationError('Refresh token is invalid or expired')

        # generate new access and refresh tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        # get user by username to fetch that userInfo and update the access token
        user = User.objects.get(username=self.user_username)
        userInfo = UserInfo.objects.get(user=user)

        # these are the required fields needed in the access token
        access['username'] = user.username
        access['preferred_name'] = userInfo.preferred_name
        access['dob'] = userInfo.dob
        access['phone_number'] = userInfo.phone_number
        access['allergies'] = userInfo.allergies

        return {
            'refresh': str(refresh),
            'access': str(access),
        }


class MyTokenRefreshView(TokenRefreshView):
    serializer_class = MyTokenRefreshSerializer


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # customize token
        token['username'] = user.username

        # every User should have a User Info entry
        userInfo = UserInfo.objects.get(user=user)

        token['preferred_name'] = userInfo.preferred_name
        token['dob'] = userInfo.dob
        token['phone_number'] = userInfo.phone_number
        token['allergies'] = userInfo.allergies

        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


# show routes in rest framework
@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
    ]

    return Response(routes)


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

    # make sure that the request has the correct data
    if list(request.data.keys()) != ['user_addresses', 'allergies', 'dob', 'preferred_name', 'username', 'password', 'phone_number']:
        return Response({"error": "Submitted data was rejected."})

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

    # user addresses are saved in a different dictionary from user info because
    # user addresses are created from a different model
    user_addresses_form = {}

    # loop through data in the user_addresses to decode it and save it to the user_addresses dict
    for address in request.data["user_addresses"]:

        # set each address in user_addresses to an empty dict to collect the data for the address fields
        user_addresses_form[address] = {}

        for field in request.data["user_addresses"][address]:

            # all data is encoded base 64 when sent to the back end, so we reject any data that is not base 64 encoded
            if not is_base64_encoded(request.data["user_addresses"][address][field]):
                return Response({"error": "Submitted data was rejected."})

            decoded_data = base64.b64decode(request.data["user_addresses"][address][field]).decode("utf-8")
            user_addresses_form[address][field] = decoded_data

    # pass user_info_form to user_data_backend_validation to see if there are any errors in the data
    errors = user_data_backend_validation(user_info_form)

    # check errors in user_addresses_form before creating user account
    # currently there is no validation for user_addresses_form. It is a work in progress.

    # we join the list of allergies because we are saving it as one string in the database
    user_info_form["allergies"] = "/".join(user_info_form["allergies"])

    # if there are errors return the errors to the front end to let the user know
    if errors:
        return Response(errors)
    else:
        # else create user and direct user to login page on front end
        user = User.objects.create(username=user_info_form['username'])
        # hash the password
        user.set_password(user_info_form['password'])
        user.save()

        # remove the fields that are not in UserInfo model to avoid TypeError
        del user_info_form["username"]
        del user_info_form["password"]

        # add user to user_form_info from the user object that was created for foreign key
        user_info_form["user"] = user

        # create user info entry from user's data by unpacking it
        UserInfo.objects.create(**user_info_form)

        # for every address add the user for the foreign key and then create that address
        for address in user_addresses_form:
            user_addresses_form[address]["user"] = user
            Address.objects.create(**user_addresses_form[address])

        # send success message to direct the user to the login page
        return Response({"success": "No errors detected."})


# this function is used to update the user's saved data
@api_view(['PUT'])
def update_user_form(request):

    # make sure that the request has the correct data
    if list(request.data.keys()) != ["username", "preferred_name", "allergies"]:
        return Response({"error": "Submitted data was rejected."})

    # create a user info dictionary to hold the decoded data from the user
    user_info_form = {}

    # all data is encoded base 64 when sent to the back end, so we reject any data that is not base 64 encoded
    if not is_base64_encoded(request.data["preferred_name"]):
        return Response({"error": "Submitted data was rejected."})

    # else: else not needed to be declared
    decoded_data = base64.b64decode(request.data["preferred_name"]).decode("utf-8")
    user_info_form["preferred_name"] = decoded_data

    if not is_base64_encoded(request.data["username"]):
        return Response({"error": "Submitted data was rejected."})

    # else: else not needed to be declared
    decoded_data = base64.b64decode(request.data["username"]).decode("utf-8")
    user_info_form["username"] = decoded_data

    # the allergies' field holds a list of allergies, we set it equal to an empty list to append the decoded data
    user_info_form["allergies"] = []

    # loop the allergies field and decode it and append it to the user info dict under allergies
    for allergy in request.data["allergies"]:

        # all data is encoded base 64 when sent to the back end, so we reject any data that is not base 64 encoded
        if not is_base64_encoded(allergy):
            return Response({"error": "Submitted data was rejected."})

        decoded_data = base64.b64decode(allergy).decode("utf-8")
        user_info_form["allergies"].append(decoded_data)

    # pass user_info_form to user_data_backend_validation to see if there are any errors in the data
    errors = validate_user_update_info(user_info_form)

    # we join the list of allergies because we are saving it as one string in the database
    user_info_form["allergies"] = "/".join(user_info_form["allergies"])

    # if there are errors return the errors to the front end to let the user know
    if errors:
        return Response(errors)
    else:
        user = User.objects.get(username=user_info_form["username"])
        UserInfo.objects.filter(user=user).update(preferred_name=user_info_form["preferred_name"],
                                                  allergies=user_info_form["allergies"])

        return Response({"success": "No errors detected."})
