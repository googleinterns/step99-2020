package com.google.musicanalysis.site;

import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/callback/youtube")
public class YouTubeCallbackServlet extends OAuthCallbackServlet {
  @Override
  public String getServiceName() {
    return "youtube";
  }

  @Override
  public String getClientId() {
    return Constants.YOUTUBE_CLIENT_ID;
  }

  @Override
  public String getClientSecret() {
    return System.getenv().get("YOUTUBE_CLIENT_SECRET");
  }

  @Override
  public String getTokenUri() {
    return "https://oauth2.googleapis.com/token";
  }

  @Override
  public String getRedirectUri() {
    return System.getenv().get("YOUTUBE_CALLBACK_URI");
  }
}
