from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Ligne,
    Poste,
    Boat,
    GammeCabine,
    VarianteGamme,
    Cabine,
    ProductionPlanningLine,
    Sheet,
    PosteVarianteDocumentation,
    SheetPage,
    InteractiveElement,
    ImageElement
)


@admin.register(Ligne)
class LigneAdmin(admin.ModelAdmin):
    list_display = ['internal_id', 'name']
    search_fields = ['internal_id', 'name']
    ordering = ['internal_id']


@admin.register(Poste)
class PosteAdmin(admin.ModelAdmin):
    list_display = ['internal_id', 'ligne']
    list_filter = ['ligne']
    search_fields = ['internal_id']
    ordering = ['internal_id']


@admin.register(Boat)
class BoatAdmin(admin.ModelAdmin):
    list_display = ['internal_id', 'name']
    search_fields = ['internal_id', 'name']
    ordering = ['internal_id']


@admin.register(GammeCabine)
class GammeCabineAdmin(admin.ModelAdmin):
    list_display = ['internal_id', 'boat']
    list_filter = ['boat']
    search_fields = ['internal_id']
    ordering = ['internal_id']


@admin.register(VarianteGamme)
class VarianteGammeAdmin(admin.ModelAdmin):
    list_display = ['internal_id', 'gamme']
    list_filter = ['gamme']
    search_fields = ['internal_id']
    ordering = ['internal_id']


@admin.register(Cabine)
class CabineAdmin(admin.ModelAdmin):
    list_display = ['internal_id', 'variante_gamme']
    list_filter = ['variante_gamme']
    search_fields = ['internal_id']
    ordering = ['internal_id']


@admin.register(ProductionPlanningLine)
class ProductionPlanningLineAdmin(admin.ModelAdmin):
    list_display = ['cabine', 'ligne', 'ligne_sens', 'entry_date', 'exit_date']
    list_filter = ['ligne', 'ligne_sens', 'entry_date']
    search_fields = ['cabine__internal_id', 'ligne__name']
    date_hierarchy = 'entry_date'
    ordering = ['-entry_date']


@admin.register(Sheet)
class SheetAdmin(admin.ModelAdmin):
    list_display = ['name', 'business_id', 'language', 'created_by', 'created_at', 'updated_at']
    list_filter = ['language', 'created_at', 'created_by']
    search_fields = ['name', 'business_id']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(PosteVarianteDocumentation)
class PosteVarianteDocumentationAdmin(admin.ModelAdmin):
    list_display = ['poste', 'varianteGamme', 'ligne_sens', 'sheet']
    list_filter = ['ligne_sens', 'poste', 'varianteGamme']
    search_fields = ['poste__internal_id', 'varianteGamme__internal_id']
    ordering = ['poste']


@admin.register(SheetPage)
class SheetPageAdmin(admin.ModelAdmin):
    list_display = ['number', 'sheet', 'business_id', 'language', 'created_by', 'created_at']
    list_filter = ['language', 'sheet', 'created_at', 'created_by']
    search_fields = ['business_id', 'description', 'sheet__name']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    date_hierarchy = 'created_at'
    ordering = ['sheet', 'number']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(InteractiveElement)
class InteractiveElementAdmin(admin.ModelAdmin):
    list_display = ['business_id', 'type', 'page', 'language', 'created_by', 'created_at']
    list_filter = ['type', 'language', 'page__sheet', 'created_at', 'created_by']
    search_fields = ['business_id', 'type', 'page__sheet__name']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    date_hierarchy = 'created_at'
    ordering = ['page', 'id']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ImageElement)
class ImageElementAdmin(admin.ModelAdmin):
    list_display = ['business_id', 'thumbnail_preview', 'page', 'language', 'width', 'height', 'created_by', 'created_at']
    list_filter = ['language', 'page__sheet', 'created_at', 'created_by']
    search_fields = ['business_id', 'page__sheet__name']
    readonly_fields = ['thumbnail_display', 'width', 'height', 'created_at', 'updated_at', 'created_by']
    date_hierarchy = 'created_at'
    ordering = ['page', 'id']
    
    fields = [
        'page',
        'business_id',
        'url',
        'thumbnail_display',
        'width',
        'height',
        'description',
        'language',
        'created_at',
        'updated_at',
        'created_by'
    ]
    
    def thumbnail_preview(self, obj):
        """Small thumbnail for list view (50x50px)"""
        if obj.url:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.url.url
            )
        return "No image"
    thumbnail_preview.short_description = 'Preview'
    
    def thumbnail_display(self, obj):
        """Large preview for detail view (up to 400x400px)"""
        if obj.url:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 400px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;" />',
                obj.url.url
            )
        return "No image uploaded yet"
    thumbnail_display.short_description = 'Image Preview'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
