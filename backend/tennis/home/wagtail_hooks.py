from wagtail import hooks
from wagtail.admin.action_menu import ActionMenuItem
from django.urls import reverse
from .models import TrimPage, FramePage

class TrimPageExportMenuItem(ActionMenuItem):
    name = 'export'
    label = "Export"
    icon_name = 'placeholder'  # Optional: you can specify an icon here

    def get_url(self, context):
        page = context.get('page')
        if isinstance(page, TrimPage):
            return reverse('trim_export', args=[page.id])
        return None

    def is_shown(self, context):
        page = context.get('page')
        return isinstance(page, TrimPage)  # Show only for TrimPage instances


class TrimPageTrimVideoMenuItem(ActionMenuItem):
    name = 'export'
    label = "Trim Video"
    icon_name = 'placeholder'  # Optional: you can specify an icon here

    def get_url(self, context):
        page = context.get('page')
        if isinstance(page, TrimPage):
            return reverse('trim_video', args=[page.id])
        return None

    def is_shown(self, context):
        page = context.get('page')
        if isinstance(page, TrimPage):
            return not page.trimming
        return False


@hooks.register('register_page_action_menu_item')
def register_page_exportion_menu_item():
    return TrimPageExportMenuItem(order=100)


@hooks.register('register_page_action_menu_item')
def register_page_trim_video_menu_item():
    return TrimPageTrimVideoMenuItem(order=99)