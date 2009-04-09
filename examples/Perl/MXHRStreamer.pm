#!/usr/bin/perl

# MXHR Demo
#
# Created by Arsenio Santos
# Copyright (c) 2009 Digg Inc. All rights reserved.

package MXHRStreamer;
use MIME::Base64;
use Digest::MD5 qw(md5_base64);
use strict;

sub new
{
    my $class = shift;
    my $self = {};
    $self->{_payloads} = [];
    $self->{_boundary} = '_' . time . '-' . md5_base64(rand(2**32));
    bless $self, $class;
    return $self;
}

sub get_boundary
{
    my ($self) = @_;
    return $self->{_boundary};
}

sub add_image
{
    my ($self, $image, $content_type) = @_;
    my $encoded = encode_base64($image);
    $self->add_payload($encoded, $content_type);
}

sub add_html
{
    my ($self, $text) = @_;
    $self->add_payload($text, 'text/html');
}

sub add_javascript
{
    my ($self, $javascript) = @_;
    $self->add_payload($javascript, 'text/javascript');
}

sub add_payload
{
    my ($self, $payload, $content_type) = @_;
    push(@{$self->{_payloads}},
                        {'payload' =>      $payload,
                         'content_type' => $content_type}
    );
}

sub stream
{
    my ($self) = @_;
    my $stream = '';
    foreach my $payload (@{$self->{_payloads}}) {
        $stream .= "--" . $self->{_boundary} . "\n";
        $stream .= "Content-Type: " . $$payload{'content_type'} . "\n";
        $stream .= $$payload{'payload'};
    }
    $stream .= "--" . $self->{_boundary} . "--\n";
    return $stream;
}

1;
