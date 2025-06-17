from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.templatetags.static import static

from image_word.models import Image, Language, Word


# Create your views here.


def index(request):
    return redirect(static('index.html'))


def languages(request):
    return JsonResponse([
        dict(name=l.name, id=l.id, code=l.code)
        for l in Language.objects.all()
    ], safe=False)


def random(request, width, height):
    imgs_len = width * height
    queryset = (Word.objects
                .select_related('image', 'language')
                .prefetch_related('image__alt_imgs')
                .order_by('?'))
    lang = request.GET.get('lang', 'ky')
    if lang:
        language = get_object_or_404(Language.objects.filter(code=lang))
        queryset = queryset.filter(language=language)

    data = list(queryset[:imgs_len])
    return JsonResponse(dict(
        height=height,
        width=width,
        lang=lang,
        words=[
            dict(text=w.text,
                 lang=w.language.code,
                 img=dict(url=w.image.file.url,
                          alts=[
                              dict(url=aw.file.url)
                              for aw in w.image.alt_imgs.all()
                          ])
                 )
            for w in data
        ]
    ))
