var createVis = function () {
  var Plus = {};
  Plus.columns = function (table, columns) {
    var ret = [];
    for (var i = 0, l = table.length; i < l; i++) {
      var row = table[i];
      var _row = [];
      for (var j = 0, k = columns.length; j < k; j++) {
        _row.push(row[columns[j]]);
      }
      ret.push(_row);
    }
    return ret;
  };
  
  Plus.count = function (table, col) {
    var ret = _.chain(table).groupBy(function (val) {
        return val;
      }).map(function (val, key) {
        console.log(arguments);
        return [key, val.length];
      }).value();
    return ret;
  };
  
  function isNumber(n) {
    // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  
  function isNumberOrNull(n) {
    // http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
    return !isNaN(parseFloat(n)) && isFinite(n) || n === null || n === "" || n === undefined;
  }
  
  var createVisConfig = function (style) {
    var configStyle = style;
    return function (container) {
      var options = this.options;
      var optionType = this.optionType;
      var valueOrNot = App.get("valueOrNot");
      var head, noStat, stat;
      var fields = App.get('fields');
      var matrix = App.get('data');
      var that = this;
      var createSelect = function (selectName, stat) {
        //create Single select
        var dom = '<p>';
        if (selectName === 'category') {
          dom += '<span title="统计分类。选择某一列进行统计分类，如果某一列为字符串，则不同字符串分为一类。如果某一列为数值，则分割成不同的区间进行分类, [start, end]为整个区间， step为分割步长。scatter等可视化形式还有一些自定义设置，具体请参看每种可视化形式的注释" style="cursor: help;">' + selectName + '</span>';
        } else if (selectName === 'label') {
          dom += '<span title="标签列，用于在图表中标示数据来源于哪一行" style="cursor: help;">' + selectName + '</span>';
        } else {
          dom += '<span title="数据列，选择绘图的数据"  style="cursor: help;">' + selectName + '</span>';
        }
        dom += ': <select class="' + selectName + ' field">';
        fields.forEach(function (field, i) {
          if (i === 0 && stat) {
              if (selectName === 'category') {
                dom += '<option value="-1">NULL</option>';
              } else {
                dom += '<option value="-1"><B>categoryStatisticCount</B></option>';
              }
          }
          if (optionType[selectName] === "number" && valueOrNot[i] === false) {
            // not add;
          } else {
            dom += '<option value="' + i + '">' + field + '</option>';
          }
        });
        dom += '</select>';
        if (selectName !== "category" && stat) {
          // stat type
          dom += ' <select disabled="disabled" class="stat-type">';
          ['sum', 'avrg', 'max', 'min'].forEach(function(d, i) {
            dom += '<option value="' + d + '">' + d + '</option>';
          });
          dom += '</select>';
        }
        dom += '</p>';
        return dom;
      };
      /*
      var statTrigger = function () {
        if ($(this).hasClass("stat")) {
          $(this).html("no stat")
              .removeClass("stat")
              .addClass("noStat");
          $(this).parent().parent().find("div.stat").hide();
          $(this).parent().parent().find("div.noStat").show();
        } else {
          $(this).html("stat")
              .removeClass("noStat")
              .addClass("stat");
          $(this).parent().parent().find("div.noStat").hide();
          $(this).parent().parent().find("div.stat").show();
        }
      };
      */
      var createCateConfig = (function () {
        //var cateType = $("<span> string </span> <span> number </span>");
        var numberConfig = $("<div><p>start: <input class = \"cateConfigStart\" /></p>" +
                            "<p>end: <input class = \"cateConfigEnd\" /></p> " +
                            "<p>step: <input class = \"cateConfigStep\" /></p></div>");
        numberConfig.find("input").css("width", "160px");
        var strLabel = "string (same string will merge)";
        var numLabel = "number (divide into several intervals)";
        //var stringConfig = $("<p>same string will merge</p>");
        //$(this).parent().parent().find(".cateConfig").remove();
        return function () {
          var fields = App.get('fields');
          var matrix = App.get('data');
          //var columnData = matrix;
    
          var columnIsNumber = function (index) {
            return matrix.every(function (d) {
              return isNumber(d[index]);
            });
          };
    
          var cateTrigger = function () {
            if ($(this).html() === numLabel) {
              $.data(cateType[0], "cateType", "string");
              $(this).html(strLabel);
              numberConfig.hide();
              //stringConfig.show();
            } else {
              $.data(cateType[0], "cateType", "number");
              $(this).html(numLabel);
              numberConfig.show();
              //stringConfig.hide();
            }
          };
    
          var getStatInfo = function (index) {
              var column = matrix.map(function (d) {
                      return parseFloat(d[index]);
                      });
              var i, l, v;
              var min = column[0], max = column[0];
              for (i = 1, l = column.length; i < l; i++) {
                  v = column[i];
                  if (v < min) {min = v;}
                  if (v > max) {max = v;}
              }
              return {"min": min,
                    "max": max}
          };
    
          var statResult = {};
          var cateConfig = $("<div class=\"cateConfig\"></div>")
                            .css({ "padding-left": "50px" });
          var cateType = $("<p class=\"cateType\"></p>");
    
          $(this).parent().find(".cateConfig").remove();
    
          if ($(this).val() === "-1") {
          } else if (!columnIsNumber($(this).val())) {
            $.data(cateType[0], "cateType", "string");
            cateConfig.append(cateType.html(strLabel)
                                .css({"background-color": "#ddffdd"}));
                    //.append(stringConfig.show());
          } else {
            $.data(cateType[0], "cateType", "number");
            cateConfig.append(cateType.html(numLabel)
                    .css({"cursor": "pointer",
                        "background-color": "#ddffdd"})
                    .on("click", cateTrigger))
                .append(numberConfig.show());
                //.append(stringConfig.hide());
    
            statResult = getStatInfo($(this).val());
            numberConfig.find("input.cateConfigStart").val(statResult.min);
            numberConfig.find("input.cateConfigEnd").val(statResult.max);
            numberConfig.find("input.cateConfigStep").val(Math.ceil((statResult.max - statResult.min) * 1000) / 10000);
          }
          cateConfig.insertAfter($(this));
        };
      }());
  
      var getNoStatHtml = function () {
        var html = '';
        html += '<div class=\"noStat\">';
        html += ' <p><span title="取前多少条数据进行可视化" style="cursor: help">dataNumber</span>'
          + ': <input class="data_number" value="50" />(total: ' + matrix.length + ')</p>';
        for (var i = 0, l = options.length; i < l; i++) {
          html += createSelect(options[i], false);
        }
        html += '</div>';
        return $(html);
      };
  
      var getStatHtml = function () {
        var jqNode;
        var html = '';
        var cateName;
        html += '<div class=\"stat\">';
        html += ' <p><span title="取前多少条数据进行可视化" style="cursor: help">dataNumber</span>'
          + ': <input class="data_number" value="50" />(total: ' + matrix.length + ')</p>';
        for (var i = 0, l = options.length; i < l; i++) {
          cateName = options[i] === 'label' ? 'category' : options[i];
          html += createSelect(cateName, true);
        }
        html += '</div>';
        jqNode = $(html);
        jqNode.find("select.category").on("change", createCateConfig);
        
        //stat type select
        //jqNode.find("select.field").on("change", function () {
        jqNode.delegate("select.field", "change", function () {
          if ($(this).hasClass("category")) {
            return;
          }
          if ($(this).val() === "-1" || $("#chart_type").val() === "Scatter") {
            $(this).siblings().attr("disabled", true);
          } else {
            $(this).siblings().removeAttr("disabled");
          }
        });
        return jqNode;
      };
  
      var getConfigTabs = function (stat) {
        var statConfigTabs = '\
        <div class="tabbable" id="configTabs"> \
          <ul class="nav nav-tabs" id="configNavTabs"> \
            <li class="active"><a href="#noStatContent" data-toggle="tab">普通模式</a></li> \
            <li><a href="#statContent" data-toggle="tab">统计模式</a></li> \
          </ul> \
     \
          <div class="tab-content"> \
            <div class="tab-pane active" id="noStatContent"> \
            </div> \
            <div class="tab-pane" id="statContent"> \
            </div> \
          </div> \
        </div> \
        ';
        var noStatConfigTabs = '\
        <div class="tabbable" id="configTabs"> \
          <ul class="nav nav-tabs" id="configNavTabs"> \
            <li class="active"><a href="#noStatContent" data-toggle="tab">普通模式</a></li> \
          </ul> \
     \
          <div class="tab-content"> \
            <div class="tab-pane active" id="noStatContent"> \
            </div> \
          </div> \
        </div> \
        ';
        if (stat === "stat") {
          return statConfigTabs;
        } else if (stat === "no stat") {
          return noStatConfigTabs;
        }
      };
  
      var getChartTypeHead = function (type) {
          return '<li class="visual-type"><p>'+ type.toLowerCase() + 
                  '<a id="filterTooltip" href="./doc/chartType.html#' + type.toLowerCase() +
                  '" target="_blank"><i class="icon-question-sign"></i></a>' +
                  '</p></li>';
      };
  
      container.empty();
      if (configStyle === "static") {
        if (!this.statistic) {
          //static and no statistic
          //container.append($(' <p>' + this.type + '</p>')).append(getNoStatHtml());
          var configTabs = $(getConfigTabs("no stat"));
          configTabs.find("#configNavTabs").prepend(getChartTypeHead(this.type));
          configTabs.find("#noStatContent").append(getNoStatHtml());
          container.append(configTabs);
        } else {
          //static and statistic
          /*
          var head = $(' <p>' + this.type + ' </p>')
              .append($('<span class=\"noStat\"> no stat </span>').on("click", statTrigger));
          var noStat = getNoStatHtml();
          var stat = getStatHtml().hide();
          container.append(head).append(noStat).append(stat);
          */
          var configTabs = $(getConfigTabs("stat"));
          configTabs.find("#configNavTabs").prepend(getChartTypeHead(this.type));
          configTabs.find("#noStatContent").append(getNoStatHtml());
          configTabs.find("#statContent").append(getStatHtml());
          container.append(configTabs);
        }
      } else {
        var add = function (stat) {
          return function () {
            $(createSelect(that.addOption, stat)).append(
              delDiv.clone(true)
            ).insertBefore($(this));
          };
        };
        var del = function () {
          $(this).parent().remove();
        };
  
        var addButtonNoStat = $("<span class=\"addValue\">&nbsp;+&nbsp;</span>").on("click", add(false));
        var addButtonStat = $("<span class=\"addValue\">&nbsp;+&nbsp;</span>").on("click", add(true));
        var delDiv = $("<span class=\"delValue\">&nbsp;-&nbsp;</span>").on("click", del);
        if (!this.statistic) {
          //dynamic and no statistic
          /*
          container.append(getNoStatHtml()).prepend($(' <p>' + this.type + '</p>'));
          container.find("div").append(addButtonNoStat);
          */
  
          var configTabs = $(getConfigTabs("no stat"));
          configTabs.find("#configNavTabs").prepend(getChartTypeHead(this.type));
          configTabs.find("#noStatContent").append(
              getNoStatHtml().append(addButtonNoStat));
          container.append(configTabs);
        } else {
          //dynamic and statistic
          /*
          var head = $(' <p>' + this.type + ' </p>')
              .append($('<span class=\"noStat\"> no stat </span>').on("click", statTrigger));
          var noStat = getNoStatHtml().append(addButtonNoStat);
          var stat = getStatHtml().hide().append(addButtonStat.clone(true));
          container.append(head).append(noStat).append(stat);
          */
          var configTabs = $(getConfigTabs("stat"));
          configTabs.find("#configNavTabs").prepend(getChartTypeHead(this.type));
          configTabs.find("#noStatContent").append(
                  getNoStatHtml().append(addButtonNoStat));
          configTabs.find("#statContent").append(
                  getStatHtml().append(addButtonStat));
          container.append(configTabs);
  
        }
      }
    };
  };
  
  var ChartConfig = {
    "pie": {
      type: "Pie",
      statistic: true,
      options: ["label", "value"],
      optionType: {"label": "string", "value": "number"},
      createConfig: createVisConfig("static")
    },
    "line": {
      type: "Line",
      statistic: true,
      options: ["label", "value"],
      optionType: {"label": "string", "value": "number"},
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    },
    "area": {
      type: "Area",
      statistic: true,
      options: ["label", "value"],
      optionType: {"label": "string", "value": "number"},
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    },
    "bar": {
      type: "Bar",
      statistic: true,
      options: ["label", "value"],
      optionType: {"label": "string", "value": "number"},
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    },
    "column": {
      type: "Column",
      statistic: true,
      options: ["label", "value"],
      optionType: {"label": "string", "value": "number"},
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    },
    "treemap": {
      type: "Treemap",
      statistic: true,
      options: ["label", "value"],
      optionType: {"label": "string", "value": "number"},
      createConfig: createVisConfig("static")
    },
    "scatter": {
      type: "Scatter",
      statistic: true,
      options: ["label", "x_value", "y_value"],
      optionType: {"label": "string", "x_value": "number", "y_value": "number"},
      createConfig: createVisConfig("static")
    },
    "parallel": {
      type: "Parallel",
      //statistic: true,
      options: ["value", "value"],
      optionType: {"value": "string"},
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    },
    "scatterplotmatrix": {
      type: "ScatterplotMatrix",
      //statistic: true,
      options: ["value", "value"],
      optionType: {"value": "number"},
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    }
  };
  
  var App = new Scape();
  var FIELDS = dataSource.map(function (d) { return d[0]; });
  var datas = dataSource.map(function (d) { return d.slice(1); });
  
  Land("header", function (view) {
    var select = view.$("#dataSource");
    datas.forEach(function (d, i) {
      select.append($('<option value="' + i + '">数据' + (i + 1) + '</option>'));
    });
    view.delegate("select", "change", function () {
      App.set('dataSource_change', select.val());
    });
  
    App.ready('dataSource_change', function (val) {
      var index = parseInt(val.newVal, 10);
      App.set('fields', dataSource[index][0]);
      App.set('data', dataSource[index].slice(1));
      App.set('sourceData', dataSource[index].slice(1));
      App.set('data_change', select.val());
    });
  
    App.set('dataSource_change', select.val());
    //view.$("select").trigger("change");
  });
  
  Land("#content", function (view) {
    App.ready('data_change', function (val) {
      view.$("#visual").empty();
    });
  
    App.ready('show_data', function (event) {
      view.$("#navTabs").find("a").first().trigger("click");
      var indexes = event.newVal;
      App.set('tableFieldIndexes', indexes);
      if (indexes.length === 0) {
        view.$("#table").html("");
        return;
      }
      var defaultNumber = 100;
      var data = App.get('data');
      var list = Plus.columns(data, indexes);
      App.set('filtered', list);
      var fields = Plus.columns([App.get('fields')], indexes);
      var html = '<table class="table-bordered table-striped">';
      var i, l, j, k, row;
  
      for (i = 0, l = fields.length; i < l; i++) {
        row = fields[i];
        html += '<tr><th>#</th>';
        for (j = 0, k = row.length; j < k; j++) {
          html += '<th>' + row[j] + '</th>';
        }
        html += '</tr>';
      }
      for (i = 0, l = Math.min(list.length, defaultNumber); i < l; i++) {
        row = list[i];
        html += '<tr><td>' + (i + 1) + '</td>';
        for (j = 0, k = row.length; j < k; j++) {
          html += '<td>' + row[j] + '</td>';
        }
        html += '</tr>';
      }
      html += '</table>';
      view.$("#table").html(html);
    });
  
    App.ready("show_chart", function (event) {
      //var counted = Plus.count(App.get('filtered'));
      var fields = App.get('fields');
      var matrix = App.get('data');
      var containerId = "visual";
      var newVal = event.newVal;
  
      var numberValidate = function (valueIndexes) {
        //check data validation
        var columnIsNumber = function (index) {
          return matrix.every(function (d, i) {
            return isNumber(d[index]);
          });
        };
  
        var flag = true;
        valueIndexes.forEach(function (d) {
          if (d === -1) {
            return;
          }
          if (!columnIsNumber(d)) {
            alert("column " + fields[d] + " is not number");
            flag = false;
          }
        });
        return flag;
      };
  
      //init single cate
      var initCate = function (valueIndexes, statTypes) {
        var cate = {};
        cate.count = 0;
        valueIndexes.forEach(function(vi, i) {
          //cate.sum = 0;
          if (vi === -1) {
            //COUNT
            //cate[vi] = 0;
          } else {
            if (statTypes[i] === "avrg") {
              cate[i] = 0;
            } else if (statTypes[i] === "max") {
              cate[i] = undefined;
            } else if (statTypes[i] === "min") {
              cate[i] = undefined;
            } else {
              //default sum
              cate[i] = 0;
            }
          }
        });
        return cate;
      };
      //add data to cate
      var cateAddData = function (cate, d, valueIndexes, statTypes) {
        cate.count += 1;
        valueIndexes.forEach(function (vi, i) {
            var v;
            if (vi === -1) {
              //COUNT
              //cate[vi] += 1;
            } else {
              v = d[vi] === "" ? 0 : parseFloat(d[vi]);
              if (statTypes[i] === 'avrg') {
                cate[i] += v;
                //cate[vi].value += parseFloat(d[vi]);
                //cate[vi].count += 1; 
              } else if (statTypes[i] === 'max') {
                if (typeof cate[i] === 'undefined') {
                  cate[i] = v; 
                } else {
                  cate[i] = Math.max(cate[i], v); 
                }
              } else if (statTypes[i] === 'min') {
                if (typeof cate[i] === 'undefined') {
                  cate[i] = v;
                } else {
                  cate[i] = Math.min(cate[i], v); 
                }
              } else {
                //default sum
                cate[i] += v;
              }
            }
        });
      };
      //recover avrg form {} to number;
      var cateResultProcess = function (valueIndexes, statTypes, statData, cates) {
        var cate;
        var type;
        var cateName;
        var i;
        for (cateName in statData) {
          cate = statData[cateName];
          //empty
          if (cate.count === 0) {
            //remove this category
            delete statData[cateName];
            continue;
          }
          //not empty
          valueIndexes.forEach(function(vi, i) {
            if (vi === -1) {
              //count
              cate[i] = cate.count;
            } else {
              type = statTypes[i];
              if (type === "sum") {
                //
              } else if (type === "avrg") {
                cate[i] = cate[i] / cate.count;
              } else if (type === "max") {
                //
              } else if (type === "min") {
                //
              }
            }
          });
          //remove sum and count
          delete cate.count;
          //delete cate.sum;
        }
        //cates delete emtpy;
        for (i = cates.length - 1; i >= 0; i--) {
          if (typeof statData[cates[i]] === 'undefined') {
            cates.splice(i, 1);
          }
        }
      };
  
      var getStringStatData = function (valueIndexes, labelIndex, statTypes, config) {
        var dataNumber = config.dataNumber;
        var cates = [];
        var statData = {};
        //init
        matrix.forEach(function (d, i) {
          var cate;
          if (i < dataNumber) {
            cate = statData[d[labelIndex]];
            if (typeof cate === 'undefined') {
              cates.push(d[labelIndex]);
              cate = statData[d[labelIndex]] = initCate(valueIndexes, statTypes);
            }
          }
        });
        //stat
        matrix.forEach(function (d, i) {
          var cate;
          if (i < dataNumber) {
            cate = statData[d[labelIndex]];
            cateAddData(cate, d, valueIndexes, statTypes);
          }
        });
  
        //get avrg
        cateResultProcess(valueIndexes, statTypes, statData, cates);
  
        return {cates: cates,
              statData: statData};
      };
  
      var getNumberStatData = function (valueIndexes, labelIndex, statTypes, config) {
        var dataNumber = config.dataNumber;
        var cates = [];
        var statData = {};
        var start = config.statInfo.start;
        var end = config.statInfo.end;
        var step = config.statInfo.step;
        var num, l;
        var inDomain = function (d) {
          return (d-start) * (d - end) <= 0;
        };
        if (!isNumber(start)) {
            alert("start is not a number");
            return {"dataValid": false};
        }
        if (!isNumber(end)) {
            alert("end is not a number");
            return {"dataValid": false};
        }
        if (!isNumber(step)) {
            alert("step is not a number");
            return {"dataValid": false};
        }
        if ((end - start) * step <= 0) {
          if (start === end) {
            step = 1;
          } else {
            alert("(end - start) / step should be positive");
            return {"dataValid": false};
          }
        }
        
        var getIndex = function (d) {
          return Math.floor((d - start) / step);
        };
        var getDomainString = function (d) {
          var idx = getIndex(d);
          if (inDomain(start + (idx + 1) * step)) {
            return "[" + (start + idx * step) + "--"
              + (start + (idx + 1) * step) + ")"; 
          } else {
            return "[" + (start + idx * step) + "--"
              + end + "]"; 
          }
        };
        var cate;
        var index;
        var domainString;
        for (num = start; inDomain(num); num += step) {
          domainString = getDomainString(num);
          cates.push(domainString);
          cate = statData[domainString] = initCate(valueIndexes, statTypes);
        }
        if (getIndex(end) === cates.length) {
          //float count debug {start: 3, end: 8, step: 0.2}
          domainString = getDomainString(end);
          cates.push(domainString);
          cate = statData[domainString] = initCate(valueIndexes, statTypes);
        }
  
        matrix.forEach(function (d, i) {
          if (i < dataNumber) {
            if (!inDomain(d[labelIndex])) {
              return;
            }
            if (d[labelIndex] === "") {// item without value will be ignored
              return;
            }
            index = getIndex(d[labelIndex]);
            domainString = cates[index];
            cate = statData[domainString];
            cateAddData(cate, d, valueIndexes, statTypes);
          }
        });
  
        //get avrg
        cateResultProcess(valueIndexes, statTypes, statData, cates);
  
        return {
            "dataValid": true,
            "cates": cates,
            "statData": statData
        };
      };
  
      
      var getDimension = function (dimen, config) {
        var dimension = [];
        config.dimensions.forEach(function (d) {
          if (typeof d[dimen] !== 'undefined') {
            dimension.push(d[dimen]);
          }
        });
        return dimension;
      };
      var getDimensionStatType = function (dimen, config) {
        var statType = [];
        config.dimensions.forEach(function (d) {
          if (typeof d[dimen] !== 'undefined') {
            statType.push(d.statType);
          }
        });
        return statType;
      };
  
      /* confit data format
      "{
      "type":"pie",
      "dataNumber":50,
      "dimensions":[{"category":0},{"value":2,"statType":"sum"}],
      "chart":"datav",
      "isStat":true,
      "statInfo":{"cateType":"string"}
      }"
      */
  
      function showPie (config) {
        var dataNumber = config.dataNumber,
            labelIndex,
            labelName,
            valueIndexes = getDimension("value", config),
            valueNames;
        var statResult;
        var statTypes = [];
        var cates = [];
        var statData = {};
        //check data validation
        /*
        if (!numberValidate(valueIndexes)) {
              return;
        }
        */
  
        if (!config.isStat) {
          labelIndex = getDimension("label", config)[0];
          labelName = fields[labelIndex];
          valueNames = valueIndexes.map(function (d) {
            return d === -1 ? "count" : fields[d];
          });
        } else {
          //stat
          labelIndex = getDimension("category", config)[0];
          labelName = fields[labelIndex];
          statTypes = getDimensionStatType("value", config);
          valueNames = valueIndexes.map(function (d, i) {
            return d === -1 ? "count" : fields[d] + " (" + statTypes[i] + ")";
          });
          if (config.statInfo.cateType === "string") {
            //string
            statResult = getStringStatData(valueIndexes, labelIndex, statTypes, config);
          } else {
            //number
            statResult = getNumberStatData(valueIndexes, labelIndex, statTypes, config);
            if (statResult.dataValid === false) {
              return;
            }
          }
          cates= statResult.cates;
          statData = statResult.statData;
        }
  
        /*
        var data = [[], []];
        if (!config.isStat) {
          matrix.forEach(function (d, i) {
            if (i < dataNumber) {
              //data.push([d[labelIndex], parseInt(d[valueIndex])]);
              data[0].push(d[labelIndex]);
              data[1].push(d[valueIndexes[0]]);
            }
          });
        } else {
          cates.forEach(function (d) {
            data[0].push(d);
            data[1].push(statData[d][0]);
          });
        }
        */
        var data = [];
        if (!config.isStat) {
          matrix.forEach(function (d, i) {
            if (i < dataNumber) {
              var v = d[valueIndexes[0]];
              data.push([d[labelIndex], v === "" ? 0 : parseFloat(v)]);
            }
          });
        } else {
          cates.forEach(function (d) {
            /*
            data[0].push(d);
            data[1].push(statData[d][0]);
            */
            data.push([d, statData[d][0]]);
          });
        }
  
        var pie = new Pie(containerId, {
          width: $("#" + containerId).width() - 20,
          height: $("#" + containerId).height() - 20,
          tag: true
        });
        pie.setSource(data);
        pie.render();
      }
  
      function showPie_highCharts (config) {
        var dataNumber = config.dataNumber,
            labelIndex,
            labelName,
            valueIndexes = getDimension("value", config),
            valueNames;
        var statResult;
        var statTypes = [];
        var cates = [];
        var statData = {};
        //check data validation
        /*
        if (!numberValidate(valueIndexes)) {
              return;
        }
        */
  
        if (!config.isStat) {
          labelIndex = getDimension("label", config)[0];
          labelName = fields[labelIndex];
          valueNames = valueIndexes.map(function (d) {
            return d === -1 ? "count" : fields[d];
          });
        } else {
          //stat
          labelIndex = getDimension("category", config)[0];
          labelName = fields[labelIndex];
          statTypes = getDimensionStatType("value", config);
          valueNames = valueIndexes.map(function (d, i) {
            return d === -1 ? "count" : fields[d] + " (" + statTypes[i] + ")";
          });
          if (config.statInfo.cateType === "string") {
            //string
            statResult = getStringStatData(valueIndexes, labelIndex, statTypes, config);
          } else {
            //number
            statResult = getNumberStatData(valueIndexes, labelIndex, statTypes, config);
            if (statResult.dataValid === false) {
              return;
            }
          }
          cates = statResult.cates;
          statData = statResult.statData;
        }
  
        var data = [];
        if (!config.isStat) {
          matrix.forEach(function (d, i) {
            if (i < dataNumber) {
              var v = d[valueIndexes[0]];
              data.push([d[labelIndex], v === "" ? null : parseFloat(v)]);
            }
          });
        } else {
          cates.forEach(function (d) {
            data.push([d,statData[d][0]]);
          });
        }
    
        var chart = new Highcharts.Chart({
            chart: {
              renderTo: containerId,
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false
            },
            title: {
              text: labelName + " - " + valueNames[0]
            },
            subtitle: {
              text: 'Source: 在云端'
            },
            tooltip: {
              formatter: function() {
                return '<b>'+ this.point.name +'</b>: ' + this.percentage +' % (' + this.y + ')';
              }
            },
            plotOptions: {
              pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                  enabled: true,
                  color: '#000000',
                  connectorColor: '#000000',
                  formatter: function() {
                    return '<b>'+ this.point.name +'</b>: '+ this.percentage.toFixed(2) +' %';
                  }
                }
              }
            },
            series: [{
                type: 'pie',
                name: 'Browser share',
                data: data
                    /*
                    [
                    ['Firefox',   45.0],
                    ['IE',       26.8],
                    {
                        name: 'Chrome',
                        y: 12.8,
                        sliced: true,
                        selected: true
                    },
                    ['Safari',    8.5],
                    ['Opera',     6.2],
                    ['Others',   0.7]
                ]
                */
            }]
        });
      };
  
      function showLineLike (config) {
        var dataNumber = config.dataNumber,
            labelIndex,
            labelName,
            valueIndexes = getDimension("value", config),
            valueNames;
        var statResult;
        var statTypes = [];
        var cates = [];
        var statData = {};
        //check data validation
        /*
        if (!numberValidate(valueIndexes)) {
              return;
        }
        */
        if (!config.isStat) {
          labelIndex = getDimension("label", config)[0];
          labelName = fields[labelIndex];
          valueNames = valueIndexes.map(function (d) {
            return d === -1 ? "count" : fields[d];
          });
        } else {
          //stat
          labelIndex = getDimension("category", config)[0];
          labelName = fields[labelIndex];
          statTypes = getDimensionStatType("value", config);
          valueNames = valueIndexes.map(function (d, i) {
            return d === -1 ? "count" : fields[d] + " (" + statTypes[i] + ")";
          });
          if (config.statInfo.cateType === "string") {
            //string
            statResult = getStringStatData(valueIndexes, labelIndex, statTypes, config);
          } else {
            //number
            statResult = getNumberStatData(valueIndexes, labelIndex, statTypes, config);
            if (statResult.dataValid === false) {
              return;
            }
          }
          cates= statResult.cates;
          statData = statResult.statData;
        }
  
        //var data = [{"name": valueName, "data": []}];
        var data = [];
        var xAxis = {"categories": []};
        if (config.type === "line") {
          xAxis.labels = {
                    rotation: 45,
                    align: 'left'
                };
        }
        valueNames.forEach(function (d) {
          data.push({"name": d, "data": []});
        });
        if (!config.isStat) {
          matrix.forEach(function (d, i) {
            if (i < dataNumber) {
              xAxis.categories.push(d[labelIndex]);
              data.forEach(function (da, j) {
                var v = d[valueIndexes[j]];
                da.data.push(v === "" ? null : parseFloat(v));
              });
            }
          });
        } else {
          cates.forEach(function (d) {
            xAxis.categories.push(d);
            data.forEach(function (da, j) {
              //da.data.push(statData[d][valueIndexes[j]]);
              da.data.push(statData[d][j]);
            });
          });
        }
        
        var chart = new Highcharts.Chart({
          chart: {
            renderTo: containerId,
            type: config.type,
            marginRight: 130,
            marginBottom: 25
          },
          title: {
            text: labelName,
            x: -20 //center
          },
          subtitle: {
            text: 'Source: 在云端',
            x: -20
          },
          xAxis: xAxis,
          /*{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          },
          */
          yAxis: {
            title: {
              text: valueNames[0] + " ... "//'Temperature (°C)'
            },
            plotLines: [{
              value: 0,
              width: 1,
              color: '#808080'
            }]
          },
          tooltip: {
            formatter: function() {
              return '<b>'+ this.series.name +'</b><br/>'+
                this.x +': '+ this.y;
            }
          },
          legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: -10,
            y: 100,
            borderWidth: 0
          },
          series: data
                  /*[{
              name: 'Tokyo',
              data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
          }, {
              name: 'New York',
              data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
          }, {
              name: 'Berlin',
              data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
          }, {
              name: 'London',
              data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
          }]
          */
        });
  
      }
  
      function showLine (config) {
        showLineLike(config);
      }
      
      function showArea (config) {
        showLineLike(config);
      }
  
      function showBar (config) {
        showLineLike(config);
      }
  
      function showColumn (config) {
        showLineLike(config);
      }
  
      function showTreemap (config) {
        var dataNumber = config.dataNumber,
            labelIndex,
            labelName,
            valueIndexes = getDimension("value", config),
            valueNames;
        var statResult;
        var statTypes = [];
        var cates = [];
        var statData = {};
        //check data validation
        /*
        if (!numberValidate(valueIndexes)) {
              return;
        }
        */
        if (!config.isStat) {
          labelIndex = getDimension("label", config)[0];
          labelName = fields[labelIndex];
          valueNames = valueIndexes.map(function (d) {
            return d === -1 ? "count" : fields[d];
          });
        } else {
          //stat
          labelIndex = getDimension("category", config)[0];
          labelName = fields[labelIndex];
          statTypes = getDimensionStatType("value", config);
          valueNames = valueIndexes.map(function (d, i) {
            return d === -1 ? "count" : fields[d] + " (" + statTypes[i] + ")";
          });
          if (config.statInfo.cateType === "string") {
            //string
            statResult = getStringStatData(valueIndexes, labelIndex, statTypes, config);
          } else {
            //number
            statResult = getNumberStatData(valueIndexes, labelIndex, statTypes, config);
            if (statResult.dataValid === false) {
              return;
            }
          }
          cates= statResult.cates;
          statData = statResult.statData;
        }
  
        var data = {
           "name": "root",
           "children": []
        };
        if (!config.isStat) {
          matrix.forEach(function (d, i) {
            if (i < dataNumber) {
              var v = d[valueIndexes[0]];
              data.children.push({"name": d[labelIndex], "size": v === "" ? 0 : parseFloat(v)});
            }
          });
        } else {
          cates.forEach(function (d) {
            data.children.push({"name": d, "size": statData[d][0]});
          });
        }
  
        var treemap = new Treemap(containerId, {
          width: $("#" + containerId).width() - 20,
          height: $("#" + containerId).height() -25
        });
        treemap.setSource(data);
        treemap.render();
      }
  
      function showScatter (config) {
        var dataNumber = config.dataNumber,
            labelIndex,
            labelName,
            xValueIndex = getDimension("x_value", config)[0],
            yValueIndex = getDimension("y_value", config)[0],
            xValueName = xValueIndex === -1 ? "count" : fields[xValueIndex],
            yValueName = yValueIndex === -1 ? "count" : fields[yValueIndex],
            valueIndexes = [xValueIndex, yValueIndex],
            valueNames;
        var statResult;
        var statTypes = [];
        var cates = [];
        var statData = {};
        //check data validation
        /*
        if (!numberValidate(valueIndexes)) {
              return;
        }
        */
        if (!config.isStat) {
          labelIndex = getDimension("label", config)[0];
          labelName = fields[labelIndex];
          valueNames = valueIndexes.map(function (d) {
            return d === -1 ? "count" : fields[d];
          });
        } else {
          //stat
          labelIndex = getDimension("category", config)[0];
          labelName = fields[labelIndex];
          statTypes = getDimensionStatType("value", config);
          valueNames = valueIndexes.map(function (d, i) {
            return d === -1 ? "count" : fields[d] + " (" + statTypes[i] + ")";
          });
          if (config.statInfo.cateType === "string") {
            //string
            statResult = getStringStatData(valueIndexes, labelIndex, statTypes, config);
          } else {
            //number
            statResult = getNumberStatData(valueIndexes, labelIndex, statTypes, config);
            if (statResult.dataValid === false) {
              return;
            }
          }
          cates= statResult.cates;
          statData = statResult.statData;
        }
  
        //var data = [{ name: 'Female', color: 'rgba(223, 83, 83, .5)', data: [[161.2, 51.6],..]}];
        var data = [];
        var hash = {};
        var getKey = function (line) {
          // string
          if (config.statInfo.cateType === "string") {
              return line[labelIndex];
          } 
          // number
          var start = config.statInfo.start,
              end = config.statInfo.end,
              step = config.statInfo.step;
          var inDomain = function (d) {
            return (d-start) * (d - end) <= 0;
          };
          var getIndex = function (d) {
            return Math.floor((d - start) / step);
          };
          var getDomainString = function (d) {
            var idx = getIndex(d);
            if (inDomain(start + (idx + 1) * step)) {
              return "[" + (start + idx * step) + "--"
                + (start + (idx + 1) * step) + ")"; 
            } else {
              return "[" + (start + idx * step) + "--"
                + end + "]"; 
            }
          };  
          if (!inDomain(line[labelIndex])) {
            return;
          }
          //return getIndex(line[labelIndex]);
          return getDomainString(line[labelIndex]);
        };
        var getValue = function (d, idx) {
          var v = d[idx];
          if (idx !== -1) {
            return v === "" ? 0 : parseFloat(v);
          }
          //count hack
          return statData[d[labelIndex]][$.inArray(-1, valueIndexes)];
        };
        if (!config.isStat) {
          data = [{name: labelName, color: "rgba(150,150,255, 0.5)", data: []}];
          matrix.forEach(function (d, i) {
            var getFloat = function (v) {
              return v === "" ? 0 : parseFloat(v);
            };
            if (i < dataNumber) {
              data[0].data.push([getFloat(d[valueIndexes[0]]), getFloat(d[valueIndexes[1]])]);
            }
          });
        } else {
          //only use cates to create hash
          cates.forEach(function (d, i) {
            data.push({
                name: d,
                data: []
              });
            /*
            if (config.statInfo.cateType === "string") {
              hash[d] = data[data.length - 1].data;
            } else {
              hash[i] = data[data.length - 1].data;
            }
            */
            hash[d] = data[data.length - 1].data;
          });
          matrix.forEach(function (d, i) {
            if (i < dataNumber) {
              var key = getKey(d);
              if (typeof key === 'undefined') {
                return;
              }
              hash[key].push([getValue(d, valueIndexes[0]), getValue(d, valueIndexes[1])]);
            }
          });
        }
  
        var chart = new Highcharts.Chart({
            chart: {
                renderTo: containerId,
                type: 'scatter',
                zoomType: 'xy'
            },
            title: {
                text: labelName
            },
            subtitle: {
                text: yValueName + " " + xValueName
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: xValueName
                },
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: yValueName
                }
            },
            tooltip: {
                formatter: function() {
                        return ''+
                        this.x +' , '+ this.y + ' ';
                }
            },
            legend: {
              layout: 'vertical',
              align: 'right',
              verticalAlign: 'top',
              x: -10,
              y: 100,
              borderWidth: 0
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 5,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    }
                }
            },
            series: data
          /*
            [{
                name: 'Female',
                color: 'rgba(223, 83, 83, .5)',
                data: [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6]]
    
            }, {
                name: 'Male',
                color: 'rgba(119, 152, 191, .5)',
                data: [[174.0, 65.6], [175.3, 71.8], [193.5, 80.7], [186.5, 72.6], [187.2, 78.8]]
            }]
          */
        });
      }
  
      function showParallel (config) {
        var dataNumber = config.dataNumber,
            valueIndexes = getDimension("value", config),
            valueNames = valueIndexes.map(function (d) {
              return d === -1 ? "count" : fields[d];
            });
  
        var data = [fields].concat(matrix.slice(0, dataNumber));
  
        var parallel = new Parallel(containerId, {
          width: $("#" + containerId).width() - 20,
          height: $("#" + containerId).height() - 20
        });
        parallel.setSource(data);
        parallel.chooseDimensions(valueNames);
        parallel.render();
      }
  
      function showScatterplotMatrix (config) {
        var dataNumber = config.dataNumber,
            valueIndexes = getDimension("value", config),
            valueNames = valueIndexes.map(function (d) {
              return d === -1 ? "count" : fields[d];
            });
  
        var data = [fields].concat(matrix.slice(0, dataNumber));
  
        var spm = new ScatterplotMatrix(containerId, {
          width: $("#" + containerId).width() - 20,
          height: $("#" + containerId).height() - 20,
          margin: 50
        });
        spm.setSource(data);
        spm.setDimensionsX(valueNames);
        spm.setDimensionsY(valueNames);
        spm.render();
      }
  
      view.$("#visual").empty();
      view.$("#navTabs").find("a").last().trigger("click");
      switch (newVal.type) {
        case "pie":
          if (newVal.chart === 'datav') {
            //showPie(newVal);
            showPie_highCharts(newVal);
          } else {
            showPie_highCharts(newVal);
          }
          break;
        case "line":
          showLine(newVal);
          break;
        case "area":
          showArea(newVal);
          break;
        case "bar":
          showBar(newVal);
          break;
        case "column":
          showColumn(newVal);
          break;
        case "treemap":
          showTreemap(newVal);
          break;
        case "scatter":
          showScatter(newVal);
          break;
        case "parallel":
          showParallel(newVal);
          break;
        case "scatterplotmatrix":
          showScatterplotMatrix(newVal);
          break;
        default:
          break;
      }
    });
    view.$("#table").scroll(function (e) {
      var addNumber = 100;
      var myDiv = this;
      if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
        //alert("scroll to bottom");
        var table = $(this).find("table");
        if (table.length === 0) {//none
          return;
        }
        var recentNumber = $(this).find("table")[0].rows.length - 1;
        var data = App.get('data');
        var indexes = App.get('tableFieldIndexes');
        var list = Plus.columns(data, indexes);
        var html = "";
        for (i = recentNumber, l = Math.min(list.length, recentNumber + addNumber); i < l; i++) {
          row = list[i];
          html += '<tr><td>' + (i + 1) + '</td>';
          for (j = 0, k = row.length; j < k; j++) {
            html += '<td>' + row[j] + '</td>';
          }
          html += '</tr>';
        }
        table.append($(html));
      }
    });
    $('#filterTooltip').tooltip('hide');
  });
  
  Land("aside", function (view) {
    var showData = function () {
      var indexes = [];
      view.$("input[type=checkbox]").each(function (index, value) {
        if ($(this).prop("checked")) {
          indexes.push(index);
        }
      });
      App.set("show_data", indexes);
    };
  
    //table
    //click all or none
    view.delegate("#fields a", "click", function () {
      if ($(this).html() === "显示所有列") {
        view.$("input[type=checkbox]").each(function (index, value) {
          $(this).attr("checked", true);
        });
      } else if ($(this).html() === "隐藏所有列") {
        view.$("input[type=checkbox]").each(function (index, value) {
          $(this).attr("checked", false);
        });
      }
      showData();
    });
    //click checkbox
    view.delegate("input[type=checkbox]", "click", function () {
      showData();
    });
  
    //table data config panel
    App.ready('filter_change', function (val) {
      if (val.newVal === "dataChanged") {
        var html = '<ul class="nav nav-pills"> <li><a href="#">显示所有列</a></li> <li ><a href="#">隐藏所有列</a></li> </ul>';
        html += '<ul class="unstyled">';
        var fields = App.get('fields');
        for (var i = 0, l = fields.length; i < l; i++) {
          html += '<li><label><input type="checkbox" value="' + fields[i] + '" /> ' + fields[i] + '</label></li>';
        }
        html += '</ul>';
        view.$("#fields").html(html);
        //show all
        view.$("#fields a").first().trigger("click");
      } else {
        //show prev
        showData();
      }
    });
  
    //click to show chart
    view.delegate("#config .render", "click", function (e) {
      var node = $(e.currentTarget);
      var type = view.$("#chart_type").val().toLowerCase();
      var fields = App.get('fields');
      var config = ChartConfig[type];
      var panel = view.$("#chartConfigPanel");
      var inputIsValid = true;
  
      var isStat = function () {
        //return panel.find("span.stat").length === 1;
        return panel.find("#statContent").hasClass("active");
      };
  
      var getConfigContainer = function () {
        if (!config.statistic) {
          return panel;
        } else {
          if (isStat()) {
            return panel.find("div.stat");
          } else {
            return panel.find("div.noStat");
          }
        }
      };
  
      var result = {
        "type": type,
        "dataNumber": parseInt(getConfigContainer().find(".data_number").val(), 10),
        "dimensions": [],
        "chart": node.data("type")  // hight_chart  or datav
      };
  
      /*
      var fieldHandle = function (field) {
        var container = getConfigContainer();
        var multiValue = [];
        if (config.addOption !== field) {//single option
          result[field] = parseInt(container.find("." + field).val(), 10);
        } else {//multi option
          container.find("." + field).map(function (i, d) {
                multiValue.push(parseInt($(d).val(), 10));
              });
          result[field] = multiValue; 
        }
      };
      */
  
      var fieldHandle = function (fieldDom) {
        var r = {};
        var className = $(fieldDom).attr("class").split(" ")[0];
        var statTypeVal = $(fieldDom).siblings(".stat-type").val();
        r[className] = parseInt($(fieldDom).val(), 10); 
        r.statType = statTypeVal;
        return r;
      };
  
      var getNoStatResult = function () {
        var field;
        /*
        for (var i = 0, l = config.options.length; i < l; i++) {
          fieldHandle(config.options[i]);
        }
        */
        var container = getConfigContainer();
        container.find(".field").each(function (i, d) {
          //handle field
          result.dimensions.push(fieldHandle(d));
          
        });
      };
      var getStatResult = function () {
        var field;
        var multiValue = [];
        var cateIndex, cateType;
        var indexComplicated = false;
  
        var container = getConfigContainer();
        container.find(".field").each(function (i, d) {
          //handle field
          if (i === 0) {
          //category
            if ($(d).val() === "-1") {
            //NULL
              alert("Please choose a category.");
              inputIsValid = false;
              return;
            } else {
              cateType = $.data(panel.find(".cateType")[0], "cateType");
              if (cateType === "string") {
                result.statInfo = {"cateType": "string"};
              } else {
                result.statInfo = {"cateType": "number",
                      "start": parseFloat(panel.find("input.cateConfigStart").val()),
                      "end": parseFloat(panel.find("input.cateConfigEnd").val()),
                      "step": parseFloat(panel.find("input.cateConfigStep").val())
                };
              }
            }
          }
          result.dimensions.push(fieldHandle(d));
        });
        /*
        for (var i = 0, l = config.options.length; i < l; i++) {
          field = config.options[i];
          if (field === "label") {
            //get category and category stat info
            cateIndex = parseInt(panel.find(".category").val(), 10);
            if (cateIndex === -1) {
              alert("Please choose a category.");
              inputIsValid = false;
              return;
            } else {
              fieldHandle("category");
              cateType = panel.find(".cateType").html();
              if (cateType === "string") {
                result.statInfo = {"cateType": "string"};
              } else {
                result.statInfo = {"cateType": "number",
                      "start": parseFloat(panel.find("input.cateConfigStart").val()),
                      "end": parseFloat(panel.find("input.cateConfigEnd").val()),
                      "step": parseFloat(panel.find("input.cateConfigStep").val())
                };
              }
            }
          } else {
            //get value
            fieldHandle(field);
          }
        }
        */
      };
  
      if (!isStat()) {
          result.isStat = false;
          getNoStatResult();
      } else {
          result.isStat = true;
          getStatResult();
      }
  
      if (inputIsValid) {
        App.set("show_chart", result);
      }
    });
  
    //chart type select
    view.$("#chart_type").on("change", function () {
      var type = view.$("#chart_type").val().toLowerCase();
      var visualConfig = ChartConfig[type];
      if (visualConfig) {
        visualConfig.createConfig(view.$("#chartConfigPanel"));
        view.$("#config").show();
      }
    });
  
    //chart vis config init
    App.ready("filter_change", function () {
      view.$("#chart_type").trigger("change");
    });
  
    //create single condition
    var createCondition = function () {
      var html = "";
      var fields = ["EVERY", "SOME"].concat(App.get('fields'));
      var conditions = [
        "is not",
        "is",
        "=",
        "<",
        ">",
        ">=",
        "<=",
        "contains",
        "contains ignoring case", 
        "does not contain",
        "starts with",
        "ends with",
        "in"
        ];
      var i, l;
      html += '<p><select class="filter-fields input-small">';
      fields.forEach(function (d, i) {
          html += '<option value="' + (i - 2) + '">' + d + '</option>';
          });
      html += '</select> <select class="filter-condition-type input-small">';
      conditions.forEach(function (d) {
          html += '<option value="' + d + '">' + d + '</option>';
          });
      html += '</select> <input class="filter-condition-value input-small"> <i class="icon-remove"></i> </p>';
      return html;
    };
  
    var checkValueOrNot = function () {
        var data = App.get('data');
        var fields = App.get('fields');
        var valueOrNot = [];
        if (data.length > 0) {
          valueOrNot = data[0].map(function (d) { return true; });
          data.forEach(function (d, i) {
            d.forEach(function (c, j) {
              if (!isNumberOrNull(c)) {
                valueOrNot[j] = false;
              }
            });
          });
        } else {
          valueOrNot = fields.map(function (d) { return false; });
        }
        App.set("valueOrNot", valueOrNot);
    };
  
    var initFilter = function () {
      //init filter condition
      view.$("#filterConditions").html(createCondition());
      //init state
      view.$("#filterResult").html("show <B>All Rows (" + App.get("sourceData").length + ")</B>");
      //recover data;
      App.set('data', App.get('sourceData'));
  
      //check value or not
      checkValueOrNot('init');
  
      //app set show data;
      //showData();
    };
  
    //filter
    App.ready("data_change", function () {
      if (view.$("#collapseFilterCtrl").hasClass("in")) {
        view.$("#collapseFilterCtrl").collapse("hide");
      }
      initFilter();
      //init visual config and table config
      App.set("filter_change", "dataChanged");
    });
  
    view.delegate(".icon-remove", "click", function () {
      //remove condition, if no one left, add one;
      $(this).parent().remove();
      if(view.$("#filterConditions").find("p").length === 0) {
        view.$("#filterConditions").html(createCondition());
      }
    });
  
    view.delegate("#addFilterCondition", "click", function () {
      //add condition
      view.$("#filterConditions").append($(createCondition()));
    });
  
    view.delegate("#applyFilterButton", "click", function () {
      //update data, refresh state;
      //get new data;
      var checkRow = function (row) {
        //return true if row statisfy the condition
        var flag = true;
        view.$("#filterConditions p").each(function (i, d) {
          var result;
          var field = $(this).find(".filter-fields").val();
          var condition = $(this).find(".filter-condition-type").val();
          var value = $(this).find(".filter-condition-value").val();
          var checkSingleField = function (field, condition, value) {
            var values = [];
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
          };
          
          if (field === "-2") {
            //every
            result = row.every(function (d) {
              return checkSingleField(d, condition, value);
            });
          } else if (field === "-1") {
            //some
            result = row.some(function (d) {
              return checkSingleField(d, condition, value);
            });
          } else {
            result = checkSingleField(row[field], condition, value);
          }
          if (result === false) {
            flag = false;
          }
        });//end of each condition;
        return flag;
      };
      var matrix = App.get("sourceData");
      var data = [];
      matrix.forEach(function (d, i) {
        if (checkRow(d)) {
          data.push(d);
        }
      });
      //app set new filtered data;
      App.set('data', data);
  
      //refresh state
      var str = "";
      view.$("#filterConditions p").each(function (i, d) {
        var field = $(this).find(".filter-fields>option:selected").get(0).text;
        var condition = $(this).find(".filter-condition-type").val();
        var value = $(this).find(".filter-condition-value").val();
        var values = [];
        if (condition === "in") {
          value.split(",").forEach(function (d) {
            values.push($.trim(d));
          });
          value = "('" + values.join("\', \'") + "')";
        } else if (isNumber(value)) {
          value = parseFloat(value);
        } else {
          value = "\'" + value + "\'";
        }
        str += (i === 0 ? "" : " AND ") + field + " " + condition + " " + value;
      });
      view.$("#filterResult").html("show <B>" + str + "</B>" + "&nbsp;&nbsp;<I>" + data.length + " of " + matrix.length + "</I>");
  
      //check value or not
      checkValueOrNot('filter');
  
      //show data;
      showData();
  
      //refresh visual config
      App.set("filter_change");
    });
  
    view.delegate("#clearFilterButton", "click", function () {
      initFilter();
      //init visual config and table config
      App.set("filter_change");
    });
  
  });
  
  Land("footer", function (view) {
    view.element.html("@DataV");
  });
};
