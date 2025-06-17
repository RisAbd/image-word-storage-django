from django.urls import path

from image_word import views

urlpatterns = [
    path('', views.index),
    path('api/random_<int:width>x<int:height>/', views.random),
    path('api/languages/', views.languages),
]
