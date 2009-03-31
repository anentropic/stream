DUI.create('Stream', {
    pong: null,
    lastLength: 0,
    streams: [],
    listeners: {},
    
    init: function() {
        this.req = new XMLHttpRequest();
        
        var _this = this;
        this.req.onreadystatechange = function() {
            _this.readyStateNanny.apply(_this);
        }
    },
    
    load: function(url) {
        this.req.open('GET', url, true);
        this.req.send(null);
    },
    
    readyStateNanny: function() {
        if(this.req.readyState == 3 && this.pong == null) {
            //console.log('state 3');
            
            var contentTypeHeader = this.req.getResponseHeader("Content-Type");
            
            if(contentTypeHeader.indexOf("multipart/mixed") == -1) {
                this.req.onreadystatechange = function() {
                    throw new Error('Send it as multipart/mixed, genius.');
                    this.req.onreadystatechange = function() {};
                }.bind(this);
                
            } else {
                this.boundary = '--' + contentTypeHeader.split('"')[1];
                
                //console.log(this.boundary);
                
                //start pinging
                this.pong = window.setInterval(this.ping.bind(this), 15);
            }
        }
        
        if(this.req.readyState == 4) {
            //console.log('state 4');
            
            //stop the insanity!
            clearInterval(this.pong);
            
            //one last ping to clean up
            this.ping();
            
            if(typeof this.listeners.complete != 'undefined') {
                var _this = this;
                $j.each(this.listeners.complete, function() {
                    this.apply(_this);
                });
            }
        }
    },
    
    ping: function() {
        var length = this.req.responseText.length;
        
        var packet = '';
        var getPacket = function() {
            packet = this.req.responseText.substring(this.lastLength, length);
            //packet = this.req.responseText.slice(this.lastLength);
        }.apply(this);
        
        //drop the end boundary if this is the last packet
        var dropPacketBoundary = function() {
            if(this.req.readyState == 4) {
                packet = packet.replace(this.boundary + '--', '');
            }
        }.apply(this);
        
        this.processPacket(packet);
        
        this.lastLength = length;
    },
    
    processPacket: function(packet) {
        if(packet.length < 1) return;
        
        //XML CDATA style packets: <![mime/type[ *data* ]]>
        var startFlag = -1;
        var findStartFlag = function() {
            //turbo hella slow
            //startFlag = packet.search(/<\!\[.+\[/);
            
            //i don't know if we can count on this, but it's fast as hell
            startFlag = packet.indexOf(this.boundary);
        }.apply(this);
        
        var endFlag = -1;
        var findEndFlag = function() {
            
            //is there a startFlag?
            if(startFlag > -1) {
                if(typeof this.currentStream != 'undefined') {
                //if there's an open stream, that's an endFlag, not a startFlag
                    endFlag = startFlag;
                    startFlag = -1;
                } else {
                //no open stream? ok, valid startFlag. let's try find an endFlag then.
                    endFlag = packet.indexOf(this.boundary, startFlag + this.boundary.length);
                }
            }
        }.apply(this);
        
        //console.log(packet.length, ' --- ', startFlag, ' / ', endFlag, ': ', packet);
        
        //no stream is open
        //use this.currentStream for the open stream flag DUHHHHH
        if(typeof this.currentStream == 'undefined') {
            //open a stream, this.currentStream = this.streams[] = '';
            this.currentStream = '';
            
            //console.log('opening a stream');
            
            //is there a start flag?
            if(startFlag > -1) {
            //yes
                //is there an end flag?
                if(endFlag > -1) {
                //yes
                    //use the end flag to grab the entire payload in one swoop
                    var payload = packet.substring(startFlag, endFlag);
                    this.currentStream += payload;
                    
                    //remove the payload from this chunk
                    packet = packet.replace(payload, '');
                    
                    this.closeCurrentStream();
                    
                    //start over on the remainder of this packet
                    this.processPacket(packet);
                } else {
                //no
                    //grab from the start of the start flag to the end of the chunk
                    this.currentStream += packet.substr(startFlag);
                    
                    //leave this.currentStream set and wait for another packet
                }
            } else {
                //wtf? no open stream and no start flag means someone fucked up the output
                //...OR maybe they're sending garbage in front of their first payload. weird.
                //i guess just ignore it for now?
                
                //console.log('GARBAGE PACKET');
            }
        // else we have an open stream
        } else {
            //is there an end flag?
            if(endFlag > -1) {
            //yes
                //use the end flag to grab the rest of the payload
                var chunk = packet.substring(0, endFlag);
                this.currentStream += chunk;
                
                //remove the rest of the payload from this chunk
                packet = packet.replace(chunk, '');
                
                this.closeCurrentStream();
                
                //start over on the remainder of this packet
                this.processPacket(packet);
            } else {
            //no
                //put this whole packet into this.currentStream
                this.currentStream += packet;
                
                //wait for another packet
            }
        }
    },
    
    closeCurrentStream: function() {
        //console.log('closing a stream');
        
        //skip all this shit for now
        /* delete this.currentStream;
        return; */
        
        //write stream
        //this.streams.push(this.currentStream);
        
        //get mimetype
        var mime = '';
        var payload = '';
        var mimeAndPayload = '';
        var findMime = function() {
            //this call to String.match is slow as fuck. Womp.
            //mime = this.currentStream.match(/<\!\[(.+)\[/)[1];
            //mime = this.currentStream.split('<![', 2)[1].split('[', 1)[0];
            
            //first, ditch the boundary
            this.currentStream = this.currentStream.replace(this.boundary + "\n", '');
            
            /* The mimetype is the first line after the boundary.
               Note that RFC 2046 says that there's either a mimetype here or a blank line to default to text/plain,
               so if the payload starts on the line after the boundary, we'll intentionally ditch that line
               because it doesn't conform to the spec. QQ more noob, L2play, etc. */
            mimeAndPayload = this.currentStream.split("\n");
            
            mime = mimeAndPayload.shift().split('Content-Type:', 2)[1].split(";", 1)[0].replace(' ', '');
            
            //better to have this null than undefined
            mime = mime ? mime : null;
            
            //console.log("mime:", mime);
        }.apply(this);
        
        //get payload
        var stripPayload = function() {
            //slowish
            //payload = this.currentStream.replace(/<\!\[.+?\[/, '').replace(']]>', '');
            
            //not as slow
            //payload = this.currentStream.replace('<![' + mime + '[', '').replace(']]>', '');
            
            //fast!
            /* var mimeFlag = '<![' + mime + '[';
            var payloadStart = this.currentStream.indexOf(mimeFlag) + mimeFlag.length;
            var payloadEnd = this.currentStream.indexOf(']]>');
            payload = this.currentStream.slice(payloadStart, payloadEnd); */
            
            payload = mimeAndPayload.join("\n");
        }.apply(this);
        
        //try to fire the listeners for this mimetype
        var _this = this;
        if(typeof this.listeners[mime] != 'undefined') {
            $j.each(this.listeners[mime], function() {
                this.apply(_this, [payload]);
            });
        }
        
        //set this.currentStream = null
        delete this.currentStream;
    },
    
    listen: function(mime, callback) {
        if(typeof this.listeners[mime] == 'undefined') {
            this.listeners[mime] = [];
        }
        
        if(typeof callback != 'undefined' && callback.constructor == Function) {
            this.listeners[mime].push(callback);
        }
    }
});

Function.prototype.bind = function() {
    var __method = this, object = arguments[0], args = [];

    for(i = 1; i < arguments.length; i++)
        args.push(arguments[i]);
    
    return function() {
        return __method.apply(object, args);
    }
}

/* GLOSSARY
    packet: the amount of data sent in one ping interval
    payload: an entire piece of content, contained between <<<mime/type||| and |||>>>
*/