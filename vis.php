<?php
error_reporting (E_ALL ^ E_NOTICE); /* 1st line (recommended) */
//$dataSource = $_POST["dataSource"];
//$dataSource = '';
$html = "";
$dataSource = $_REQUEST['dataSource'];
if ($dataSource == '') {
  $html = file_get_contents("index.html");
  echo $html;
} else {
  $lines = file("index.html");
  $lines[5] = '<script>var dataSource=['.(stripslashes($dataSource)).'];</script>';
  /*
     $lines[5] = '<script>var dataSource=['.file_get_contents("./scripts/exampleDataSource.js").'];</script>';
    */
  echo join("\n", $lines);
}
?>
