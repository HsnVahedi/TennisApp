# Generated by Django 4.2.15 on 2024-08-14 22:27

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('home', '0010_framepage'),
    ]

    operations = [
        migrations.CreateModel(
            name='FramesBatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('dir_path', models.CharField(max_length=512)),
                ('trim_page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='frames_batches', to='home.trimpage')),
            ],
        ),
    ]
