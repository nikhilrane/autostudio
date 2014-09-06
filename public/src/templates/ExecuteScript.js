if (!!!templates) var templates = {};
templates["ExecuteScript"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class='modal fade bs-example-modal-lg'>");t.b("\n" + i);t.b("    <div class='modal-dialog'>");t.b("\n" + i);t.b("        <div class='modal-content'>");t.b("\n" + i);t.b("            <div class='modal-header'>");t.b("\n" + i);t.b("                <button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span>");t.b("\n" + i);t.b("                    <span class='sr-only'></span>");t.b("\n" + i);t.b("                </button>");t.b("\n" + i);t.b("                <h4 class='modal-title'>Execute Script <br> <small>Use the <i>Browse</i> button to upload files if required by the script.</small></h4>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div id='modal-body' class='modal-body'>");t.b("\n" + i);t.b("                <script>");t.b("\n" + i);t.b("                    (function() {");t.b("\n" + i);t.b("                        var bar = $('.progress-bar');");t.b("\n" + i);t.b("                        var status = $('#status');");t.b("\n" + i);t.b("                        var files = [];");t.b("\n" + i);t.b("                        $('#executeForm').ajaxForm({");t.b("\n" + i);t.b("                            beforeSend: function() {");t.b("\n" + i);t.b("                                status.empty();");t.b("\n" + i);t.b("                                var percentVal = '0%';");t.b("\n" + i);t.b("                                bar.width(percentVal);");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                                var f = $(\"#execFiles\").prop('files');");t.b("\n" + i);t.b("                                for (var i = 0; i < f.length; i++) {");t.b("\n" + i);t.b("                                    file = $(\"#execFiles\").prop('files')[i];");t.b("\n" + i);t.b("                                    files.push(file.name);");t.b("\n" + i);t.b("                                }");t.b("\n");t.b("\n" + i);t.b("                                console.log(\"files: \" + JSON.stringify(files));");t.b("\n" + i);t.b("                            },");t.b("\n" + i);t.b("                            uploadProgress: function(event, position, total, percentComplete) {");t.b("\n" + i);t.b("                                bar.attr('aria-valuenow', percentComplete);");t.b("\n" + i);t.b("                                var percentVal = percentComplete + '%';");t.b("\n" + i);t.b("                                bar.width(percentVal);");t.b("\n" + i);t.b("                                bar.html(percentVal);");t.b("\n" + i);t.b("                            },");t.b("\n" + i);t.b("                            success: function() {");t.b("\n" + i);t.b("                                var percentVal = '100%';");t.b("\n" + i);t.b("                                bar.width(percentVal);");t.b("\n" + i);t.b("                                bar.attr('aria-valuenow', '100');");t.b("\n" + i);t.b("                                bar.html(percentVal);");t.b("\n" + i);t.b("                                bar.removeClass('active');");t.b("\n" + i);t.b("                            },");t.b("\n" + i);t.b("                            complete: function(xhr) {");t.b("\n" + i);t.b("                                status.html(xhr.responseText);");t.b("\n" + i);t.b("                                console.log(\"complete from upload called\");");t.b("\n" + i);t.b("								$('#execClose').click();");t.b("\n");t.b("\n" + i);t.b("                                // $('#genOutput').html(\"\");");t.b("\n" + i);t.b("                                $('#execOutput').html(\"\");");t.b("\n");t.b("\n" + i);t.b("                                var writer = new draw2d.io.json.Writer();");t.b("\n" + i);t.b("                                // alert(\"calling parse...\");");t.b("\n" + i);t.b("                                writer.marshal(app.view, $.proxy(function(jsonData) {");t.b("\n" + i);t.b("                                    // alert(\"Inside marshal\");");t.b("\n");t.b("\n" + i);t.b("                                    var documentObject = {");t.b("\n" + i);t.b("                                        \"documentData\": jsonData,");t.b("\n" + i);t.b("                                        \"name\": app.loadedDefinitionId,");t.b("\n" + i);t.b("                                        \"username\": sessionStorage.getItem('username'),");t.b("\n" + i);t.b("                                        \"files\": files");t.b("\n" + i);t.b("                                    };");t.b("\n");t.b("\n" + i);t.b("                                    // alert(\"sending: \" + JSON.stringify(documentObject));");t.b("\n");t.b("\n" + i);t.b("                                    $.ajax({");t.b("\n" + i);t.b("                                        url: '/pipestudio/executeScript',");t.b("\n" + i);t.b("                                        // dataType: \"jsonp\",");t.b("\n" + i);t.b("                                        data: {");t.b("\n" + i);t.b("                                            \"toGenerate\": documentObject");t.b("\n" + i);t.b("                                        },");t.b("\n" + i);t.b("                                        type: 'POST',");t.b("\n" + i);t.b("                                        success: function(script) {");t.b("\n" + i);t.b("                                            console.log(\"Success in execute script! \\n\" + JSON.stringify(script));");t.b("\n" + i);t.b("                                        },");t.b("\n" + i);t.b("                                        error: function(err) {");t.b("\n" + i);t.b("                                            console.log(\"Failure in execute script\" + JSON.stringify(err));");t.b("\n" + i);t.b("                                        },");t.b("\n" + i);t.b("                                    });");t.b("\n" + i);t.b("                                }, this));");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                            }");t.b("\n" + i);t.b("                        });");t.b("\n" + i);t.b("                    })();");t.b("\n" + i);t.b("                </script>");t.b("\n" + i);t.b("                <form id='executeForm' action='/pipestudio/uploadFile' enctype='multipart/form-data' method='post'>");t.b("\n" + i);t.b("                    <br>");t.b("\n" + i);t.b("                    <input id='execFiles' type='file' name='upload' multiple='multiple' class=\"btn btn-primary\">");t.b("\n" + i);t.b("                    <br>");t.b("\n" + i);t.b("                    <div class='progress'>");t.b("\n" + i);t.b("                        <div class='progress-bar progress-bar-success progress-bar-striped active' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 10%'>");t.b("\n" + i);t.b("                            0%");t.b("\n" + i);t.b("                        </div>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                </form>");t.b("\n");t.b("\n");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div class='modal-footer'>");t.b("\n" + i);t.b("                <script>");t.b("\n" + i);t.b("                    function startExec() {");t.b("\n" + i);t.b("                        $('#executeForm').submit();");t.b("\n" + i);t.b("                    }");t.b("\n" + i);t.b("                </script>");t.b("\n" + i);t.b("                <button type='button' class='btn btn-primary' onClick='startExec()'>Execute</button>");t.b("\n" + i);t.b("                <button id=\"execClose\" type='button' class='btn btn-danger' data-dismiss='modal'>Cancel</button>");t.b("\n");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("        </div><!-- /.modal-content -->");t.b("\n" + i);t.b("    </div><!-- /.modal-dialog -->");t.b("\n" + i);t.b("</div><!-- /.modal -->");return t.fl(); },partials: {}, subs: {  }});