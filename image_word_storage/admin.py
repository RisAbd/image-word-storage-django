from django.contrib import admin

from image_word_storage.models import BaseModel


class BaseModelAdmin(admin.ModelAdmin):
    list_display = '__str__ created_at added_by'.split()

    def save_model(self, request, obj, form, change):
        obj.added_by = request.user
        if not obj.name:
            obj.name = obj.filename
        return super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        if isinstance(formset.model, BaseModel):
            for rel_obj in formset.save(commit=False):
                if rel_obj.added_by is None:
                    rel_obj.added_by = request.user
                rel_obj.save()
            formset.save_m2m()
        return super().save_formset(request, form, formset, change)
