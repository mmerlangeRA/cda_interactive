from rest_framework import serializers
from .models import (
    Sheet, SheetPage, InteractiveElement, MediaTag, MediaLibrary,
    ReferenceValue, FieldDefinitionValue, ReferenceHistory,
    Boat, GammeCabine, VarianteGamme, Cabine, Ligne, Poste
)


class InteractiveElementSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    reference = serializers.SerializerMethodField()
    field_values = serializers.SerializerMethodField()
    field_values_data = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = InteractiveElement
        fields = [
            'id',
            'page',
            'business_id',
            'type',
            'z_order',
            'descriptions',
            'konva_jsons',
            'reference_value',
            'reference',
            'field_values',
            'field_values_data',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def get_reference(self, obj):
        """Include full reference data for read operations"""
        if obj.reference_value:
            from .serializers import ReferenceValueSerializer
            return ReferenceValueSerializer(obj.reference_value, context=self.context).data
        return None
    
    def get_field_values(self, obj):
        """Serialize related field values"""
        return FieldDefinitionValueSerializer(obj.field_values.all(), many=True).data
    
    def create(self, validated_data):
        field_values_data = validated_data.pop('field_values_data', [])
        validated_data['created_by'] = self.context['request'].user
        
        element = InteractiveElement.objects.create(**validated_data)
        
        # Create field values if provided
        for field_data in field_values_data:
            # Handle image field specially
            if 'value_image' in field_data and field_data['value_image'] is not None:
                from .models import MediaLibrary
                image_id = field_data.pop('value_image')
                try:
                    image_instance = MediaLibrary.objects.get(id=image_id)
                    field_data['value_image'] = image_instance
                except MediaLibrary.DoesNotExist:
                    field_data['value_image'] = None
            
            FieldDefinitionValue.objects.create(interactive_element=element, **field_data)
        
        return element
    
    def update(self, instance, validated_data):
        field_values_data = validated_data.pop('field_values_data', None)
        
        # Update element fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update field values if provided
        if field_values_data is not None:
            # Delete existing field values
            instance.field_values.all().delete()
            
            # Create new field values
            for field_data in field_values_data:
                # Handle image field specially
                if 'value_image' in field_data and field_data['value_image'] is not None:
                    from .models import MediaLibrary
                    image_id = field_data.pop('value_image')
                    try:
                        image_instance = MediaLibrary.objects.get(id=image_id)
                        field_data['value_image'] = image_instance
                    except MediaLibrary.DoesNotExist:
                        field_data['value_image'] = None
                
                FieldDefinitionValue.objects.create(interactive_element=instance, **field_data)
        
        return instance


class SheetPageSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    elements = InteractiveElementSerializer(many=True, read_only=True)
    elements_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SheetPage
        fields = [
            'id',
            'sheet',
            'number',
            'description',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username',
            'elements',
            'elements_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def get_elements_count(self, obj):
        return obj.elements.count()
    
    def create(self, validated_data):
        # Automatically set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SheetSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    pages = SheetPageSerializer(many=True, read_only=True)
    pages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Sheet
        fields = [
            'id',
            'name',
            'business_id',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username',
            'pages',
            'pages_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def get_pages_count(self, obj):
        return obj.pages.count()
    
    def create(self, validated_data):
        # Automatically set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SheetListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views without nested data"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    pages_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Sheet
        fields = [
            'id',
            'name',
            'business_id',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username',
            'pages_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def get_pages_count(self, obj):
        return obj.pages.count()


class SheetPageListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views without nested elements"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    sheet_name = serializers.CharField(source='sheet.name', read_only=True)
    elements_count = serializers.SerializerMethodField()
    
    class Meta:
        model = SheetPage
        fields = [
            'id',
            'sheet',
            'sheet_name',
            'number',
            'description',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username',
            'elements_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def get_elements_count(self, obj):
        return obj.elements.count()


class InteractiveElementListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    page_number = serializers.IntegerField(source='page.number', read_only=True)
    sheet_name = serializers.CharField(source='page.sheet.name', read_only=True)
    
    class Meta:
        model = InteractiveElement
        fields = [
            'id',
            'page',
            'page_number',
            'sheet_name',
            'business_id',
            'type',
            'z_order',
            'descriptions',
            'konva_jsons',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']


class MediaTagSerializer(serializers.ModelSerializer):
    """Serializer for media tags"""
    media_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaTag
        fields = ['id', 'name', 'created_at', 'media_count']
        read_only_fields = ['id', 'created_at']
    
    def get_media_count(self, obj):
        return obj.media_items.count()


# Backward compatibility alias
ImageTagSerializer = MediaTagSerializer


class MediaLibrarySerializer(serializers.ModelSerializer):
    """Serializer for media library with full details (images and videos)"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    tags = MediaTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=MediaTag.objects.all(),
        write_only=True,
        required=False,
        source='tags'
    )
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaLibrary
        fields = [
            'id',
            'name',
            'description',
            'media_type',
            'file',
            'file_url',
            'thumbnail',
            'thumbnail_url',
            'tags',
            'tag_ids',
            'language',
            'width',
            'height',
            'file_size',
            'duration',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username', 'width', 'height', 'file_size', 'duration']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_thumbnail_url(self, obj):
        # For videos, use thumbnail if available
        if obj.media_type == 'video' and obj.thumbnail:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        # For images, return the file itself as thumbnail
        elif obj.media_type == 'image':
            return self.get_file_url(obj)
        return None
    
    def create(self, validated_data):
        # Automatically set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


# Backward compatibility alias
ImageLibrarySerializer = MediaLibrarySerializer


class MediaLibraryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    tags = MediaTagSerializer(many=True, read_only=True)
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaLibrary
        fields = [
            'id',
            'name',
            'description',
            'media_type',
            'file_url',
            'thumbnail_url',
            'tags',
            'language',
            'width',
            'height',
            'file_size',
            'duration',
            'created_at',
            'created_by_username'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_thumbnail_url(self, obj):
        # For videos, use thumbnail if available
        if obj.media_type == 'video' and obj.thumbnail:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        # For images, return the file itself as thumbnail
        elif obj.media_type == 'image':
            return self.get_file_url(obj)
        return None


# Backward compatibility alias  
ImageLibraryListSerializer = MediaLibraryListSerializer


class FieldDefinitionValueSerializer(serializers.ModelSerializer):
    """Serializer for field definition values"""
    value = serializers.SerializerMethodField()
    value_image = serializers.PrimaryKeyRelatedField(read_only=True)
    image = MediaLibraryListSerializer(source='value_image', read_only=True)
    
    class Meta:
        model = FieldDefinitionValue
        fields = [
            'id',
            'name',
            'type',
            'language',
            'value',
            'value_string',
            'value_int',
            'value_float',
            'value_image',
            'image'
        ]
        read_only_fields = ['id']
    
    def get_value(self, obj):
        """Return the actual value based on type"""
        if obj.type == 'image' and obj.value_image:
            return obj.value_image.id
        return obj.get_value()


class ReferenceHistorySerializer(serializers.ModelSerializer):
    """Serializer for reference history"""
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)
    
    class Meta:
        model = ReferenceHistory
        fields = [
            'id',
            'reference',
            'version',
            'changed_by',
            'changed_by_username',
            'changed_at',
            'changes'
        ]
        read_only_fields = ['id', 'changed_at']


class ReferenceValueSerializer(serializers.ModelSerializer):
    """Serializer for reference values with full details"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    fields = FieldDefinitionValueSerializer(many=True, read_only=True)
    fields_data = serializers.ListField(write_only=True, required=False)
    
    class Meta:
        model = ReferenceValue
        fields = [
            'id',
            'type',
            'icon',
            'version',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username',
            'fields',
            'fields_data'
        ]
        read_only_fields = ['id', 'version', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def create(self, validated_data):
        fields_data = validated_data.pop('fields_data', [])
        validated_data['created_by'] = self.context['request'].user
        
        # Make a copy for history BEFORE modifying
        import copy
        fields_data_for_history = copy.deepcopy(fields_data)
        
        reference = ReferenceValue.objects.create(**validated_data)
        
        # Create field values
        for field_data in fields_data:
            # Handle image field specially - convert ID to instance
            if 'value_image' in field_data and field_data['value_image'] is not None:
                from .models import MediaLibrary
                image_id = field_data.pop('value_image')
                try:
                    image_instance = MediaLibrary.objects.get(id=image_id)
                    field_data['value_image'] = image_instance
                except MediaLibrary.DoesNotExist:
                    field_data['value_image'] = None
            
            FieldDefinitionValue.objects.create(reference=reference, **field_data)
        
        # Create initial history entry
        ReferenceHistory.objects.create(
            reference=reference,
            version=1,
            changed_by=self.context['request'].user,
            changes={'action': 'created', 'fields': fields_data_for_history}
        )
        
        return reference
    
    def update(self, instance, validated_data):
        fields_data = validated_data.pop('fields_data', None)
        
        # Track changes for history
        changes = {}
        old_version = instance.version
        
        # Update reference fields
        for attr, value in validated_data.items():
            if getattr(instance, attr) != value:
                changes[attr] = {'old': getattr(instance, attr), 'new': value}
                setattr(instance, attr, value)
        
        # Increment version
        instance.version += 1
        instance.save()
        
        # Update field values if provided
        if fields_data is not None:
            # Make a copy for history (before converting image IDs to instances)
            import copy
            fields_data_for_history = copy.deepcopy(fields_data)
            
            # Delete existing fields
            instance.fields.all().delete()
            
            # Create new fields
            for field_data in fields_data:
                # Handle image field specially - convert ID to instance
                if 'value_image' in field_data and field_data['value_image'] is not None:
                    from .models import MediaLibrary
                    image_id = field_data.pop('value_image')
                    try:
                        image_instance = MediaLibrary.objects.get(id=image_id)
                        field_data['value_image'] = image_instance
                    except MediaLibrary.DoesNotExist:
                        field_data['value_image'] = None
                
                FieldDefinitionValue.objects.create(reference=instance, **field_data)
            
            changes['fields'] = {'action': 'updated', 'new_fields': fields_data_for_history}
        
        # Create history entry
        ReferenceHistory.objects.create(
            reference=instance,
            version=instance.version,
            changed_by=self.context['request'].user,
            changes=changes
        )
        
        return instance


class ReferenceValueListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    fields_preview = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferenceValue
        fields = [
            'id',
            'type',
            'icon',
            'version',
            'created_at',
            'updated_at',
            'created_by_username',
            'fields_preview'
        ]
    
    def get_fields_preview(self, obj):
        """Get a preview of the first translatable field (usually 'reference')"""
        # Try to get 'reference' field in English first
        ref_field = obj.fields.filter(name='reference', language='en').first()
        if not ref_field:
            # Fallback to any reference field
            ref_field = obj.fields.filter(name='reference').first()
        
        if ref_field:
            return {
                'name': ref_field.name,
                'value': ref_field.get_value(),
                'language': ref_field.language
            }
        
        return None


# Filter entity serializers for sheet filtering
class BoatSerializer(serializers.ModelSerializer):
    """Serializer for Boat model"""
    class Meta:
        model = Boat
        fields = ['id', 'internal_id', 'name']


class GammeCabineSerializer(serializers.ModelSerializer):
    """Serializer for GammeCabine model"""
    boat_name = serializers.CharField(source='boat.name', read_only=True)
    
    class Meta:
        model = GammeCabine
        fields = ['id', 'internal_id', 'boat', 'boat_name']


class VarianteGammeSerializer(serializers.ModelSerializer):
    """Serializer for VarianteGamme model"""
    gamme_internal_id = serializers.CharField(source='gamme.internal_id', read_only=True)
    
    class Meta:
        model = VarianteGamme
        fields = ['id', 'internal_id', 'gamme', 'gamme_internal_id']


class CabineSerializer(serializers.ModelSerializer):
    """Serializer for Cabine model"""
    variante_internal_id = serializers.CharField(source='variante_gamme.internal_id', read_only=True)
    
    class Meta:
        model = Cabine
        fields = ['id', 'internal_id', 'variante_gamme', 'variante_internal_id']


class LigneSerializer(serializers.ModelSerializer):
    """Serializer for Ligne model"""
    class Meta:
        model = Ligne
        fields = ['id', 'internal_id', 'name']


class PosteSerializer(serializers.ModelSerializer):
    """Serializer for Poste model"""
    ligne_name = serializers.CharField(source='ligne.name', read_only=True)
    
    class Meta:
        model = Poste
        fields = ['id', 'internal_id', 'ligne', 'ligne_name']
