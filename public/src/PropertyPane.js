

autostudio.PropertyPane = Class.extend({
	
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
        // if(figure !== null) 
        //     console.log("fig: " + figure.NAME + ", id: " + figure.getId());
        // else
        //     console.log("fig is NULL");
        
        // if(this.pane!==null){
        //     this.pane.onHide();
        // }
        
        // this.html.html("");

        // if(figure===null || (figure !== null && typeof figure.injectPropertyView != 'function') ){
        //     return;
        // }
        // this.pane = null;

        // figure.injectPropertyView(this.html);
        
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

