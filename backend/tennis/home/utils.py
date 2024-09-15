from home.models import HomePage, UserPage, TrimsPage


def get_or_create_user_page(user):
    home_page = HomePage.objects.first()
    user_page = UserPage.objects.filter(user=user).first()
    if not user_page:
        user_page = UserPage(user=user)
        home_page.add_child(instance=user_page)
        user_page.save_revision().publish()
    return user_page


def get_or_create_trims_page(user):
    user_page = get_or_create_user_page(user)
    trims_page = user_page.get_children().type(TrimsPage).first()

    if not trims_page:
        trims_page = TrimsPage()
        user_page.add_child(instance=trims_page)
        trims_page.save_revision().publish()

    return trims_page