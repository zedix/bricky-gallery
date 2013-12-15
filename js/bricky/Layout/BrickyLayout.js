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
 * @module   bricky/BrickyLayout
 * @requires jquery
 * @requires bricky/Bricky
 * @requires bricky/Layout/AbstractLayout
 */
define('bricky/Layout/BrickyLayout', [
    'jquery',
    'bricky/Bricky',
    'bricky/Layout/AbstractLayout'
], function ($, Bricky, AbstractLayout) {
    'use strict';

    var BrickyLayout = function (element, options) {
        AbstractLayout.call(this, element, options);
        this.fixedHeight = 220;
    };

    BrickyLayout.prototype = Object.create(AbstractLayout.prototype, {
        constructor: {
            value: BrickyLayout,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    BrickyLayout.prototype.render = function (images) {
        if ($.isArray(images)) {
            this.rows = this._extractRows(images);

            this.rows.forEach(function (row) {
                row.forEach(function (item) {
                    this._renderItem(item);
                }, this);
            }, this);
        }
    };

    BrickyLayout.prototype._extractRows = function (items) {
        var items = items.slice(),
            containerWidth = $(this.element).width();

        // calculate rows of images which each row fitting into
        // the specified windowWidth.
        var rows = [];
        while (items.length > 0) {
            rows.push(this._extractRow(items, containerWidth));
        }
        return rows;
    };

    BrickyLayout.prototype._extractRow = function (items, containerWidth) {
        var row = [], len = 0;

        // Build a row of images until longer than maxwidth
        while (items.length > 0 && len < containerWidth) {
            var item = items.shift();

            item.thumbWidth = item.getThumbnailWidthForHeight(this.fixedHeight);
            row.push(item);
            len += (item.thumbWidth + this.itemMargin);
        }

        // calculate by how many pixels too long?
        var delta = len - containerWidth;

        // if the line is too long, make images smaller
        if (row.length > 0 && delta > 0) {

            // calculate the distribution to each image in the row
            var cutoff = this._calculateCutOff(len, delta, row);

            for (var i in row) {
                var pixelsToRemove = cutoff[i];
                item = row[i];

                // move the left border inwards by half the pixels
                item.vx = Math.floor(pixelsToRemove / 2);

                // shrink the width of the image by pixelsToRemove
                item.vwidth = item.thumbWidth - pixelsToRemove;
            }
        } else {
            // all images fit in the row, set vx and vwidth
            for(var i in row) {
                item = row[i];
                item.vx = 0;
                item.vwidth = item.thumbWidth;
            }
        }

        return row;
    };

    /**
     * Distribute a delta (integer value) to n items based on
     * the size (width) of the items thumbnails.
     * 
     * @param {Number} len - The sum of the width of all thumbnails
     * @param {Number} delta - The delta (integer number) to be distributed
     * @param {Array<Bricky.PhotoItem>} items - An array with items of one row
     * @private
     */
    BrickyLayout.prototype._calculateCutOff = function (len, delta, items) {
        // resulting distribution
        var cutoff = [];
        var cutsum = 0;

        // distribute the delta based on the proportion of
        // thumbnail size to length of all thumbnails.
        items.forEach(function (item, i) {
            var fractOfLen = item.thumbWidth / len;
            cutoff[i] = Math.floor(fractOfLen * delta);
            cutsum += cutoff[i];
        });

        // still more pixel to distribute because of decimal
        // fractions that were omitted.
        var stillToCutOff = delta - cutsum;
        while (stillToCutOff > 0) {
            for (var i = 0, l = cutoff.length; i < l; i++) {
                // distribute pixels evenly until done
                cutoff[i]++;
                stillToCutOff--;
                if (stillToCutOff == 0) break;
            }
        }
        return cutoff;
    };

    BrickyLayout.prototype._renderItem = function (item) {
        $('<div>', {
            'class': this.options.classNames.galleryItem + ' invisible',
            css: {
                width: Math.floor(item.vwidth),
                height: this.fixedHeight
            }
        }).append(
            $('<img>').data('id', item.id)
                .on('load', this._onImageLoaded.bind(this))
                .attr('src', item.item.thumbUrl.replace('{0}', this.fixedHeight + 'x'))
                .css({
                    width: item.thumbWidth,
                    height: this.fixedHeight,
                    'margin-left': (item.vx ? (-item.vx) : 0) + 'px'
                })
        ).appendTo(this.element);
    };

    Bricky.Layout.BrickyLayout = BrickyLayout;

    return BrickyLayout;
});