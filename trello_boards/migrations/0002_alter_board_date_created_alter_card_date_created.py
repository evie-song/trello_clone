# Generated by Django 4.0.4 on 2022-05-11 18:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trello_boards', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='board',
            name='date_created',
            field=models.DateTimeField(auto_now_add=True),
        ),
        migrations.AlterField(
            model_name='card',
            name='date_created',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
