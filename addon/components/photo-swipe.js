/* global PhotoSwipe */
/* global PhotoSwipeUI_Default */

import Em from 'ember';

var run = Em.run;

export default Em.Component.extend({

  initGallery: function() {
    if(this.get('enabled')) {
      this.get('gallery').init();
    }
  }.observes('enabled'),

  onInsert: Em.on('didInsertElement', function() {

    Em.run.scheduleOnce('afterRender', this, function() {
      this.set('pswpEl', this.$('.pswp')[0]);
      this.set('pswpTheme', PhotoSwipeUI_Default);

      this._buildOptions();

      /**
       * DEPRECATED
       *
       * Code exists for backward compatability of block usage
       * up to ember-cli-photoswipe versions 1.0.1.
       */
      if (this.get('items')) {
        return this._initItemGallery();
      }
      console.log("WARNING: See https://github.com/poetic/ember-cli-photoswipe#usage");
      return this._calculateItems();
      /**
       * END DEPRECATED
       */
    });
  }),

  _buildOptions: function(getThumbBoundsFn) {
     var reqOpts = {
      history: false
    };

    if (Em.isPresent(getThumbBoundsFn)) {
      reqOpts.getThumbBoundsFn = getThumbBoundsFn;
    }

    var options = Em.merge(reqOpts, this.get('options') || {});
    this.set('options', options);
  },

  _initItemGallery: function() {
    var component = this;

    component.get('items').forEach(function(item) {
      if(!item.w || !item.h) {
        item.w = 1;
        item.h = 1;
        item.dynamic = true;
      }
    });

    component.set('gallery', new PhotoSwipe(
      component.get('pswpEl'),
      component.get('pswpTheme'),
      component.get('items'),
      component.get('options')
    ));

    component.get('gallery').listen('gettingData', function(index, item) {
      component._setItemDimensions(item).then(function(changed) {
        if(changed) {
          Em.run.later(component, function() {
            var index = component.get('gallery').items.indexOf(item);
            window.a = component.get('gallery');
            component.get('gallery').lazyLoadItem(index);
            component.get('gallery').invalidateCurrItems();
            component.get('gallery').updateSize(true);
          });
        }
      });
    });

    component._reInitOnClose();
  },

  _setItemDimensions: function(item) {
    return new Em.RSVP.Promise(function(resolve, reject) {
      if(!item.dynamic) {
        return resolve(false);
      }

      var img = new Image();
      img.onload = function() {
        item.w = this.naturalWidth;
        item.h = this.naturalHeight;
        item.dynamic = false;
        resolve(true);
      };
      img.onerror = function(err) {
        reject(err);
      };
      img.src = item.src + '?' + Math.random();
    });
  },

  _reInitOnClose: function() {
    var component = this;
    this.get('gallery').listen('close', function() {
      component.set('enabled', false);
      run.next(function() {
        component._initItemGallery();
      });
    });
  },

  itemObserver: Em.observer('items', function(){
    var component = this;
    component._initItemGallery();
  }),

  /**
   * DEPRECATED
   *
   * Code exists for backward compatability of block usage
   * up to ember-cli-photoswipe versions 1.0.1.
   */
  click: function(evt) {

    if (this.get('items')) {
      return; // ignore - not using deprecated block form
    }

    var aElement = this.$(evt.target).parent();
    var index    = this.$("a.photo-item").index( aElement );

    if (!aElement.is('a')) { return; }

    evt.preventDefault();

    // setup options, such as index for index
    this._buildOptions(this._getBounds.bind(this));
    this.set('options.index', index);

    var pSwipe = new PhotoSwipe(
      this.get('pswpEl'),
      this.get('pswpTheme'),
      this.get('calculatedItems'),
      this.get('options')
    );
    this.set('gallery', pSwipe);
    this.get('gallery').init();
  },
  /**
   * END DEPRECATED
   */

  _getBounds: function(i) {
    var img      = this.$('img').get(i),
        position = this.$(img).position(),
        width    = this.$(img).width();
    return {x: position.left, y: position.top, w: width};
  },

  actions: {
    launchGallery(item) {
      this._buildOptions(this._getBounds.bind(this));
      if (item !== undefined) {
        var index = this.get('items').indexOf(item);
        this.set('options.index', index);
      }

      var pSwipe = new PhotoSwipe(
        this.get('pswpEl'),
        this.get('pswpTheme'),
        this.get('items'),
        this.get('options')
      );
      this.set('gallery', pSwipe);
      this.get('gallery').init();
    }
  },


  /**
   * DEPRECATED
   *
   * Code exists for backward compatability of block usage
   * up to ember-cli-photoswipe versions 1.0.1.
   */
  _calculateItems: function() {
    var items           = this.$().find('a');
    var calculatedItems = Em.A(items).map(function(i, item) {
      return {
        src:   Em.$(item).attr('href'),
        w:     Em.$(item).data('width'),
        h:     Em.$(item).data('height'),
        msrc:  Em.$(item).children('img').attr('src'),
        title: Em.$(item).children('img').attr('alt')
      };
    });
    this.set('calculatedItems', calculatedItems);
  }
  /**
   * END DEPRECATED
   */

});
