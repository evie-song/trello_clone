# Generated by Django 4.0.5 on 2022-06-22 17:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('trello_boards', '0021_boardmembership'),
    ]

    operations = [
        migrations.AddField(
            model_name='board',
            name='background_color',
            field=models.CharField(default='blank', max_length=200),
            preserve_default=False,
        ),
    ]
