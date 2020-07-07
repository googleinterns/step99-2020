package com.google.musicanalysis.site;

import com.google.musicanalysis.util.Constants;
import com.google.musicanalysis.util.Secrets;
import java.io.IOException;
import java.net.URI;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/callback/spotify")
public class SpotifyCallbackServlet extends OAuthCallbackServlet {
  private static final Logger LOGGER = Logger.getLogger(SpotifyCallbackServlet.class.getName());

  @Override
  protected String getServiceName() {
    return "spotify";
  }

  @Override
  protected String getClientId() {
    return Constants.SPOTIFY_CLIENT_ID;
  }

  @Override
  protected String getClientSecret() {
    try {
      return Secrets.getSecretString("SPOTIFY_CLIENT_SECRET");
    } catch (IOException e) {
      LOGGER.log(Level.SEVERE, e, () -> "Could not get Spotify client secret");
      return null;
    }
  }

  @Override
  protected String getTokenUri() {
    return "https://accounts.spotify.com/api/token";
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
