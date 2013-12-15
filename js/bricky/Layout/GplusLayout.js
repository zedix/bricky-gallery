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
 * A Google+ Photos layout.
 *
 * @module bricky/Layout/GplusLayout
 * @requires jquery
 * @requires bricky/Bricky
 * @requires bricky/Layout/AbstractLayout
 */
define('bricky/Layout/GplusLayout', [
    'jquery',
    'bricky/Bricky',
    'bricky/Layout/AbstractLayout'
], function ($, Bricky, AbstractLayout) {
    'use strict';

    var GplusLayout = function (element, options) {
        AbstractLayout.call(this, element, options);
        this.element = element;
        this.rowsPerLoad = 20;
        this.options = options;
        this.rows = [];

        this.rowLayoutPatterns = {
            // 2 images
            '=L': true,
            'L=': true,

            // 3 images
            'LLL': true,
            'LPL': true,
            'LLP': true,
            'PPL': true,
            'PLP': true,
            'PLL': true,
            '=PP': true,
            '=PL': true,
            'P=P': true,
            'PP=': true,
            'PL=': true,
            'P=L': true,
            'LP=': true,
            '=P=': true,
            'LL=': true,

            // 4 images only
            /*'PPPP': true,
            'LLLL': true,
            'PLLL': true,
            'LLPL': true,
            'LLLP': true,
            'PLLP': true,
            'LPLL': true,*/

            // 4 images
            'PPLL': true,
            'PLPL': true,
            'LPLP': true,
            'LPPL': true,
            'LPPP': true,
            'PPPL': true,
            'PPP=': true,

            // 5 images
            'LPPPL': true,
            'PPLPL': true,
            'LPPPP': true,
            'PLPPP': true,
            'PPLPP': true,
            'PPPLP': true,
            'PPPPL': true,
            //'PPPPP': true,

            // 6 images
            'PPPPPP': true
        }
    };

    GplusLayout.prototype = Object.create(AbstractLayout.prototype, {
        constructor: {
            value: GplusLayout,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    GplusLayout.prototype.render = function (images) {
        if ($.isArray(images)) {
            this.rows = this._extractRows(images);
            this.limit = this.rowsPerLoad;
        } else {
            this.limit = this.limit + this.rowsPerLoad;
        }
        this.limit = this.limit.limit(0, this.rows.length);

        var containerWidth = $(this.element).width(),
            lastRow = this.rows.getLast(),
            pattern = this._getRowPattern(lastRow),
            start = $('.' + this.options.classNames.galleryRow).length;

        for (var i = start; i < this.limit; i++) {
            if (this.rows[i] === lastRow && !this.rowLayoutPatterns[pattern]) {
                Bricky.ImageUtils.getThumbnailSizesForHeight(this.rows[i], containerWidth / 4);
            } else {
                Bricky.ImageUtils.getThumbnailSizesForWidth(this.rows[i], containerWidth, this.itemMargin);
            }
            this._injectRow(this.rows[i]);
        }
    };

    /**
     * Group images by row.
     *
     * @param {Array<Bricky.PhotoItem>} images
     */
    GplusLayout.prototype._extractRows = function (images) {
        if (images) {
            var pattern = '',
                lastImage = images.getLast();

            for (var i = 0, l = images.length; i < l; i++) {
                pattern += images[i].getOrientationCode();
                if (this.rowLayoutPatterns[pattern] || lastImage === images[i]) {
                    this.rows.push(images.slice(i - pattern.length + 1, i + 1));
                    pattern = '';
                }
            }
        }
        return this.rows;
    };

    GplusLayout.prototype._injectRow = function (images) {
        var rowEl = $('<div>', {'class': this.options.classNames.galleryRow}).appendTo(this.element);

        images.forEach(function (img) {
            $('<div>', {'class': this.options.classNames.galleryItem + ' invisible'}).append(
                $('<img>', {
                    src: img.thumbUrl,
                    css: {
                        width: Math.floor(img.thumbWidth),
                        height: img.thumbHeight
                    }
                }).data('id', img.id).on('load', this._onImageLoaded.bind(this))

            ).appendTo(rowEl);

        }, this);
    };

    /**
     * Return row layout pattern as a string for the given row.
     *
     * @param {Array<Bricky.PhotoItem>} rowItems - Gallery items in the row
     * @return {String} Row pattern. E.g. 'PLP'
     */
    GplusLayout.prototype._getRowPattern = function (rowItems) {
        return rowItems.reduce(function (currentValue, item) {
            return currentValue + item.getOrientationCode();
        }, '');
    };

    if (!Bricky.Layout) {
        Bricky.Layout = {};    
    }
    Bricky.Layout.GplusLayout = GplusLayout;

    return GplusLayout;
});