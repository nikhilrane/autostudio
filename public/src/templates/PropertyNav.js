if (!!!templates) var templates = {};
templates["PropertyNav"] = new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<ul class=\"nav nav-tabs\" role=\"tablist\">");t.b("\n" + i);t.b("	");t.b("\n" + i);if(t.s(t.f("paramList",c,p,1),c,p,0,63,188,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("				<li class=\"");t.b(t.v(t.f("active",c,p,0)));t.b("\"><a href=\"#");t.b(t.v(t.f("paramID",c,p,0)));t.b("_");t.b(t.v(t.f("paramName",c,p,0)));t.b("_link\" role=\"tab\" data-toggle=\"tab\">");t.b(t.v(t.f("paramName",c,p,0)));t.b("</a></li>");t.b("\n" + i);});c.pop();}t.b("	</ul>");t.b("\n");t.b("\n" + i);t.b("		<!-- Tab panes -->");t.b("\n" + i);t.b("	");t.b("\n" + i);t.b("	<form class='form-horizontal'>");t.b("\n" + i);t.b("		<div class=\"tab-content\">");t.b("\n" + i);t.b("	");t.b("\n" + i);t.b("			");t.b("\n" + i);if(t.s(t.f("paramList",c,p,1),c,p,0,317,751,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("			  	<div class=\"tab-pane ");t.b(t.v(t.f("active",c,p,0)));t.b("\" id=\"");t.b(t.v(t.f("paramID",c,p,0)));t.b("_");t.b(t.v(t.f("paramName",c,p,0)));t.b("_link\">");t.b("\n" + i);t.b("			  		<div class='form-group'>");t.b("\n" + i);t.b("			  		<br><br>");t.b("\n" + i);t.b("					  	<label class='col-sm-2 control-label' for='");t.b(t.v(t.f("paramID",c,p,0)));t.b("'>");t.b(t.v(t.f("paramName",c,p,0)));t.b(" </label>");t.b("\n" + i);t.b("						<div class='col-sm-10'>");t.b("\n" + i);t.b("						    <input id='");t.b(t.v(t.f("paramID",c,p,0)));t.b("_");t.b(t.v(t.f("paramName",c,p,0)));t.b("' name='");t.b(t.v(t.f("paramName",c,p,0)));t.b("' class='form-control ");t.b(t.v(t.f("paramID",c,p,0)));t.b("' type='text' value='");t.b(t.v(t.f("paramValue",c,p,0)));t.b("'/>");t.b("\n" + i);t.b("						</div>");t.b("\n" + i);t.b("						<br>");t.b("\n" + i);t.b("					</div>");t.b("\n" + i);t.b("				</div>");t.b("\n");t.b("\n" + i);});c.pop();}t.b("	");t.b("\n" + i);t.b("		</div>");t.b("\n" + i);t.b("	</form>");t.b("\n" + i);t.b("	");t.b("\n" + i);t.b("<br>");return t.fl(); },partials: {}, subs: {  }});
