from django.contrib import admin

from image_word_storage.admin import BaseModelAdmin

from . import models


@admin.register(models.Image)
class ImageAdmin(BaseModelAdmin):

    class AltImageInline(admin.TabularInline):
        model = models.AlternativeImage
        extra = 1

    class WordInline(admin.TabularInline):
        model = models.Word
        extra = 1

    inlines = [AltImageInline, WordInline]

    readonly_fields = 'created_at added_by'.split()

    list_display = '__str__ created_at added_by name file'.split()


@admin.register(models.Language)
class LanguageAdmin(BaseModelAdmin):
    pass


@admin.register(models.Word)
class WordAdmin(BaseModelAdmin):
    list_display = '__str__ language image created_at added_by'.split()
    list_display_links = 'language image'.split()
