from django.urls import path

from imgdescribeapp import views

app_name = 'imgdescribeapp'

urlpatterns = [
    path('start/', views.start_quickdescribe, name='start'),
    path('next_img/<int:idx>', views.get_image_path, name='serve_image'),
    path('score/<int:idx>/<str:sent>', views.calc_sentence_score, name="score"),
]
