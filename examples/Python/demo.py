#!/usr/bin/env python
# encoding: utf-8
"""
MXHR Demo

You can easily take this class / example and use it in any web framework such as Django.

Created by Chris Goffinet
Copyright (c) 2009 Digg Inc. All rights reserved.
"""

import os
import base64
import random
import md5
from time import time

class MXHRStreamer(object):
    """Simple class that handles streaming multipart payloads"""
    def __init__(self):
        self.payloads = []
        self.boundary = "_%d-%s" % (time(), md5.new(str(random.randint(0, 2**32))).hexdigest())
        
    def get_boundary(self):
        return self.boundary
        
    def add_image(self, image, content_type):
        encoded = base64.b64encode(image)
        self.add_payload(encoded, content_type)
        
    def add_html(self, text):
        self.add_payload(text, "text/html")
        
    def add_javascript(self, javascript):
        self.add_payload(javascript, "text/javascript")
        
    def add_payload(self,payload, content_type):
        self.payloads.append([payload,content_type])
            
    def stream(self):
        stream = ""
        for payload, content_type in self.payloads:
            stream += "--%s\n" % self.get_boundary() 
            stream += "Content-Type: %s\n" % content_type
            stream += "%s\n" % payload
            
        stream += "--%s--" % self.get_boundary() 
        self.payloads = []
        
        return stream

def main():
    base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    image_data = open(base + "/img/32x32-digg-guy.gif").read()
    javascript = """
    console.log('huuurrrr');
    /* fake data */"""
    
    streamer = MXHRStreamer()
    
    """ 
    Simple test. Add some payloads (images and javascript).
    
    """
    for i in range(1,300):
        streamer.add_image(image_data, "image/gif")
    
    for i in range(1,10):
        streamer.add_javascript(javascript)
        
    """ Output the final payload to browser 
    
    This is just an example, so remember, you need to set the MIME-Version and 
    Content-Type headers in your favorite framework
    
    """
    print "MIME-Version: 1.0"
    print "Content-Type: multipart/mixed; boundary=\"%s\"\n" % streamer.get_boundary()
    print streamer.stream(), 
    
if __name__ == '__main__':
    main()
