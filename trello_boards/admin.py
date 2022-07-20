from django.contrib import admin
from .models import Board, Card, List, Checklist, ChecklistItem, Label, CardMembership, BoardMembership, CardLabel

# Register your models here.
admin.site.register(Board)
admin.site.register(List)
admin.site.register(Card)
admin.site.register(Label)
admin.site.register(Checklist)
admin.site.register(ChecklistItem)
admin.site.register(CardMembership)
admin.site.register(BoardMembership)
admin.site.register(CardLabel)