package com.google.musicanalysis.cache;

import com.google.musicanalysis.types.*;
import com.google.musicanalysis.util.Secrets;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SealedObject;
import javax.crypto.spec.SecretKeySpec;

enum FileStatus {
  SUCCESS,
  CREATED,
  EXISTS
}

public class AnalysisCache {
  private static final String CACHE_FILE = "cachedData.txt";
  private static HashMap<String, AnalysisGroup> responseMap = new HashMap<String, AnalysisGroup>();
  private static Cipher cipher;

  private static volatile AnalysisCache AnalysisCacheObject;

  private AnalysisCache() throws NoSuchAlgorithmException, NoSuchPaddingException {
    this.cipher = Cipher.getInstance("Blowfish");
  }

  // Singleton paradigm ensures cache can only be loaded once
  public static AnalysisCache getInstance()
      throws NoSuchAlgorithmException, NoSuchPaddingException {
    if (AnalysisCacheObject == null) {
      // Ensures thread safe
      synchronized (AnalysisCache.class) {
        if (AnalysisCacheObject == null) {
          AnalysisCacheObject = new AnalysisCache();
        }
      }
    }
    return AnalysisCacheObject;
  }

  public static void loadCache()
      throws InvalidKeyException, IllegalBlockSizeException, BadPaddingException {

    try {
      cipher.init(Cipher.DECRYPT_MODE, generateKey());
      CipherInputStream inFile =
          new CipherInputStream(new BufferedInputStream(new FileInputStream(CACHE_FILE)), cipher);
      ObjectInputStream inData = new ObjectInputStream(inFile);
      SealedObject encodedResponse = (SealedObject) inData.readObject();
      responseMap = (HashMap<String, AnalysisGroup>) encodedResponse.getObject(cipher);
      inData.close();
      inFile.close();
    } catch (IOException e) {
      e.printStackTrace();
      return;
    } catch (ClassNotFoundException c) {
      System.out.println("Analysis Group class not found");
      c.printStackTrace();
      return;
    }
  }

  public static void saveCache() throws InvalidKeyException, IllegalBlockSizeException {
    try {
      cipher.init(Cipher.ENCRYPT_MODE, generateKey());
      SealedObject sealedObject = new SealedObject(responseMap, cipher);
      CipherOutputStream outFile =
          new CipherOutputStream(
              new BufferedOutputStream(new FileOutputStream(CACHE_FILE)), cipher);
      ObjectOutputStream outData = new ObjectOutputStream(outFile);
      outData.writeObject(sealedObject);
      outData.close();
      outFile.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public static void add(String requestUrl, AnalysisGroup responseData) {
    responseMap.put(requestUrl, responseData);
  }

  public static AnalysisGroup search(String requestUrl) {
    // map.get() returns null if not match
    return responseMap.get(requestUrl);
  }

  public static void delete(String requestUrl) {
    responseMap.remove(requestUrl);
  }

  private static FileStatus createFile() {
    try {
      File file = new File(CACHE_FILE);
      if (file.createNewFile()) {
        return FileStatus.CREATED;
      } else {
        return FileStatus.EXISTS;
      }
    } catch (IOException e) {
      e.printStackTrace();
    }
    return FileStatus.SUCCESS;
  }

  private static SecretKeySpec generateKey() throws IOException {
    String key = Secrets.getSecretString("CACHE_ENCRYPTION_KEY");
    byte[] keyData = key.getBytes();
    SecretKeySpec keySpec = new SecretKeySpec(keyData, "Blowfish");
    return keySpec;
  }
}
