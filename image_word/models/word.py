
from django.db import models

from image_word_storage.models import BaseModel


class Language(BaseModel):

    name = models.CharField(max_length=128, blank=False)

    def __str__(self):
        return self.name


class Word(BaseModel):
    language = models.ForeignKey(Language, on_delete=models.PROTECT)
    image = models.ForeignKey('Image', on_delete=models.CASCADE)
    text = models.CharField(max_length=32, blank=False)

    def __str__(self):
        return f'{self.text!r} <{self.language}>'
