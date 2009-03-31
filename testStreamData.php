<?php

header('MIME-Version: 1.0');
header('Content-Type: multipart/mixed; boundary="|||"');

if(!isset($_GET['size'])) {
    $size = 512;
} else {
    $size = $_GET['size'];
}

if(!isset($_GET['payloads'])) {
    $payloads = 2;
} else {
    $payloads = $_GET['payloads'];
}

$count = 1024 * $size;


$imgFile = file_get_contents('hippo.jpg');

for($i = 0; $i < 300 ; $i++) {
    echo "--|||
Content-Type: image/jpeg
" . base64_encode($imgFile);
}

echo '--|||--';
exit;

echo "--|||
Content-Type: text/javascript
/*";
for($i = 0; $i < $count ; $i++) {
    echo 'Y';
}
echo "*/
console.log('huuurrrr');";

for($i = 1; $i < $payloads; $i++) {
    echo '
--|||
Content-Type: text/html
';
    
    echo '<em>';
    
    for($j = 0; $j < $count ; $j++) {
        echo 'X';
    }
    
    echo '</em>';
}

echo '--|||--';

?>
