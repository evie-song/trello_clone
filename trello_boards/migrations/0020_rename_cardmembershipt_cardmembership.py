# Generated by Django 4.0.5 on 2022-06-10 22:02

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('trello_boards', '0019_cardmembershipt'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='CardMembershipt',
            new_name='CardMembership',
        ),
    ]
