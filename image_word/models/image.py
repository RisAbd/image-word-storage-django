
from django.db import models

from image_word_storage.models import BaseModel


def image_upload_to(instance, filename):
    return instance.created_at.strftime(f'images/%Y-%m-%d/{instance.name}/{filename}')


def alt_image_upload_to(instance, filename):
    return instance.created_at.strftime(f'images/%Y-%m-%d/{instance.main_image.name}/{filename}')


class Image(BaseModel):
    name = models.CharField(max_length=128, blank=True)
    file = models.ImageField(upload_to=image_upload_to)

    def __str__(self):
        return f'{self.name!r} <{self.file}>'


class AlternativeImage(BaseModel):
    main_image = models.ForeignKey(Image, on_delete=models.CASCADE)
    file = models.ImageField(upload_to=alt_image_upload_to)

    def __str__(self):
        return f'{self.main_image} / alt_img: <{self.file}>'
