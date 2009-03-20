var req = new XMLHttpRequest();
//req.open('GET', 'http://dev.loc/proxy.php?proxy_url=http://www.ibiblio.org/webster/xml_files/gcide_g.xml', true);
req.open('GET', 'testStreamData.php', true);

var ping = null;
var lastLength = 0;
var content = '';

//IDEA1! register listeners for each mimetype you want to use. i.e. foo = new AAAOOOH(); foo.listen('text/plain', function(payload) {});


req.onreadystatechange = function(e) {
    if(req.readyState == 3 && ping == null) {
        console.log('state 3');
        ping = window.setInterval(function() {
            var length = req.responseText.length;
            
            var chunkSize = length - lastLength;
            
            var thisChunk = req.responseText.substr(lastLength, chunkSize);
            
            var startFlag = thisChunk.search(/<<<.+\|\|\|/);
            var endFlag = thisChunk.search(/\|\|\|>>>/);
            
            content += thisChunk;
            
            console.log(lastLength, ' - ', length, ' --- ', startFlag, ' / ', endFlag);
            
            lastLength = length;
        }, 15);   
    } else if(req.readyState == 4) {
        console.log('state 4');
        window.clearInterval(ping);
        
        content += req.responseText.substr(lastLength);
        
        $j('body').html(content);
    }
}

req.send(null);