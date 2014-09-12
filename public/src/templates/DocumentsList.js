if (!!!templates) var templates = {};
templates["DocumentsList"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<style type='text/css'>");t.b("\n" + i);t.b("    body {");t.b("\n" + i);t.b("        background-color: #eee;");t.b("\n" + i);t.b("        counter-reset: Serial;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    table {");t.b("\n" + i);t.b("        border-collapse: separate;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    tr {");t.b("\n" + i);t.b("        text-align: left;");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("    tr td:first-child:before {");t.b("\n" + i);t.b("        counter-increment: Serial;");t.b("\n" + i);t.b("        content: \"\" counter(Serial);");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("</style>");t.b("\n" + i);t.b("<script>");t.b("\n" + i);t.b("    var noOfItems = 0;");t.b("\n" + i);t.b("    $(function() {");t.b("\n");t.b("\n" + i);t.b("        noOfItems = ");t.b(t.v(t.f("listLength",c,p,0)));t.b(";");t.b("\n" + i);t.b("        var noOfPages = Math.ceil(noOfItems / 10);		// This is because we show 10 items per page");t.b("\n" + i);t.b("        var left_li = $('<li> </li>');");t.b("\n" + i);t.b("        var left_a = $('<a href=\"#\">&laquo;</a>');");t.b("\n");t.b("\n" + i);t.b("        left_a.on('click', function() {");t.b("\n" + i);t.b("            var pageToDisplay = $(this).parent().siblings(\".active\").children().first().html();");t.b("\n");t.b("\n" + i);t.b("            pageToDisplay = parseInt(pageToDisplay);");t.b("\n" + i);t.b("            if (pageToDisplay > 1) {");t.b("\n" + i);t.b("                $(this).parent().siblings(\".active\").removeClass(\"active\");");t.b("\n" + i);t.b("                pageToDisplay = pageToDisplay - 1;");t.b("\n" + i);t.b("                $(this).parent().siblings(\":eq(\" + (pageToDisplay - 1) + \")\").addClass(\"active\");");t.b("\n" + i);t.b("                displayPage(pageToDisplay);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        });");t.b("\n");t.b("\n" + i);t.b("        left_li.append(left_a);");t.b("\n" + i);t.b("        $('#docListPagination').append(left_li);");t.b("\n");t.b("\n" + i);t.b("        for (var i = 1; i <= noOfPages; i++) {");t.b("\n");t.b("\n" + i);t.b("            var li = $('<li> </li>');");t.b("\n" + i);t.b("            var a = $('<a href=\"#\"></a>');");t.b("\n" + i);t.b("            a.html(i);");t.b("\n" + i);t.b("            a.on('click', function() {");t.b("\n" + i);t.b("                $(this).parent().siblings(\".active\").removeClass(\"active\");");t.b("\n" + i);t.b("                $(this).parent().addClass(\"active\");");t.b("\n" + i);t.b("                displayPage($(this).html());");t.b("\n" + i);t.b("            });");t.b("\n" + i);t.b("            li.append(a);");t.b("\n" + i);t.b("            $('#docListPagination').append(li);");t.b("\n" + i);t.b("        }");t.b("\n");t.b("\n" + i);t.b("        var right_li = $('<li> </li>');");t.b("\n" + i);t.b("        var right_a = $('<a href=\"#\">&raquo;</a>');");t.b("\n");t.b("\n" + i);t.b("        right_a.on('click', function() {");t.b("\n" + i);t.b("            var pageToDisplay = $(this).parent().siblings(\".active\").children().first().html();");t.b("\n" + i);t.b("            pageToDisplay = parseInt(pageToDisplay);");t.b("\n");t.b("\n" + i);t.b("            if (pageToDisplay < noOfPages) {");t.b("\n" + i);t.b("                $(this).parent().siblings(\".active\").removeClass(\"active\");");t.b("\n" + i);t.b("                pageToDisplay = pageToDisplay + 1;");t.b("\n" + i);t.b("                $(this).parent().siblings(\":eq(\" + pageToDisplay + \")\").addClass(\"active\");");t.b("\n" + i);t.b("                displayPage(pageToDisplay);");t.b("\n" + i);t.b("            }");t.b("\n" + i);t.b("        });");t.b("\n");t.b("\n" + i);t.b("        right_li.append(right_a);");t.b("\n" + i);t.b("        $('#docListPagination').append(right_li);");t.b("\n");t.b("\n" + i);t.b("        $('.docTR').hide();");t.b("\n" + i);t.b("        displayPage(1);");t.b("\n" + i);t.b("        $('#docListPagination').children('li:eq(1)').addClass(\"active\");");t.b("\n");t.b("\n" + i);t.b("    });");t.b("\n");t.b("\n" + i);t.b("    function displayPage(pageNo) {");t.b("\n" + i);t.b("        var start = (pageNo - 1) * 10;");t.b("\n" + i);t.b("        var end = start + 10;");t.b("\n" + i);t.b("        $('.docTR:visible').hide();");t.b("\n" + i);t.b("        $('.docTR').slice(start, noOfItems < end ? noOfItems : end).show('fast');");t.b("\n" + i);t.b("    }");t.b("\n");t.b("\n" + i);t.b("    function getDocument(docName) {");t.b("\n" + i);t.b("        $.ajax({");t.b("\n" + i);t.b("            url: '/pipestudio/getDoc',");t.b("\n" + i);t.b("            data: {");t.b("\n" + i);t.b("                \"documentName\": docName,");t.b("\n" + i);t.b("                \"username\": sessionStorage.getItem(\"username\")");t.b("\n" + i);t.b("            },");t.b("\n" + i);t.b("            type: 'GET',");t.b("\n" + i);t.b("            success: function(jsonData) {");t.b("\n" + i);t.b("                var docData = JSON.stringify(JSON.parse(jsonData).result.documentData);");t.b("\n" + i);t.b("                app.loadDefinition(docName, docData);");t.b("\n" + i);t.b("            },");t.b("\n" + i);t.b("            error: function(err) {");t.b("\n" + i);t.b("                console.log(\"Failure in getting doc: \" + JSON.stringify(err));");t.b("\n" + i);t.b("            },");t.b("\n" + i);t.b("        });");t.b("\n" + i);t.b("    }");t.b("\n");t.b("\n" + i);t.b("    function deleteDocument(trID, docName) {");t.b("\n" + i);t.b("        $.ajax({");t.b("\n" + i);t.b("            url: '/pipestudio/deleteDoc',");t.b("\n" + i);t.b("            data: {");t.b("\n" + i);t.b("                \"documentName\": docName,");t.b("\n" + i);t.b("                \"documentID\": trID,");t.b("\n" + i);t.b("                \"username\": sessionStorage.getItem(\"username\")");t.b("\n" + i);t.b("            },");t.b("\n" + i);t.b("            type: 'POST',");t.b("\n" + i);t.b("            success: function(jsonData) {");t.b("\n" + i);t.b("                console.log(\"docName: \" + docName);");t.b("\n" + i);t.b("                $('#' + trID).hide('slow', function() { $(this).remove(); }).siblings('.docTR:hidden').first().show('slow');");t.b("\n");t.b("\n" + i);t.b("                // var pageToDisplay = $('#docListPagination').children('.active').children().first().html();");t.b("\n" + i);t.b("                // pageToDisplay = parseInt(pageToDisplay);");t.b("\n" + i);t.b("                // console.log(\"going to display: \" + pageToDisplay);");t.b("\n" + i);t.b("                // displayPage(pageToDisplay);");t.b("\n" + i);t.b("            },");t.b("\n" + i);t.b("            error: function(err) {");t.b("\n" + i);t.b("                console.log(\"Failure in getting doc: \" + JSON.stringify(err));");t.b("\n" + i);t.b("            },");t.b("\n" + i);t.b("        });");t.b("\n" + i);t.b("    }");t.b("\n" + i);t.b("</script>");t.b("\n" + i);t.b("<div id=\"documentsListDiv\" class='modal fade'>");t.b("\n" + i);t.b("    <div class='modal-dialog'>");t.b("\n" + i);t.b("        <div class='modal-content'>");t.b("\n" + i);t.b("            <div class='modal-header'>");t.b("\n" + i);t.b("                <button type='button' class='close' data-dismiss='modal'><span aria-hidden='true'>&times;</span>");t.b("\n" + i);t.b("                    <span class='sr-only'></span>");t.b("\n" + i);t.b("                </button>");t.b("\n" + i);t.b("                <h4 class='modal-title'>Documents List</h4>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div id='modal-body' class='modal-body'>");t.b("\n" + i);t.b("                <table class=\"table table-hover\">");t.b("\n" + i);t.b("                    <thead>");t.b("\n" + i);t.b("                        <tr>");t.b("\n" + i);t.b("                            <th><b>#</b></th>");t.b("\n" + i);t.b("                            <th><b>Document Name</b></th>");t.b("\n" + i);t.b("                            <th><b>Status</b></th>");t.b("\n" + i);t.b("                            <th><b>Delete</b></th>");t.b("\n" + i);t.b("                        </tr>");t.b("\n" + i);t.b("                    </thead>");t.b("\n" + i);t.b("                    <tbody>");t.b("\n" + i);if(t.s(t.f("list",c,p,1),c,p,0,5225,5867,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                        <tr id=\"");t.b(t.v(t.f("_id",c,p,0)));t.b("\" class=\"warning docTR\">");t.b("\n" + i);t.b("                            <td></td>");t.b("\n" + i);t.b("                            <td><a href=\"#\" data-dismiss='modal' onclick='getDocument(\"");t.b(t.v(t.f("name",c,p,0)));t.b("\")'>");t.b(t.v(t.f("name",c,p,0)));t.b("</a></td>");t.b("\n" + i);t.b("                            <td>");t.b(t.v(t.f("status",c,p,0)));t.b("</td>");t.b("\n" + i);t.b("                            <td>");t.b("\n" + i);t.b("                                <button type='button' class='btn btn-danger' onclick='deleteDocument(\"");t.b(t.v(t.f("_id",c,p,0)));t.b("\", \"");t.b(t.v(t.f("name",c,p,0)));t.b("\")'>");t.b("\n" + i);t.b("                                    <span class=\"glyphicon glyphicon-remove\"></span>");t.b("\n" + i);t.b("                                </button>");t.b("\n" + i);t.b("                            </td>");t.b("\n" + i);t.b("                        </tr>");t.b("\n" + i);});c.pop();}t.b("                    </tbody>");t.b("\n" + i);t.b("                </table>");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                <div align=\"center\">");t.b("\n" + i);t.b("                    <ul id=\"docListPagination\" class=\"pagination\"></ul>");t.b("\n" + i);t.b("                </div>");t.b("\n");t.b("\n");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div class='modal-footer'>");t.b("\n" + i);t.b("                <button type='button' class='btn btn-danger' data-dismiss='modal'>Cancel</button>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("        </div><!-- /.modal-content -->");t.b("\n" + i);t.b("    </div><!-- /.modal-dialog -->");t.b("\n" + i);t.b("</div><!-- /.modal -->");return t.fl(); },partials: {}, subs: {  }});
