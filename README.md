# Bricky

Bricky is a Google+ Photos inspired web gallery used on vignal dot me.

## Usage

```
 var gallery = new Bricky.Gallery(document.body, {
    title: 'My Album'
    theme: 'gplus',
    layout: 'GplusLayout',
    animation: 'bounceIn',
    ambilight: true
}).init([
    {width: xxx, height: xxx, url: 'xxx', meta: {}},
    {width: xxx, height: xxx, url: 'xxx', meta: {}}
]);

```

## Demos

#### Layouts

Currently, the gallery supports the following layout:

* [Bricky layout](http://photos.vignal.me/album/costa-rica)
* [Simple layout](http://photos.vignal.me/album/costa-rica?layout=SimpleLayout)
* [Gplus layout](http://photos.vignal.me/album/costa-rica?layout=BrickyLayout)
* [Linear layout](http://photos.vignal.me/album/costa-rica?layout=LinearLayout)

#### Themes

* [Bricky theme](http://photos.vignal.me/album/costa-rica?theme=bricky)
* [Gplus theme](http://photos.vignal.me/album/costa-rica?theme=gplus)
* [Polaroid theme](http://photos.vignal.me/album/costa-rica?theme=polaroid)


## Compatibility

Works in IE 10+, Chrome 29+, FF 22+, iOS 7+ and Android 4.4+.