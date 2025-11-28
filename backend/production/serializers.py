from rest_framework import serializers
from .models import (
    Sheet, SheetPage, InteractiveElement, ImageTag, ImageLibrary,
    ReferenceValue, FieldDefinitionValue, ReferenceHistory
)


class InteractiveElementSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = InteractiveElement
        fields = [
            'id',
            'page',
            'business_id',
            'type',
            'description',
            'konva_transform',
            'language',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
    
    def create(self, validated_data):
        # Automatically set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


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
            'language',
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
            'language',
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
            'konva_transform',
            'language',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']


class ImageTagSerializer(serializers.ModelSerializer):
    """Serializer for image tags"""
    images_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ImageTag
        fields = ['id', 'name', 'created_at', 'images_count']
        read_only_fields = ['id', 'created_at']
    
    def get_images_count(self, obj):
        return obj.images.count()


class ImageLibrarySerializer(serializers.ModelSerializer):
    """Serializer for image library with full details"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    tags = ImageTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=ImageTag.objects.all(),
        write_only=True,
        required=False,
        source='tags'
    )
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ImageLibrary
        fields = [
            'id',
            'name',
            'description',
            'image',
            'image_url',
            'tags',
            'tag_ids',
            'language',
            'width',
            'height',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username', 'width', 'height']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def create(self, validated_data):
        # Automatically set created_by from request user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ImageLibraryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    tags = ImageTagSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ImageLibrary
        fields = [
            'id',
            'name',
            'description',
            'image_url',
            'thumbnail_url',
            'tags',
            'language',
            'width',
            'height',
            'created_at',
            'created_by_username'
        ]
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request is not None:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
    
    def get_thumbnail_url(self, obj):
        # For now, return the same as image_url
        # In future, could implement thumbnail generation
        return self.get_image_url(obj)


class FieldDefinitionValueSerializer(serializers.ModelSerializer):
    """Serializer for field definition values"""
    value = serializers.SerializerMethodField()
    value_image = serializers.PrimaryKeyRelatedField(read_only=True)
    image = ImageLibraryListSerializer(source='value_image', read_only=True)
    
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
                from .models import ImageLibrary
                image_id = field_data.pop('value_image')
                try:
                    image_instance = ImageLibrary.objects.get(id=image_id)
                    field_data['value_image'] = image_instance
                except ImageLibrary.DoesNotExist:
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
                    from .models import ImageLibrary
                    image_id = field_data.pop('value_image')
                    try:
                        image_instance = ImageLibrary.objects.get(id=image_id)
                        field_data['value_image'] = image_instance
                    except ImageLibrary.DoesNotExist:
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
