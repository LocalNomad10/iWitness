IWitness.ResultSetView = Ember.View.extend({
  templateName: 'result_set_template',
  isVisibleBinding: 'IWitness.currentViewController.showingSearchResults',

  didInsertElement: function(){
    var self = this;
    _.defer(function(){
      $(window).on('scroll', self.infiniteScrollDetection('twitter'));
      $(window).on('scroll', self.infiniteScrollDetection('flickr'));
      self._toggleLivestreamPausing();
    });
  },

  infiniteScrollDetection: function(service){
    var self = this;

    return function(e) {
      var lastEl = self.$('.'+ service +':last');
      if(lastEl.length > 0) {
        var scrollDistanceToLastEl = lastEl.offset().top - $(window).scrollTop() - $(window).height();
        if(scrollDistanceToLastEl < 600 && IWitness.searchController.serviceHasMorePages(service)) {
          IWitness.searchController.getNextPageForService(service);
        }
      }
    };
  },

  selectResult: function(result) {
    IWitness.resultSetController.set('selectedResult', result);
  },

  selectedResult: function() {
    return IWitness.resultSetController.get('selectedResult');
  }.property('IWitness.resultSetController.selectedResult'),

  timeline: _.debounce(function(){
    var prev, cur;
    $('#timeline').show();
    this.$(".item-wrapper").each(function(i, e){
      cur = $(e);
      if(prev && cur) {
        if (prev.data('posted-time') == cur.data('posted-time')) {
          prev.removeClass('last');
          cur.removeClass('first');
        } else {
          prev.addClass('last');
          cur.addClass('first');
        }
      } else {
        cur.addClass('first');
      }
      prev = cur;
    });

    // prev is now the very last item, which ends the timeline.
    if (prev) prev.addClass('last');

  }, 100).observes('IWitness.resultSetController.length'),


  _toggleLivestreamPausing: function(){
    if(IWitness.criteriaController.getPath('content.stream')){
      $(window).on('scroll.pause', this._scrollPause() );
    } else {
      $(window).off('scroll.pause');
      IWitness.hiddenItemsController.unpause();
    }
  }.observes('IWitness.criteriaController.content.stream'),

  // wrap the debounced call in a function that binds 'this' to the current view.
  _scrollPause: function(){
    var self = this;
    return _.debounce(function(e){
      if($(window).scrollTop() > 100) {
        IWitness.hiddenItemsController.pause();
      } else {
        IWitness.hiddenItemsController.unpause();
      }
    }, 100);
  }

});
