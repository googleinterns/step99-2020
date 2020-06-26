package com.google.musicanalysis.site;

import java.io.IOException;
import java.math.BigInteger;
import java.net.URLEncoder;
import java.security.SecureRandom;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/oauth/login")
public class OAuthLoginServlet extends HttpServlet {

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    // generate a nonce to prevent CSRF
    var state = new BigInteger(130, new SecureRandom()).toString(32);
    req.getSession(true).setAttribute("oauth:state", state);

    // URI that user should be redirected to after logging in
    var redirectUri = System.getenv().get("OAUTH_CALLBACK_URI");

    // redirect to OAuth landing page
    var oauthLoginUri = new StringBuilder();
    oauthLoginUri.append("https://accounts.spotify.com/authorize");
    oauthLoginUri.append("?client_id=");
    oauthLoginUri.append(Constants.SPOTIFY_CLIENT_ID);
    oauthLoginUri.append("&response_type=code");
    oauthLoginUri.append("&redirect_uri=");
    oauthLoginUri.append(URLEncoder.encode(redirectUri, "UTF-8"));
    oauthLoginUri.append("&scope=");
    oauthLoginUri.append(URLEncoder.encode("user-read-private user-top-read user-library-read", "UTF-8"));
    oauthLoginUri.append("&state=");
    oauthLoginUri.append(state);

    res.sendRedirect(oauthLoginUri.toString());
  }
}
