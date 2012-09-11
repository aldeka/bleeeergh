MyApp = new Backbone.Marionette.Application();

MyApp.addRegions({
    mainRegion: "#content"
    });
    
AngryCat = Backbone.Model.extend({
    rankUp: function(){ 
        this.set({rank: this.get('rank') - 1 });
        },
    rankDown: function(){
        this.set({ rank: this.get('rank') + 1 });
        },
    addVote: function(){
        this.set('votes', this.get('votes') + 1);
        },
    defaults: {
        votes: 0
        }
    });

AngryCats = Backbone.Collection.extend({
    model: AngryCat,
    initialize: function(cats){
        var rank = 1;
        var self = this;
        _.each(cats, function(cat){
            cat.set('rank', rank);
            ++ rank;
            });
            
         _.each(cats, function(cat){
            var slug = cat.name.replace(' ','_');
            // this doesn't fill it in in the template, whyyyy
            cat.set('slug', slug);
            });
            
        this.on('add', function(cat){
            if( !cat.get('rank') ){
                var error = Error("Cat must have a rank defined before being added to the collection");
                error.name = "NoRankError";
                throw error;
                }
            });
        
        MyApp.vent.on('rank:up', function(cat){
            if (cat.get('rank') == 1){
                return true;
                }
            self.rankUp(cat);
            self.sort();
            });
            
        MyApp.vent.on('rank:down', function(cat){
            if (cat.get('rank') == self.size()){
                return true;
                }
            self.rankDown(cat);
            self.sort();
            });
            
        MyApp.vent.on("cat:disqualify", function(cat){
            var disqualifiedRank = cat.get('rank');
            var catsToUprank = self.filter(
                function(cat){ return cat.get('rank') > disqualifiedRank; });
            //_.each(catsToUprank, 
            catsToUprank.forEach(
                function(cat){
                    cat.rankUp();
                    });
            self.trigger('reset');
            });
            
        },
    comparator: function(cat){
        return cat.get('rank');
        },
        
    rankUp: function(cat){
        var self = this;
        var rankToSwap = cat.get('rank') - 1;
        var otherCat = this.at(rankToSwap - 1);
        cat.rankUp();
        otherCat.rankDown();
        },
    rankDown: function(cat){
        var self = this;
        var rankToSwap = cat.get('rank') + 1;
        var otherCat = this.at(rankToSwap - 1);
        
        cat.rankDown();
        otherCat.rankUp();
        }
    });
    
AngryCatView = Backbone.Marionette.ItemView.extend({
    template: "#angry_cat-template",
    tagName: 'tr',
    className: 'angry_cat',
    events: {
        'click .rank_up img': 'rankUp',
        'click .rank_down img': 'rankDown',
        'click a.disqualify': 'disqualify'
        },
    rankUp: function(){
        this.model.addVote();
        MyApp.vent.trigger('rank:up', this.model);
        },
    rankDown: function(){
        this.model.addVote();
        MyApp.vent.trigger('rank:down', this.model);
        },
    disqualify: function(){
        MyApp.vent.trigger("cat:disqualify", this.model);
        this.model.destroy();
        },
    initialize: function(){
        this.bindTo(this.model,"change:votes", this.render);
        }
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
    
    cats.add(new AngryCat({ 
        name: 'Cranky Cat', 
        image_path: 'assets/images/cat4.jpg', 
        rank: cats.size() + 1 
        }));
    });
