

example.PropertyPane = Class.extend({
	
	init:function(elementId, view){
	    this.selectedFigure = null;
        this.html = $("#"+elementId);
        this.view = view;
        this.pane = null;
        this.view.addSelectionListener(this);
        
        // register as listener to update the property pane if anything has been changed in the model
        
        view.getCommandStack().addEventListener($.proxy(function(event){
            if(event.isPostChangeEvent()){
                this.onSelectionChanged(this.selectedFigure);
            }
        },this));
	},
	
    /**
     * @method
     * Called if the selection in the canvas has been changed. You must register this
     * class on the canvas to receive this event.
     * 
     * @param {draw2d.Figure} figure
     */
    onSelectionChanged : function(figure){
        this.selectedFigure = figure;
        
        // if(this.pane!==null){
        //     this.pane.onHide();
        // }
        
        // this.html.html("");

        // if(figure===null || (figure !== null && typeof figure.injectPropertyView != 'function') ){
        //     return;
        // }
        // this.pane = null;
        // console.log("Setting base props to: " + figure.NAME);
        // figure.injectPropertyView(this.html);
        // switch(figure.NAME)
        // {
        //     case "example.shape.Aggregate":
        //         this.pane = new example.propertypane.PropertyPaneAggregate(figure);
        //         break;
        //     case "example.shape.DBJoin":
        //         this.pane = new example.propertypane.PropertyPaneDBJoin(figure);
        //         break;
        //     case "example.shape.DBSource":
        //         this.pane = new example.propertypane.PropertyPaneDBSource(figure);
        //         break;
        //     case "example.shape.DBWriter":
        //         this.pane = new example.propertypane.PropertyPaneDBWriter(figure);
        //         break;
        //     case "example.shape.FileSource":
        //         // this.pane = new example.propertypane.PropertyPaneFileSource(figure);
        //         this.pane = new example.propertypane.PropertyPaneGenericShape(figure);
        //         break;
        //     case "example.shape.Filter":
        //         this.pane = new example.propertypane.PropertyPaneFilter(figure);
        //         break;
        //     case "example.shape.Matcher":
        //         this.pane = new example.propertypane.PropertyPaneMatcher(figure);
        //         break;
        //     case "example.shape.MemorySource":
        //         this.pane = new example.propertypane.PropertyPaneMemorySource(figure);
        //         break;                
        //     case "example.shape.Project":
        //         this.pane = new example.propertypane.PropertyPaneProject(figure);
        //         break;
        //     case "example.shape.RelationHashJoin":
        //         this.pane = new example.propertypane.PropertyPaneRelationHashJoin(figure);
        //         break;
        //     case "example.shape.RScript":
        //         this.pane = new example.propertypane.PropertyPaneRScript(figure);
        //         break;
        //     case "example.shape.SlidingWindow":
        //         this.pane = new example.propertypane.PropertyPaneSlidingWindow(figure);
        //         break;
        //     case "example.shape.SocketSink":
        //         this.pane = new example.propertypane.PropertyPaneSocketSink(figure);
        //         break;
        //     case "example.shape.SocketSource":
        //         this.pane = new example.propertypane.PropertyPaneSocketSource(figure);
        //         break;
        //     case "example.shape.SPARQLJoin":
        //         this.pane = new example.propertypane.PropertyPaneSPARQLJoin(figure);
        //         break;
        //     case "example.shape.StreamWriter":
        //         this.pane = new example.propertypane.PropertyPaneStreamWriter(figure);
        //         break;
        //     case "example.shape.SymmetricHashJoin":
        //         this.pane = new example.propertypane.PropertyPaneSymmetricHashJoin(figure);
        //         break;
        //     case "example.shape.Triplifier":
        //         this.pane = new example.propertypane.PropertyPaneTuplifier(figure);
        //         break;
        //     case "example.shape.Tuplifier":
        //         this.pane = new example.propertypane.PropertyPaneTriplifier(figure);
        //         break;
        //     case "example.shape.TwitterReader":
        //         this.pane = new example.propertypane.PropertyPaneTwitterReader(figure);
        //         break;
        //     case "example.shape.Union":
        //         this.pane = new example.propertypane.PropertyPaneUnion(figure);
        //         break;
        //     case "example.shape.ZmqPublisher":
        //         this.pane = new example.propertypane.PropertyPaneZmqPublisher(figure);
        //         break;
        //     case "example.shape.ZmqPull":
        //         this.pane = new example.propertypane.PropertyPaneZmqPull(figure);
        //         break;
        //     case "example.shape.ZmqPush":
        //         this.pane = new example.propertypane.PropertyPaneZmqPush(figure);
        //         break;
        //     case "example.shape.ZmqSubscriber":
        //         this.pane = new example.propertypane.PropertyPaneZmqSubscriber(figure);
        //         break;
        //     default:
        //         break;
        // }
        
        // if(this.pane!==null){
        //     this.pane.injectPropertyView(this.html);
        // }
    },
    
    onResize: function()
    {
        if(this.pane!==null){
            this.pane.onResize();
        }
    },

    updateParameter: function(paramName, paramValue) {
        this.selectedFigure.setParameter(paramName, paramValue);
    }
    
});

