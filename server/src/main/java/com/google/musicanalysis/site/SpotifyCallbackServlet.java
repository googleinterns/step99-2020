package com.google.musicanalysis.site;

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
  public String getServiceName() {
    return "spotify";
  }

  @Override
  public String getClientId() {
    return Constants.SPOTIFY_CLIENT_ID;
  }

  @Override
  public String getClientSecret() {
    try {
      return Secrets.getSecretString("SPOTIFY_CLIENT_SECRET");
    } catch (IOException e) {
      LOGGER.log(Level.SEVERE, e, () -> "Could not get Spotify client secret");
      return null;
    }
  }

  @Override
  public String getTokenUri() {
    return "https://accounts.spotify.com/api/token";
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
