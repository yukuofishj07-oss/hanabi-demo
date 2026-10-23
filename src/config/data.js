export const DATA = {
  city: "示範市",
  islands: [
    {
      id: "island_01",
      name: "01 原料精煉所",
      axial: { q: 0, r: 0 },
      desc: "純化高規格硫磺、硝酸鉀與特級松木炭，構築全島火藥動能磐石。",
      items: [
        { id: "i1_1", name: "硝石提純槽", model: "vat", spec: "純度 99.8%", timeline: "基礎期" },
        { id: "i1_2", name: "松木炭烘窯", model: "kiln", spec: "孔隙率 82%", timeline: "基礎期" }
      ]
    },
    {
      id: "island_02",
      name: "02 光學配色所",
      axial: { q: 1, r: -1 },
      desc: "調製鍶紅、鋇綠、銅藍與鈉黃等金屬化合物，決定煙火夜空綻放色階譜系。",
      items: [
        { id: "i2_1", name: "金屬鹽合成艙", model: "lab", spec: "5 階極限色", timeline: "研發期" },
        { id: "i2_2", name: "微光光度儀", model: "tower", spec: "2800K 色溫", timeline: "常態期" }
      ]
    },
    {
      id: "island_03",
      name: "03 星體造粒廠",
      axial: { q: 2, r: -1 },
      desc: "以旋轉滾筒進行數十層精細包衣裹覆，培育出色彩隨引爆時序變化的星珠。",
      items: [
        { id: "i3_1", name: "滾筒造粒機", model: "drum", spec: "粒徑 3-12mm", timeline: "量產期" },
        { id: "i3_2", name: "變色包衣艙", model: "coater", spec: "3 次漸變", timeline: "核心期" }
      ]
    },
    {
      id: "island_04",
      name: "04 低溫乾燥棚",
      axial: { q: 2, r: 0 },
      desc: "導入恆溫風道輕柔脫水，確保星珠含水率在極限值以下，杜絕高空啞彈。",
      items: [
        { id: "i4_1", name: "通風乾燥棚架", model: "shed", spec: "濕度 < 35%", timeline: "品管期" }
      ]
    },
    {
      id: "island_05",
      name: "05 半球紙殼壓製",
      axial: { q: 1, r: 1 },
      desc: "進口高強度牛皮紙漿層壓成型，打造可耐受微型爆炸膛壓的真圓彈殼。",
      items: [
        { id: "i5_1", name: "紙漿熱壓成型機", model: "press", spec: "壁厚 4.5mm", timeline: "量產期" }
      ]
    },
    {
      id: "island_06",
      name: "06 彈體裝配室",
      axial: { q: 0, r: 1 },
      desc: "工藝師以同心圓將數百顆星珠精密排布於內膽，正中央注入割火炸藥包。",
      items: [
        { id: "i6_1", name: "手工星珠排列台", model: "bench", spec: "同心度 99.5%", timeline: "工藝期" },
        { id: "i6_2", name: "割火藥量化罐", model: "vat", spec: "充填 220g", timeline: "核心期" }
      ]
    },
    {
      id: "island_07",
      name: "07 紙帶糊緊工坊",
      axial: { q: -1, r: 1 },
      desc: "以經緯交叉模式拉緊纏繞數十道牛皮膠帶，決定花火於高空爆開時的圓形度與張力。",
      items: [
        { id: "i7_1", name: "經緯張力纏帶機", model: "winder", spec: "交叉 36 疊層", timeline: "工藝期" }
      ]
    },
    {
      id: "island_08",
      name: "08 升空發射底座",
      axial: { q: -1, r: 0 },
      desc: "在球體底端接合升空黑火藥杯與精準延遲時間引信，提供直沖百米高空的推力。",
      items: [
        { id: "i8_1", name: "升空藥杯膠合台", model: "hopper", spec: "升空速度 150m/s", timeline: "組裝期" }
      ]
    },
    {
      id: "island_09",
      name: "09 X光安全探傷",
      axial: { q: -2, r: 0 },
      desc: "透過全方位 X 射線透視彈體，全面剔除內部任何空洞、裂隙與重心偏移。",
      items: [
        { id: "i9_1", name: "全息射線檢驗機", model: "scanner", spec: "探傷合格 100%", timeline: "安檢期" }
      ]
    },
    {
      id: "island_10",
      name: "10 防潮氣密封箱",
      axial: { q: -2, r: 1 },
      desc: "以防靜電鋁箔充氮熱封，安放於減震抗撞木箱內，確保陸海運輸安全。",
      items: [
        { id: "i10_1", name: "抗靜電充氮包裝機", model: "boxer", spec: "氣密度 IP68", timeline: "出貨期" }
      ]
    },
    {
      id: "island_11",
      name: "11 迫擊砲施放陣地",
      axial: { q: -1, r: -1 },
      desc: "海岸防爆鋼構迫擊砲台，涵蓋 6 吋牡丹、10 吋錦冠尺玉到多發速射箱架。",
      items: [
        { id: "i11_1", name: "10吋尺玉鋼砲筒", model: "mortar", spec: "垂直仰角 89°", timeline: "施放期" },
        { id: "i11_2", name: "32連發矩陣排架", model: "mortar_multi", spec: "連射間隔 0.2s", timeline: "盛典期" }
      ]
    },
    {
      id: "island_12",
      name: "12 觀禮與指揮塔",
      axial: { q: 0, r: -1 },
      desc: "雙層木造全景觀禮樓，內建即時氣象風速風向儀與毫秒級電子編程點火系統。",
      items: [
        { id: "i12_1", name: "編程電子點火中樞", model: "tower", spec: "同步誤差 < 5ms", timeline: "指揮期" }
      ]
    }
  ],
  // 輸送物料流動路線 (from island -> to island)
  flowLines: [
    { from: "island_01", to: "island_03", material: "純化黑火藥", color: 0x333333 },
    { from: "island_02", to: "island_03", material: "五彩金屬鹽", color: 0xe74c3c },
    { from: "island_03", to: "island_04", material: "濕式星珠", color: 0xf39c12 },
    { from: "island_05", to: "island_06", material: "半球牛皮紙殼", color: 0xd35400 },
    { from: "island_04", to: "island_06", material: "乾燥星體", color: 0x2ecc71 },
    { from: "island_06", to: "island_07", material: "半成品彈體", color: 0x9b59b6 },
    { from: "island_07", to: "island_08", material: "紮緊球體", color: 0x34495e },
    { from: "island_08", to: "island_09", material: "組裝完成彈", color: 0xe67e22 },
    { from: "island_09", to: "island_10", material: "安檢合格彈", color: 0x1abc9c },
    { from: "island_10", to: "island_11", material: "成品花火箱", color: 0xc0392b }
  ]
};
