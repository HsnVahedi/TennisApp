# Generated by Django 4.2.15 on 2024-08-15 00:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0002_framesbatch_detected_framesbatch_detections'),
    ]

    operations = [
        migrations.AlterField(
            model_name='framesbatch',
            name='dir_path',
            field=models.CharField(max_length=512, unique=True),
        ),
    ]
