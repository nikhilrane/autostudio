if (!!!templates) var templates = {};
templates["MapProps"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div id=\"propertiesModal\" class=\"modal fade\">");t.b("\n" + i);t.b("    <div class=\"modal-lg\">");t.b("\n" + i);t.b("        <div class=\"modal-content\">");t.b("\n" + i);t.b("            <div class=\"modal-header\">");t.b("\n" + i);t.b("                <button type=\"button\" class=\"close\" data-dismiss=\"modal\"><span aria-hidden=\"true\">&times;</span><span class=\"sr-only\">Close</span>");t.b("\n" + i);t.b("                </button>");t.b("\n" + i);t.b("                <h4 class=\"modal-title\"><b>");t.b(t.v(t.f("label",c,p,0)));t.b("</b> Properties</h4>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div class=\"modal-body\">");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                <script>");t.b("\n" + i);t.b("                    $(document).ready(function() {");t.b("\n");t.b("\n" + i);t.b("		                $(\"#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_paramsTable\").html(\"\").show();");t.b("\n");t.b("\n" + i);if(t.s(t.f("paramList",c,p,1),c,p,0,633,708,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("			                $(\"#");t.b(t.v(t.f("paramID",c,p,0)));t.b("_text\").val('");t.b(t.t(t.f("paramValue",c,p,0)));t.b("'); ");t.b("\n" + i);});c.pop();}t.b("\n" + i);t.b("						var w =  $('#propertiesModal').innerWidth();");t.b("\n");t.b("\n" + i);t.b("						// This is a really wierd hack but we don't get");t.b("\n" + i);t.b("						// the exact width of modal or form here.");t.b("\n" + i);t.b("						w = (w/4)-30;");t.b("\n");t.b("\n");t.b("\n" + i);t.b("						$(\"#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_paramsTable\").show().handsontable({");t.b("\n" + i);t.b("							data: getParsedUsingData(),");t.b("\n" + i);t.b("							minRows: 1,");t.b("\n" + i);t.b("							colWidths: [w, w],");t.b("\n" + i);t.b("							manualColumnResize: true,");t.b("\n" + i);t.b("							rowHeaders: false,");t.b("\n" + i);t.b("							minSpareRows: 1,");t.b("\n" + i);t.b("							colHeaders: [\"Parameter Name\", \" Parameter Value\"],");t.b("\n" + i);t.b("							afterChange: function(array, source) {");t.b("\n" + i);t.b("								if (array !== null) {");t.b("\n" + i);t.b("									var data = this.getData();");t.b("\n" + i);t.b("									var final = \"\";");t.b("\n");t.b("\n" + i);t.b("									if (data !== null) {");t.b("\n");t.b("\n" + i);t.b("									    for (var i = 0; i < data.length; i++) {");t.b("\n" + i);t.b("									        if (data[i].param !== null && data[i].value !== null) {");t.b("\n" + i);t.b("									            if (final.length > 0) { final = final + \", \"; }");t.b("\n");t.b("\n" + i);t.b("									            final = final + data[i].param + \" = \" + data[i].value;");t.b("\n" + i);t.b("									        }");t.b("\n" + i);t.b("									    }");t.b("\n" + i);t.b("									}");t.b("\n" + i);t.b("									$('#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_text ').val(final);");t.b("\n" + i);t.b("									app.updateFigureParameter(\"using\", final);");t.b("\n" + i);t.b("								}");t.b("\n" + i);t.b("							},");t.b("\n" + i);t.b("							columns: [{data: \"param\", renderer: italicRenderer}, {data: \"value\"}]");t.b("\n" + i);t.b("						});");t.b("\n");t.b("\n" + i);t.b("					});");t.b("\n");t.b("\n");t.b("\n" + i);t.b("					function italicRenderer(instance, td, row, col, prop, value, cellProperties) {");t.b("\n" + i);t.b("						Handsontable.renderers.TextRenderer.apply(this, arguments);");t.b("\n" + i);t.b("						$(td).css({");t.b("\n" + i);t.b("							\"font-style\": \"italic\",");t.b("\n" + i);t.b("							\"color\": \"#777\"");t.b("\n" + i);t.b("						});");t.b("\n");t.b("\n" + i);t.b("					}");t.b("\n");t.b("\n" + i);t.b("					function onChanged() {");t.b("\n");t.b("\n" + i);t.b("                        var val = $('#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_on_text').val();");t.b("\n" + i);t.b("                        if (val !== undefined && val !== null && val.trim().length > 0) {");t.b("\n" + i);t.b("                            app.updateFigureParameter(\"on\", val);");t.b("\n" + i);t.b("                        }");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n" + i);t.b("                    function doChanged() {");t.b("\n");t.b("\n" + i);t.b("                        var val = $('#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_do_text').val();");t.b("\n" + i);t.b("                        if (val !== undefined && val !== null && val.trim().length > 0) {");t.b("\n" + i);t.b("                            app.updateFigureParameter(\"do\", val);");t.b("\n" + i);t.b("                        }");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    function getParsedUsingData() {");t.b("\n" + i);t.b("                        var val = $('#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_text').val();");t.b("\n" + i);t.b("                        var data = [];");t.b("\n");t.b("\n" + i);t.b("                        if (val !== undefined) {");t.b("\n" + i);t.b("                            var dataArr = val.trim().replace(/,[^(?:\\\",\\\")]/g, '\\u000B').split('\\u000B');");t.b("\n");t.b("\n" + i);t.b("                            for (var i = 0; i < dataArr.length; i++) {");t.b("\n" + i);t.b("                                var temp = {};");t.b("\n" + i);t.b("                                var current = dataArr[i].trim().split('=');");t.b("\n" + i);t.b("                                temp[\"param\"] = current[0];");t.b("\n" + i);t.b("                                temp[\"value\"] = current[1];");t.b("\n" + i);t.b("                                data.push(temp);");t.b("\n" + i);t.b("                            }");t.b("\n" + i);t.b("                        }");t.b("\n" + i);t.b("                        return data;");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    function usingChanged() {");t.b("\n");t.b("\n" + i);t.b("                        var val = $('#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_text').val();");t.b("\n" + i);t.b("                        if (val !== undefined) {");t.b("\n" + i);t.b("                            app.updateFigureParameter(\"using\", val);");t.b("\n" + i);t.b("                            $('#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_paramsTable').handsontable('loadData', getParsedUsingData());");t.b("\n" + i);t.b("                        }");t.b("\n");t.b("\n" + i);t.b("                    }");t.b("\n");t.b("\n");t.b("\n" + i);t.b("                    function commentChanged() {");t.b("\n");t.b("\n" + i);t.b("                        var val = $('#");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_comment_text').val();");t.b("\n" + i);t.b("                        if (val !== undefined) {");t.b("\n" + i);t.b("                            val = val.replace(/\\n/g, '\\\\n');");t.b("\n" + i);t.b("                            app.updateFigureParameter(\"comment\", val);");t.b("\n" + i);t.b("                        }");t.b("\n" + i);t.b("                    }");t.b("\n" + i);t.b("                </script>");t.b("\n" + i);t.b("                <form id=\"");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_form\" role='form'>");t.b("\n" + i);t.b("                    <br>");t.b("\n");t.b("\n" + i);t.b("                    <!-- 'on' parameter section -->");t.b("\n" + i);t.b("                    <div id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_on_div' class='form-group'>");t.b("\n" + i);t.b("                        <label for='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_on_label'>on</label>");t.b("\n" + i);t.b("                        <input id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_on_text' class='form-control' name='on' type='text' value='' onchange=\"onChanged()\" placeholder=\"On parameter values...\" />");t.b("\n" + i);t.b("                        <br>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                    <br>");t.b("\n");t.b("\n" + i);t.b("                    <!-- 'do' parameter section -->");t.b("\n" + i);t.b("                    <div id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_do_div' class='form-group'>");t.b("\n" + i);t.b("                        <label for='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_do_label'>do</label>");t.b("\n" + i);t.b("                        <input id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_do_text' class='form-control' name='do' type='text' value='' onchange=\"doChanged()\" placeholder=\"Do parameter values...\" />");t.b("\n" + i);t.b("                        <br>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                    <br>");t.b("\n");t.b("\n" + i);t.b("                    <!-- 'using' parameter section -->");t.b("\n" + i);t.b("                    <div id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_div' class='form-group'>");t.b("\n" + i);t.b("                        <label for='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_label'>using</label>");t.b("\n" + i);t.b("                        <input id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_text' class='form-control' name='using' type='text' value='' onchange=\"usingChanged()\" placeholder=\"You can directly enter all values here...\" />");t.b("\n" + i);t.b("                        <br>");t.b("\n" + i);t.b("                        <div id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_using_paramsTable' class=\"handsontable\" style=\"width:100%\"></div>");t.b("\n" + i);t.b("                    </div>");t.b("\n" + i);t.b("                    <br>");t.b("\n");t.b("\n" + i);t.b("                    <!-- 'comment' parameter section -->");t.b("\n" + i);t.b("                    <div id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_comment_div' class='form-group'>");t.b("\n" + i);t.b("                        <label for='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_comment_label'>comment</label>");t.b("\n" + i);t.b("                        <textarea id='");t.b(t.v(t.f("shapeID",c,p,0)));t.b("_comment_text' class='form-control' name='comment' value='' onchange=\"commentChanged()\" placeholder=\"Comment goes here...\" rows=\"3\"></textarea>");t.b("\n" + i);t.b("                    </div>");t.b("\n");t.b("\n" + i);t.b("                    <br />");t.b("\n");t.b("\n" + i);t.b("                </form>");t.b("\n");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("            <div class=\"modal-footer\">");t.b("\n" + i);t.b("                <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>");t.b("\n" + i);t.b("                <button type=\"button\" class=\"btn btn-primary\">OK</button>");t.b("\n" + i);t.b("            </div>");t.b("\n" + i);t.b("        </div><!-- /.modal-content -->");t.b("\n" + i);t.b("    </div><!-- /.modal-dialog -->");t.b("\n" + i);t.b("</div><!-- /.modal -->");return t.fl(); },partials: {}, subs: {  }});
