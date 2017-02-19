可视化图表操作说明：
================

1. [pie](#pie)(饼图)
2. [line](#line)(线图)
3. [area](#area)(面积图)
4. [bar](#bar)(横向柱状图)
5. [column](#column)(纵向柱状图)
6. [treemap](#treemap)(树图)
7. [scatter](#scatter)(散点图)
8. [scatterplotMatrix](#scatterplotMatrix)(散点矩阵)
9. [parallel](#parallel)(平行坐标轴)


### <a id="pie">pie(饼图)</a>
    "pie": {
      type: "Pie",
      statistic: true,
      options: ["label", "value"],
      createConfig: createVisConfig("static")
    }
pie支持统计模式，选项数确定。

在默认模式下有两个必选项：label和value。lable（标签）指定数据项的名称，用于在图中标示每个扇形的名称，value指定数据项的值，用于确定每个扇形的大小。value必须为数字，缺值为0(datav)或null(hight charts)。为这两个必选项指定好相应的列，就能显示了。

在统计模式下也有label和value两个选项。但是会根据label的取值情况进行不同的统计。如果label为数字，用户可以划分数值区间，对各区间进行统计。如果label为字符，那么字符相同的label会合并，对各不同字符进行统计。  若某行value缺值，则设为0。label为数字时，若某行的label缺值，则忽略该行。

### <a id="line">line(线图)</a>
    "line": {
      type: "Line",
      statistic: true,
      options: ["label", "value"],
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    }
line支持统计模式，选项数可变。

在默认模式下有两个必选项：label和value。value项的数量可以增加。lable（标签）指定图形中横坐标轴的名称。value指定一条线上各个点的值，多个value项代表了多条线。value必须为数字，缺值为null(hightCharts)。

在统计模式下，会根据label的取值情况进行不同的统计。如果label为数字，用户可以划分数值区间，对各区间进行统计。如果label为字符，那么字符相同的label会合并，对各不同字符进行统计。绘图时不同区间或者不同字符串作为横坐标，每个value在不同区间或者不同字符串上的统计值作为一条线上各个点的值。  若某行value缺值，则设为0。label为数字时，若某行的label缺值，则忽略该行。

### <a id="area">area(面积图)</a>
    "area": {
      type: "Area",
      statistic: true,
      options: ["label", "value"],
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    }
area的操作逻辑和[line](#line)完全一样，只是显示效果有差异，area会将线下面的区域着色。

### <a id="bar">bar(横向柱状图)</a>
    "bar": {
      type: "Bar",
      statistic: true,
      options: ["label", "value"],
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    }
bar的操作逻辑和[line](#line)完全一样，只是显示效果有差异。

### <a id="column">column(柱状图)</a>
    "column": {
      type: "Column",
      statistic: true,
      options: ["label", "value"],
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    }
column的操作逻辑和[line](#line)完全一样，只是显示效果有差异。

### <a id="treemap">treemap(树图)</a>
    "treemap": {
      type: "Treemap",
      statistic: true,
      options: ["label", "value"],
      createConfig: createVisConfig("static")
    }
treemap的操作逻辑和[pie](#pie)完全一样，只是显示效果有差异。treemap用矩形面积来衡量占比的大小。

### <a id="scatter">scatter(散点图)</a>
    "scatter": {
      type: "Scatter",
      statistic: true,
      options: ["label", "x_value", "y_value"],
      createConfig: createVisConfig("static")
    }
scatter支持统计模式，选项数确定。

在默认模式下有三个必选项：label、x_value和y_avlue。lable（标签）用于标示图中每个点的名称，x_value指定横坐标。y_value指定纵坐标。x_value和y_value必须为数字，缺值为0(hightCharts)。为这三个必选项指定好相应的列，就能绘制散点图了。

在统计模式下选项相同。其实只是用点的颜色来多显示类别信息。但是会根据label的取值情况进行不同的归类。如果label为数字，用户可以划分数值区间，相同区间的点归为一类。如果label为字符，那么label字符相同的点会归为一类。同一类的点会显示成同一种颜色和形状。  若某行value缺值，则设为0。label为数字时，若某行的label缺值，则忽略该行。

### <a id="scatterplotMatrix">scatterplotMatrix(散点矩阵)</a>
    "scatterplotmatrix": {
      type: "ScatterplotMatrix",
      options: ["value", "value"],
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    }
scatterplotMatrix不支持统计模式，选项数可变。

在默认模式下有两个必选项：两个value。value项的数量还可以增加。value必须为数字。任意两个value指定了坐标系的x轴和y轴，可绘制一个scatter图。多个scatter图形成了一个散点图矩阵，并提供交互。

### <a id="parallel">parallel(平行坐标轴)</a>
    "parallel": {
      type: "Parallel",
      options: ["value", "value"],
      addOption: "value",
      createConfig: createVisConfig("dynamic")
    }
parallel不支持统计模式，选项数可变。

在默认模式下有两个必选项：两个value。value项的数量还可以增加。value可以为数字或字符串。每个value绘制一个坐标轴，用户可以通过拖选查看任意坐标区间内的数据分布情况。

