//commented because errors in FF
this.plaxController = new PlaxController ({ el: $('#crowd') });

try { //temp fix for homepage/room error
  this.searchController = new SearchController ({ el: $('#search') });
} catch(err) {}