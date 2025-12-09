# Generated migration for adding owner field to Narrative
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('narratives', '0002_auto_20250614_1757'),
    ]

    operations = [
        migrations.AddField(
            model_name='narrative',
            name='owner',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='narratives',
                to=settings.AUTH_USER_MODEL
            ),
        ),
    ]
