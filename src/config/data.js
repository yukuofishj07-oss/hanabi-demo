export const DATA = {
  city: "示範市",
  islands: [
    {
      id: "island_01",
      name: "01 原料精煉所",
      axial: { q: 0, r: 0 },
      desc: "純化特選硫磺、高純硝石與多孔松木炭，為整座花火島鍛造最穩定的能量核心。",
      items: [
        { id: "i1_1", name: "硝石提純槽", model: "vat", spec: "純度 99.8%", timeline: "基礎期" },
        { id: "i1_2", name: "松炭封閉窯", model: "kiln", spec: "孔隙率 82%", timeline: "基礎期" }
      ]
    },
    {
      id: "island_02",
      name: "02 光學顯色所",
      axial: { q: 1, r: -1 },
      desc: "配製鍶紅、鋇綠、銅藍與鈉黃等金屬化合物，決定夜空綻放的花火色溫與色純度。",
      items: [
        { id: "i2_1", name: "金屬鹽合成艙", model: "lab", spec: "5 階極限色", timeline: "研發期" },
        { id: "i2_2", name: "微光比色塔", model: "tower", spec: "2800K 光溫", timeline: "常態期" }
      ]
    },
    {
      id: "island_03",
      name: "03 星體造粒廠",
      axial: { q: 2, r: -1 },
      desc: "濕法混藥後在滾筒中進行數十層均勻包衣，培育出層次分明、同心變色的微粒星體。",
      items: [
        { id: "i3_1", name: "雙筒旋轉造粒機", model: "drum", spec: "粒徑 3-12mm", timeline: "量產期" },
        { id: "i3_2", name: "三態漸變包衣艙", model: "coater", spec: "色階切換 3 次", timeline: "核心期" }
      ]
    },
    {
      id: "island_04",
      name: "04 低溫乾燥棚",
      axial: { q: 2, r: 0 },
      desc: "溫控通風循環系統，嚴格剔除星珠多餘水分，確保零受潮、零啞彈的起爆可靠度。",
      items: [
        { id: "i4_1", name: "無菌溫控乾燥架", model: "shed", spec: "濕度 < 35%", timeline: "品管期" }
      ]
    },
    {
      id: "island_05",
      name: "05 半球紙殼壓製",
      axial: { q: 1, r: 1 },
      desc: "高拉力牛皮紙漿層壓成型，製造均勻耐壓的半球形外殼，支撐核心爆轟氣壓。",
      items: [
        { id: "i5_1", name: "紙漿真空熱壓機", model: "press", spec: "壁厚 4.5mm", timeline: "量產期" }
      ]
    },
    {
      id: "island_06",
      name: "06 彈體裝配室",
      axial: { q: 0, r: 1 },
      desc: "工藝師手作同心圓排列星珠，填入精確克數的中心割火爆藥與延遲傳火管。",
      items: [
        { id: "i6_1", name: "手工星珠排列台", model: "bench", spec: "真圓度 99.6%", timeline: "工藝期" },
        { id: "i6_2", name: "割火藥定量填裝槽", model: "vat", spec: "均勻度 100%", timeline: "核心期" }
      ]
    },
    {
      id: "island_07",
      name: "07 紙帶糊緊工坊",
      axial: { q: -1, r: 1 },
      desc: "天然米膠糊敷與交叉緊密經緯纏繞 36 疊層，為花火賦予飽滿的高空展開張力。",
      items: [
        { id: "i7_1", name: "十字經緯纏帶機", model: "winder", spec: "拉力 850N", timeline: "工藝期" }
      ]
    },
    {
      id: "island_08",
      name: "08 升空推進底合",
      axial: { q: -1, r: 0 },
      desc: "加裝底部升空黑火藥杯與高精度延遲引信，給予花火彈升空百米的充沛初速。",
      items: [
        { id: "i8_1", name: "推進底杯壓裝台", model: "hopper", spec: "初速 145m/s", timeline: "組裝期" }
      ]
    },
    {
      id: "island_09",
      name: "09 X光安全探傷",
      axial: { q: -2, r: 0 },
      desc: "全方位斷層掃描彈體內部，檢測是否有空泡、裂隙或重心偏差，杜絕安全隱患。",
      items: [
        { id: "i9_1", name: "全息射線探傷機", model: "scanner", spec: "通關率 100%", timeline: "安檢期" }
      ]
    },
    {
      id: "island_10",
      name: "10 防潮充氮封箱",
      axial: { q: -2, r: 1 },
      desc: "抽真空充氮熱封，安放於減震抗衝擊木箱，確保海空運送過程穩定無損。",
      items: [
        { id: "i10_1", name: "抗靜電充氮密封艙", model: "boxer", spec: "防水 IP68", timeline: "出廠期" }
      ]
    },
    {
      id: "island_11",
      name: "11 迫擊砲施放陣地",
      axial: { q: -1, r: -1 },
      desc: "鋼構迫擊砲台與連發箱架陣列，承接組裝完成的菊錦尺玉，準備綻放夜空。",
      items: [
        { id: "i11_1", name: "10吋尺玉垂直鋼砲", model: "mortar", spec: "仰角 89°", timeline: "施放期" },
        { id: "i11_2", name: "32連發速射排架", model: "mortar_multi", spec: "間隔 0.2s", timeline: "盛典期" }
      ]
    },
    {
      id: "island_12",
      name: "12 觀禮與指揮塔",
      axial: { q: 0, r: -1 },
      desc: "雙層木造觀景樓，配備氣象風向測候儀與毫秒級電子編程點火陣列主控台。",
      items: [
        { id: "i12_1", name: "編程電子點火中樞", model: "tower", spec: "同步誤差 < 3ms", timeline: "指揮期" }
      ]
    }
  ],
  // 真實協作線與搬運工種定義
  flowLines: [
    { from: "island_01", to: "island_03", material: "純化黑火藥", cargo: "火藥桶", color: 0x444444 },
    { from: "island_02", to: "island_03", material: "五彩金屬鹽", cargo: "顯色藥箱", color: 0xe74c3c },
    { from: "island_03", to: "island_04", material: "濕式星珠", cargo: "星體曬盤", color: 0xf39c12 },
    { from: "island_05", to: "island_06", material: "半球牛皮紙殼", cargo: "模壓紙殼", color: 0xd35400 },
    { from: "island_04", to: "island_06", material: "乾燥星體", cargo: "乾燥星盒", color: 0x2ecc71 },
    { from: "island_06", to: "island_07", material: "半成品彈體", cargo: "裸裝花火球", color: 0x9b59b6 },
    { from: "island_07", to: "island_08", material: "紮緊球體", cargo: "糊緊彈體", color: 0x34495e },
    { from: "island_08", to: "island_09", material: "組裝完成彈", cargo: "帶底座花火彈", color: 0xe67e22 },
    { from: "island_09", to: "island_10", material: "安檢合格彈", cargo: "防爆合格品", color: 0x1abc9c },
    { from: "island_10", to: "island_11", material: "成品花火箱", cargo: "密封花火箱", color: 0xc0392b }
  ]
};
