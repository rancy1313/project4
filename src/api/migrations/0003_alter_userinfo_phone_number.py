# Generated by Django 4.2 on 2023-04-14 17:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_note"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userinfo",
            name="phone_number",
            field=models.CharField(max_length=15, unique=True),
        ),
    ]
