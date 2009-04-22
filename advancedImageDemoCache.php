<?php
    /**
     * Advanced Image Demo with Cache
     *
     * @author goffinet
     * @version $Id$
     * @copyright Digg Inc., 22 April, 2009
     * @package default
     **/

    $images = array(
            "img/advanced/dfltr.png",
            "img/advanced/dtrinh.png",
            "img/advanced/jstump.png",
            "img/advanced/lenn0x.png",
            "img/advanced/op12.png",
            "img/advanced/phatduckk.png",
            "img/advanced/sfrench.png",
            "img/advanced/thejakemarsh.png",
        );
    if ($_COOKIE["MXHR_Cached"]) {
        $cached = true;
    } else {
        setcookie("MXHR_Cached", "1");
        $cached = false;
    }
    
    function array2js($array)
    {
        $newArray = array();
        foreach($array as $val) {
            $newArray[] = "'" . $val . "'";
        }
        return "[" . implode(',',$newArray) . "]";
    }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html xmlns="http://www.w3.org/1999/xhtml">

<head><title></title>

    <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.min.js"></script>
    <script type="text/javascript" src="js/DUI.js"></script>
    <script type="text/javascript" src="js/Stream.js"></script>
    
    <style type="text/css">
    body{font-family:arial,helvetica,sans-serif;}
    h1, h2, h3 {text-align:center;}
    .column {width:50%; float:left;}
    #stream {border: 4px solid #90B557; margin: 0pt auto; padding: 4px; width: 300px; -moz-border-radius: 3px; -webkit-border-radius: 3px; background: #ecffe1;}
    #normal {border: 4px solid #5481AC; margin: 0pt auto; padding: 4px; width: 300px; -moz-border-radius: 3px; -webkit-border-radius: 3px; background: #edf2ff;}
    </style>
</head>

<body>

<h1>DUI.Stream: Better living through MXHR</h1>
<h3>Advanced Image Demo with Caching</h3>
<div class="column" id="image_data">
    <?php if ($cached): ?>
        <div id="cached">
            <?php foreach ($images as $img): ?><img src="<?php echo $img ?>?cache=MXHR" width="48" height="48"/><?php endforeach ?>            
        </div>
    <?php else: ?>
        
    <?php endif ?>
</div>

<script type="text/javascript">

if($.browser.msie) {
    alert('Sorry, IE still handles object tags kind of stupidly, so this demo won\'t work for you yet. Try it in Firefox, it\'s pretty cool :)');
} else {

    var s = new DUI.Stream();
    
    if ($("#cached").length == 0) {
        s.listen('image/png', function(payload) {
            $('#image_data').append('<object type="image/png" data="data:image/gif;base64,' + payload + '" width="48" height="48"></object>');
        });
        
        s.listen('complete', function() {
            var images = <?php echo array2js($images) ?>;
            imgs = "";
            for (var i = 0; i < images.length; i++) {
                imgs += '<img src="' + images[i] + '?cache=MXHR" width="48" height="48" style="visibility:hidden"/>';
            }
            $(document.body).append(imgs);
        });
        s.load('testAdvancedImageData.php');
    }
}

</script>


</body>

</html>
