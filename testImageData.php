<?php

header('MIME-Version: 1.0');
header('Content-Type: multipart/mixed; boundary="|||"');


$imgFile = file_get_contents('img/32x32-digg-guy.gif');

for($i = 0; $i < 300 ; $i++) {
    echo "--|||
Content-Type: image/gif
" . base64_encode($imgFile);
}

echo '--|||--';

?>