# Generated by Django 4.0.4 on 2022-05-16 21:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('trello_boards', '0003_list_alter_card_board'),
    ]

    operations = [
        migrations.RenameField(
            model_name='card',
            old_name='board',
            new_name='list_name',
        ),
    ]
