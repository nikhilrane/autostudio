if (!!!templates) var templates = {};
templates["OperatorImageList"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");if(t.s(t.f("imgList",c,p,1),c,p,0,12,693,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("<div class=\"panel panel-default\">");t.b("\n" + i);t.b("    <div class=\"panel-heading\">");t.b("\n" + i);t.b("      <h4 class=\"panel-title\">");t.b("\n" + i);t.b("        <a data-toggle=\"collapse\" data-parent=\"#accordion\" href=\"#collapse_");t.b(t.v(t.f("operatorType",c,p,0)));t.b("\">");t.b("\n" + i);t.b("          ");t.b(t.v(t.f("operatorType",c,p,0)));t.b("\n" + i);t.b("        </a>");t.b("\n" + i);t.b("      </h4>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div id=\"collapse_");t.b(t.v(t.f("operatorType",c,p,0)));t.b("\" class=\"panel-collapse collapse in\">");t.b("\n" + i);t.b("      <div class=\"panel-body\">");t.b("\n" + i);if(t.s(t.f("operators",c,p,1),c,p,0,394,647,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("\n" + i);t.b("                <p class=\"ops_hover\" align=\"center\"> ");t.b("\n" + i);t.b("                    <img src=\"./public/images/");t.b(t.v(t.f("src",c,p,0)));t.b("\"   data-shape=\"");t.b(t.v(t.f("type",c,p,0)));t.b("\"     class=\"palette_node_element draw2d_droppable\"></img><br>");t.b("\n" + i);t.b("                    ");t.b(t.v(t.f("name",c,p,0)));t.b("\n" + i);t.b("                </p>");t.b("\n");t.b("\n" + i);});c.pop();}t.b("      </div>");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("</div>");t.b("\n" + i);});c.pop();}return t.fl(); },partials: {}, subs: {  }});