from django.db import models
from django.conf import settings
from datetime import date


class Ligne(models.Model):
    internal_id = models.CharField(max_length=10, help_text="internal id of the ligne")
    name = models.CharField(max_length=100, help_text="Name of the ligne", default="none")

    class Meta:
        db_table = 'ligne'
        verbose_name = 'Ligne'
        verbose_name_plural = 'Lignes'

    def __str__(self):
        return f"{self.name} ({self.internal_id})"


class Poste(models.Model):
    internal_id = models.CharField(max_length=10, help_text="internal id of the poste")
    ligne = models.ForeignKey(Ligne, on_delete=models.CASCADE, help_text="reference to the ligne")

    class Meta:
        db_table = 'poste'
        verbose_name = 'Poste'
        verbose_name_plural = 'Postes'

    def __str__(self):
        return f"Poste {self.internal_id}"


class Boat(models.Model):
    internal_id = models.CharField(max_length=10, help_text="internal id of the boat")
    name = models.CharField(max_length=100, help_text="Name of the boat", default="non défini")

    class Meta:
        db_table = 'boat'
        verbose_name = 'Boat'
        verbose_name_plural = 'Boats'

    def __str__(self):
        return f"{self.name} ({self.internal_id})"


class GammeCabine(models.Model):
    internal_id = models.CharField(max_length=10, help_text="internal id of the gamme")
    boat = models.ForeignKey(Boat, on_delete=models.CASCADE, help_text="reference to the boat")

    class Meta:
        db_table = 'gamme_cabine'
        verbose_name = 'Gamme Cabine'
        verbose_name_plural = 'Gammes Cabine'

    def __str__(self):
        return f"Gamme {self.internal_id}"


class VarianteGamme(models.Model):
    gamme = models.ForeignKey(GammeCabine, on_delete=models.CASCADE, help_text="reference to the gamme")
    internal_id = models.CharField(max_length=10, help_text="internal id of the variante")

    class Meta:
        db_table = 'variante_gamme'
        verbose_name = 'Variante Gamme'
        verbose_name_plural = 'Variantes Gamme'

    def __str__(self):
        return f"Variante {self.internal_id}"


class Cabine(models.Model):
    internal_id = models.CharField(max_length=10, help_text="internal id of the cabine")
    variante_gamme = models.ForeignKey(VarianteGamme, on_delete=models.CASCADE, help_text="reference to the variante")

    class Meta:
        db_table = 'cabine'
        verbose_name = 'Cabine'
        verbose_name_plural = 'Cabines'

    def __str__(self):
        return f"Cabine {self.internal_id}"


class ProductionPlanningLine(models.Model):
    cabine = models.ForeignKey(Cabine, on_delete=models.CASCADE, help_text="reference to the cabine")
    ligne = models.ForeignKey(Ligne, on_delete=models.CASCADE, help_text="reference to the ligne")
    ligne_sens = models.CharField(max_length=1, help_text="sens of the ligne: D, G or -", default="D")
    entry_date = models.DateField(help_text="entry date of the ligne")
    exit_date = models.DateField(help_text="exit date of the ligne")
    scheduled_entry_date = models.DateField(help_text="scheduled entry date of the ligne", default=date.today)
    scheduled_exit_date = models.DateField(help_text="scheduled exit date of the ligne", default=date.today)

    class Meta:
        db_table = 'production_planning_line'
        verbose_name = 'Production Planning Line'
        verbose_name_plural = 'Production Planning Lines'

    def __str__(self):
        return f"Planning {self.cabine} on {self.ligne}"


class Sheet(models.Model):
    name = models.CharField(max_length=200, help_text="Name of the sheet")
    business_id = models.CharField(max_length=100, help_text="Business identifier for translation")
    language = models.CharField(max_length=10, help_text="Language code (e.g., en, fr, es)", default="en")
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the sheet was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the sheet was last updated")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_sheets',
        help_text="User who created this sheet"
    )

    class Meta:
        db_table = 'sheet'
        verbose_name = 'Sheet'
        verbose_name_plural = 'Sheets'
        unique_together = [['business_id', 'language']]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.business_id} - {self.language})"


class PosteVarianteDocumentation(models.Model):
    poste = models.ForeignKey(Poste, on_delete=models.CASCADE, help_text="reference to the poste")
    varianteGamme = models.ForeignKey(VarianteGamme, on_delete=models.CASCADE, help_text="reference to the variante")
    ligne_sens = models.CharField(max_length=1, help_text="sens of the ligne: D, G or -", default="D")
    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, help_text="reference to the interactive sheet")

    class Meta:
        db_table = 'poste_variante_documentation'
        verbose_name = 'Poste Variante Documentation'
        verbose_name_plural = 'Poste Variante Documentations'

    def __str__(self):
        return f"Doc for {self.poste} - {self.varianteGamme}"


class SheetPage(models.Model):
    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name='pages', help_text="reference to the sheet")
    number = models.IntegerField(help_text="Page number")
    description = models.JSONField(
        default=dict,
        blank=True,
        help_text="Page description in multiple languages: {'en': 'English desc', 'fr': 'Description française'}"
    )
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the page was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the page was last updated")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_pages',
        help_text="User who created this page"
    )

    class Meta:
        db_table = 'sheet_page'
        verbose_name = 'Sheet Page'
        verbose_name_plural = 'Sheet Pages'
        unique_together = [['sheet', 'number']]
        ordering = ['sheet', 'number']

    def __str__(self):
        return f"Page {self.number} of {self.sheet.name}"
    
    def get_description(self, language='en'):
        """Get description for a specific language with fallback to 'en' then 'fr'"""
        if not self.description:
            return ""
        if language in self.description:
            return self.description[language]
        # Fallback to English, then French, then first available
        for fallback_lang in ['en', 'fr']:
            if fallback_lang in self.description:
                return self.description[fallback_lang]
        # Return first available language if no fallback found
        return next(iter(self.description.values())) if self.description else ""


class InteractiveElement(models.Model):
    page = models.ForeignKey(SheetPage, on_delete=models.CASCADE, related_name='elements', help_text="reference to the page")
    business_id = models.CharField(max_length=100, help_text="Business identifier")
    type = models.CharField(max_length=50, help_text="Type of interactive element")
    
    # Multilingual fields
    descriptions = models.JSONField(
        default=dict,
        blank=True,
        help_text="Descriptions by language: {'en': 'desc', 'fr': 'desc'}"
    )
    konva_jsons = models.JSONField(
        default=dict,
        blank=True,
        help_text="Konva JSON representations by language: {'en': {...}, 'fr': {...}}"
    )
    
    # Reference link (for elements spawned from reference library)
    reference_value = models.ForeignKey(
        'ReferenceValue',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='canvas_instances',
        help_text="Source reference for this element (if spawned from reference library)"
    )
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the element was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the element was last updated")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_elements',
        help_text="User who created this element"
    )

    class Meta:
        db_table = 'interactive_element'
        verbose_name = 'Interactive Element'
        verbose_name_plural = 'Interactive Elements'
        ordering = ['page', 'id']

    def __str__(self):
        return f"{self.type} - {self.business_id}"


class ImageTag(models.Model):
    """Tags for organizing images in the library"""
    name = models.CharField(max_length=50, unique=True, help_text="Tag name")
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the tag was created")
    
    class Meta:
        db_table = 'image_tag'
        verbose_name = 'Image Tag'
        verbose_name_plural = 'Image Tags'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ImageLibrary(models.Model):
    """Centralized image storage with tagging and language support"""
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('fr', 'French'),
    ]
    
    name = models.CharField(max_length=255, help_text="Image name")
    description = models.TextField(blank=True, help_text="Image description")
    image = models.ImageField(upload_to='library_images/%Y/%m/%d/', help_text="Upload an image file")
    tags = models.ManyToManyField(ImageTag, blank=True, related_name='images', help_text="Tags for organizing images")
    language = models.CharField(
        max_length=2,
        choices=LANGUAGE_CHOICES,
        blank=True,
        null=True,
        help_text="Language for this image (optional)"
    )
    
    # Image dimensions
    width = models.IntegerField(null=True, blank=True, help_text="Image width in pixels")
    height = models.IntegerField(null=True, blank=True, help_text="Image height in pixels")
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the image was uploaded")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the image was last updated")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_images',
        help_text="User who uploaded this image"
    )
    
    class Meta:
        db_table = 'image_library'
        verbose_name = 'Image Library'
        verbose_name_plural = 'Image Library'
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-detect image dimensions if not set
        if self.image and not self.width and not self.height:
            try:
                from PIL import Image
                img = Image.open(self.image)
                self.width, self.height = img.size
            except Exception:
                pass
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} ({self.language or 'no language'})"


class ImageElement(InteractiveElement):
    """
    Specialized InteractiveElement for images with upload capability.
    Inherits all fields from InteractiveElement and adds image-specific fields.
    """
    url = models.ImageField(
        upload_to='interactive_elements/images/%Y/%m/%d/',
        help_text="Upload an image file"
    )
    
    # Optional: Store image dimensions
    width = models.IntegerField(null=True, blank=True, help_text="Image width in pixels")
    height = models.IntegerField(null=True, blank=True, help_text="Image height in pixels")
    
    class Meta:
        db_table = 'image_element'
        verbose_name = 'Image Element'
        verbose_name_plural = 'Image Elements'
    
    def save(self, *args, **kwargs):
        # Auto-set type field to 'image'
        self.type = 'image'
        
        # Auto-detect image dimensions if not set
        if self.url and not self.width and not self.height:
            try:
                from PIL import Image
                img = Image.open(self.url)
                self.width, self.height = img.size
            except Exception:
                pass
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Image: {self.business_id} ({self.language})"


class ReferenceValue(models.Model):
    """
    Represents a reference instance (e.g., a specific screw or gabarit).
    The structure/schema is defined in frontend config, only values are stored here.
    """
    type = models.CharField(max_length=50, help_text="Reference type (e.g., 'screw', 'gabarit')")
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Optional icon name")
    version = models.IntegerField(default=1, help_text="Version number, incremented on each update")
    
    # Tracking fields
    created_at = models.DateTimeField(auto_now_add=True, help_text="When the reference was created")
    updated_at = models.DateTimeField(auto_now=True, help_text="When the reference was last updated")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_references',
        help_text="User who created this reference"
    )
    
    class Meta:
        db_table = 'reference_value'
        verbose_name = 'Reference Value'
        verbose_name_plural = 'Reference Values'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.type} (v{self.version})"


class FieldDefinitionValue(models.Model):
    """
    Stores the actual value for a field in a reference.
    Supports multilingual values (e.g., 'reference' field in EN and FR).
    Can belong to a ReferenceValue (template) or an InteractiveElement (instance).
    """
    reference = models.ForeignKey(
        ReferenceValue,
        on_delete=models.CASCADE,
        related_name='fields',
        null=True,
        blank=True,
        help_text="Reference to the parent ReferenceValue (for template fields)"
    )
    interactive_element = models.ForeignKey(
        InteractiveElement,
        on_delete=models.CASCADE,
        related_name='field_values',
        null=True,
        blank=True,
        help_text="Interactive element this field value belongs to (for instance fields)"
    )
    name = models.CharField(max_length=100, help_text="Field name (e.g., 'reference', 'image')")
    type = models.CharField(
        max_length=20,
        help_text="Field type: 'string', 'int', 'float', or 'image'"
    )
    language = models.CharField(
        max_length=2,
        blank=True,
        null=True,
        help_text="Language code ('en', 'fr') or NULL for non-translatable fields"
    )
    
    # Polymorphic value storage - only one will be used based on 'type'
    value_string = models.TextField(blank=True, null=True, help_text="Value for string type")
    value_int = models.IntegerField(blank=True, null=True, help_text="Value for int type")
    value_float = models.FloatField(blank=True, null=True, help_text="Value for float type")
    value_image = models.ForeignKey(
        ImageLibrary,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        help_text="Value for image type (reference to ImageLibrary)"
    )
    
    class Meta:
        db_table = 'field_definition_value'
        verbose_name = 'Field Definition Value'
        verbose_name_plural = 'Field Definition Values'
        ordering = ['reference', 'interactive_element', 'name', 'language']
    
    def __str__(self):
        lang_str = f" ({self.language})" if self.language else ""
        return f"{self.reference.type}.{self.name}{lang_str}"
    
    def get_value(self):
        """Return the actual value based on the field type"""
        if self.type == 'string':
            return self.value_string
        elif self.type == 'int':
            return self.value_int
        elif self.type == 'float':
            return self.value_float
        elif self.type == 'image':
            return self.value_image
        return None


class ReferenceHistory(models.Model):
    """
    Audit trail for reference changes.
    Stores what changed, when, and by whom.
    """
    reference = models.ForeignKey(
        ReferenceValue,
        on_delete=models.CASCADE,
        related_name='history',
        help_text="Reference to the ReferenceValue"
    )
    version = models.IntegerField(help_text="Version number at the time of this change")
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        help_text="User who made this change"
    )
    changed_at = models.DateTimeField(auto_now_add=True, help_text="When the change was made")
    changes = models.JSONField(
        help_text="JSON object describing what changed: {field_name: {old: value, new: value}}"
    )
    
    class Meta:
        db_table = 'reference_history'
        verbose_name = 'Reference History'
        verbose_name_plural = 'Reference History'
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.reference.type} v{self.version} - {self.changed_at.strftime('%Y-%m-%d %H:%M')}"
