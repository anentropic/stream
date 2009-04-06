package com.digg.example;

import java.io.File;
import java.io.IOException;

import com.digg.MXHRStreamer;

public class MXHRStreamerExample {

	public static void main(String[] args) throws IOException {
		MXHRStreamer streamer = new MXHRStreamer();
		
		// add some html
		streamer.addHtml("<b>bold tag</b>");
		
		// add some js
		streamer.addJavascript("alert('i am js')");
		
		// Adding an image...
		// you might have to change the path in the next line depending on your build
		// uncomment the next 2 lines and check stdout for the current dir and adjust filePath
		//	File dir1 = new File(".");
		//  System.out.println ("Current dir : " + dir1.getCanonicalPath());
		
		String filePath = "img/32x32-digg-guy.gif";
		File file = new File(filePath);
		streamer.addImage(file, "image/png");
		
		// before you output the stream you need to send the following response header
		// check out HttpServletResponseaddHeader
		// MIME-Version: 1.0
		// Content-Type: multipart/mixed; boundary="<streamer.getBoundry()>"
		System.out.println(streamer.stream());
	}
	
}
