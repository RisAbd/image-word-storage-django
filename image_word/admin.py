from django.contrib import admin
from django.utils.safestring import mark_safe

from image_word_storage.admin import BaseModelAdmin

from . import models


@admin.register(models.Image)
class ImageAdmin(BaseModelAdmin):

    class AltImageInline(admin.TabularInline):
        model = models.AlternativeImage
        extra = 1
        readonly_fields = 'image_preview'.split()

        def image_preview(self, o):
            return mark_safe(f'<img src="{o.file.url}" width="200" height="200" />')

    class WordInline(admin.TabularInline):
        model = models.Word
        extra = 1

    inlines = [AltImageInline, WordInline]

    readonly_fields = 'created_at added_by image_preview'.split()

    list_display = '__str__ created_at added_by file'.split()

    def image_preview(self, o):
        return mark_safe(f'<img src="{o.file.url}" width="200" height="200" />')

    def save_model(self, request, obj, form, change):
        if not obj.name:
            obj.name = obj.filename
        return super().save_model(request, obj, form, change)


@admin.register(models.Language)
class LanguageAdmin(BaseModelAdmin):
    list_display = '__str__ code created_at added_by'.split()


@admin.register(models.Word)
class WordAdmin(BaseModelAdmin):
    list_display = 'text language image created_at added_by'.split()
    list_display_links = 'language image'.split()
    list_filter = 'language'.split()
