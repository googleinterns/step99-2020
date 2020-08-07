package com.google.musicanalysis.cache;

import com.google.musicanalysis.types.*;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class WarmupListener implements ServletContextListener {
  @Override
  public void contextInitialized(ServletContextEvent event) {
    try {
      // Only instance of the cache allowed
      AnalysisCache.getInstance();
      AnalysisCache.loadCache();
      AnalysisCache.cleanDayOldEntries();
    } catch (InvalidKeyException
        | IllegalBlockSizeException
        | NoSuchAlgorithmException
        | NoSuchPaddingException
        | BadPaddingException e) {
      e.printStackTrace();
    }
  }

  @Override
  public void contextDestroyed(ServletContextEvent event) {
    try {
      AnalysisCache.saveCache();
    } catch (InvalidKeyException | IllegalBlockSizeException e) {
      e.printStackTrace();
    }
  }
}
