package com.google.musicanalysis.site;

import java.io.IOException;
import java.math.BigInteger;
import java.security.SecureRandom;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.musicanalysis.util.URLEncodedBuilder;

@WebServlet("/api/oauth/login/*")
public class OAuthLoginServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    var path = req.getPathInfo().substring(1);

    if (path == null) {
      res.setStatus(404);
      return;
    }

    // URI that user should be redirected to after logging in
    var redirectUri = System.getenv().get("OAUTH_CALLBACK_URI");
    String oauthLoginUriBase;
    URLEncodedBuilder oauthLoginUriParams;

    // generate a nonce to prevent CSRF
    var state = new BigInteger(130, new SecureRandom()).toString(32);
    var session = req.getSession(true);
    session.setAttribute("oauth:state", state);

    if (path.equalsIgnoreCase("spotify")) {
      session.setAttribute("oauth:service", "spotify");

      oauthLoginUriBase = "https://accounts.spotify.com/authorize";
      oauthLoginUriParams = new URLEncodedBuilder()
        .add("client_id", Constants.SPOTIFY_CLIENT_ID)
        .add("scope", "user-read-private user-top-read user-library-read");
    } else if (path.equalsIgnoreCase("youtube")) {
      session.setAttribute("oauth:service", "youtube");

      oauthLoginUriBase = "https://accounts.google.com/o/oauth2/v2/auth";
      oauthLoginUriParams = new URLEncodedBuilder()
        .add("client_id", Constants.YOUTUBE_CLIENT_ID)
        .add("scope", "https://www.googleapis.com/auth/youtube.readonly");
    } else {
      res.setStatus(404);
      return;
    }

    oauthLoginUriParams = oauthLoginUriParams
        .add("response_type", "code")
        .add("state", state)
        .add("redirect_uri", redirectUri);

    // redirect to OAuth landing page
    res.sendRedirect(oauthLoginUriBase + "?" + oauthLoginUriParams.build());
  }
}
