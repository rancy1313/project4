from django.contrib import admin
from .models import Note, UserInfo, Address


# Register your models here.
admin.site.register(Note)
admin.site.register(UserInfo)
admin.site.register(Address)