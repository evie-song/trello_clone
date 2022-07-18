$(document).ready(function() {

	// csrf token settings
	function getCookie(name) {
	    let cookieValue = null;
	    if (document.cookie && document.cookie !== '') {
	        const cookies = document.cookie.split(';');
	        for (let i = 0; i < cookies.length; i++) {
	            const cookie = cookies[i].trim();
	            // Does this cookie string begin with the name we want?
	            if (cookie.substring(0, name.length + 1) === (name + '=')) {
	                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
	                break;
	            }
	        }
	    }
	    return cookieValue;
	}

	// focus the card composer if there's no cards on the page.
	function focusInitialCardInput() {
		if (($('.list-content').length == 2) && ($('.list-card').length == 0)) {
			const $cardComposer = $('.open-card-composer')
			const $newCardForm = $cardComposer.siblings("form")
			$cardComposer.hide()
			$newCardForm.show()
			$newCardForm.find('textarea').focus()
		}	
	}
	focusInitialCardInput()

	// use jquery sortable to make cards sortable. 
	function sortableCard() {
		$('.card-collection').sortable({
			revert: true,
			scroll: false,
			items: '.list-card',
			placeholder: "sortable-card-placeholder",
			cursor: "move",
			connectWith: '.card-collection',
			containment: '.board-page',
			appendTo: '.main-body',
			axis: false,

			start: function( event, ui ) { 
				$(ui.item).addClass("card-dragging");
				ui.placeholder.height(ui.item.height())
				oldListId = ui.item.closest('.list-content').find('input[name=list_id]').val()
		    },
		    stop: function( event, ui ) { 
				$(ui.item).removeClass("card-dragging");
				const cardId = ui.item.attr("id").split("_").pop()
				const newListContentEle = ui.item.closest('.list-content')
				const newListId = newListContentEle.find('input[name=list_id]').val()
				const cards = newListContentEle.find('.list-card')

				let newCardOrder = ''
				cards.each(function () {
					newCardOrder += ($(this).attr("id").split("_").pop() + ",")
				})
				const csrftoken = getCookie("csrftoken")

				$.ajax({
					url: "change_card_order",
					type: "POST",
					data: {
						"card_id": cardId,
						"old_list_id": oldListId,
						"new_list_id": newListId,
						"new_card_order": newCardOrder
					},
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRFToken", csrftoken);
					},
					success: function (data) {
					
					},
					error: function (error) {
			            console.log(error);
			        }
				})
		    }
		});
	}

	// initialize sortable on cards
	sortableCard();

	// use jquery sortable to make lists sortable. 
	function sortableList() {
		$('.board').sortable({
			revert: true,
			scroll: true,
			items: '.list-wrapper',
			handle: '.list-title',
			placeholder: "sortable-list-placeholder",
			cursor: "move",
			containment: '.main-body',
			appendTo: '.main-body',
			axis: false,
			tolerance: "pointer",

			start: function(event, ui) {
				ui.helper.addClass('list-dragging');
				ui.placeholder.height(ui.helper[0].scrollHeight)

			},
			beforeStop: function( event, ui ) { 
				ui.helper.removeClass('list-dragging')

			},
			stop: function( event, ui ) {
				const listId = ui.item.find('input[name=list_id]').val()
				const boardId = 1
				const $lists = $('.list-wrapper').find('input[name=list_id]')

				let newListOrder = ''
				$lists.each(function() {
					newListOrder += ($(this).val() + ',')
				})

				const csrftoken = getCookie("csrftoken")
				console.log(listId, $lists, newListOrder)

				$.ajax({
					url: "change_list_order",
					type: "POST",
					data: {
						"list_id": listId,
						"board_id": 1,
						"new_list_order": newListOrder
					},
					beforeSend: function (xhr) {
						xhr.setRequestHeader("X-CSRFToken", csrftoken);
					},
					success: function (data) {
						console.log(data.html)
					},
					error: function (error) {
			            console.log(error);
			        }
				})
			},
		})
	}

	// initialize sortable on lists.
	sortableList()


	// on textarea elements, auto expand height and prevent scroll bar. 
	$('textarea').each(function () {
	  this.setAttribute('style', 'height:' + (this.scrollHeight) + 'px;overflow-y:hidden;');
	  }).on('input', function () {
	  this.style.height = 'auto';
	  this.style.height = (this.scrollHeight) + 'px';
	})

	// new card composer changes when selected. 
	$(document).on("click", ".open-card-composer", function(){
		const $cardComposer = $(this)
		const $newCardForm = $(this).siblings("form")
		$cardComposer.hide()
		$newCardForm.show()
		$newCardForm.find('textarea').focus()
	})

	

	$(document).on("click", ".new-card-clear-icon", function(){
		const $cardComposer = $(this).parent().parent().siblings("a")
		const $newCardForm = $(this).parent().parent()
		$cardComposer.show()
		$newCardForm.hide()
	})

	// new list composer changes when selected. 
	$(document).on("click", ".open-list-composer", function(){
		const $listComposer = $(this)
		const $newListForm = $(this).siblings("form")
		$listComposer.hide()
		$newListForm.show()
		$newListForm.find('input[name=new_list_name]').focus()
	})

	$(document).on("click", ".board", function(e){
		const $formSelected = $('#new-list-form')
		const $cardComposer = $formSelected.siblings('.open-list-composer')
		$cardComposer.show()
		$formSelected.hide()
		// console.log(this)
		console.log('.board', e.target)
	})
	$(document).on('click', '.board > *', (e)=>{
		e.stopPropagation()
		e.stopImmediatePropagation()
	})

	$(document).on("click", ".new-list-clear-icon", function(){
		const $listComposer = $(this).parent().parent().siblings("a")
		const $listCardForm = $(this).parent().parent()
		$listComposer.show()
		$listCardForm.hide()
	})

	// Show and hide new checklist item form. 
	$(document).on("click", ".add-new-checklist-item-btn", function(){
		const $checklistItemComposer = $(this)
		const $newchecklistItemForm = $(this).siblings("form")
		$checklistItemComposer.hide()
		$newchecklistItemForm.show()
	})

	$(document).on("click", ".new-checklist-item-clear-btn", function(){
		const $checklistItemComposer = $(this).parent().parent().siblings("a")
		const $newchecklistItemForm = $(this).parent().parent()
		$checklistItemComposer.show()
		$newchecklistItemForm.hide()
	})
	
	// activity/comment textarea format changes when selected
	$(document).on("click", ".comment-input-box", function(){
		const commentFooter = $(".comment-input-footer");
		commentFooter.slideDown(50);
	})

	$(document).on("blur", ".comment-input-box", function(){
		const commentFooter = $(".comment-input-footer");
		if ($(".comment-input-box").val().length == 0) {
			commentFooter.slideUp(50);
		}
	})

	$(".comment-input-box").on("input", function(){
		if ($(".comment-input-box").val().length != 0) {
			$(".comment-save-btn").css({
				"backgroundColor": "#0079bf",
				"color" : "white",
			})
		} else {
			$(".comment-save-btn").css({
				"color": "#a5adba",
		    "backgroundColor": "#091e420a",
	  })}
	})

	// description textarea format changes when selected
	$(document).on("click", ".description-input-box, .description-edit-button", function(event){
		const descriptionFooter = $(".description-footer");
		const descriptionInputBox = $(".description-input-box");
		const descriptionEditButton = $(".description-edit-button");
		descriptionFooter.slideDown(50);
		descriptionEditButton.hide()
		descriptionInputBox.css({
			"backgroundColor": "white",
			"outline": "2px solid #0079bf",
			"height": "110px",
		})
	})

	$(document).on("click", ".description-control", function(){
		const descriptionInputBox = $(".description-input-box");

		if ($(".description-input-box").val().length == 0) {
			$(".description-footer").slideUp(50);
			descriptionInputBox.css({
					"backgroundColor": "#091e420a",
					"outline": "initial",
					"height": "initial"
				})
		} else {
			$(".description-edit-button").show();
			$(".description-footer").slideUp(50);
			descriptionInputBox.css({
					"backgroundColor": "unset",
					"outline": "initial",
					"height": "initial"
				})
		}
	})

	// update the checklist bar based on state of checkboxes. 
	// cross out the text when checkbox is checked.
	$(document).on("change", ".checklist-item input[type=checkbox]", function(event){
		const $label = $(this).parent("form").siblings("span")
		const $checklist = $(this).closest(".checklist-progress-item-list")
		const $checkboxItems = $checklist.find("input[type=checkbox]")
		const $checkboxCount = $checkboxItems.length
		const $numberOfChecked = $checkboxItems.filter(":checked").length
		const percentageChecked = ( $numberOfChecked / $checkboxCount * 100).toFixed(0)
		const $progress = $checklist.siblings(".checklist-progress-bar").children(".checklist-progress-number")
		const $progressBar = $progress.siblings(".background-color")

		const $checklistItem = $(this)
		const $checkboxStatus = $checklistItem.siblings('input[name="checkbox_status"]')

		if (this.checked){
			$checkboxStatus.val("True")
			$label.css("text-decoration", "line-through")
			$progress.text(percentageChecked + "%")
			$progressBar.animate({"width": `${percentageChecked}%`})
			if (percentageChecked == 100) {
				$progressBar.css({
					"backgroundColor": "#61bd4f",
					"border-top-right-radius": "4px",
		    		"border-bottom-right-radius": "4px",
			})
			} else {
				$progressBar.css({
					"backgroundColor": "#5ba4cf",
					"border-top-right-radius": "0",
		    		"border-bottom-right-radius": "0",
				})
			}
		} else {
			$checkboxStatus.val("False")
			$label.css("text-decoration", "none")
			$progress.text(percentageChecked + "%")
			$progressBar.animate({"width": `${percentageChecked}%`})
			$progressBar.css({
				"backgroundColor": "#5ba4cf",
				"border-top-right-radius": "0",
		  		"border-bottom-right-radius": "0",
			})
		}

	// save checkbox status changes to database and update checklist summary on board page.
		const $checklistItemForm = $checklistItem.parent('form')
		const $data = $checklistItemForm.serialize()
		const csrftoken = getCookie("csrftoken")

		$.ajax({
			url: "checklist_item_checked_status_change",
			type: "POST",
			data: $data,
			beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (data) {
            	const cardIdName = "card_id_" + data.card_id
            	$('.list-card[id="' + cardIdName + '"]').find(".card-footer-container .card-footer-checklist").html(data.html)
            },
            error: function (error) {
                console.log(error);
            }
		})
	})
		
	
	// Save a new checklist item.
	$(document).on("submit", ".checklist-item-form", function(event) {
		event.preventDefault()
		const $formSelected = $(this)
		if ($formSelected.find('textarea[name="name"]').val() != '' ) {
			const $data = $(this).serialize()
			const csrftoken = getCookie('csrftoken')

			$.ajax({
				url: $formSelected.attr("action"),
				type: "POST",
				data: $data,
				beforeSend: function (xhr) {
	                xhr.setRequestHeader("X-CSRFToken", csrftoken);
	            },
	            success: function (data) {
					$formSelected.parent(".checklist-new-item").siblings(".checklist-progress-item-list").append(data.card_checklist_item_html)
					$formSelected[0].reset()

					const cardIdName = "card_id_" + data.card_id
	            	$('.list-card[id="' + cardIdName + '"]').find(".card-footer-container .card-footer-checklist").html(data.index_card_checklist_html)
	            },
	            error: function (error) {
	                console.log(error);
	            }
			})
		} else {
			$formSelected.find('textarea[name="name"]').focus()
		}
		
	})


	// Setting the click event listener on the new list submit button
	$(document).on('submit', '#new-list-form', function(event){
		event.preventDefault()
		const $form = $(this)
		if ($form.find('input[name=new_list_name').val() != '') {
			const csrftoken = getCookie('csrftoken')
			const data = $form.serialize()
			console.log(data)
			$.ajax({
				url: $('#new-list-form')[0].action,
				type: "POST",
				data: data,
				beforeSend: function (xhr) {
	                xhr.setRequestHeader("X-CSRFToken", csrftoken);
	            },
	            success: function (data) {
	                $(".list-wrapper.empty").before(data.html)
	                $form[0].reset()
	                console.log('new list')
	                sortableCard()

	            },
	            error: function (error) {
	                console.log(error);
	            }
			})
		} else {
			$form.find('input[name=new_list_name').focus()
		}
	})

	// Delete a list. 
	$(document).on('click', '.confirm-delete-list.delete-alert-btn', function(event) {
		event.preventDefault()
		const $btnSelected = $(this)
		const $listId = $btnSelected.siblings('input[name=list_id]').val()
		const csrftoken = getCookie('csrftoken')

		$.ajax ({
			url: 'delete_list',
			type: 'POST',
			data: {list_id: $listId},
			beforeSend: function (xhr) {
	                xhr.setRequestHeader("X-CSRFToken", csrftoken);
	            },
	            success: function (data) {
					$('.pop-over').hide()
					$('input[name=list_id][value="' + $listId + '"]').closest('.list-wrapper').remove()
	            },
	            error: function (error) {
	                console.log(error);
	            }
		})
	})


	// Setting the click event listner on the new card submit button
	$(document).on('submit', '.new-card-form', function(event){
		event.preventDefault()
		const $formSelected = $(this)
		if ($formSelected.find('textarea').val() != '') {
			const $data = $(this).serialize()
			const csrftoken = getCookie('csrftoken')

			$.ajax({
				url: $('.new-card-form')[0].action,
				type: "POST",
				data: $data,
				beforeSend: function (xhr) {
	                xhr.setRequestHeader("X-CSRFToken", csrftoken);
	            },
	            success: function (data) {
					$formSelected.closest('.card-composer-container').siblings('.card-collection').append(data.html)
					$formSelected[0].reset()
					sortableCard()
	            },
	            error: function (error) {
	                console.log(error);
	            }
			})
		} else {
			$formSelected.find('textarea').focus()
		}
	})

	// save desciption edit to the database.
	$(document).on('submit', '.card-description-form', function(event){
		event.preventDefault()
		const csrftoken = getCookie('csrftoken')
		const $formSelected = $(this)
		const $data = $(this).serialize()

		$.ajax({
			url: $formSelected[0].action,
			type: "POST",
			data: $data,
			beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (data) {

            },
            error: function (error) {
                console.log(error);
            }
		})
	})

	// click card title to show the card page
	$(document).on("click", ".list-card", function(event) {
		const $cardPage = $(".card-page")
		const $cardIdStr = $(this).attr('id')
		const cardIdArr = $cardIdStr.split("_")
		const cardId = cardIdArr[cardIdArr.length-1]
		const csrftoken = getCookie('csrftoken')

		$.ajax({
			url: '/card_page',
			type: "POST",
			data: {
				id: cardId
			},
			beforeSend: function (xhr) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function (data) {
				$cardPage.html(data.html)
				$cardPage.show()
            },
            error: function (error) {
                console.log(error);
            }
		})
	})

	$(document).on("click", ".close-icon", function(event) {
		const cardPage = $(".card-page")
		$(cardPage).hide()
	})

	$(document).on("click", ".pop-over-close-icon", function(event) {
		$popOver = $(".pop-over")
		$popOver.hide()
	})

	// render account/new board/remove list pop over window. 
	$(document).on('click', '.member-icon.account-menu, .new-board-menu, .list-header-icon', function(event){
		event.preventDefault()
		const $btnSelected = $(this)
		const csrftoken = getCookie("csrftoken")

		let position = $(this).position()
		let positionLeft, positionTop
	
		positionLeft = position.left
		positionTop = position.top
		
		let url, data
		const userId = $(this).siblings('input[name=user_id]').val()
		console.log(positionLeft, positionTop)

		if ($btnSelected.hasClass('account-menu')) {
			url = 'render_pop_over_account'
			data = {"user_id": userId}
		}

		if ($btnSelected.hasClass('new-board-menu')) {
			url = 'render_pop_over_new_board'
			data = {"user_id": userId}
		}

		if ($btnSelected.hasClass('list-header-icon')) {
			url = 'render_pop_over_list_menu'
			const listId = $btnSelected.closest('.list-wrapper').find('input[name=list_id]').val()
			data = {"list_id": listId}
		}

		$.ajax ({
			url: url,
			type: "POST",
			data: data,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				const $popOver = $('.pop-over')
				$popOver.html(data.html)

				if ($btnSelected.hasClass('account-menu')) {
					$popOver.css({
						"left": positionLeft - $popOver.width() + 32 - 8,
						"top": positionTop + 32
					})
				}

				if ($btnSelected.hasClass('list-header-icon')) {
					position = $btnSelected.offset()
					console.log(position.left, position.top)
					$popOver.css({
						"left": position.left +24,
						"top": position.top +24
					})
				}

				if (($btnSelected.hasClass('new-board-menu')) && ($btnSelected.hasClass('board-link'))) {
					$popOver.css({
						"left": positionLeft + 100,
						"top": positionTop + $btnSelected.height - 20
					})
				} else if ($btnSelected.hasClass('new-board-menu')) {
					$popOver.css({
						"left": positionLeft + 24,
						"top": positionTop + 24
					})
				}

				$popOver.show()
				$('input.new-board-title').focus()
			},
			error: function (error) {
                console.log(error);
            }
		})
	})

	// select a background color for a new board.
	$(document).on("click", ".board-background-icon", (e) => {
		const $btnSelected = $(e.target)
		$('.icon-sm.material-icons.color-check-icon').removeClass('icon-show')
		$btnSelected.find('.color-check-icon').addClass('icon-show')
	})

	// render new checklist/label/remove checklist/add due date/remove card pop over window
	$(document).on("click", ".window-sidebar .button-link, .labels .label-name, .labels .add-label-button, .delete-checklist-btn, .due-date-edit-button", function(event) {

		const $btnSelected = $(this);
		const $cardIdArr = $(this).closest(".window").attr("id").split("_");
		const cardId = $cardIdArr[$cardIdArr.length-1];
		const csrftoken = getCookie("csrftoken");
		const $popOver = $(".pop-over");

		const position = $btnSelected.position()
		let positionLeft = position.left
		let positionTop = position.top

		let url, data
		if ($btnSelected.hasClass("add-checklist-menu")) {
			url = "render_pop_over_checklist";
			data = {"id": cardId};
		} 
		if (($btnSelected.hasClass("add-label-menu")) || ($btnSelected.hasClass("label-name")) || ($btnSelected.hasClass("add-label-button"))) {
			url = "render_pop_over_label";
			data = {"id": cardId};
		}
		if ($btnSelected.hasClass("delete-checklist-btn")) {
			url = "render_pop_over_delete_checklist";
			const $checklistId = $btnSelected.closest(".card-checklist-wrapper").find("input[name=checklist_id").val()
			data = {"checklist_id": $checklistId};
			positionTop = $btnSelected.parent().parent().position().top
		}
		if (($btnSelected.hasClass("add-date-menu")) || ($btnSelected.hasClass("due-date-edit-button"))) {
			url = "render_pop_over_due_date";
			data = {"id": cardId};
		} 
		if ($btnSelected.hasClass("add-members-menu")) {
			url = "render_pop_over_members";
			data = {"id": cardId};
		} 
		if ($btnSelected.hasClass("remove-card-menu")) {
			url = "render_pop_over_remove_card"
			data = {"id": cardId};
		}

		console.log(data)

		$.ajax({
			url: url,
			type: "POST",
			data: data,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				console.log('test')
				$popOver.html(data.html)
				if ($btnSelected.hasClass("remove-card-menu")) {
					$popOver.css({
						"left": positionLeft ,
						"top": positionTop -170
					})
				} else {
					$popOver.css({
						"left": positionLeft,
						"top": positionTop + 48
					})
				}

				// test code for the date pick. 
				$popOver.show()
				$( function() {
				    $( "#datepicker" ).datepicker();
				});
				const date = new Date($.now())
				const month = date.getMonth()+1
				const day = date.getDate()
				const dateStr = (month<10 ? '0' : '') + month + "/" + (day<10 ? '0' : '') + day + "/" + date.getFullYear()
				const timeStr = date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

				$('input.due-date-input.dates').val(dateStr)
				$('input.due-date-input.time').val(timeStr)

			},
			error: function (error) {
                console.log(error);
            }
		})
	})

	// Save a new checklist from the pop over form. 
	$(document).on("submit", ".checklist-form", function(event) {
		event.preventDefault()
		const $formSelected = $(this)

		if ($formSelected.find('input[name=name]').val() != '') {
			const $data = $formSelected.serialize()
			const $popOver = $(".pop-over")
			const csrftoken = getCookie("csrftoken")

			$.ajax({
				url: $formSelected.attr("action"),
				type: "POST",
				data: $data,

				beforeSend: function (xhr) {
					xhr.setRequestHeader("X-CSRFToken", csrftoken);
				},
				success: function (data) {
					$(".card-detail-module.card-checklist").append(data.html)
					$formSelected[0].reset()
					$popOver.hide()

					const $newChecklist = $(".card-detail-module.card-checklist div:last-child")
					$newChecklist.find(".checklist-new-item form").show()
					$newChecklist.find(".checklist-new-item textarea").focus()
					$newChecklist.find(".add-new-checklist-item-btn").hide()
				},
				error: function (error) {
	                console.log(error);
	            }
			})
		} else {
			$formSelected.find('input[name=name]').focus()
		}
	})

	// Remove an existing checklist from the pop over window. 
	$(document).on("click", ".pop-over-content .confirm-delete-checklist", function (event) {
		const $checklistId = $(this).siblings("input[name=checklist_id]").val()
		const csrftoken = getCookie("csrftoken")
		const $checklistSelected = $('.card-checklist-wrapper input[name=checklist_id][value="' + $checklistId + '"]').closest(".card-checklist-wrapper")
		$checklistSelected.remove()
		$(".pop-over").hide()

		$.ajax({
			url: "delete_checklist",
			type: "POST",
			data: {"checklist_id": $checklistId},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				const cardIdName = "card_id_" + data.card_id
            	$('.list-card[id="' + cardIdName + '"]').find(".card-footer-container .card-footer-checklist").html(data.html)
			},
			error: function (error) {
                console.log(error);
            }
		})
	})

	// Remove an existing card from the pop over window.
	$(document).on("click", ".pop-over-content .confirm-delete-card", function (event) {
		const $cardId = $(this).siblings("input[name=card_id]").val()
		const csrftoken = getCookie("csrftoken")

		$.ajax({
			url: "delete_card",
			type: "POST",
			data: {"card_id": $cardId},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				$('.card-page').hide()
				$('.pop-over').hide()
				const cardIdName = "card_id_" + $cardId
            	$('.list-card[id="' + cardIdName + '"]').remove()
			},
			error: function (error) {
                console.log(error);
            }
		})
	})

	// Update card member changes upon clicks. 
	$(document).on("click", ".select-member", function (event) {
		event.preventDefault()
		const $member = $(this)
		const $memberCheckIcon = $member.find(".member-check-icon")
		const $cardId = $member.closest(".pop-over-content").find("input[name=card_id]").val()
		const csrftoken = getCookie("csrftoken")
		const $userId = $member.find("input[name=user_id]").val()
		let memberChecked = ''
		const cardIdName = 'card_id_' + $cardId

		if ($memberCheckIcon.hasClass("icon-show")) {
			$memberCheckIcon.removeClass('icon-show')
			$memberCheckIcon.hide()
			memberChecked = 'false'


			// $('.card-detail-item.members').hide()
			// $('.list-card[id="' + cardIdName + '"]').find('.member-icon-container').hide()

		} else {
			$memberCheckIcon.addClass('icon-show')
			$memberCheckIcon.show()
			memberChecked = 'true'
		}

		$.ajax ({
			url: 'change_card_membership',
			type: 'POST',
			data: {
				"card_id":$cardId,
				"user_id": $userId,
				"member_checked": memberChecked
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				$('.card-detail-item.members .card-detail-item-content').html(data.card_member_html)
				$('.list-card[id="' + cardIdName + '"]').find(".member-icon-container").html(data.index_member_html)
				if ($('.card-detail-item-content .member-avatar').length != 0) {
					$('.card-detail-item.members').show()
				} else {
					$('.card-detail-item.members').hide()
				}
			},
			error: function (error) {
	            console.log(error);
	        }
		})
	})

	// Update card label changes upon clicks. 
	$(document).on("click", ".card-label", function (event) {
		const $label = $(this)
		const $labelCheckIcon = $label.find(".label-check-icon")
		const $cardId = $label.closest(".edit-label-pop-over").siblings("input[name=card_id]").val()
		const csrftoken = getCookie("csrftoken")
		let labelChecked = ""
		const $labelColorArr = $(this).data("id").split("_")
		const $labelColor = $labelColorArr[$labelColorArr.length-1]
		const cardIdName = 'card_id_' + $cardId

		if ($labelCheckIcon.hasClass("icon-show")) {
			$labelCheckIcon.removeClass("icon-show")
			$labelCheckIcon.hide()
			labelChecked = "false"
			$('.label-name.card-label-' + $labelColor).remove()
			$('.list-card[id="' + cardIdName + '"]').find('.label-bar.card-label-' + $labelColor).hide()
			$('.member-icon-container').hide()
			if ($('.card-detail-item.labels a.label-name').length == 0) {
				$('.card-detail-item.labels').addClass('hide')
			}

		} else {
			$labelCheckIcon.addClass("icon-show")
			$labelCheckIcon.show()
			labelChecked = "true"
			$('.card-detail-item.labels').removeClass('hide')

		}

		$.ajax({
			url: "change_card_label",
			type: "POST",
			data: {
				"label_id": $label.data("id"),
				"card_id": $cardId,
				"label_checked": labelChecked
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				$('.labels .add-button.add-label-button').before(data.card_label_html)
				$('.list-card[id="' + cardIdName + '"]').find(".list-card-label").append(data.index_label_html)
			},
			error: function (error) {
	            console.log(error);
	        }
		})
	})

	// Save due date from the pop over window. 
	$(document).on("click", ".pop-over-content .due-dates-save-btn", function(event) {
		event.preventDefault()
		const $dateInput = $('input.due-date-input.dates').val()
		const $timeInput = $('input.due-date-input.time').val()
		const dueDate = $dateInput + " " + $timeInput
		const $cardId = $(this).siblings('input[name=card_id]').val()
		const cardIdName = 'card_id_' + $cardId
		const csrftoken = getCookie("csrftoken")

		$.ajax ({
			url: "update_due_date",
			type: "POST",
			data: {
				"due_date": dueDate,
				"card_id": $cardId
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				$('.pop-over').hide()
				$('.card-detail-item.due-dates').removeClass('hide')
				$('.card-detail-module.card-detail-data').html(data.card_page_detail_html)
				$('.list-card[id="' + cardIdName + '"]').replaceWith(data.index_card_html)
			},
			error: function (error) {
				console.log(error)
			}
		})
	})

	// Remove due date from the pop over window. 
	$(document).on('click', ".pop-over-content .due-dates-remove-btn", function (event) {
		event.preventDefault()
		const $cardId = $(this).siblings('input[name=card_id]').val()
		const cardIdName = 'card_id_' + $cardId
		const csrftoken = getCookie("csrftoken")

		$.ajax ({
			url: 'remove_due_date',
			type: 'POST',
			data: {
				'card_id': $cardId
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				$('.pop-over').hide()
				$('.card-detail-item.due-dates').addClass('hide')
				$('.card-detail-module.card-detail-data').html(data.card_page_detail_html)
				$('.list-card[id="' + cardIdName + '"]').replaceWith(data.index_card_html)
			},
			error: function (error) {
				console.log(error)
			}

		})
	})

	// Complete/undo complete due date complation from the checkbox. 
	$(document).on('change', '.due-date-checkbox-form input[name=checkbox]', function (event) {
		$checkBox = $(this)
		const $cardIdArr = $(this).closest(".window").attr("id").split("_");
		const cardId = $cardIdArr[$cardIdArr.length-1];
		const cardIdName = 'card_id_' + cardId
		let status = ""
		if (this.checked) {
			status = "True"
		} else {
			status = "False"
		}
		const csrftoken = getCookie("csrftoken")

		$.ajax ({
			url: 'update_due_date_completion',
			type: 'POST',
			data: {
				'card_id': cardId,
				'status': status
			},
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			},
			success: function (data) {
				$('.card-detail-module.card-detail-data').html(data.card_page_detail_html)
				$('.list-card[id="' + cardIdName + '"]').replaceWith(data.index_card_html)
			},
			error: function (error) {
				console.log(error)
			}
		})
	})

	// create a new board.  
	$(document).on('submit', '.new-board-form', function (event) {
		event.preventDefault()
		const $formSelected = $(event.target)
		if ($formSelected.find('input[name=name]').val() != '') {
			const $userId = $formSelected.find('input[name=user_id]').val()
			const $boardTitle = $formSelected.find('input[name=name]').val()

			// const data = $formSelected.serialize()
			const $color = $('.color-check-icon.icon-show').closest('.board-background-icon').data("color")
			const csrftoken = getCookie("csrftoken")

			$.ajax ({
				url: 'new_board',
				type: 'POST',
				data: {
					user_id: $userId,
					board_title: $boardTitle,
					board_color: $color
				},
				beforeSend: function (xhr) {
					xhr.setRequestHeader("X-CSRFToken", csrftoken);
				},
				success: function (data) {
					const boardId = data.board_id
					window.location.href = '/board/' + boardId;
				},
				error: function (error) {
					console.log(error)
				}
			})
		} else {
			$formSelected.find('input[name=name]').focus()
		}
	})
})



