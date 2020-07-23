package com.google.musicanalysis.cache;

import com.google.musicanalysis.types.*;
import java.lang.Object;
import java.lang.ClassNotFoundException;
import java.time.Instant;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.io.File;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.ObjectInputStream;
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.io.IOException;


public class AnalysisCache {
    private HashMap<String, AnalysisGroup> responseMap;
    
    public AnalysisCache(){
        this.responseMap = new HashMap<String, AnalysisGroup>();
    }

    public void open() {
        HashMap<String, AnalysisGroup> responseData = null;

        int file = createFile(); // this will have use later.

        try {
            // .ser for serialized 
            FileInputStream inFile = new FileInputStream("cachedData.txt");
            ObjectInputStream inData = new ObjectInputStream(inFile);
            responseMap = (HashMap<String, AnalysisGroup>) inData.readObject();
            inData.close();
            inFile.close();
        } catch (IOException e) {
            e.printStackTrace();
            return;
        } catch (ClassNotFoundException c) {
            c.printStackTrace();
            return;
        }
    }

    public void close() {
        try {
            FileOutputStream outFile = new FileOutputStream("cachedData.txt");
            ObjectOutputStream outData = new ObjectOutputStream(outFile);
            outData.writeObject(this.responseMap);
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

    private int createFile() {
        try {   //logic here is going to improve which is why it's int
            File file = new File("cachedData.txt");
            if (file.createNewFile()){
                return 0;
            } else {
                return 1;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return 0;
    }
}
