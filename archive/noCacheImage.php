<?php

header('Pragma: no-cache');
header('Cache-Control: no-cache');
header('Content-Type: image/jpeg');

echo file_get_contents('hippo.jpg');

?>
