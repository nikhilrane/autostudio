if (!!!templates) var templates = {};
templates["DownloadFiles"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div class='modal fade bs-example-modal-lg'>");t.b("\n" + i);t.b("    <div class='modal-dialog'>");t.b("\n" + i);t.b("        <div class='modal-content'>");t.b("\n" + i);t.b("            <div class='modal-header'>");t.b("\n" + i);t.b("                <button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span>");t.b("\n" + i);t.b("                    <span class='sr-only'></span>");t.b("\n" + i);t.b("                </button>");t.b("\n" + i);t.b("                <h4 class='modal-title'>Download output files of executions <br> <small>Use the links to download specific files.</small></h4>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div id='modal-body' class='modal-body'>");t.b("\n");t.b("\n" + i);t.b("                <script>");t.b("\n" + i);t.b("                    var replaceWith = \"-\";");t.b("\n" + i);t.b("                    var toReplace = /[!\"#$%&'()*+,.\\/:;<=>?@[\\\\\\]^`{|}~]/g;");t.b("\n" + i);t.b("                    var rootPath = \"output\";");t.b("\n" + i);t.b("                    var data = JSON.parse('");t.b(t.t(t.f("list",c,p,0)));t.b("');");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    $(function() {");t.b("\n" + i);t.b("                        createRoot();");t.b("\n" + i);t.b("                        createTree();");t.b("\n");t.b("\n" + i);t.b("                        $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');");t.b("\n" + i);t.b("                        $('.tree li').hide();");t.b("\n" + i);t.b("                        $('.tree li:first').show();");t.b("\n" + i);t.b("                        $('.tree li.parent_li > span').on('click', function(e) {");t.b("\n" + i);t.b("                            var children = $(this).parent('li.parent_li').find(' > ul > li');");t.b("\n" + i);t.b("                            if (children.is(\":visible\")) {");t.b("\n" + i);t.b("                                children.hide('fast');");t.b("\n" + i);t.b("                                $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-folder-close').removeClass('icon-folder-open');");t.b("\n" + i);t.b("                            } else {");t.b("\n" + i);t.b("                                children.show('fast');");t.b("\n" + i);t.b("                                $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-folder-open').removeClass('icon-folder-close');");t.b("\n" + i);t.b("                            }");t.b("\n" + i);t.b("                            e.stopPropagation();");t.b("\n" + i);t.b("                        });");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    });");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    function getDirHtml(folder, name) {");t.b("\n");t.b("\n" + i);t.b("                        var li = $('<li> </li>');");t.b("\n" + i);t.b("                        li.attr('id', folder.replace(toReplace, replaceWith));");t.b("\n" + i);t.b("                        //console.log(\"folder: \" + folder.replace(toReplace, replaceWith));");t.b("\n" + i);t.b("                        var node = $('<span class=\"badge badge-warning\" data-folderName=\"\"> </span>');");t.b("\n" + i);t.b("                        node.data('path', folder);");t.b("\n" + i);t.b("                        node.append('<i class=\"icon-folder-close\"></i> &nbsp;' + name);");t.b("\n" + i);t.b("                        li.append(node);");t.b("\n" + i);t.b("                        var children_ul = $('<ul> </ul>');");t.b("\n" + i);t.b("                        children_ul.attr('id', folder.replace(toReplace, replaceWith) + '_ul');");t.b("\n" + i);t.b("                        li.append(children_ul);");t.b("\n" + i);t.b("                        return li;");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    function getFileHtml(file, name) {");t.b("\n" + i);t.b("                        var li = $('<li> </li>');");t.b("\n" + i);t.b("                        var node = $('<span></span>');");t.b("\n" + i);t.b("//downloadForm.append($('<label for=\"filePath\">' + name + '</label>'));");t.b("\n" + i);t.b("var downloadForm = $('<form action=\"/pipestudio/downloadFile\" method=\"post\"> </form>');");t.b("\n" + i);t.b("downloadForm.append($('<i class=\"icon-file\"></i>'));");t.b("\n" + i);t.b("downloadForm.append($('<input style=\"display:none;\" name=\"username\" value=\"' + sessionStorage.getItem(\"username\") + '\"></input>'));");t.b("\n" + i);t.b("downloadForm.append($('<input style=\"display:none;\" name=\"fileToDownload\" value=\"' + file + '\"></input>'));");t.b("\n" + i);t.b("downloadForm.append($('<button type=\"submit\" class=\"btn btn-info btn-xs\"><span class=\"glyphicon glyphicon-download-alt\" style=\"border:0px\"></span>' + name + '</button>'));");t.b("\n");t.b("\n" + i);t.b("//                        link.on('click', function(e) {");t.b("\n" + i);t.b("//                            e.preventDefault();");t.b("\n" + i);t.b("//                            downloadFile($(this).data('path'));");t.b("\n" + i);t.b("//                        });");t.b("\n" + i);t.b("//                        link.html('&nbsp;' + name);");t.b("\n" + i);t.b("//                        link.data('path', file);");t.b("\n" + i);t.b("                        node.append(downloadForm);");t.b("\n" + i);t.b("                        li.append(node);");t.b("\n");t.b("\n" + i);t.b("                        return li;");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n" + i);t.b("                    function downloadFile(filePath) {");t.b("\n" + i);t.b("                        alert(\"path: \" + filePath);");t.b("\n" + i);t.b("                        $.ajax({");t.b("\n" + i);t.b("                            url: '/pipestudio/downloadFile',");t.b("\n" + i);t.b("                            data: {");t.b("\n" + i);t.b("                                \"username\": sessionStorage.getItem('username'),");t.b("\n" + i);t.b("								\"fileToDownload\": filePath");t.b("\n" + i);t.b("                            },");t.b("\n" + i);t.b("                            type: 'POST',");t.b("\n" + i);t.b("                            success: function(fileData, fileName) {");t.b("\n" + i);t.b("                                console.log(\"Success in download! \\nFile name:\\n\" + fileName + \"\\nData:\\n\" + fileData); ");t.b("\n" + i);t.b("                            },");t.b("\n" + i);t.b("                            error: function(err) {");t.b("\n" + i);t.b("                                console.log(\"Failure downloading file!\" + JSON.stringify(err));");t.b("\n" + i);t.b("                            },");t.b("\n" + i);t.b("                        });");t.b("\n");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n" + i);t.b("                    function createRoot() {");t.b("\n" + i);t.b("                        var mainUl = $('<ul> </ul>');");t.b("\n");t.b("\n" + i);t.b("                        $.each(data[\"output\"], function(key, value) {");t.b("\n" + i);t.b("                            var path = rootPath + \"/\" + value;");t.b("\n" + i);t.b("                            //console.log(key + \" <=> \" + value + \" | \" + path);");t.b("\n");t.b("\n" + i);t.b("                            if (data[path] !== undefined) {");t.b("\n" + i);t.b("                                //this means current 'value' is a directory");t.b("\n" + i);t.b("                                //var htmlCode = getDirHtml(path, value);");t.b("\n" + i);t.b("                                mainUl.append(getDirHtml(path, value));");t.b("\n" + i);t.b("                            } else {");t.b("\n" + i);t.b("                                //var htmlCode = getFileHtml(path, value);");t.b("\n" + i);t.b("                                mainUl.append(getFileHtml(path, value));");t.b("\n" + i);t.b("                            }");t.b("\n" + i);t.b("                        });");t.b("\n");t.b("\n" + i);t.b("                        //console.log(\"replaced: \\n\" + rootPath.replace(toReplace, replaceWith));");t.b("\n" + i);t.b("                        //console.log(\"html: \\n\" + mainUl.html());");t.b("\n" + i);t.b("                        //$('#-home-nikhilrane-git_rep-autostudio-executions-output-nik_ul').html(mainUl.html());");t.b("\n" + i);t.b("                        $('#' + rootPath.replace(toReplace, replaceWith) + '_ul').html(mainUl.html());");t.b("\n");t.b("\n" + i);t.b("                        delete data[\"output\"];");t.b("\n");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    function createTree() {");t.b("\n");t.b("\n" + i);t.b("                        $.each(data, function(key, value) {");t.b("\n" + i);t.b("                            //var folderPath = key + \"/\" + value;");t.b("\n" + i);t.b("                            // console.log(key + \" <=> \" + value + \" | \" + folderPath);");t.b("\n" + i);t.b("                            //Only folders are supposed to be here, and they are already created");t.b("\n" + i);t.b("                            var mainUl = $('#' + key.replace(toReplace, replaceWith) + '_ul');");t.b("\n" + i);t.b("                            //console.log(\"checking: \" + key.replace(toReplace, replaceWith) + '_ul' + \", length: \" + value.length);");t.b("\n");t.b("\n" + i);t.b("                            //console.log(\"before: \" + mainUl.html());");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                            for (var i = 0; i < value.length; i++) {");t.b("\n" + i);t.b("                                var current = value[i];");t.b("\n" + i);t.b("                                //console.log(\"current: \" + current);");t.b("\n" + i);t.b("                                var path = key + \"/\" + current;");t.b("\n" + i);t.b("                                if (data[path] !== undefined) {");t.b("\n" + i);t.b("                                    //this means current 'value' is a directory");t.b("\n" + i);t.b("                                    //var htmlCode = getDirHtml(path, value);");t.b("\n" + i);t.b("                                    mainUl.append(getDirHtml(path, current));");t.b("\n" + i);t.b("                                } else {");t.b("\n" + i);t.b("                                    var htmlCode = getFileHtml(path, current);");t.b("\n" + i);t.b("                                    //console.log(\"html: \" + htmlCode.html());");t.b("\n" + i);t.b("                                    mainUl.append(getFileHtml(path, current));");t.b("\n" + i);t.b("                                }");t.b("\n" + i);t.b("                            }");t.b("\n");t.b("\n" + i);t.b("                        });");t.b("\n" + i);t.b("                    }");t.b("\n" + i);t.b("                </script>");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                <div class=\"tree\">");t.b("\n" + i);t.b("                    <ul>");t.b("\n" + i);t.b("                        <li id=\"output\">");t.b("\n" + i);t.b("                            <span data-path=\"output\"><i class=\"icon-hdd\"></i> Output </span>");t.b("\n" + i);t.b("                            <ul id=\"output_ul\">");t.b("\n");t.b("\n" + i);t.b("                            </ul>");t.b("\n" + i);t.b("                        </li>");t.b("\n" + i);t.b("                    </ul>");t.b("\n" + i);t.b("                </div>");t.b("\n");t.b("\n");t.b("\n");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div class='modal-footer'>");t.b("\n" + i);t.b("                <button id=\"execClose\" type='button' class='btn btn-danger' data-dismiss='modal'>Cancel</button>");t.b("\n");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("        </div>");t.b("\n" + i);t.b("        <!-- /.modal-content -->");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <!-- /.modal-dialog -->");t.b("\n" + i);t.b("</div>");t.b("\n" + i);t.b("<!-- /.modal -->");return t.fl(); },partials: {}, subs: {  }});
