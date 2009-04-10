#!/usr/bin/env ruby -wKU
=begin
MXHR Demo

You can easily take this class / example and use it in any web framework such as Ruby on Rails.

Created by Chris Goffinet
Copyright (c) 2009 Digg Inc. All rights reserved.
=end

require 'base64'
require 'digest'

class MXHRStreamer
    def initialize
        srand()
        @payloads = []
        @boundary = "_%d-%s" % [ Time.now.to_i, Digest::MD5.hexdigest(rand(2**32).to_s) ]
    end

    def get_boundary
        return @boundary
    end

    def add_image(image, content_type)
        encoded = Base64.encode64(image)
        self.add_payload(encoded, content_type)
    end

    def add_html(text)
        self.add_payload(text, "text/html")
    end

    def add_javascript(javascript)
        self.add_payload(javascript, "text/javascript")
    end

    def add_payload(payload, content_type)
        @payloads << [payload,content_type]
    end

    def stream
        stream = ""
        @payloads.each { |payload, content_type|
            stream += "--%s\n" % self.get_boundary() 
            stream += "Content-Type: %s\n\n" % content_type 
            stream += "%s\n" % payload
        }
        stream += "--" + self.get_boundary() + "--"
        @payloads.clear

        return stream
    end
end

# Demo
streamer = MXHRStreamer.new()
base = File.dirname(File.dirname(File.dirname(File.expand_path(__FILE__))))
image_data = File.read(base + "/img/32x32-digg-guy.gif")
javascript = "console.log('huuurrrr');/* fake data */"

# Simple test. Add some payloads (images and javascript).

300.times { |n|  
    streamer.add_image(image_data, "image/gif")
}
10.times { |n|
    streamer.add_javascript(javascript)
}

# Output the final payload to browser 
# This is just an example, so remember, you need to set the MIME-Version and 
# Content-Type headers in your favorite framework

puts "MIME-Version: 1.0\n"
puts "Content-Type: multipart/mixed; boundary=\"" + streamer.get_boundary() + "\"\n\n"
puts streamer.stream()
