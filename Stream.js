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
        if(this.req.readyState == 3 && this.ping == null) {
            //console.log('state 3');
            
            //start pinging
            this.pong = window.setInterval(this.ping, 15);   
        }
        
        if(this.req.readyState == 4) {
            //console.log('state 4');
            
            //stop the insanity!
            clearInterval(this.pong);
            
            //one last ping to clean up
            this.ping();
        }
    },
    
    ping: function() {
        var length = this.req.responseText.length;
        
        var packetSize = length - this.lastLength;
        
        var packet = this.req.responseText.substr(this.lastLength, packetSize);
        
        this.processPacket(packet);
        
        this.lastLength = length;
    },
    
    processPacket: function(packet) {
        if(packet.length < 1) return;
        
        //XML CDATA style packets: <![mime/type[ *data* ]]>
        var startFlag = packet.search(/<\!\[.+\[/);
        var endFlag = packet.search(/\]\]>/);
        
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
                    var payload = packet.substring(startFlag, endFlag + 3);
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
                var chunk = packet.substring(0, endFlag + 3);
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
        
        //write stream
        this.streams.push(this.currentStream);
        
        //get mimetype
        var mime = this.currentStream.match(/<\!\[(.+)\[/)[1];
        
        //var payload = this.currentStream.match(/<\!\[([^\[]+)\[([^\]]+)\]\]>/m);
        var payload = this.currentStream.replace(/<\!\[.+?\[/, '').replace(']]>', '');
        
        //console.log(payload);
        
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