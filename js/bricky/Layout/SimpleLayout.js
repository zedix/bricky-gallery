/*!
 * Bricky Photos Gallery
 * Bricky is a Google+ Photos inspired web gallery.
 *
 * Licensed under the MIT license.
 * (c) 2012-2014 Louis-Xavier Vignal
 */

/*global
    define
*/

/**
 * Simple gallery layout with 200x200 square thumbnails.
 *
 * @module   bricky/Layout/SimpleLayout
 * @requires jquery
 * @requires bricky/Bricky
 * @requires bricky/Layout/AbstractLayout  
 */
define('bricky/Layout/SimpleLayout', [
    'jquery',
    'bricky/Bricky',
    'bricky/Layout/AbstractLayout'
], function ($, Bricky, AbstractLayout) {
    'use strict';

    var SimpleLayout = function (element, options) {
        AbstractLayout.call(this, element, options);
        this.thumbSize = 200;
    };

    SimpleLayout.prototype = Object.create(AbstractLayout.prototype, {
        constructor: {
            value: SimpleLayout,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    SimpleLayout.prototype.render = function (images) {
        if ($.isArray(images)) {
            this.images = images;
        }

        if (this.limit < this.images.length) {
            this.limit = (this.limit + this.options.lazyLoad.itemsPerLoad)
                .limit(0, this.images.length);

            for (this.index; this.index < this.limit; this.index++) {
                var item = this.images[this.index];
                item.thumbWidth = this.thumbSize;
                item.thumbHeight = this.thumbSize;
                this._renderItem(item);
            }
        }
    };

    Bricky.Layout.SimpleLayout = SimpleLayout;

    return SimpleLayout;
});