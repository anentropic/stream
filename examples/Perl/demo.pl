#!/usr/bin/perl

# MXHR Demo
#
# Created by Arsenio Santos
# Copyright (c) 2009 Digg Inc. All rights reserved.

use MXHRStreamer;
use strict;

my $image = "";
open IMAGEFILE, "../../img/32x32-digg-guy.gif" or die $!;
binmode IMAGEFILE;
while (<IMAGEFILE>) {
    $image .= $_;
}
close IMAGEFILE;

my $script = "console.log('huuurrrr');/* fake data */\n";

my $streamer = new MXHRStreamer();

# Simple test. Add some payloads (images and javascript).

for (my $i = 0; $i < 200; $i++) {
    $streamer->addImage($image, 'image/gif');
}
for (my $i = 0; $i < 10; $i++) {
    $streamer->addJavaScript($script);
}

# Output the final payload to browser 
# This is just an example, so remember, you need to set the MIME-Version and 
# Content-Type headers in your favorite framework
print "MIME-Version: 1.0\n";
print "Content-Type: multipart/mixed; boundary=\"" . $streamer->getBoundary() . "\"\n\n";
print $streamer->stream();
