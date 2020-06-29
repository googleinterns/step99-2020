package com.google.musicanalysis.site;

import java.net.URI;
import java.util.logging.Logger;
import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/login/spotify")
public class SpotifyLoginServlet extends OAuthLoginServlet {
  private static final Logger LOGGER = Logger.getLogger(SpotifyLoginServlet.class.getName());

  @Override
  public String getServiceName() {
    return "spotify";
  }

  @Override
  public String getAuthUri() {
    return "https://accounts.spotify.com/authorize";
  }

  @Override
  public String getClientId() {
    return Constants.SPOTIFY_CLIENT_ID;
  }

  @Override
  public String[] getScopes() {
    return new String[] {"user-read-private", "user-top-read", "user-library-read"};
  }

  @Override
  public String getRedirectUri() {
    // URI that user should be redirected to after logging in
    try {
      var domainUri = URI.create(System.getenv().get("DOMAIN"));
      return domainUri.resolve("/api/oauth/callback/spotify").toString();
    } catch (NullPointerException e) {
      LOGGER.severe("The DOMAIN environment variable is not set.");
      throw e;
    }
  }
}
