from django.urls import path

from . import views

app_name = 'trello_boards'

urlpatterns = [
    path('', views.index, name='index'),
    path('board/<int:board_id>', views.board_page, name='board_page'),
    path('new_list', views.new_list, name="new_list"),
    path('new_card', views.new_card, name="new_card"),
    path('card_page', views.card_page, name="card_page"),
    path('card_description_edit', views.card_description_edit, name="card_description_edit"),
    path('new_checklist_item', views.new_checklist_item, name="new_checklist_item"),
    path('board/new_checklist', views.new_checklist, name="new_checklist"),
    path('board/checklist_item_checked_status_change', views.checklist_item_checked_status_change, name="checklist_item_checked_status_change"),
    path('board/change_card_label', views.change_card_label, name="change_card_label"),
    path('board/render_pop_over_checklist', views.render_pop_over_checklist, name="render_pop_over_checklist"),
    path('board/render_pop_over_label', views.render_pop_over_label, name="render_pop_over_label"),
    path('board/render_pop_over_delete_checklist', views.render_pop_over_delete_checklist, name="render_pop_over_delete_checklist"),
    path('board/delete_checklist', views.delete_checklist, name="delete_checklist"),
    path('board/render_pop_over_due_date', views.render_pop_over_due_date, name="render_pop_over_due_date"),
    path('board/change_card_order', views.change_card_order, name='change_card_order'),
    path('board/change_list_order', views.change_list_order, name='change_list_order'),
    path('board/render_pop_over_remove_card', views.render_pop_over_remove_card, name='render_pop_over_remove_card'),
    path('board/delete_card', views.delete_card, name='delete_card'),
    path('board/update_due_date', views.update_due_date, name='update_due_date'),
    path('board/render_pop_over_members', views.render_pop_over_members, name='render_pop_over_members'),
    path('board/change_card_membership', views.change_card_membership, name='change_card_membership'),
    path('board/remove_due_date', views.remove_due_date, name='remove_due_date'),
    path('board/update_due_date_completion', views.update_due_date_completion, name='update_due_date_completion'),
    path('board/render_pop_over_account', views.render_pop_over_account, name='render_pop_over_account'),
    path('render_pop_over_account', views.render_pop_over_account, name='render_pop_over_account'),
    path('board/render_pop_over_new_board', views.render_pop_over_new_board, name='render_pop_over_new_board'),
    path('board/new_board', views.new_board, name='new_board'),
    path('new_board', views.new_board, name='new_board'),
    path('board/render_pop_over_list_menu', views.render_pop_over_list_menu, name='render_pop_over_list_menu'),
    path('board/delete_list', views.delete_list, name='delete_list'),
    path('render_pop_over_new_board', views.render_pop_over_new_board, name='render_pop_over_new_board'),
]