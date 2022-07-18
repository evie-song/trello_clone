from django.shortcuts import render, redirect
from django.contrib.auth import login, logout

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import forms  
from django.contrib import messages  
from .forms import CustomUserCreationForm 

# Create your views here.

def register(request):
	if request.method != 'POST':
		form = CustomUserCreationForm
	else:
		form = CustomUserCreationForm(data=request.POST)

		if form.is_valid():
			new_user = form.save()
			login(request, new_user)
			return redirect('trello_boards:index')

	context = {'form': form}
	return render(request, 'registration/register.html', context)

	

