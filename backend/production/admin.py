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
    ImageElement,
    ReferenceValue,
    FieldDefinitionValue,
    ReferenceHistory,
    MediaTag,
    MediaLibrary
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


@admin.register(MediaTag)
class MediaTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_media_count', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at']
    ordering = ['name']
    
    def get_media_count(self, obj):
        return obj.media_items.count()
    get_media_count.short_description = 'Media Count'


@admin.register(MediaLibrary)
class MediaLibraryAdmin(admin.ModelAdmin):
    list_display = ['name', 'media_type', 'thumbnail_preview', 'language', 'get_tags_display', 'file_size_display', 'created_by', 'created_at']
    list_filter = ['media_type', 'language', 'tags', 'created_at', 'created_by']
    search_fields = ['name', 'description']
    readonly_fields = ['thumbnail_display', 'width', 'height', 'file_size', 'duration', 'created_at', 'updated_at', 'created_by']
    filter_horizontal = ['tags']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    fieldsets = (
        ('Media Information', {
            'fields': ('name', 'description', 'media_type')
        }),
        ('Files', {
            'fields': ('file', 'thumbnail', 'thumbnail_display')
        }),
        ('Classification', {
            'fields': ('tags', 'language')
        }),
        ('Metadata', {
            'fields': ('width', 'height', 'file_size', 'duration'),
            'classes': ('collapse',)
        }),
        ('Tracking', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def thumbnail_preview(self, obj):
        """Small thumbnail for list view (50x50px)"""
        if obj.media_type == 'image' and obj.file:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.file.url
            )
        elif obj.media_type == 'video' and obj.thumbnail:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" /><br><small>▶ Video</small>',
                obj.thumbnail.url
            )
        elif obj.media_type == 'video':
            return format_html('<small>▶ Video (no thumbnail)</small>')
        return "No media"
    thumbnail_preview.short_description = 'Preview'
    
    def thumbnail_display(self, obj):
        """Large preview for detail view (up to 400x400px)"""
        if obj.media_type == 'image' and obj.file:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 400px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;" /><br><small>{}x{} px</small>',
                obj.file.url,
                obj.width or '?',
                obj.height or '?'
            )
        elif obj.media_type == 'video' and obj.thumbnail:
            return format_html(
                '<img src="{}" style="max-width: 400px; max-height: 400px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;" /><br><small>▶ Video Thumbnail ({}s)</small>',
                obj.thumbnail.url,
                obj.duration or '?'
            )
        elif obj.media_type == 'video':
            return format_html('<small>▶ Video file uploaded (no thumbnail)</small>')
        return "No media uploaded yet"
    thumbnail_display.short_description = 'Media Preview'
    
    def get_tags_display(self, obj):
        """Display tags as comma-separated list"""
        tags = obj.tags.all()
        if tags:
            return ', '.join([tag.name for tag in tags])
        return '-'
    get_tags_display.short_description = 'Tags'
    
    def file_size_display(self, obj):
        """Display file size in human-readable format"""
        if obj.file_size:
            size = obj.file_size
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} TB"
        return '-'
    file_size_display.short_description = 'File Size'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class FieldDefinitionValueInline(admin.TabularInline):
    """Inline admin for field definition values"""
    model = FieldDefinitionValue
    extra = 0
    fields = ['name', 'type', 'language', 'value_string', 'value_int', 'value_float', 'value_image']
    readonly_fields = []
    
    def get_readonly_fields(self, request, obj=None):
        # Make fields readonly after creation to prevent accidental changes
        if obj and obj.pk:
            return ['name', 'type', 'language']
        return []


@admin.register(ReferenceValue)
class ReferenceValueAdmin(admin.ModelAdmin):
    list_display = ['id', 'type', 'version', 'get_reference_preview', 'created_by', 'created_at', 'updated_at']
    list_filter = ['type', 'created_at', 'created_by']
    search_fields = ['type', 'fields__value_string']
    readonly_fields = ['version', 'created_at', 'updated_at', 'created_by']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    inlines = [FieldDefinitionValueInline]
    
    fieldsets = (
        ('Reference Information', {
            'fields': ('type', 'icon', 'version')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
    
    def get_reference_preview(self, obj):
        """Get preview of reference field value"""
        ref_field = obj.fields.filter(name='reference', language='en').first()
        if not ref_field:
            ref_field = obj.fields.filter(name='reference').first()
        if ref_field:
            value = ref_field.get_value()
            return f"{value} ({ref_field.language or 'no-lang'})" if value else '-'
        return '-'
    get_reference_preview.short_description = 'Reference'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(FieldDefinitionValue)
class FieldDefinitionValueAdmin(admin.ModelAdmin):
    list_display = ['id', 'reference', 'name', 'type', 'language', 'get_value_display']
    list_filter = ['type', 'language', 'reference__type']
    search_fields = ['name', 'value_string', 'reference__type']
    readonly_fields = ['get_value_display']
    ordering = ['reference', 'name', 'language']
    
    fieldsets = (
        ('Field Information', {
            'fields': ('reference', 'name', 'type', 'language')
        }),
        ('Values', {
            'fields': ('value_string', 'value_int', 'value_float', 'value_image', 'get_value_display')
        }),
    )
    
    def get_value_display(self, obj):
        """Display the appropriate value based on type"""
        value = obj.get_value()
        if obj.type == 'image' and obj.value_image:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;" /><br>{}',
                obj.value_image.image.url,
                obj.value_image.name
            )
        return value if value is not None else '-'
    get_value_display.short_description = 'Current Value'


@admin.register(ReferenceHistory)
class ReferenceHistoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'reference', 'version', 'changed_by', 'changed_at', 'get_changes_summary']
    list_filter = ['changed_at', 'changed_by', 'reference__type']
    search_fields = ['reference__type']
    readonly_fields = ['reference', 'version', 'changed_by', 'changed_at', 'changes', 'get_changes_display']
    date_hierarchy = 'changed_at'
    ordering = ['-changed_at']
    
    fieldsets = (
        ('History Information', {
            'fields': ('reference', 'version', 'changed_by', 'changed_at')
        }),
        ('Changes', {
            'fields': ('get_changes_display', 'changes')
        }),
    )
    
    def get_changes_summary(self, obj):
        """Brief summary of changes"""
        changes = obj.changes
        if isinstance(changes, dict):
            if 'action' in changes:
                return changes['action'].capitalize()
            elif 'fields' in changes:
                return 'Fields updated'
            else:
                return f"{len(changes)} fields changed"
        return '-'
    get_changes_summary.short_description = 'Changes'
    
    def get_changes_display(self, obj):
        """Pretty display of changes"""
        import json
        return format_html('<pre>{}</pre>', json.dumps(obj.changes, indent=2))
    get_changes_display.short_description = 'Changes (Formatted)'
    
    def has_add_permission(self, request):
        # History entries should only be created automatically
        return False
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of history
        return False


@admin.register(PosteVarianteDocumentation)
class PosteVarianteDocumentationAdmin(admin.ModelAdmin):
    list_display = ['poste', 'varianteGamme', 'ligne_sens', 'sheet']
    list_filter = ['ligne_sens', 'poste', 'varianteGamme']
    search_fields = ['poste__internal_id', 'varianteGamme__internal_id']
    ordering = ['poste']


@admin.register(SheetPage)
class SheetPageAdmin(admin.ModelAdmin):
    list_display = ['number', 'sheet', 'created_by', 'created_at']
    list_filter = ['sheet', 'created_at', 'created_by']
    search_fields = ['sheet__name']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    date_hierarchy = 'created_at'
    ordering = ['sheet', 'number']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(InteractiveElement)
class InteractiveElementAdmin(admin.ModelAdmin):
    list_display = ['business_id', 'type', 'page', 'created_by', 'created_at']
    list_filter = ['type', 'page__sheet', 'created_at', 'created_by']
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
    list_display = ['business_id', 'thumbnail_preview', 'page', 'width', 'height', 'created_by', 'created_at']
    list_filter = ['page__sheet', 'created_at', 'created_by']
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
        'descriptions',
        'konva_jsons',
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
