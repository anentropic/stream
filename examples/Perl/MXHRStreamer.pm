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

sub getBoundary
{
    my ($self) = @_;
    return $self->{_boundary};
}

sub addImage
{
    my ($self, $image, $content_type) = @_;
    my $encoded = encode_base64($image);
    $self->addPayload($encoded, $content_type);
}

sub addHtml
{
    my ($self, $text) = @_;
    $self->addPayload($text, 'text/html');
}

sub addJavaScript
{
    my ($self, $javascript) = @_;
    $self->addPayload($javascript, 'text/javascript');
}

sub addPayload
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
        $stream .= "--" . $self->getBoundary() . "\n";
        $stream .= "Content-Type: " . $$payload{'content_type'} . "\n";
        $stream .= $$payload{'payload'};
    }
    $stream .= "--" . $self->getBoundary() . "--\n";
    return $stream;
}

1;
