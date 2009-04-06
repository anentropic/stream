package com.digg;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

import org.apache.commons.codec.binary.Base64;

/**
 * A simple implementation of MXHRStreamer in Java
 * 
 * @author Arin Sarkissian <arin@digg.com>
 */
public class MXHRStreamer {
	public static final String CONTENT_TYPE_HTML = "text/html";
	public static final String CONTENT_TYPE_JAVASCRIPT = "text/javascript";
	
	private ArrayList<Payload> payloads;
	public String boundry;
	
	public MXHRStreamer() {
		this("|||");
	}	
	
	public MXHRStreamer(String boundry) {
		this.boundry = boundry;
		payloads = new ArrayList<Payload>();
	}
	
	public String getBoundry() {
		return boundry;
	}

	public void addImage(byte[] image, String contentType) {
		this.addPayload(new String(Base64.encodeBase64(image)), contentType);
	}
	
	public void addImage(File file, String contentType) throws IOException {
		byte[] bytes = new byte[(int)file.length()];
		FileInputStream fs = new FileInputStream(file);
		fs.read(bytes);
		this.addImage(bytes, contentType);
	}	
	
	public void addHtml(String html) {
		this.addPayload(html, CONTENT_TYPE_HTML);
	}
	
	public void addJavascript(String javascript) {
		this.addPayload(javascript, CONTENT_TYPE_JAVASCRIPT);
	}
	
	public void addPayload(String payload, String contentType) {
		Payload p = new Payload(payload, contentType);
		payloads.add(p);
	}
	
	public void addPayload(Payload payload) {
		payloads.add(payload);
	}	
	
	public String stream() {
		StringBuffer sb = new StringBuffer();
		int numPayloads = payloads.size();
		
		for (int i = 0; i < numPayloads; i++) {
			sb.append("\n--" + boundry  + "\n")
				.append("Content-Type: " + payloads.get(i).contentType + "\n")
				.append(payloads.get(i).payload);
		}
		
		sb.append("\n--" + boundry + "--\n");
		return sb.toString();
	}
	
	public class Payload {
		public String contentType;
		public String payload;
		
		public Payload(String payload, String contentType) {
			this.contentType = contentType;
			this.payload = payload;
		}
	}
}
