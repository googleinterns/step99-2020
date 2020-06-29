package com.google.musicanalysis.site;

import com.google.musicanalysis.util.Constants;
import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/login/youtube")
public class YouTubeLoginServlet extends OAuthLoginServlet {
  @Override
  protected String getServiceName() {
    return "youtube";
  }

  @Override
  protected String getAuthUri() {
    return "https://accounts.google.com/o/oauth2/v2/auth";
  }

  @Override
  protected String getClientId() {
    return Constants.YOUTUBE_CLIENT_ID;
  }

  @Override
  protected String[] getScopes() {
    return new String[] {"https://www.googleapis.com/auth/youtube.readonly"};
  }

  @Override
  protected String getRedirectUri() {
    return System.getenv().get("YOUTUBE_CALLBACK_URI");
  }

  @Override
  protected String getSessionServiceKey() {
    return Constants.SPOTIFY_SESSION_KEY;
  }
}
