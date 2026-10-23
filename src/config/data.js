export const DATA = {
  city: "示範市",
  islands: [
    {
      id: "island_01",
      step: "01",
      name: "01 黑火藥配研室",
      axial: { q: -4, r: -1 },
      desc: "煙火的能量心臟！按 75% 硝酸鉀(氧化劑)、15% 松木炭粉(燃料)、10% 硫磺(助燃劑)黃金配比在防爆木臼中精密研磨，為整座花火島提供起爆動能基石。",
      items: [
        { id: "i1_1", name: "防爆研磨臼", model: "vat", spec: "黃金配比 75:15:10", timeline: "基底原材" },
        { id: "i1_2", name: "微粉篩分機", model: "kiln", spec: "細度 200 目", timeline: "精細研磨" }
      ]
    },
    {
      id: "island_02",
      step: "02",
      name: "02 金屬顯色配方所",
      axial: { q: -2, r: -1 },
      desc: "夜空繽紛的秘密！利用焰色反應配製高純化合物：鍶鹽(烈焰紅)、鋇鹽(翡翠綠)、銅鹽(深邃藍)、鈉鹽(純黃金)與鈣鹽(亮澄)，調配專屬色譜。",
      items: [
        { id: "i2_1", name: "五色金屬鹽合艙", model: "lab", spec: "光譜純度 99.8%", timeline: "光學配色" },
        { id: "i2_2", name: "色溫光度檢驗儀", model: "tower", spec: "顯色溫 2800K", timeline: "光譜校正" }
      ]
    },
    {
      id: "island_03",
      step: "03",
      name: "03 星珠滾筒造粒廠",
      axial: { q: 0, r: -1 },
      desc: "以油菜籽為中心星核，在傾斜旋轉滾筒中一層噴米漿澱粉糊、一層灑色火藥粉，反覆滾製出大小均勻且具備多層變色特性的同心圓彩珠。",
      items: [
        { id: "i3_1", name: "傾斜旋轉造粒滾筒", model: "drum", spec: "同心滾製 24 層", timeline: "造粒成型" },
        { id: "i3_2", name: "漸變多色包衣艙", model: "coater", spec: "色階變換 3 次", timeline: "變色工藝" }
      ]
    },
    {
      id: "island_04",
      step: "04",
      name: "04 星珠陽光乾燥棚",
      axial: { q: 2, r: -1 },
      desc: "剛滾好的星珠帶有水分。平鋪於天然竹篩架，以 35°C 溫風循環乾燥，嚴格控制含水率低於 0.3%，杜絕任何高空熄火啞彈危險。",
      items: [
        { id: "i4_1", name: "竹篩通風乾燥棚", model: "shed", spec: "含水率 < 0.3%", timeline: "乾燥固化" }
      ]
    },
    {
      id: "island_05",
      step: "05",
      name: "05 半球紙模壓製廠",
      axial: { q: 3, r: 0 },
      desc: "煙火外彈骨架！以韌性極強的進口牛皮紙漿，經高精度真空熱壓模具多層加壓，成型為光滑真圓的半球紙殼，支撐瞬間爆炸氣壓。",
      items: [
        { id: "i5_1", name: "半球真空熱壓模", model: "press", spec: "圓度誤差 < 0.1mm", timeline: "紙殼模壓" }
      ]
    },
    {
      id: "island_06",
      step: "06",
      name: "06 內膽排列填裝室",
      axial: { q: 1, r: 1 },
      desc: "工藝核心！師傅將彩色星珠沿著半球紙殼內壁由外向內精密排列成同心圓，正中央放入棉紙包裹的「割火炸藥包」，保證 360 度均勻炸開成正圓。",
      items: [
        { id: "i6_1", name: "同心圓星珠排列台", model: "bench", spec: "排布 360 顆星珠", timeline: "匠心排列" },
        { id: "i6_2", name: "割火藥定量灌裝器", model: "vat", spec: "均勻爆壓 100%", timeline: "割藥充填" }
      ]
    },
    {
      id: "island_07",
      step: "07",
      name: "07 經緯紙帶糊緊工坊",
      axial: { q: -1, r: 1 },
      desc: "日本花火關鍵古法「玉張(Tama-bari)」！將上下半球合攏後，交叉纏繞 48 道牛皮紙條並刷上小麥澱粉糊，為彈體賦予承受數千磅極限膛壓的張力。",
      items: [
        { id: "i7_1", name: "經緯張力纏帶機", model: "winder", spec: "交叉纏繞 48 疊層", timeline: "極限膛壓" }
      ]
    },
    {
      id: "island_08",
      step: "08",
      name: "08 底部升空推藥組",
      axial: { q: -3, r: 1 },
      desc: "火箭助推底座！在圓球彈體底端膠合盛裝定額顆粒黑火藥的紙錐杯，並連接通往砲筒底部的快速發射引信，給予直沖 200 米高空的驚人初速。",
      items: [
        { id: "i8_1", name: "推進底杯膠合槽", model: "hopper", spec: "升空初速 160m/s", timeline: "升空推力" }
      ]
    },
    {
      id: "island_09",
      step: "09",
      name: "09 X光安全探傷站",
      axial: { q: -2, r: 2 },
      desc: "出廠前最嚴苛安檢！以醫療級 X 射線進行 360 度斷層透視，確認內部星珠對稱、引信牢固、無任何空泡鬆動，實現零膛炸、零隱患出廠。",
      items: [
        { id: "i9_1", name: "全息射線探傷艙", model: "scanner", spec: "空洞瑕疵 0 容忍", timeline: "安全全檢" }
      ]
    },
    {
      id: "island_10",
      step: "10",
      name: "10 迫擊鋼砲盛典陣地",
      axial: { q: 0, r: 2 },
      desc: "盛典終章！將 10 吋(尺玉)花火裝入厚壁合金鋼迫擊砲筒，微秒級電子脈衝點火，花火如金龍沖天，在夜空中綻放直徑 300 公尺的璀璨花海！",
      items: [
        { id: "i10_1", name: "10吋尺玉合金砲筒", model: "mortar", spec: "展開直徑 320m", timeline: "高空盛典" },
        { id: "i10_2", name: "電子脈衝點火台", model: "tower", spec: "同步誤差 < 1ms", timeline: "智能發射" }
      ]
    }
  ],
  flowLines: [
    { from: "island_01", to: "island_02", material: "基底黑火藥" },
    { from: "island_02", to: "island_03", material: "顯色金屬鹽" },
    { from: "island_03", to: "island_04", material: "剛滾好之星珠" },
    { from: "island_04", to: "island_05", material: "乾燥硬化星珠" },
    { from: "island_05", to: "island_06", material: "模壓真圓紙殼" },
    { from: "island_06", to: "island_07", material: "填裝內膽球體" },
    { from: "island_07", to: "island_08", material: "玉張糊緊球體" },
    { from: "island_08", to: "island_09", material: "帶底座花火彈" },
    { from: "island_09", to: "island_10", material: "安檢合格成品彈" }
  ]
};
