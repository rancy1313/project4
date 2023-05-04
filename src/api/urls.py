from django.urls import path
from . import views

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

# path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
urlpatterns = [
    path('', views.getRoutes),

    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', views.MyTokenRefreshView.as_view(), name='token_obtain_pair'),

    path("validate-unique-fields/", views.validate_unique_fields),
    path("submit-user-form/", views.submit_user_form),
    path("update-user-form/", views.update_user_form),
]
