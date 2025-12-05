# Generated manually for data preservation
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("production", "0009_add_z_order_to_interactive_element"),
    ]

    operations = [
        # Step 1: Rename ImageTag to MediaTag (table rename only)
        migrations.RenameModel(
            old_name='ImageTag',
            new_name='MediaTag',
        ),
        
        # Step 2: Update MediaTag meta to new db_table
        migrations.AlterModelTable(
            name='mediatag',
            table='media_tag',
        ),
        
        # Step 3: Rename ImageLibrary to MediaLibrary (table rename only)
        migrations.RenameModel(
            old_name='ImageLibrary',
            new_name='MediaLibrary',
        ),
        
        # Step 4: Update MediaLibrary meta to new db_table
        migrations.AlterModelTable(
            name='medialibrary',
            table='media_library',
        ),
        
        # Step 5: Rename 'image' field to 'file'
        migrations.RenameField(
            model_name='medialibrary',
            old_name='image',
            new_name='file',
        ),
        
        # Step 6: Add new fields to MediaLibrary
        migrations.AddField(
            model_name='medialibrary',
            name='media_type',
            field=models.CharField(
                choices=[('image', 'Image'), ('video', 'Video')],
                default='image',
                help_text='Type of media file',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='medialibrary',
            name='thumbnail',
            field=models.ImageField(
                blank=True,
                help_text='Thumbnail image',
                null=True,
                upload_to='library_thumbnails/%Y/%m/%d/',
            ),
        ),
        migrations.AddField(
            model_name='medialibrary',
            name='file_size',
            field=models.BigIntegerField(
                blank=True,
                help_text='File size in bytes',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='medialibrary',
            name='duration',
            field=models.FloatField(
                blank=True,
                help_text='Video duration in seconds (NULL for images)',
                null=True,
            ),
        ),
        
        # Step 7: Update related_name for tags
        migrations.AlterField(
            model_name='medialibrary',
            name='tags',
            field=models.ManyToManyField(
                blank=True,
                help_text='Tags for organizing media',
                related_name='media_items',
                to='production.mediatag',
            ),
        ),
        
        # Step 8: Update related_name for created_by
        migrations.AlterField(
            model_name='medialibrary',
            name='created_by',
            field=models.ForeignKey(
                help_text='User who uploaded this media',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='uploaded_media',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        
        # Step 9: Update FieldDefinitionValue.value_image to point to MediaLibrary
        # This happens automatically because we renamed the model
    ]
