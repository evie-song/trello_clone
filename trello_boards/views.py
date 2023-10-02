from django.shortcuts import render, get_list_or_404, get_object_or_404, redirect

from django.http import HttpResponse, JsonResponse

from django.template.loader import render_to_string

from .models import Board, List, Card, Checklist, ChecklistItem, Label, CardMembership, BoardMembership, CardLabel

import datetime
from django.utils import timezone
from django.utils.timezone import get_current_timezone, make_aware

from django.contrib.auth.models import User

# from django.contrib.auth import login

from django.contrib.auth.decorators import login_required

from django.views.decorators.csrf import csrf_exempt

import random
# from django.views.decorators.csrf import requires_csrf_token, ensure_csrf_cookie
# from django.template import RequestContext



# Create your views here.
@login_required(login_url='/users/login/')
def index(request):
	user = request.user
	return render(request, "index_boards_partial.html", {'user': user})

	# board = get_object_or_404(Board, id=1)
	# user = User.objects.get(id=board.user_id)
	# lists = get_list_or_404(List)
	# return render(request, "index_boards_partial.html", {'board': board, 'lists': lists, 'user': user})

@login_required(login_url='/users/login/')
def board_page(request, board_id):
	board_selected = get_object_or_404(Board, id=board_id)
	user = User.objects.get(id=board_selected.user_id)
	board_members = BoardMembership.objects.filter(board=board_selected)
	if List.objects.filter(board_id=board_selected.id).exists():
		lists = List.objects.filter(board_id=board_selected.id)
	else:
		lists = []
	return render(request, "index_board_partial.html", {'board_members': board_members,'board_selected': board_selected, 'lists': lists, 'user': user})
	
def edit_board_title(request):
	if request.method == "POST":
		board_id = request.POST['board_id']
		board_title = request.POST['board_title']
		board_selected = Board.objects.get(id=board_id)
		board_selected.board_title = board_title
		board_selected.save()
		
		return JsonResponse({'result': "success" })

def new_list(request):
	if request.method == "POST":
		new_list = List()
		new_list.list_title = request.POST['new_list_name']
		new_list.board_id= int(request.POST['board_id'])
		new_list.save()

		# update list_order attribute of the board.
		board = new_list.board
		board.list_order += (str(new_list.id) + ',')
		board.save()

		context = {"list": new_list}
		html = render_to_string('index_list_partial.html', context)
		return JsonResponse({'html':html})

def update_list_title(request):
	if request.method == "POST":
		list_id = request.POST['list_id']
		list_selected = List.objects.get(id=list_id)
		new_title = request.POST['list_title']
		list_selected.list_title = new_title
		list_selected.save()
		return JsonResponse({'result': 'success'})

def new_card(request):
	if request.method == "POST":
		new_card = Card()
		list_id = request.POST['list_id']
		new_card.card_title = request.POST['new_card_name']
		new_card.list_name_id = list_id
		new_card.save()

		# update card_order attribute of the list. 
		list_selected = List.objects.get(id=list_id)
		list_selected.card_order += (str(new_card.id) + ",")
		list_selected.save()

		context = {"card": new_card}
		html = render_to_string('index_list_card_partial.html', context)
		return JsonResponse({'html':html})

def card_page(request):
	if request.method == "POST":
		card_id = int(request.POST.get('id'))
		card_selected = Card.objects.get(id=card_id)
		card_checklists = card_selected.checklist_set.all()
		card_labels = card_selected.get_labels_in_order()
		if CardMembership.objects.filter(card_id=card_id).exists():
			card_memberships = CardMembership.objects.filter(card_id=card_id)
		else:
			card_memberships = []
		context = {"card": card_selected, "card_checklists": card_checklists, "card_labels": card_labels, "card_memberships": card_memberships}

		html = render_to_string('card_page.html', context)
		return JsonResponse({'html':html})

def card_description_edit(request):
	if request.method == "POST":
		card_id = request.POST['card_id']
		card_selected = Card.objects.get(id=card_id)
		new_description = request.POST['description_content']
		card_selected.card_description = new_description
		card_selected.save()
		return JsonResponse({'html':"succsess"})

def edit_card_title(request):
	if request.method == "POST":
		card_id = request.POST['card_id']
		card_selected = Card.objects.get(id=card_id)
		new_title = request.POST['card_title']
		card_selected.card_title = new_title.strip()
		card_selected.save()
		return JsonResponse({'html': "success"})

def new_checklist_item(request):
	if request.method == "POST":
		new_checklist_item = ChecklistItem()
		new_checklist_item.item_title = request.POST["name"]
		new_checklist_item.checklist_name_id = request.POST["checklist_id"]
		new_checklist_item.save()

		card_id = Checklist.objects.get(id=new_checklist_item.checklist_name_id).card_name_id
		card = Card.objects.get(id=card_id)
		context = {"item": new_checklist_item, "card": card}
		index_card_checklist_html = render_to_string("index_list_card_checklist_partial.html", context)
		card_checklist_item_html = render_to_string("card_page_checklist_item_partial.html", context)

		return JsonResponse({'index_card_checklist_html': index_card_checklist_html, 'card_checklist_item_html': card_checklist_item_html, 'card_id': card_id})

def new_checklist(request):
	if request.method == "POST":
		new_checklist = Checklist()
		new_checklist.checklist_title = request.POST["name"]
		new_checklist.card_name_id = request.POST["card_id"]
		new_checklist.save()
		context = {'checklist': new_checklist}
		html = render_to_string("card_page_checklist_partial.html", context)
		return JsonResponse({'html':html})

def checklist_item_checked_status_change(request):
	if request.method == "POST":
		checklist_item_id = request.POST["checklist_item_id"]
		checklist_item = ChecklistItem.objects.get(id=checklist_item_id)
		checkbox_value = request.POST["checkbox_status"]
		checklist_item.checked = checkbox_value
		checklist_item.save()

		card_id = Checklist.objects.get(id=checklist_item.checklist_name_id).card_name_id
		card = Card.objects.get(id=card_id)
		context = {"card": card}
		html = render_to_string("index_list_card_checklist_partial.html", context)
		return JsonResponse({'html': html, "card_id": card_id})

def change_card_label(request):
	if request.method == "POST":
		selected_label_color = request.POST.get('label_color')
		selected_card_id = int(request.POST.get("card_id"))
		label_checked_str = request.POST.get("label_checked")
		card = Card.objects.get(id=selected_card_id)
		board = card.list_name.board
		board_label = Label.objects.get(board=board, label_title=selected_label_color)

		if label_checked_str == "true":
			new_card_label = CardLabel()
			new_card_label.card = card
			new_card_label.label = board_label
			new_card_label.save()

			context = {"card": card}
			card_page_detail_html = render_to_string("card_page_detail_data_partial.html", context)
			index_card_html = render_to_string('index_list_card_partial.html', context)
			return JsonResponse({'card_page_detail_html': card_page_detail_html, 'index_card_html': index_card_html })

		elif label_checked_str == "false":
			card_label = CardLabel.objects.get(card=card, label=board_label)
			card_label.delete()
			return JsonResponse({"html":""})
		
def render_pop_over_checklist(request):
	if request.method == "POST":
		card_id = int(request.POST.get('id'))
		card_selected = Card.objects.get(id=card_id)
		context = {"card": card_selected}
		html = render_to_string("pop_over_checklist_partial.html",context)
		return JsonResponse({'html':html})

def render_pop_over_label(request):
	if request.method == "POST":
		card_id = int(request.POST.get('id'))
		card_selected = Card.objects.get(id=card_id)
		board_labels = card_selected.list_name.board.label_set.all()
		card_labels = card_selected.cardlabel_set.all()
		label_list = []
		for card_label in card_labels:
			label_list.append(card_label.label.label_title)
		context = {"card": card_selected, "label_list": label_list, "board_labels": board_labels }
		html = render_to_string("pop_over_label_partial.html",context)
		return JsonResponse({'html':html})

def render_pop_over_delete_checklist(request):
	if request.method == "POST":
		checklist_id = int(request.POST.get('checklist_id'))
		checklist_selected = Checklist.objects.get(id=checklist_id)
		context = {"checklist": checklist_selected}

		html = render_to_string("pop_over_remove_checklist_partial.html", context)
		return JsonResponse({'html':html})

def delete_checklist(request):
	if request.method == "POST":
		checklist_id = int(request.POST.get('checklist_id'))
		checklist_selected = Checklist.objects.get(id=checklist_id)
		checklist_selected.delete()

		card_id = checklist_selected.card_name_id
		card = Card.objects.get(id=card_id)
		context = {"card": card}
		html = render_to_string("index_list_card_checklist_partial.html", context)
		return JsonResponse({'html': html, "card_id": card_id})

def render_pop_over_due_date(request):
	if request.method == "POST":
		card_id = int(request.POST.get('id'))
		card_selected = Card.objects.get(id=card_id)
		context = {"card": card_selected}

		html = render_to_string("pop_over_due_date_partial.html",context)
		return JsonResponse({'html':html})

def change_card_order(request):
	if request.method == "POST":
		card_id = int(request.POST.get('card_id'))
		old_list_id = int(request.POST.get('old_list_id'))
		new_list_id	= int(request.POST.get('new_list_id'))
		new_card_order = request.POST.get('new_card_order')
		new_list = List.objects.get(id=new_list_id)
		new_list.card_order = new_card_order
		new_list.save()

		if new_list_id != old_list_id:
			card = Card.objects.get(id=card_id)
			card.list_name_id = new_list_id
			card.save()
			old_list = List.objects.get(id=old_list_id)
			new_card_id_str = (str(card_id) + ',')
			old_list.card_order = old_list.card_order.replace(new_card_id_str,"")
			old_list.save()

		return JsonResponse({'html':""})

def change_list_order(request):
	if request.method == "POST":
		list_id = int(request.POST.get('list_id'))
		list_selected = List.objects.get(id=list_id)
		board_id = list_selected.board_id
		board = Board.objects.get(id=board_id)
		new_list_order = request.POST.get('new_list_order')
		board.list_order = new_list_order
		board.save()

		return JsonResponse({'html':new_list_order})

def render_pop_over_remove_card(request):
	if request.method == "POST":
		card_id = int(request.POST.get('id'))
		card_selected = Card.objects.get(id=card_id)
		context = {"card": card_selected}
		html = render_to_string("pop_over_remove_card_partial.html",context)
		return JsonResponse({'html':html})

def delete_card(request):
	if request.method == "POST":
		card_id = int(request.POST.get('card_id'))
		card = Card.objects.get(id=card_id)
		card.delete()

		list_id = card.list_name_id
		list_belong = List.objects.get(id=list_id)
		card_id_str = (str(card_id) + ',')
		list_belong.card_order = list_belong.card_order.replace(card_id_str,"")
		list_belong.save()

		return JsonResponse({'html': ""})

def update_due_date(request):
	if request.method == "POST":
		card_id = int(request.POST.get('card_id'))
		card = Card.objects.get(id=card_id)
		due_date_input = request.POST.get('due_date')
		datetime_obj = datetime.datetime.strptime(due_date_input, "%m/%d/%Y %I:%M %p")
		current_tz = timezone.get_current_timezone()
		aware_datetime = make_aware(datetime_obj, timezone=current_tz)
		card.due_date = aware_datetime
		card.save()

		context = {"card": card}
		card_page_detail_html = render_to_string("card_page_detail_data_partial.html", context)
		index_card_html = render_to_string('index_list_card_partial.html', context)
		return JsonResponse({'card_page_detail_html': card_page_detail_html, 'index_card_html': index_card_html })

def remove_due_date(request):
	if request.method == 'POST':
		card_id = int(request.POST.get('card_id'))
		card = Card.objects.get(id=card_id)
		card.due_date = None 
		card.save()

		context = {"card": card}
		card_page_detail_html = render_to_string("card_page_detail_data_partial.html", context)
		index_card_html = render_to_string('index_list_card_partial.html', context)
		return JsonResponse({'card_page_detail_html': card_page_detail_html, 'index_card_html': index_card_html })

def update_due_date_completion(request):
	if request.method == 'POST':
		card_id = int(request.POST.get('card_id'))
		card = Card.objects.get(id=card_id)
		due_date_status = request.POST.get('status')
		if due_date_status == 'True':
			card.due_date_completed = True
		elif due_date_status == 'False':
			card.due_date_completed = False 
		card.save()

		context = {"card": card}
		card_page_detail_html = render_to_string("card_page_detail_data_partial.html", context)
		index_card_html = render_to_string('index_list_card_partial.html', context)
		return JsonResponse({'card_page_detail_html': card_page_detail_html, 'index_card_html': index_card_html })


def render_pop_over_members(request):
	if request.method == "POST":
		card_id = int(request.POST.get('id'))
		card_selected = Card.objects.get(id=card_id)
		user = card_selected.list_name.board.user
		board = card_selected.list_name.board
		board_memberships = BoardMembership.objects.filter(board=board)
		card_membership_status = card_selected.if_cardmembership_exist(user.id)
		all_members = [{"member": user, "status": card_membership_status, "background_color": ''}]
		if board_memberships.count() != 0:
			for membership in board_memberships:
				if CardMembership.objects.filter(member=membership.member, card=card_selected).exists():
					status = True 
				else:
					status = False
				status = {"member": membership.member, "status": status, "background_color": membership.background_color_code}
				all_members.append(status)
		context = {"card": card_selected, "all_members": all_members, user: user, "card_membership_status": card_membership_status}
		html = render_to_string("pop_over_members_partial.html",context)
		return JsonResponse({'html':html, "card_id":card_id, "card_membership_status": card_membership_status})

def change_card_membership(request):
	if request.method == "POST":
		card_id = int(request.POST.get("card_id"))
		card_selected = Card.objects.get(id=card_id)
		user_id = int(request.POST.get("user_id"))
		user = User.objects.get(id=user_id)
		member_checked_str = request.POST.get("member_checked")
		if member_checked_str == "true":
			card_membership = CardMembership(member=user,card=card_selected)
			card_membership.background_color_code = "%06x" % random.randint(0, 0xFFFFFF)
			card_membership.save()
		elif member_checked_str == 'false':
			card_membership = CardMembership.objects.get(member=user,card=card_selected)
			card_membership.delete()
		context = {"card": card_selected}
		card_member_html = render_to_string("card_page_members_partial.html", context)
		index_member_html = render_to_string("index_list_card_member_partial.html", context)
		return JsonResponse({"card_member_html": card_member_html, "index_member_html": index_member_html})

def render_pop_over_account(request):
	if request.method == 'POST':
		user_id = int(request.POST.get("user_id"))
		user = User.objects.get(id=user_id)
		html = render_to_string('index_pop_over_account_partial.html',{"user": user})
		return JsonResponse({'html':html})

def render_pop_over_new_board(request):
	if request.method == 'POST':
		user_id = int(request.POST.get("user_id"))
		user = User.objects.get(id=user_id)
		html = render_to_string('index_pop_over_new_board_partial.html', {"user": user})
		return JsonResponse({'html': html})

def render_pop_over_delete_board(request):
	if request.method == 'POST':
		board_id = request.POST['board_id']
		board = Board.objects.get(id=board_id)
		html = render_to_string('pop_over_delete_board_partial.html', {"board": board})
		return JsonResponse({'html': html})

def new_board(request):
	if request.method == 'POST':
		user_id = request.user.id
		# user_id = int(request.POST['user_id'])
		board_title = request.POST.get('board_title')
		board_background_color = request.POST.get('board_color')
		new_board = Board()
		new_board.user_id = user_id
		new_board.board_title = board_title

		if board_background_color == None:
			new_board.background_color = 'default'
		else:	
			new_board.background_color = board_background_color
		new_board.save()

		label_list = ["green", "yellow", "orange", "red", "purple", "blue"]
		for label in label_list:
			new_label = Label()
			new_label.board = new_board
			new_label.label_title = label
			new_label.save()

		new_list = List()
		new_list.board_id = new_board.id
		new_list.list_title = 'To Do'
		new_list.save()

		new_board.list_order += (str(new_list.id) + ',')
		new_board.save()
		return JsonResponse({'board_id': new_board.id})

def delete_board(request, board_id):
	board_selected = Board.objects.get(id=board_id)
	board_selected.delete()
	return redirect('/')


def render_pop_over_list_menu(request):
	if request.method == 'POST':
		list_id = int(request.POST.get('list_id'))
		list_selected = List.objects.get(id=list_id)
		html = render_to_string('index_pop_over_remove_list_partial.html', {'list': list_selected})
		return JsonResponse({'html': html})

def delete_list(request):
	if request.method == 'POST':
		list_id = int(request.POST.get('list_id'))
		list_selected = List.objects.get(id=list_id)
		list_selected.delete()

		board = list_selected.board
		list_id_str = (str(list_id) + ',')
		board.list_order = board.list_order.replace(list_id_str, '')
		board.save()
		return JsonResponse({'html': ''})

def render_pop_over_change_label_name(request):
	if request.method == 'POST':
		card_id = int(request.POST.get('card_id'))
		label_color = request.POST.get('label_color')
		card_selected = Card.objects.get(id=card_id)
		board = card_selected.list_name.board
		label_selected = Label.objects.get(board=board, label_title=label_color)
		context = {"card": card_selected, "label": label_selected}
		html = render_to_string('pop_over_change_label_name_partial.html', context)
		return JsonResponse({"html": html})

def change_label_name(request):
	if request.method == "POST":
		card_id = int(request.POST["card_id"])
		label_selected = Label.objects.get(id=int(request.POST["board_label_id"]))
		label_selected.label_custom_title = request.POST["name"]
		label_selected.save()

		card_selected = Card.objects.get(id=card_id)
		board_labels = card_selected.list_name.board.label_set.all()
		card_labels = card_selected.cardlabel_set.all()
		label_list = []
		for card_label in card_labels:
			label_list.append(card_label.label.label_title)
		context = {"card": card_selected, "label_list": label_list, "board_labels": board_labels }
		pop_over_label_html = render_to_string("pop_over_label_partial.html",context)

		context = {"card": card_selected}
		card_page_detail_html = render_to_string("card_page_detail_data_partial.html", context)

		return JsonResponse({'pop_over_html':pop_over_label_html, "card_page_html": card_page_detail_html})












	
	
