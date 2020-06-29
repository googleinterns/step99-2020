package com.google.musicanalysis.site;

import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/callback/spotify")
public class SpotifyCallbackServlet extends OAuthCallbackServlet {
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
    return System.getenv().get("SPOTIFY_CLIENT_SECRET");
  }

  @Override
  public String getTokenUri() {
    return "https://accounts.spotify.com/api/token";
  }

  @Override
  public String getRedirectUri() {
    return System.getenv().get("SPOTIFY_CALLBACK_URI");
  }
}
