from rest_framework import serializers
from .models import Sheet, SheetPage, InteractiveElement


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
            'business_id',
            'number',
            'description',
            'language',
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
            'business_id',
            'number',
            'description',
            'language',
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
            'language',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'created_by_username']
