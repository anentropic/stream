import random
from django.http import HttpResponse
from django.conf import settings

MIME_HTML = 'text/html'
MIME_JSON = 'application/json'
MIME_XML = 'application/xml'
MIME_XHTML = 'application/xml+xhtml'

class MultipartHttpResponse(HttpResponse):
    """
    Class representing a multipart response, eg for sending mixed data
    back in Ajax. Probably not useable for Comet...
    
    Have done my best to follow the RFC:
    http://tools.ietf.org/html/rfc2046#section-5.1
    """
    
    MIME_BOUNDARY = "/&--- PART ---&/"
    MIME_TYPE = 'multipart/mixed' # see RFC, others are possible
    
    def __init__(self, parts, type=None):
        """
        This constructor expects a single argument, a sequence of
        (content-type, body) pairs specifying the response parts to be encoded.
        
        Optionally, specify a type to override the default MIME_TYPE
        """
        if type is None:
            type = self.MIME_TYPE
        type_str = self._make_type(type)
        body = self._make_body(parts)
        super(MultipartHttpResponse, self).__init__(content=body, mimetype=type_str)

    def _make_type(self, type):
        return "%(type)s; charset=%(charset)s; boundary=\"%(boundary)s\";" % {
            'type': type,
            'boundary': self.MIME_BOUNDARY,
            'charset': settings.DEFAULT_CHARSET,
        }
    
    def _make_body(self, parts):
        str = ''.join(['%(boundary)s\r\nContent-Type: %(type)s;\r\n\r\n%(body)s\r\n' % {
                'boundary': self.get_boundary(),
                'type': type,
                'body': body
            } for type,body in parts])
        str += self.get_final_boundary()
        return str

    def get_boundary(self):
        return '--%s' % self.MIME_BOUNDARY
    
    def get_final_boundary(self):
        return '--%s\r\n' % self.MIME_BOUNDARY


class mpAjaxHttpResponse(MultipartHttpResponse):
    """
    I think above is more correct, but the jQuery library we are using
    (http://test.getify.com/mpAjax/) wants it like this...
    
    Parts are processed in response order by the js, so order matters.
    """
    MIME_BOUNDARY = "!!!!!!=_NextPart_" # hard-coded in the js
    MIME_TYPE = 'text/html'
    
    def _make_type(self, type):
        return "%(type)s; charset=%(charset)s;" % {
            'type': type,
            'charset': settings.DEFAULT_CHARSET,
        }
    
    def get_boundary(self):
        return '%s%s' % (self.MIME_BOUNDARY, random.random())
    
    def get_final_boundary(self):
        return '\r\n'


class StreamingMultipartHttpResponse(MultipartHttpResponse):
    """
    Django HttpResonse will stream the content if you give it a generator
    (some middleware may nullify the streaming behaviour though:
    http://code.djangoproject.com/ticket/7581)
    
    This works well with the stock DUI Stream.js (v0.0.3):
    http://about.digg.com/blog/duistream-and-mxhr
    http://github.com/digg/stream
    """
    def _make_body(self, parts):
        for type,body in parts:
            yield '%(boundary)s\r\nContent-Type: %(type)s;\r\nDibble: blah\r\n\r\n%(body)s\r\n' % {
                'boundary': self.get_boundary(),
                'type': type,
                'body': body
            }
        yield self.get_final_boundary()


class DUI_MXHR_Response(StreamingMultipartHttpResponse):
    """
    To work with our customised DUI.Stream.js code.
    
    Each part has a dict of custom headers in place of the single Content-Type
    string of the basic implementation, eg:
    parts = (
        (
            {
                'Content-Type': 'text/html',
                'jQuery-Target': '#content_div',
            },
            "<p>content</p>"
        ),
        ...
    )
    """
    def _make_body(self, parts):
        for headers,body in parts:
            yield '%(boundary)s\r\n%(headers)s\r\n%(body)s\r\n' % {
                'boundary': self.get_boundary(),
                'headers': ''.join(['%s: %s\r\n' % (key,val) for key,val in headers.items()]),
                'body': body
            }
        yield self.get_final_boundary()
    