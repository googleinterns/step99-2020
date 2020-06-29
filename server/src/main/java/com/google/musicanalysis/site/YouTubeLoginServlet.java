package com.google.musicanalysis.site;

import javax.servlet.annotation.WebServlet;

@WebServlet("/api/oauth/login/youtube")
public class YouTubeLoginServlet extends OAuthLoginServlet {
  @Override
  public String getServiceName() {
    return "youtube";
  }

  @Override
  public String getAuthUri() {
    return "https://accounts.google.com/o/oauth2/v2/auth";
  }

  @Override
  public String getClientId() {
    return Constants.YOUTUBE_CLIENT_ID;
  }

  @Override
  public String[] getScopes() {
    return new String[] {"https://www.googleapis.com/auth/youtube.readonly"};
  }

  @Override
  public String getRedirectUri() {
    return System.getenv().get("YOUTUBE_CALLBACK_URI");
  }
}
