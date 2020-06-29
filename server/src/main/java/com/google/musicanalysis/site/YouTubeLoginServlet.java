package com.google.musicanalysis.site;

import java.net.URI;
import java.util.logging.Logger;
import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/login/youtube")
public class YouTubeLoginServlet extends OAuthLoginServlet {
  private static final Logger LOGGER = Logger.getLogger(YouTubeLoginServlet.class.getName());

  @Override
  public String getServiceName() {
    return "youtube";
  }

  @Override
  public String getAuthUri() {
    return "https://accounts.google.com/o/oauth2/v2/auth";
  }

  @Override
  public String getClientId() {
    return Constants.YOUTUBE_CLIENT_ID;
  }

  @Override
  public String[] getScopes() {
    return new String[] {"https://www.googleapis.com/auth/youtube.readonly"};
  }

  @Override
  public String getRedirectUri() {
    // URI that user should be redirected to after logging in
    try {
      var domainUri = URI.create(System.getenv().get("DOMAIN"));
      return domainUri.resolve("/api/oauth/callback/youtube").toString();
    } catch (NullPointerException e) {
      LOGGER.severe("The DOMAIN environment variable is not set.");
      throw e;
    }
  }
}
