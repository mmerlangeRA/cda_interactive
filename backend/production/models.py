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
    business_id = models.CharField(max_length=100, help_text="Business identifier for translation")
    type = models.CharField(max_length=50, help_text="Type of interactive element")
    description = models.JSONField(help_text="JSON description of the element")
    language = models.CharField(max_length=10, help_text="Language code (e.g., en, fr, es)", default="en")
    
    # Konva.js transform properties
    konva_transform = models.JSONField(
        null=True,
        blank=True,
        help_text="Konva.js transform data: {x, y, width, height, rotation, scaleX, scaleY, skewX, skewY, offsetX, offsetY, ...}"
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
        unique_together = [['business_id', 'language']]
        ordering = ['page', 'id']

    def __str__(self):
        return f"{self.type} - {self.business_id} ({self.language})"


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
