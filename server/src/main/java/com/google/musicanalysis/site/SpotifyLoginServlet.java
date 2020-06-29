package com.google.musicanalysis.site;

import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/login/spotify")
public class SpotifyLoginServlet extends OAuthLoginServlet {
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
    return System.getenv().get("SPOTIFY_CALLBACK_URI");
  }
}
