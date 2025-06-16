from django.contrib import admin

# Register your models here.

from . import models


@admin.register(models.Image)
class ImageAdmin(admin.ModelAdmin):

    class AltImageInline(admin.TabularInline):
        model = models.AlternativeImage
        extra = 1

    inlines = [AltImageInline, ]

    readonly_fields = 'created_at added_by'.split()

    list_display = '__str__ created_at added_by name file'.split()

    def save_model(self, request, obj, form, change):
        obj.added_by = request.user
        if not obj.name:
            obj.name = obj.filename
        return super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        if formset.model is models.AlternativeImage:
            for alt_img in formset.save(commit=False):
                if alt_img.added_by is None:
                    alt_img.added_by = request.user
                alt_img.save()
            formset.save_m2m()
        return super().save_formset(request, form, formset, change)
