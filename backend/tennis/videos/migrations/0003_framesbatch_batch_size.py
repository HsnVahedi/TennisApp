# Generated by Django 4.2.15 on 2024-09-12 20:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('videos', '0002_framesbatch_ball_job_id_framesbatch_objs_job_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='framesbatch',
            name='batch_size',
            field=models.PositiveIntegerField(blank=True, default=0, null=True),
        ),
    ]
