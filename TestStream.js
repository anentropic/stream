TestStream = DUI.Class.create({
    testBasicStream: function() {
        //COME WITH ME IF YOU WANT TO LIVE
        var s = new DUI.Stream();
        
        var content = '';
        
        s.listen('text/html', function(payload) {
            content += payload;
        });
        
        s.listen('text/javascript', function(payload) {
            //$j('body').append('<script type="text/javascript">' + payload + '</script>');
            //console.log(payload);
        });
        
        //echo '<object type="image/jpeg" data="data:image/jpeg;base64,' . base64_encode($imgFile) . '"></object>';
        s.listen('image/jpeg', function(payload) {
            //$j('#stream').append('<object width="20" height="20" type="image/jpeg" data="data:image/jpeg;base64,' + payload + '"></object>');
            
            //console.log(payload);
        });
        
        s.listen('complete', function() {
            //console.log('stream took:', (new Date).getTime() - streamStart);
            $j('#stream').append(content + '<p>stream took: ' + ((new Date).getTime() - streamStart) + '</p>');
            
            var normalStart = (new Date).getTime();
            var imgs = '';
            for (var i = 0; i < 300; i++) {
                imgs += '<img src="noCacheImage.php?nocache=' + (new Date).getTime() * Math.random() + '" width="20" height="20" />';
            }
            
            //console.log($j('#normal'));
            
            $j('#normal').append(imgs);
            
            $j('img:last', '#normal').load(function() {
                $j('#normal').append('<p>Normal took: ' + ((new Date).getTime() - normalStart) + '</p>');
            });
        });
        
        var streamStart = (new Date).getTime();
        s.load('testStreamData.php?size=512&payloads=5');
    },
    
    testPerformance: function() {
        var s = new DUI.Stream();
        
        s.listen('text/html', function(payload) {
            console.log('html stream,', (new Date).getTime() - startStream);
        });
        
        s.listen('text/javascript', function(payload) {
            console.log('js stream,', (new Date).getTime() - startStream);
        });
        
        s.listen('complete', function() {
            console.log('stream,', (new Date).getTime() - startStream);
        });
        
        startStream = (new Date).getTime();
        s.load('testStreamData.php?size=512&payloads=5');
    },
    
    testAJAXPerformance: function() {
        startAJAX = (new Date).getTime();
        $j.ajax({
            url: 'testStreamData.php',
            type: 'get',
            data: {
                size: 512
            },
            complete: function(xml) {
                console.log('ajax,', (new Date).getTime() - startAJAX);
            }
        });
        
        startAJAX2 = (new Date).getTime();
        $j.ajax({
            url: 'testStreamData.php',
            type: 'get',
            data: {
                size: 512
            },
            complete: function(xml) {
                console.log('ajax,', (new Date).getTime() - startAJAX2);
            }
        });
        
        startAJAX3 = (new Date).getTime();
        $j.ajax({
            url: 'testStreamData.php',
            type: 'get',
            data: {
                size: 512
            },
            complete: function(xml) {
                console.log('ajax,', (new Date).getTime() - startAJAX3);
            }
        });
        
        startAJAX4 = (new Date).getTime();
        $j.ajax({
            url: 'testStreamData.php',
            type: 'get',
            data: {
                size: 512
            },
            complete: function(xml) {
                console.log('ajax,', (new Date).getTime() - startAJAX4);
            }
        });
        
        startAJAX5 = (new Date).getTime();
        $j.ajax({
            url: 'testStreamData.php',
            type: 'get',
            data: {
                size: 512
            },
            complete: function(xml) {
                console.log('ajax,', (new Date).getTime() - startAJAX5);
            }
        });
    }
}, true);
