IWitness.TwitterResult = IWitness.Result.extend({
  resultType:             'twitter',
  permalinkText:          'twitter',
  avatarSrcBinding:       'profileImageUrl',
  userNamePrimaryBinding: 'fromUserName',
  contentTextBinding:     'text',

  resultId: function(){
    return this.get('resultType') +'-'+ this.get('idStr');
  }.property('idStr'),

  userNameSecondary: function() {
    return '@' + this.get('fromUser');
  }.property('fromUser'),

  postedMoment: function() {
    return moment(this.get('createdAt'));
  }.property('createdAt'),

  userUrl: function() {
    return "http://twitter.com/#!/" + this.get('fromUser');
  }.property('fromUser'),

  permalinkUrl: function() {
    return this.get('userUrl') + '/status/' + this.get('idStr');
  }.property(),

  coordinates: function() {
    return this.getPath('geo.coordinates') || [];
  }.property('geo').cacheable(),

  lat: function() {
    return this.get('coordinates')[0];
  }.property('coordinates').cacheable(),

  lng: function() {
    return this.get('coordinates')[1];
  }.property('coordinates').cacheable(),

  contentSrc: function(){
    var entities = this.get("entities"); // returns a normal JS object
    if (entities && entities.urls.length) {
      IWitness.log(entities.urls);
      var url = entities.urls[0].expanded_url;
      var match = url.match(/instagr\.am\/p\/(\w+)\//);
      if (match) {
        return "http://instagr.am/p/"+ match[1] +"/media/?size=m";
      }
      match = url.match(/twitpic\.com\/(\w+)/);
      if (match) {
        return "http://twitpic.com/show/large/"+ match[1];
      }
    }
    return null;
  }.property("entities")
});
