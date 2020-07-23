package com.google.musicanalysis.cache;

import com.google.musicanalysis.types.*;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.EOFException;
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

  private HashMap<String, AnalysisGroup> responseMap;
  Cipher cipher;

  public AnalysisCache() throws NoSuchAlgorithmException, NoSuchPaddingException {
    this.responseMap = new HashMap<String, AnalysisGroup>();
    this.cipher = Cipher.getInstance("Blowfish");
  }

  public void open() throws InvalidKeyException, IllegalBlockSizeException, BadPaddingException {
    HashMap<String, AnalysisGroup> responseData = null;

    FileStatus file = createFile(); // this will have use later.

    try {
      cipher.init(Cipher.DECRYPT_MODE, generateKey());
      CipherInputStream inFile =
          new CipherInputStream(
              new BufferedInputStream(new FileInputStream("cachedData.txt")), cipher);
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

  public void close() throws InvalidKeyException, IllegalBlockSizeException {
    try {
      cipher.init(Cipher.ENCRYPT_MODE, generateKey());
      SealedObject sealedObject = new SealedObject(this.responseMap, cipher);
      CipherOutputStream outFile =
          new CipherOutputStream(
              new BufferedOutputStream(new FileOutputStream("cachedData.txt")), cipher);
      ObjectOutputStream outData = new ObjectOutputStream(outFile);
      outData.writeObject(sealedObject);
      outData.close();
      outFile.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public void add(String requestUrl, AnalysisGroup responseData) {
    this.responseMap.put(requestUrl, responseData);
  }

  public AnalysisGroup search(String requestUrl) {
    // map.get() returns null if not match
    return this.responseMap.get(requestUrl);
  }

  public void delete(String requestUrl) {
    this.responseMap.remove(requestUrl);
  }

  private FileStatus createFile() {
    try { 
      File file = new File("cachedData.txt");
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

  private SecretKeySpec generateKey() {
    String key = "placeholder for github :)";
    byte[] keyData = key.getBytes();
    SecretKeySpec keySpec = new SecretKeySpec(keyData, "Blowfish");
    return keySpec;
  }
}
