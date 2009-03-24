//COME WITH ME IF YOU WANT TO LIVE
var s = new DUI.Stream();

s.listen('text/html', function(payload) {
    $j('body').append(payload);
    
    //alert('finished the HTML packet');
});

s.listen('text/javascript', function(payload) {
    $j('body').append('<script type="text/javascript">' + payload + '</script>');
});

s.load('testStreamData.php');
