
from django.db import models

from image_word_storage.models import BaseModel


class Language(BaseModel):
    code = models.CharField(max_length=10, blank=False, null=True)
    name = models.CharField(max_length=128, blank=False)

    def __str__(self):
        return self.name


class Word(BaseModel):
    language = models.ForeignKey(Language, on_delete=models.PROTECT)
    image = models.ForeignKey('Image', on_delete=models.CASCADE, related_name='words')
    text = models.CharField(max_length=32, blank=False)

    def __str__(self):
        return f'{self.text!r} <{self.language}>'
