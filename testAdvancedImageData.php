<?php

header('MIME-Version: 1.0');
header('Content-Type: multipart/mixed; boundary="|||"');


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
    
foreach ($images as $img) {
   $imgFile = file_get_contents($img);
       echo "--|||
   Content-Type: image/png
   " . base64_encode($imgFile);
}

echo '--|||--';

?>