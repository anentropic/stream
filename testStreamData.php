<?php

$count = 1024 * 512;

echo '<<<text/plain|||';
for($i = 0; $i < $count ; $i++) {
    echo 'X';
    
    /* if($i > 1 && $i % floor($count / 3) == 0) {
        echo '|||';
    } */
}
echo '|||>>>';

echo "\n<<<text/javascript|||/*";
for($i = 0; $i < $count ; $i++) {
    echo 'Y';
}
echo "*/
console.log('huuurrrr');|||>>>";
?>
