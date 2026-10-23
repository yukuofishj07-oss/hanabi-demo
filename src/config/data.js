export const DATA = {
  city: "示範市",
  islands: [
    {
      id: "island_01",
      step: "01",
      name: "01 黑色火藥配研室",
      axial: { q: 0, r: 0 },
      desc: "煙火的核心能量源！嚴格以 75% 硝酸鉀(氧化劑)、15% 松木炭粉(燃料)、10% 硫磺(助燃劑)以木臼精細研磨，此為所有發射與爆轟推力的基礎。",
      items: [
        { id: "i1_1", name: "防爆研磨臼", model: "vat", spec: "黃金配比 75:15:10", timeline: "基礎原材" },
        { id: "i1_2", name: "微粉篩分機", model: "kiln", spec: "粒度 200 目", timeline: "高純研磨" }
      ]
    },
    {
      id: "island_02",
      step: "02",
      name: "02 金屬顯色配方所",
      axial: { q: 1, r: -1 },
      desc: "煙火五彩繽紛的秘密！利用「焰色反應」配製高純度金屬鹽：碳酸鍶(純紅)、氯化鋇(翡翠綠)、氧化銅(靛藍)、草酸鈉(金黃)與碳酸鈣(亮橙)。",
      items: [
        { id: "i2_1", name: "五色金屬鹽合艙", model: "lab", spec: "光譜純度 99.8%", timeline: "光學顯色" },
        { id: "i2_2", name: "色溫光度檢驗儀", model: "tower", spec: "顯色溫 2800K", timeline: "品質標定" }
      ]
    },
    {
      id: "island_03",
      step: "03",
      name: "03 星珠滾筒造粒廠",
      axial: { q: 2, r: -1 },
      desc: "以油菜籽或小木屑為中心「星核」，在旋轉傾斜滾筒中一邊噴灑米漿澱粉糊、一邊灑上不同色階的火藥粉，逐層包覆滾成大小均勻的圓球星珠(Star)。",
      items: [
        { id: "i3_1", name: "旋轉造粒滾筒", model: "drum", spec: "同心裹層 24 層", timeline: "星珠滾製" },
        { id: "i3_2", name: "漸變多色包衣艙", model: "coater", spec: "綻放變色 3 次", timeline: "變色工藝" }
      ]
    },
    {
      id: "island_04",
      step: "04",
      name: "04 星珠溫控乾燥棚",
      axial: { q: 2, r: 0 },
      desc: "剛滾好的星珠帶有水分無法引燃。放置於純木造竹篩曬架上，以 35°C 溫和空氣通風乾燥數日，確保水分完全低於 0.5%，杜絕高空熄火啞彈。",
      items: [
        { id: "i4_1", name: "竹篩通風乾燥架", model: "shed", spec: "含水率 < 0.3%", timeline: "脫水固化" }
      ]
    },
    {
      id: "island_05",
      step: "05",
      name: "05 半球紙模壓製廠",
      axial: { q: 1, r: 1 },
      desc: "煙火彈的骨架！選用韌性極強的進口牛皮紙漿，以金屬半球模具層疊熱壓成型，製成上下兩個光滑真圓的半球紙殼(Hemisphere Shell)。",
      items: [
        { id: "i5_1", name: "半球真空熱壓模", model: "press", spec: "真圓度 99.9%", timeline: "殼體壓型" }
      ]
    },
    {
      id: "island_06",
      step: "06",
      name: "06 內膽排列填裝室",
      axial: { q: 0, r: 1 },
      desc: "考驗工匠匠心的工序！師傅沿著半球內壁由外向內精密排滿彩色星珠，中間放入棉紙包裹的「割火爆開火藥(Burst Charge)」，確保爆炸力道朝360度均勻推開。",
      items: [
        { id: "i6_1", name: "同心圓星珠排列台", model: "bench", spec: "星珠排布 360 顆", timeline: "精密排列" },
        { id: "i6_2", name: "割火藥定量灌裝器", model: "vat", spec: "爆破均勻度 100%", timeline: "核心割藥" }
      ]
    },
    {
      id: "island_07",
      step: "07",
      name: "07 雙半球扣合縫緊",
      axial: { q: -1, r: 1 },
      desc: "將填裝完畢的上下兩個半球彈殼嚴密合攏，中央穿入定時延遲導火管，接縫處以高強度黃麻線與棉紙黏膠緊密鎖死，合體成完整的球形花火玉。",
      items: [
        { id: "i7_1", name: "赤道合縫鎖口夾", model: "press", spec: "氣密接合度 100%", timeline: "彈體合璧" }
      ]
    },
    {
      id: "island_08",
      step: "08",
      name: "08 經緯多層紙帶糊緊",
      axial: { q: -1, r: 0 },
      desc: "「玉張(Tama-bari)」關鍵工藝！以手工或機械交叉纏繞數十層牛皮紙條，刷上天然小麥澱粉膠，緊紮成堅不可摧的硬球，唯有如此才能蓄積瞬間數千磅的高空爆炸膛壓！",
      items: [
        { id: "i8_1", name: "經緯自動纏帶機", model: "winder", spec: "交叉纏繞 48 層", timeline: "極限膛壓" }
      ]
    },
    {
      id: "island_09",
      step: "09",
      name: "09 底部升空推進藥組",
      axial: { q: -2, r: 0 },
      desc: "花火升空的火箭底座！在圓球彈體底端膠合盛裝定額顆粒黑火藥的紙錐杯，並連接通往砲底的快速發射引信，提供直沖 200 米高空的驚人推力。",
      items: [
        { id: "i9_1", name: "推進底杯膠合槽", model: "hopper", spec: "升空初速 160m/s", timeline: "升空動能" }
      ]
    },
    {
      id: "island_10",
      step: "10",
      name: "10 X光無損安全探傷",
      axial: { q: -2, r: 1 },
      desc: "安全是煙火工藝的鐵律！出廠前以醫療級 X 射線對整顆球體 360 度斷層透視，確認內部星珠完全對稱、無任何空泡鬆動或引信鬆脫，保證零膛炸。",
      items: [
        { id: "i10_1", name: "全息射線掃描艙", model: "scanner", spec: "空洞檢測 0 容忍", timeline: "全檢出廠" }
      ]
    },
    {
      id: "island_11",
      step: "11",
      name: "11 防潮封箱與運送",
      axial: { q: -1, r: -1 },
      desc: "將合格尺玉以防靜電鋁箔充氮抽真空密封，安置於防震耐撞杉木防爆箱中，安全送往臨海的迫擊砲發射陣地。",
      items: [
        { id: "i11_1", name: "充氮真空熱封艙", model: "boxer", spec: "氣密等級 IP68", timeline: "防潮運輸" }
      ]
    },
    {
      id: "island_12",
      step: "12",
      name: "12 迫擊砲陣地施放",
      axial: { q: 0, r: -1 },
      desc: "盛典的終章！將 10 吋(尺玉)彈裝入厚壁合金迫擊砲筒，由雙層觀禮指揮塔以電子微秒級脈衝點火，花火如金龍升天，在夜空中化作直徑 300 公尺的璀璨星河！",
      items: [
        { id: "i12_1", name: "10吋尺玉發射鋼砲", model: "mortar", spec: "展開直徑 320m", timeline: "盛典綻放" },
        { id: "i12_2", name: "電子脈衝點火台", model: "tower", spec: "同步誤差 < 1ms", timeline: "精準控制" }
      ]
    }
  ],
  flowLines: [
    { from: "island_01", to: "island_03", material: "純化黑火藥", cargo: "火藥研磨桶", color: 0x444444 },
    { from: "island_02", to: "island_03", material: "五色金屬顯色鹽", cargo: "顯色藥劑箱", color: 0xe74c3c },
    { from: "island_03", to: "island_04", material: "剛滾好的濕星珠", cargo: "星珠竹篩曬盤", color: 0xf39c12 },
    { from: "island_05", to: "island_06", material: "成型半球牛皮紙殼", cargo: "半球模壓紙殼", color: 0xd35400 },
    { from: "island_04", to: "island_06", material: "乾燥完成彩色星珠", cargo: "乾燥星珠木盒", color: 0x2ecc71 },
    { from: "island_06", to: "island_07", material: "已排列星珠的半球", cargo: "星珠內膽半球", color: 0x9b59b6 },
    { from: "island_07", to: "island_08", material: "合縫完成的花火玉", cargo: "合縫球體彈", color: 0x34495e },
    { from: "island_08", to: "island_09", material: "纏緊48層的高壓玉", cargo: "玉張高壓彈體", color: 0xe67e22 },
    { from: "island_09", to: "island_10", material: "加裝發射底杯之成品", cargo: "帶底座花火彈", color: 0x1abc9c },
    { from: "island_10", to: "island_11", material: "探傷合格之安心彈", cargo: "安全檢驗合格品", color: 0x27ae60 },
    { from: "island_11", to: "island_12", material: "木箱密封花火彈", cargo: "發射陣地裝填彈", color: 0xc0392b }
  ]
};
