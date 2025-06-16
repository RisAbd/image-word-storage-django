from pathlib import Path

from django.contrib.auth import get_user_model
from django.db import models
from django.conf import settings

User = get_user_model()


def image_upload_to(instance, filename):
    return instance.created_at.strftime(f'images/%Y-%m-%d/{instance.name}/{filename}')


def alt_image_upload_to(instance, filename):
    return instance.created_at.strftime(f'images/%Y-%m-%d/{instance.main_image.name}/{filename}')


class Image(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, editable=False)
    name = models.CharField(max_length=128, blank=True)
    file = models.ImageField(upload_to=image_upload_to)

    def __str__(self):
        return f'{self.name!r} <{self.file}>'


class AlternativeImage(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, editable=False)

    main_image = models.ForeignKey(Image, on_delete=models.CASCADE)
    file = models.ImageField(upload_to=alt_image_upload_to)

    def __str__(self):
        return f'{self.main_image} / alt_img: <{self.file}>'
