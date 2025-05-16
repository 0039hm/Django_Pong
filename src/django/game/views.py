from django.shortcuts import render
from django.views import generic


class PlayView(generic.TemplateView):
    template_name = 'base.html'
