package com.google.musicanalysis.site;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** 
 * New page after logging in via oauth. This servlet closes the page. 
 */
@WebServlet("/api/oauth/landing")
public class OAuthLandingServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    res.setContentType("text/html");

    StringBuilder content = new StringBuilder();

    content.append("<html><body>Succesfully Logged in.<script type=\"text/javascript\">");

    content.append("window.close();");
    content.append("</script></body></html>");
    res.getWriter().write(content.toString());
    res.setStatus(200);
  }
}
