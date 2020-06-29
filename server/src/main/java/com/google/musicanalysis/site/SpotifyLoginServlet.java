package com.google.musicanalysis.site;

import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/login/spotify")
public class SpotifyLoginServlet extends OAuthLoginServlet {
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
    return System.getenv().get("SPOTIFY_CALLBACK_URI");
  }
}
