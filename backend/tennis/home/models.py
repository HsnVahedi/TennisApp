from django.db import models
from wagtail.models import Page
from wagtail.admin.panels import FieldPanel
from wagtail.images.models import Image
from wagtailmedia.edit_handlers import MediaChooserPanel
from wagtailmedia.models import Media
from django.utils.timezone import now
import random
import string
from django.contrib.auth import get_user_model


User = get_user_model()


class HomePage(Page):
    subpage_types = ['UserPage']


class UserPage(Page):
    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name='user_page')
    
    subpage_types = ['TrimsPage']

    content_panels = [
        FieldPanel('user'),
    ]
    promote_panels = []

    def save(self, *args, **kwargs):
        self.slug = str(self.user.pk)
        self.title = str(self.user.username)
        super().save(*args, **kwargs)


class TrimsPage(Page):
    parent_page_types = ['UserPage']
    subpage_types = ['TrimPage']

    content_panels = []
    promote_panels = []

    def save(self, *args, **kwargs):
        user = self.get_parent().specific.user
        self.title = f"{user.username}'s Trims"
        self.slug = f"{user.pk}-trims" 
        super().save(*args, **kwargs)


class TrimPage(Page):
    parent_page_types = ['TrimsPage']
    subpage_types = ['FramePage']

    video = models.ForeignKey(
        Media,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    content_panels = [
        MediaChooserPanel('video'),
    ]
    promote_panels = []

    def save(self, *args, **kwargs):
        if not self.title:
            user = self.get_parent().get_parent().specific.user
            now_str = now().strftime("%Y%m%d%H%M%S")
            random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            self.title = f"{now_str}"
            self.slug = f"{user.pk}-{now_str}-{random_str}" 
        super().save(*args, **kwargs)

    def trim_video(self):
        from videos.tasks import frames_extraction_task
        return frames_extraction_task.delay(self.pk, self.video.file.path)

    def get_frames_batches(self):
        return self.frames_batches.all()


class FramePage(Page):
    parent_page_types = ['TrimPage']

    original_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    annotated_image = models.ForeignKey(
        Image,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    content_panels = [
        FieldPanel('original_image'),
        FieldPanel('annotated_image'),
    ]
    promote_panels = []

    def save(self, *args, **kwargs):
        if not self.title:
            self.title = self.original_image.title
            random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=10))
            self.slug = f"{self.get_parent().slug}-{random_str}"
        super().save(*args, **kwargs)
