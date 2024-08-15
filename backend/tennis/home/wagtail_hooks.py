from wagtail import hooks
from wagtail.admin.action_menu import ActionMenuItem
from django.urls import reverse
from .models import TrimPage

class MyNewActionMenuItem(ActionMenuItem):
    name = 'my-new-action'
    label = "MyNewAction"
    icon_name = 'placeholder'  # Optional: you can specify an icon here

    def get_url(self, context):
        page = context.get('page')
        if isinstance(page, TrimPage):
            return reverse('my_new_action', args=[page.id])
        return None

    def is_shown(self, context):
        page = context.get('page')
        return isinstance(page, TrimPage)  # Show only for TrimPage instances

@hooks.register('register_page_action_menu_item')
def register_my_new_action_menu_item():
    return MyNewActionMenuItem(order=100)
