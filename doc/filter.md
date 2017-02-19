filter introduction
======

只有满足所有过滤条件的行才会被显示。
一个过滤条件由三部分组成：**列名**，**条件**以及**过滤值**。比如：

    weight > 2000
其中"weight"为列名， ">" 为条件， 2000为过滤值。整个过滤条件的含义是只有"weight"列的值大于2000才会被显示。再比如：

    EVERY is not ""
其中"EVERY"为列名， "is not"为条件， 空字符串""为过滤值。整个过滤条件的含义是只有所有列都不为空才会被显示。

列名
---
列名除了表格原有的列名，还增加了**"EVERY"**和**"SOME"**两列。表示所有列或某些列。比如:

    SOME is ""
将会把某列为空的行过滤出来。


条件
---
条件共有

    "is",
    "is not",
    "=",
    "<",
    ">",
    ">=",
    "<=",
    "contains", "contains ignoring case", 
    "does not contain",
    "starts with",
    "ends with",
    "in"
共12种。
其中"=", "<", ">", ">=", "<="可用于字符串和数值的比较情况。当列值和过滤值都为数值项时，进行数值比较，否则进行字符串的比较。
其余条件"is", "is not", "contains", "contains ignoring case", "does not contain", "starts with", "ends with", "in"只处理过滤值为字符串的情况。其中"in"表示列值为多个过滤值之一，详情请见“过滤值”的说明。
具体javascript代码如下：

```javascript
          switch (condition) {
          case "is" :
            return field === value;
          case "is not" :
            return field !== value;
          case "=" :
            if (isNumber(value) && isNumber(field)) {
              return parseFloat(field) === parseFloat(value);
            } else {
              return field === value;
            }
          case "<" :
            if (isNumber(value) && isNumber(field)) {
              return parseFloat(field) < parseFloat(value);
            } else {
              return field < value;
            }
          case ">" :
            if (isNumber(value) && isNumber(field)) {
              return parseFloat(field) > parseFloat(value);
            } else {
              return field > value;
            }
          case ">=" :
            if (isNumber(value) && isNumber(field)) {
              return parseFloat(field) >= parseFloat(value);
            } else {
              return field >= value;
            }
          case "<=" :
            if (isNumber(value) && isNumber(field)) {
              return parseFloat(field) <= parseFloat(value);
            } else {
              return field <= value;
            }
          case "contains" :
            return field.indexOf(value) >= 0;
          case "contains ignoring case" :
            return field.toLowerCase().indexOf(value.toLowerCase()) >= 0;
          case "does not contain" :
            return !(field.indexOf(value) >= 0);
          case "starts with" :
            return field.indexOf(value) === 0;
          case "ends with" :
            //http://stackoverflow.com/questions/280634/endswith-in-javascript
            return field.indexOf(value, field.length - value.length) !== -1;
          case "in" :
            return value.split(",").some(function (d) {
              return field === $.trim(d);
            });
          default:
            return false;
          }
```

过滤值
---
过滤值为一个字符串。
当条件为"=", "<", ">", ">=", "<="时，会优先考虑数值的情况。
当条件为"in"时，为把过滤值字符串分解为以英文","分隔的数组。比如列名为过滤值为字符串"79, 80, 81"， 列名为"year"。则过滤条件为
    year in ("79", "80", "81")
会把year为"79", "80", "81"的列过滤出来。

