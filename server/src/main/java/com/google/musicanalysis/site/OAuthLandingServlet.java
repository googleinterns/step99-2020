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

    String content = "<html>"
                   + "<body>Successfully logged in.</body>"
                   + "<script type=\"text/javascript\">window.close();</script>"
                   + "</html>";

    res.getWriter().write(content);
    res.setStatus(200);
  }
}
