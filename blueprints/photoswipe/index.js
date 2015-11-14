'use strict';

var fs    = require('fs');

var PHOTOSWIPE_VERSION = 'git://github.com/dimsemenov/PhotoSwipe.git#1a061a682cf4f';

module.exports = {

  description: 'Adds Photoswipe lib from bower and generate custom src',

  normalizeEntityName: function() {/* generator with no args */},

  afterInstall: function(options) {
    return this.addBowerPackageToProject('photoswipe', PHOTOSWIPE_VERSION);
  }

};
