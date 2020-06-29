package com.google.musicanalysis.site;

import javax.servlet.annotation.WebServlet;
import com.google.musicanalysis.util.Constants;

@WebServlet("/api/oauth/callback/youtube")
public class YouTubeCallbackServlet extends OAuthCallbackServlet {
  @Override
  protected String getServiceName() {
    return "youtube";
  }

  @Override
  protected String getClientId() {
    return Constants.YOUTUBE_CLIENT_ID;
  }

  @Override
  protected String getClientSecret() {
    return System.getenv().get("YOUTUBE_CLIENT_SECRET");
  }

  @Override
  protected String getTokenUri() {
    return "https://oauth2.googleapis.com/token";
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
