MyApp = new Backbone.Marionette.Application();

MyApp.addRegions({
    mainRegion: "#content"
    });
    
AngryCat = Backbone.Model.extend({});

AngryCats = Backbone.Collection.extend({
    model: AngryCat
    });
    
AngryCatView = Backbone.Marionette.ItemView.extend({
    template: "#angry_cat-template",
    tagName: 'tr',
    className: 'angry_cat'
    });
    
AngryCatsView = Backbone.Marionette.CompositeView.extend({
    tagName: "table",
    id: 'angry_cats',
    className: 'table-striped table-bordered',
    template: '#angry_cats-template',
    itemView: AngryCatView,
    
    appendHtml: function(collectionView, itemView) { collectionView.$('tbody').append(itemView.el); }
    });
    
MyApp.addInitializer(function(options){
    var angryCatsView = new AngryCatsView({
    collection: options.cats
    });
    MyApp.mainRegion.show(angryCatsView);
    });
    
$(document).ready(function(){
    var cats = new AngryCats([
        new AngryCat ({ name: 'Wet Cat', image_path: 'assets/images/cat2.jpg'}),
        new AngryCat ({ name: 'Bitey', image_path: 'assets/images/cat1.jpg'}),
        new AngryCat ({ name: 'Ceiling Cat', image_path: 'assets/images/cat3.jpg'})
        ]);
    MyApp.start({ cats: cats });
    });
