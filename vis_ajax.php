<?php
error_reporting (E_ALL ^ E_NOTICE); /* 1st line (recommended) */
$html = "";
$dataInfo = $_REQUEST['dataInfo'];
if ($dataInfo == '') {
  $html = file_get_contents("ajaxSource.html");
  echo $html;
} else {
  $lines = file("ajaxSource.html");
  $lines[14] = '<script>var dataInfo='.(urldecode($dataInfo)).';</script>';
  echo join("\n", $lines);
}
?>
