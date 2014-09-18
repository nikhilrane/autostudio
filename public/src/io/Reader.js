/**
 * The Reader implemented by Draw2D Touch is not extensible to handle generic classes. Hence, this class customizes it to work with AutoStudio.
 * @extends draw2d.io.Reader
 */
autostudio.Reader = draw2d.io.Reader.extend({
    
    NAME : "autostudio.Reader",
    
    init: function(){
        this._super();
    },
    
    /**
     * @method
     * 
     * Restore the canvas from a given JSON object.
     * 
     * @param {draw2d.Canvas} canvas the canvas to restore
     * @param {Object} document the json object to load.
     */
    unmarshal: function(canvas, json){
        
        if(typeof json ==="string"){
            json = JSON.parse(json);
        }

        var node=null;
        $.each(json, $.proxy(function(i, element){
            try{
                var o = null;
                
                switch(element.userData.nature) {
                    case "operator": o = eval(new autostudio.shape.GenericShape(element.type, element.id));
                                     break;

                    case "connection": o = eval(new autostudio.connection.GenericConnection(element.type, element.id));
                                       break;

                    case "container": o = eval(new autostudio.shape.GenericContainer(element.type, element.id));
                                      break;

                    default: o = eval(new autostudio.shape.GenericShape(element.type, element.id));
                             break;
                }

                var source= null;
                var target=null;
                for(i in element){
                    var val = element[i];
                    if(i === "source"){
                        node = canvas.getFigure(val.node);
                        if(node===null){
                            throw "Source figure with id '"+val.node+"' not found";
                        }
                        source = node.getPort(val.port);
                        if(source===null){
                            throw "Unable to find source port '"+val.port+"' at figure '"+val.node+"' to unmarschal '"+element.type+"'";
                        }
                    }
                    else if (i === "target"){
                        node = canvas.getFigure(val.node);
                        if(node===null){
                            throw "Target figure with id '"+val.node+"' not found";
                        }
                        target = node.getPort(val.port);
                        if(target===null){
                            throw "Unable to find target port '"+val.port+"' at figure '"+val.node+"' to unmarschal '"+element.type+"'";
                        }
                    }
                }
                if(source!==null && target!==null){
                    o.setSource(source);
                    o.setTarget(target);
                }
                
                o.setPersistentAttributes(element);
                canvas.addFigure(o);
            }
            catch(exc){
                debug.group("Unable to instantiate figure type '"+element.type+"' with id '"+element.id+"' during unmarshal by "+this.NAME+". Skipping figure..");
                debug.warn(exc);
                debug.warn(element);
                debug.groupEnd();
            }
        },this));
        
        // recalculate all crossings and repaint the connections with 
        // possible crossing decoration
        canvas.calculateConnectionIntersection();
        canvas.getLines().each(function(i,line){
            line.svgPathString=null;
            line.repaint();
        });
        canvas.linesToRepaintAfterDragDrop = canvas.getLines().clone();

        canvas.showDecoration();
    }
});