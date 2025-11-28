from rest_framework import serializers
from .models import Sheet, SheetPage, InteractiveElement, ImageTag, ImageLibrary


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
