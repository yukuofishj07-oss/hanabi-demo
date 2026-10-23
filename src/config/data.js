export const DATA = {
  city: "示範市",
  islands: [
    {
      id: "island_01",
      name: "01 原料精煉所",
      axial: { q: 0, r: 0 },
      desc: "純化硝酸鉀、硫磺與精選松木炭，為基礎發射與星體打底。",
      items: [
        { id: "i1_1", name: "硝石提純槽", model: "vat", spec: "純度 99.8%", timeline: "第 1 年" },
        { id: "i1_2", name: "松木炭窯", model: "kiln", spec: "孔隙率 82%", timeline: "第 1 年" }
      ]
    },
    {
      id: "island_02",
      name: "02 光學配色所",
      axial: { q: 1, r: -1 },
      desc: "配製鍶紅、鋇綠、銅藍與鈉黃等燃燒發色金屬鹽類。",
      items: [
        { id: "i2_1", name: "金屬鹽合成艙", model: "lab", spec: "5 階光譜色", timeline: "第 1 年" },
        { id: "i2_2", name: "色溫光度儀", model: "tower", spec: "2800K 光溫", timeline: "第 2 年" }
      ]
    },
    {
      id: "island_03",
      name: "03 星體造粒廠",
      axial: { q: 2, r: -1 },
      desc: "濕法混藥後在滾筒中逐層滾裹，形成均勻同心球星體。",
      items: [
        { id: "i3_1", name: "滾筒造粒機", model: "drum", spec: "粒徑 3-12mm", timeline: "第 1 年" },
        { id: "i3_2", name: "多層同心包衣機", model: "coater", spec: "變色 3 次", timeline: "第 2 年" }
      ]
    },
    {
      id: "island_04",
      name: "04 低溫乾燥棚",
      axial: { q: 2, r: 0 },
      desc: "嚴格控制恆溫微風流動，排除水分以防啞彈。",
      items: [
        { id: "i4_1", name: "通風乾燥棚架", model: "shed", spec: "濕度 < 40%", timeline: "第 1 年" }
      ]
    },
    {
      id: "island_05",
      name: "05 半球紙殼壓製",
      axial: { q: 1, r: 1 },
      desc: "厚磅牛皮紙漿層疊加壓，成型為精密半球形外殼。",
      items: [
        { id: "i5_1", name: "紙漿熱壓機", model: "press", spec: "厚度 4.5mm", timeline: "第 1 年" }
      ]
    },
    {
      id: "island_06",
      name: "06 彈體裝配室",
      axial: { q: 0, r: 1 },
      desc: "排列彩色星體、填充割火藥包並嵌入中心傳火管。",
      items: [
        { id: "i6_1", name: "手工星體排列台", model: "bench", spec: "同心度 99%", timeline: "第 2 年" },
        { id: "i6_2", name: "割火藥包填裝器", model: "vat", spec: "均勻爆壓", timeline: "第 2 年" }
      ]
    },
    {
      id: "island_07",
      name: "07 紙帶糊緊工坊",
      axial: { q: -1, r: 1 },
      desc: "以天然米膠均勻纏繞數十層牛皮紙帶，提供關鍵引爆膛壓。",
      items: [
        { id: "i7_1", name: "十字經緯纏帶機", model: "winder", spec: "纏繞 36 層", timeline: "第 2 年" }
      ]
    },
    {
      id: "island_08",
      name: "08 發射藥底合",
      axial: { q: -1, r: 0 },
      desc: "安裝底部提升發射藥包與快速時間導火引信。",
      items: [
        { id: "i8_1", name: "定額發射藥杯", model: "hopper", spec: "初速 140m/s", timeline: "第 2 年" }
      ]
    },
    {
      id: "island_09",
      name: "09 X光安全探傷",
      axial: { q: -2, r: 0 },
      desc: "以穿透影像檢驗球體內部有無孔隙裂縫，杜絕膛炸危險。",
      items: [
        { id: "i9_1", name: "全息射線檢測儀", model: "scanner", spec: "瑕疵率 0%", timeline: "第 3 年" }
      ]
    },
    {
      id: "island_10",
      name: "10 防潮氣密包裝",
      axial: { q: -2, r: 1 },
      desc: "抗靜電鋁箔抽真空封裝，置入減震木箱完成出廠。",
      items: [
        { id: "i10_1", name: "氣密真空壓合艙", model: "boxer", spec: "IP68 防水", timeline: "第 3 年" }
      ]
    },
    {
      id: "island_11",
      name: "11 迫擊砲施放陣地",
      axial: { q: -1, r: -1 },
      desc: "排布鋼製迫擊砲筒群，承接來自全島組裝完畢的花火彈。",
      items: [
        { id: "i11_1", name: "10吋尺玉發射筒", model: "mortar", spec: "仰角 88°", timeline: "第 4 年" },
        { id: "i11_2", name: "連發速射箱架", model: "mortar_multi", spec: "32 發連射", timeline: "第 4 年" }
      ]
    },
    {
      id: "island_12",
      name: "12 觀覽與指揮塔",
      axial: { q: 0, r: -1 },
      desc: "氣象風向監測與電子點火中樞，俯瞰全海域施放盛況。",
      items: [
        { id: "i12_1", name: "電子點火控制台", model: "tower", spec: "毫秒級同步", timeline: "第 4 年" }
      ]
    }
  ]
};
