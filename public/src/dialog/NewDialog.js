

example.dialog.NewDialog = Class.extend({
    
    init:function(){
      
    },
    
    show: function(){
            this.container = $('#myModal');
            var container = this.container;
            var _this = this;
            
            container.modal();
            $(".modal-title").text("Create new definition");

            // Form part
            //
            var output =
                        '<form id="newFileNameForm">'+
                        '  <label>Name of the definition</label>'+
                        '  <input id="newFileName" type="text" class="form-control input-lg" placeholder="name of the new definition">'+
                        '</form>';
            // var compiled = Hogan.compile(template);
            // var output = $(compiled.render({}));
            container.find('.modal-body').html(output);
            var input = $("#newFileName");
            input.on("keyup", function(){
                container.find('.btn-primary').attr("disabled",input.val().length===0);
            });
            $("newFileNameForm").submit(function(e){
                return false;
            });
            
            // button bar
            //
            output = '<button class="btn" data-dismiss="modal" aria-hidden="true">Abort</button><button class="btn btn-primary">Create</button>';
            // compiled = Hogan.compile(template);
            // output = compiled.render({});
            container.find('.modal-footer').html(output);
            container.find('.btn-primary').on('click', $.proxy(function(e) {
                e.preventDefault();
                var row = $(container.find("tr.success"));
                var id = input.val();
                _this._onOk(id);
            },this)).attr("disabled",true);
    },
    
    _onOk: function(id){
        this.container.modal('hide');
        app.createDefinition(id);
    }
});