<?php

$count = 1024 * 512;

echo '<![text/html[';

echo '<em>';

for($i = 0; $i < $count ; $i++) {
    echo 'X';
}

echo '</em>';

echo ']]>';

echo "\n\n<![text/javascript[/*";
for($i = 0; $i < $count ; $i++) {
    echo 'Y';
}
echo "*/
console.log('huuurrrr');]]>";
?>
