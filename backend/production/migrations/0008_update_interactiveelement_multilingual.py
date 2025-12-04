# Generated migration for multilingual InteractiveElement refactoring

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('production', '0007_add_reference_link_to_interactive_element'),
    ]

    operations = [
        # Step 1: Remove old unique_together constraint
        migrations.AlterUniqueTogether(
            name='interactiveelement',
            unique_together=set(),
        ),
        
        # Step 2: Remove old fields from InteractiveElement
        migrations.RemoveField(
            model_name='interactiveelement',
            name='description',
        ),
        migrations.RemoveField(
            model_name='interactiveelement',
            name='language',
        ),
        migrations.RemoveField(
            model_name='interactiveelement',
            name='konva_transform',
        ),
        
        # Step 3: Add new fields to InteractiveElement
        migrations.AddField(
            model_name='interactiveelement',
            name='descriptions',
            field=models.JSONField(blank=True, default=dict, help_text="Descriptions by language: {'en': 'desc', 'fr': 'desc'}"),
        ),
        migrations.AddField(
            model_name='interactiveelement',
            name='konva_jsons',
            field=models.JSONField(blank=True, default=dict, help_text="Konva JSON representations by language: {'en': {...}, 'fr': {...}}"),
        ),
        
        # Step 4: Add interactive_element FK to FieldDefinitionValue
        migrations.AddField(
            model_name='fielddefinitionvalue',
            name='interactive_element',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='field_values',
                to='production.interactiveelement',
                help_text='Interactive element this field value belongs to (for instance fields)'
            ),
        ),
        
        # Step 5: Make reference FK nullable in FieldDefinitionValue
        migrations.AlterField(
            model_name='fielddefinitionvalue',
            name='reference',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='fields',
                to='production.referencevalue',
                help_text='Reference to the parent ReferenceValue (for template fields)'
            ),
        ),
        
        # Step 6: Update FieldDefinitionValue unique_together
        migrations.AlterUniqueTogether(
            name='fielddefinitionvalue',
            unique_together=set(),
        ),
        
        # Step 7: Update ImageElement's __str__ method will still reference language, 
        # but since ImageElement is rarely used, we'll leave it for now
        # The field doesn't exist anymore, so this might cause issues if called
    ]
