package com.google.musicanalysis.site;

import java.net.URI;
import java.util.logging.Logger;
import com.google.musicanalysis.util.Constants;
import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/login/spotify")
public class SpotifyLoginServlet extends OAuthLoginServlet {
  private static final Logger LOGGER = Logger.getLogger(SpotifyLoginServlet.class.getName());

  @Override
  protected String getServiceName() {
    return "spotify";
  }

  @Override
  protected String getAuthUri() {
    return "https://accounts.spotify.com/authorize";
  }

  @Override
  protected String getClientId() {
    return Constants.SPOTIFY_CLIENT_ID;
  }

  @Override
  protected String[] getScopes() {
    return new String[] {"user-read-private", "user-top-read", "user-library-read"};
  }

  @Override
  protected String getRedirectUri() {
    // URI that user should be redirected to after logging in
    try {
      var domainUri = URI.create(System.getenv().get("DOMAIN"));
      return domainUri.resolve("/api/oauth/callback/spotify").toString();
    } catch (NullPointerException e) {
      LOGGER.severe("The DOMAIN environment variable is not set.");
      throw e;
    }
  }

  @Override
  protected String getSessionServiceKey() {
    return Constants.SPOTIFY_SESSION_KEY;
  }
}
