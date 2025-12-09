# Generated migration for adding owner and thumbnail fields to MediaItem
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('media', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mediaitem',
            name='owner',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='media_items',
                to=settings.AUTH_USER_MODEL
            ),
        ),
        migrations.AddField(
            model_name='mediaitem',
            name='thumbnail_small',
            field=models.ImageField(blank=True, null=True, upload_to='thumbnails/%Y/%m/%d/'),
        ),
        migrations.AddField(
            model_name='mediaitem',
            name='thumbnail_medium',
            field=models.ImageField(blank=True, null=True, upload_to='thumbnails/%Y/%m/%d/'),
        ),
        migrations.AddField(
            model_name='mediaitem',
            name='thumbnail_large',
            field=models.ImageField(blank=True, null=True, upload_to='thumbnails/%Y/%m/%d/'),
        ),
        migrations.AddField(
            model_name='note',
            name='owner',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='notes',
                to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
