# Generated by Django 4.2.15 on 2024-09-19 21:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0007_videoupload_trim_page_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='videoupload',
            name='video_path',
            field=models.CharField(blank=True, max_length=2024, null=True),
        ),
    ]
