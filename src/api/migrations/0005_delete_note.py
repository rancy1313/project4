# Generated by Django 4.2 on 2023-04-27 04:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0004_alter_address_zipcode"),
    ]

    operations = [
        migrations.DeleteModel(name="Note",),
    ]
