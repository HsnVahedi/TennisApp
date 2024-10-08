# Generated by Django 4.2.15 on 2024-09-21 02:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0008_videoupload_video_path'),
    ]

    operations = [
        migrations.CreateModel(
            name='VideoClip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('clip_path', models.CharField(blank=True, max_length=2024, null=True)),
                ('clip_number', models.PositiveIntegerField(db_index=True)),
                ('video_upload', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='video_clips', to='videos.videoupload')),
            ],
            options={
                'ordering': ['clip_number'],
                'unique_together': {('video_upload', 'clip_number')},
            },
        ),
    ]
