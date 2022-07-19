from django.db import models
from datetime import datetime, timedelta
from django.utils import timezone
from django.utils.timezone import get_current_timezone, make_aware
from django.contrib.auth.models import User  

# Create your models here.
class Board(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	board_title = models.CharField(max_length=200)
	date_created = models.DateTimeField(auto_now_add=True)
	list_order = models.TextField(blank=True)
	background_color = models.CharField(max_length=200, blank=True)

	def __str__(self):
		return self.board_title

	def get_lists_in_order(self):
		new_lists = []
		if self.list_order != None:
			list_order_arr = self.list_order.split(',')
			list_order_arr.pop()
			for id in list_order_arr:
				new_lists.append(List.objects.get(id=id))
		return new_lists

class List(models.Model):
	board = models.ForeignKey(Board, on_delete=models.CASCADE)
	list_title = models.CharField(max_length=200)
	date_created = models.DateTimeField(auto_now_add=True)
	card_order = models.TextField(blank=True)

	def __str__(self):
		return self.list_title

	def get_cards_in_order(self):
		# cards = self.card_set.all()
		card_order_arr = self.card_order.split(",")
		card_order_arr.pop()
		new_cards = []
		for id in card_order_arr:
			new_cards.append(Card.objects.get(id=id))
		return new_cards


class Card(models.Model):
	list_name = models.ForeignKey(List, on_delete=models.CASCADE)
	card_title = models.CharField(max_length=200)
	card_description = models.TextField(blank=True)
	due_date = models.DateTimeField(auto_now_add=False, blank=True, null=True)
	date_created = models.DateTimeField(auto_now_add=True)
	due_date_completed = models.BooleanField(default=False)


	def __str__(self):
		return self.card_title

	def get_total_checklist_item(self):
		total_count = 0
		total_checklist = self.checklist_set.all()
		for checklist in total_checklist:
			total_count += checklist.checklistitem_set.all().count()
		return total_count
	
	def get_checked_checklist_item(self):
		total_count = 0
		total_checklist = self.checklist_set.all()
		for checklist in total_checklist:
			checklist_items = checklist.checklistitem_set.all()
			for checklist_item in checklist_items:
				if checklist_item.checked == True:
					total_count += 1
		return total_count

	def is_past_due(self):
		if self.due_date != None:
			present = datetime.now()
			current_tz = timezone.get_current_timezone()
			aware_present = make_aware(present, timezone=current_tz)
			due_date = self.due_date
			
			if due_date < aware_present:
				return True

	def is_due_soon(self):
		if self.due_date != None:
			present = datetime.now()
			current_tz = timezone.get_current_timezone()
			aware_present = make_aware(present, timezone=current_tz)
			due_date = self.due_date
			
			if due_date >= aware_present and due_date - aware_present <= timedelta(days=1):
				return True

	def if_cardmembership_exist(self, user_id):
		if CardMembership.objects.filter(card=self.id, member=user_id).exists():
			return True

	def if_owner_is_membership(self):
		owner = self.list_name.board.user
		if CardMembership.objects.filter(card=self, member=owner).exists():
			return CardMembership.objects.filter(card=self, member=owner)

	def get_all_card_memberships(self):
		card_memberships = CardMembership.objects.filter(card=self)

		board_memberships = []
		if card_memberships:
			for membership in card_memberships:
				if membership.member != self.list_name.board.user:
					board_membership = BoardMembership.objects.get(member=membership.member, board=self.list_name.board)
					board_memberships.append(board_membership)
		return board_memberships


class Checklist(models.Model):
	card_name = models.ForeignKey(Card, on_delete=models.CASCADE)
	checklist_title = models.CharField(max_length=200)
	date_created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.checklist_title

	def get_checked_percentage(self):
		checklist_items = self.checklistitem_set.all()
		item_checked = 0
		for item in checklist_items:
			if item.checked == True:
				item_checked += 1
		try:
			checked_percentage = int(round(item_checked/checklist_items.count(), 2)*100)
		except ZeroDivisionError:
			checked_percentage = 0
		return checked_percentage


class ChecklistItem(models.Model):
	checklist_name = models.ForeignKey(Checklist, on_delete=models.CASCADE)
	item_title = models.CharField(max_length=200)
	date_created = models.DateTimeField(auto_now_add=True)
	checked = models.BooleanField(default=False)

	def __str__(self):
		return self.item_title


class Label(models.Model):
	# board = models.ForeignKey(Board, on_delete=models.CASCADE)
	card_name = models.ForeignKey(Card, on_delete=models.CASCADE)
	label_title = models.CharField(max_length=200)
	label_custom_title = models.CharField(max_length=200, blank=True)
	label_selected = models.BooleanField(default=False)
	date_created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return self.label_title

class CardMembership(models.Model):
	card = models.ForeignKey(Card, on_delete=models.CASCADE)
	member = models.ForeignKey(User, on_delete=models.CASCADE)
	date_created = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return (self.card.card_title + " " + self.member.username)

class BoardMembership(models.Model):
	board = models.ForeignKey(Board, on_delete=models.CASCADE)
	member = models.ForeignKey(User, on_delete=models.CASCADE)
	date_created = models.DateTimeField(auto_now_add=True)
	background_color_code = models.CharField(max_length=200)

	def __str__(self):
		return (self.board.board_title + " " + self.member.username)









