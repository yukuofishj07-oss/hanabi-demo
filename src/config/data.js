export const DATA = {
  city: "花火工藝島",
  islands: [
    // 第一排 (後排 r = -1，由左至右直線：01 -> 02 -> 03 -> 04)
    {
      id: "isl_01",
      num: "01",
      name: "火藥配研",
      enName: "Black Powder Mill",
      axial: { q: -1, r: -1 },
      color: 0xdb6a41,
      pattern: "brick",
      treeType: "pine",
      mainModel: "mill_hall",
      summary: "花火動能之源：依循 75:15:10 黃金化學比例，於恆濕防爆木臼工坊中精密研磨硝酸鉀、松木炭與昇華硫磺。",
      items: [
        { id: "i01_1", name: "水車無靜電木臼", model: "watermill", desc: "利用水力驅動雙木杵交替舂搗，徹底杜絕金屬摩擦火花。", facts: ["配比 75:15:10", "轉速 45 RPM", "零靜電認證 100%"], phase: "第 1 階段" },
        { id: "i01_2", name: "200目微粉篩分室", model: "sieve_shed", desc: "多層絲網震動過篩，確保火藥粉末細如絲絨、燃速一致。", facts: ["篩網 200 目", "粒徑 < 0.07mm", "均勻度 99.8%"], phase: "第 1 階段" },
        { id: "i01_3", name: "赤松木炭窯", model: "kiln", desc: "精選山林赤松以古法悶燒，燒製高孔隙率活性木炭。", facts: ["悶燒 72 小時", "孔隙率 85%"], phase: "第 1 階段" },
        { id: "i01_4", name: "配研計量天平", model: "symbol_scale", desc: "精密校準氧化劑與助燃劑克數之標準度量衡器。", facts: ["精度 ±0.01g", "日產能 450kg"], phase: "第 1 階段" }
      ]
    },
    {
      id: "isl_02",
      num: "02",
      name: "光學調色",
      enName: "Color Spectrum Lab",
      axial: { q: 0, r: -1 },
      color: 0x3e7c8c,
      pattern: "dots",
      treeType: "cherry",
      mainModel: "lab_hall",
      summary: "運用金屬元素焰色反應原理，合成碳酸鍶（紅）、硝酸鋇（綠）、鹼式碳酸銅（藍）與草酸鈉（金）等高純度顯色藥劑。",
      items: [
        { id: "i02_1", name: "五色金屬鹽反應釜", model: "color_vats", desc: "五座恆溫玻璃反應槽，進行分子級金屬鹽類純化。", facts: ["純度 99.6%", "5 大基礎光譜", "零雜質鈉干擾"], phase: "第 1 階段" },
        { id: "i02_2", name: "鋁鎂合金閃光艙", model: "booth", desc: "摻入微米級鋁鎂合金粉，賦予高空煙火耀眼白金星芒。", facts: ["亮度 32000 cd", "色溫 3000K"], phase: "第 1 階段" },
        { id: "i02_3", name: "分光色溫檢驗室", model: "classroom", desc: "技師於暗室中點燃微量樣本，以光譜儀標定波長。", facts: ["紅光 650nm", "藍光 450nm", "合格率 99.9%"], phase: "第 2 階段" },
        { id: "i02_4", name: "光譜色彩地球儀", model: "symbol_globe", desc: "展示全球競技花火色階標準之巨型光學模型。", facts: ["收錄 48 色階", "全天候校準"], phase: "第 2 階段" }
      ]
    },
    {
      id: "isl_03",
      num: "03",
      name: "星珠造粒",
      enName: "Star Rolling Drums",
      axial: { q: 1, r: -1 },
      color: 0xfcea8b,
      pattern: "stripes",
      treeType: "fruit",
      mainModel: "drum_factory",
      summary: "以天然油菜籽為中心星核，於傾斜自轉黃銅滾筒中交替噴灑米漿糊與顯色藥粉，如滾雪球般培育出多層變色星珠。",
      items: [
        { id: "i03_1", name: "三連裝黃銅造粒筒", model: "rolling_drums", desc: "45度傾斜自轉銅筒，每次包裹 0.3mm 藥層，累積達 24 層。", facts: ["同心包覆 24 層", "真圓度 98.5%", "變色 3 階段"], phase: "第 2 階段" },
        { id: "i03_2", name: "糯米澱粉熬漿鍋", model: "vat_station", desc: "熬煮高黏度天然糯米澱粉漿，作為星珠無毒環保黏合劑。", facts: ["黏度 4500 cP", "熬煮溫 85°C"], phase: "第 1 階段" },
        { id: "i03_3", name: "油菜籽星核篩選台", model: "pavilion", desc: "精選粒徑完全一致之油菜籽作為星珠起滾核心。", facts: ["核徑 1.8mm", "每批 50 萬顆"], phase: "第 1 階段" },
        { id: "i03_4", name: "同心變色剖面球", model: "symbol_star", desc: "展示紅、金、翠綠三層藥衣結構之放大模型。", facts: ["燃燒時長 4.2s", "外徑 12mm"], phase: "第 2 階段" }
      ]
    },
    {
      id: "isl_04",
      num: "04",
      name: "陽光曬場",
      enName: "Solar Drying Decks",
      axial: { q: 2, r: -1 },
      color: 0x8db86f,
      pattern: "brick",
      treeType: "willow",
      mainModel: "drying_hall",
      summary: "將剛滾製完成的濕潤星珠平鋪於天然竹篩上，藉陽光日照與微風循環徹底排除水分，防止高空啞彈。",
      items: [
        { id: "i04_1", name: "三層階梯竹篩曬台", model: "drying_racks", desc: "十二格透氣竹篩木架，讓五彩星珠均勻接受日照固化。", facts: ["含水率 < 0.3%", "乾燥期 96 小時", "抗壓 > 15kg"], phase: "第 2 階段" },
        { id: "i04_2", name: "微風循環測風車", model: "windmill", desc: "監測曬場風速與濕度，自動調節通風百葉角度。", facts: ["恆溫 35°C", "相對濕度 38%"], phase: "第 2 階段" },
        { id: "i04_3", name: "星珠硬度抽檢站", model: "clinic", desc: "以彈簧壓力計抽檢乾燥後星珠之抗碎裂強度。", facts: ["抽檢率 5%", "零粉化認證"], phase: "第 2 階段" },
        { id: "i04_4", name: "日照乾燥計時鐘", model: "symbol_clock", desc: "精準控管每批星珠翻面與日照時數之大型計時器。", facts: ["每 2 小時翻篩", "全時段監控"], phase: "第 2 階段" }
      ]
    },

    // 第二排 (中排 r = 0，由右至左折返：05 -> 06 -> 07 -> 08)
    {
      id: "isl_05",
      num: "05",
      name: "紙殼模壓",
      enName: "Hemisphere Shell Press",
      axial: { q: 1, r: 0 },
      color: 0xb48560,
      pattern: "dots",
      treeType: "palm",
      mainModel: "press_hall",
      summary: "選用長纖維進口牛皮紙漿，經高溫蒸汽與 5 噸液壓龍門模具立體熱壓，製成對稱堅韌的半球形外骨骼彈殼。",
      items: [
        { id: "i05_1", name: "龍門往復液壓熱壓機", model: "hydraulic_press", desc: "以 80°C 蒸汽與 5 噸液壓將多層牛皮紙漿壓合定型。", facts: ["壁厚 4.5mm", "公差 ±0.1mm", "抗拉 120 MPa"], phase: "第 2 階段" },
        { id: "i05_2", name: "長纖維牛皮紙漿池", model: "canal_bridge", desc: "浸泡並疏解原木長纖維紙漿，賦予彈殼極致韌性。", facts: ["纖維長 3.2mm", "浸泡 48 小時"], phase: "第 1 階段" },
        { id: "i05_3", name: "半球赤道修邊台", model: "booth", desc: "精密裁切半球殼邊緣，確保上下半球合攏時嚴絲合縫。", facts: ["真圓度 99.9%", "日產 300 對"], phase: "第 2 階段" },
        { id: "i05_4", name: "標準尺玉紙殼模", model: "symbol_dome", desc: "展示 3 吋、6 吋至 10 吋尺玉半球殼規格之模型。", facts: ["最大口徑 30cm", "耐壓 2500 PSI"], phase: "第 2 階段" }
      ]
    },
    {
      id: "isl_06",
      num: "06",
      name: "內膽排珠",
      enName: "Star Arrangement Studio",
      axial: { q: 0, r: 0 },
      color: 0xf2b5c6,
      pattern: "stripes",
      treeType: "cherry",
      mainModel: "assembly_hall",
      summary: "花火圖案成型的匠心核心！師傅以排珠匙將數百顆彩色星珠沿半球內壁排成同心圓，中央置入割火引爆藥包。",
      items: [
        { id: "i06_1", name: "同心圓剖面排珠檯", model: "cutaway_shell", desc: "展示外圈紅星、中圈金星與中央割火藥包之精密立體結構。", facts: ["排布 360 顆星珠", "同心度 99.6%", "雙層蕊心設計"], phase: "第 3 階段" },
        { id: "i06_2", name: "割火藥與穀殼填裝器", model: "vat_station", desc: "以精選乾燥棉籽穀殼混入黑火藥，填滿星珠間隙防震。", facts: ["割藥重 420g", "零位移填充"], phase: "第 3 階段" },
        { id: "i06_3", name: "職人手工排珠工坊", model: "classroom", desc: "資深花火師傅親手微調每一顆星珠間距之靜音工作室。", facts: ["匠人年資 25 年", "耗時 4 小時/顆"], phase: "第 3 階段" },
        { id: "i06_4", name: "花火設計圖譜典藏", model: "symbol_book", desc: "記載菊、牡丹、冠柳與型物花火排列公式之傳承秘笈。", facts: ["收錄 120 圖譜", "百年工藝傳承"], phase: "第 3 階段" }
      ]
    },
    {
      id: "isl_07",
      num: "07",
      name: "玉張糊緊",
      enName: "Paste Wrapping Workshop",
      axial: { q: -1, r: 0 },
      color: 0x6f7fb5,
      pattern: "brick",
      treeType: "pine",
      mainModel: "wrapping_hall",
      summary: "執行日本花火核心秘術「玉張（Tama-bari）」，將合攏後的球體以牛皮紙帶經緯交叉纏繞 48 層，蓄積超強高空爆轟膛壓。",
      items: [
        { id: "i07_1", name: "自動經緯翻轉纏帶機", model: "winder_machine", desc: "夾持球體進行 90 度經緯交錯纏紙，確保各方向張力均等。", facts: ["纏繞 48 疊層", "張力 850 N", "耐膛壓 3000 PSI"], phase: "第 3 階段" },
        { id: "i07_2", name: "懸掛式尺玉陰乾木架", model: "hanging_rack", desc: "每纏繞 6 層即吊掛自然風乾，使彈體堅硬如實心保齡球。", facts: ["陰乾 7 日", "硬度 92 Shore"], phase: "第 3 階段" },
        { id: "i07_3", name: "赤道麻線鎖口台", model: "pavilion", desc: "在上下半球接合赤道處纏繞高拉力黃麻繩，防止裂開。", facts: ["麻繩 12 股", "氣密接合 100%"], phase: "第 3 階段" },
        { id: "i07_4", name: "張力檢測音叉台", model: "booth", desc: "師傅以木槌輕敲彈體表面，聽音辨別紙層乾燥與緊實度。", facts: ["清脆高頻音準", "全顆無空鼓"], phase: "第 3 階段" }
      ]
    },
    {
      id: "isl_08",
      num: "08",
      name: "推進裝底",
      enName: "Lift Charge & Fuse",
      axial: { q: -2, r: 0 },
      color: 0x58a6a6,
      pattern: "dots",
      treeType: "fruit",
      mainModel: "hopper_hall",
      summary: "於堅硬的花火球底部膠合錐形「升空推進藥杯」與毫秒級延遲時間引信，提供將數公斤尺玉直推 300 公尺高空的動力。",
      items: [
        { id: "i08_1", name: "定量推進藥漏斗塔", model: "hopper_tower", desc: "精準填充粗顆粒高爆發力黑火藥至底部紙錐杯內。", facts: ["初速 160 m/s", "推升高度 320m", "藥量誤差 < 0.5g"], phase: "第 3 階段" },
        { id: "i08_2", name: "延遲時間引信壓合線", model: "classroom", desc: "安裝每秒燃燒 1.1 公分之高精準度導火管，確保頂點引爆。", facts: ["延遲 5.8 秒", "誤差 ±0.04s"], phase: "第 3 階段" },
        { id: "i08_3", name: "快引傳火索捲盤架", model: "bike_rack", desc: "整齊捲放外覆牛皮紙之高速傳火索，連接砲口點火頭。", facts: ["傳火速 45 m/s", "防潮雙層包覆"], phase: "第 3 階段" },
        { id: "i08_4", name: "推進動能計算儀", model: "symbol_coin", desc: "根據彈體總重與風阻自動換算最佳發射藥克數。", facts: ["10吋總重 8.5kg", "推重比 18:1"], phase: "第 3 階段" }
      ]
    },

    // 第三排 (前排 r = 1，由左至右直線：09 -> 10 -> 11 -> 12，結尾 12 直線回原點 01)
    {
      id: "isl_09",
      num: "09",
      name: "安全探傷",
      enName: "X-Ray Inspection",
      axial: { q: -2, r: 1 },
      color: 0x71806a,
      pattern: "stripes",
      treeType: "willow",
      mainModel: "scanner_hall",
      summary: "出廠前最嚴苛的無損檢驗！以醫療級 X 光斷層掃描球體內部，確認星珠對稱、無空泡裂隙、引信無鬆脫，保證零膛炸。",
      items: [
        { id: "i09_1", name: "環場 X光透視掃描艙", model: "xray_dome", desc: "圓頂鉛防護艙，以升降螢光掃描環進行 360 度斷層透視。", facts: ["解析度 0.1mm", "空泡 0 容忍", "安全通關 100%"], phase: "第 4 階段" },
        { id: "i09_2", name: "重心平衡浮力檢測槽", model: "clinic", desc: "測試球體重心是否位於正中央，防止升空軌跡偏斜。", facts: ["偏心率 < 0.5%", "垂直度 99.8%"], phase: "第 4 階段" },
        { id: "i09_3", name: "防偽合格封印台", model: "booth", desc: "為通過探傷之尺玉貼上官方防偽封條與電子追蹤碼。", facts: ["晶片溯源管理", "雙重技師簽核"], phase: "第 4 階段" },
        { id: "i09_4", name: "零事故安檢金盾", model: "symbol_globe", desc: "象徵花火工藝島連續萬發零膛炸紀錄之安全榮譽標誌。", facts: ["安檢 12 道關卡", "可靠度 99.99%"], phase: "第 4 階段" }
      ]
    },
    {
      id: "isl_10",
      num: "10",
      name: "防潮封箱",
      enName: "Nitrogen Sealing & Logistics",
      axial: { q: -1, r: 1 },
      color: 0xc5b5a7,
      pattern: "brick",
      treeType: "palm",
      mainModel: "logistics_hall",
      summary: "將安檢合格之尺玉以抗靜電鋁箔袋抽真空充氮密封，置入防震杉木箱內，由專車安全運往海岸施放陣地。",
      items: [
        { id: "i10_1", name: "抗靜電充氮熱封艙", model: "boxer_machine", desc: "注入乾燥氮氣隔絕濕氣與氧氣，確保長途儲運穩定。", facts: ["防水等級 IP68", "靜電阻值 10^8Ω", "保質期 3 年"], phase: "第 4 階段" },
        { id: "i10_2", name: "防爆減震運輸車隊", model: "bus_stop", desc: "配備氣墊減震底盤與防火罩之專用花火搬運車。", facts: ["時速限制 25km", "GPS 即時監控"], phase: "第 4 階段" },
        { id: "i10_3", name: "杉木防震儲運棧", model: "pavilion", desc: "採用天然吸濕防靜電之厚實杉木打造專用彈體護箱。", facts: ["減震緩衝 80%", "恆溫倉儲"], phase: "第 4 階段" },
        { id: "i10_4", name: "物流調度時程鐘", model: "symbol_clock", desc: "協調全島 10 條物料專線準時配送至砲陣地之調度中心。", facts: ["準點率 100%", "零碰撞紀錄"], phase: "第 4 階段" }
      ]
    },
    {
      id: "isl_11",
      num: "11",
      name: "迫擊砲陣",
      enName: "Mortar Launch Battery",
      axial: { q: 0, r: 1 },
      color: 0xdb6a41,
      pattern: "dots",
      treeType: "pine",
      mainModel: "mortar_battery",
      summary: "臨海重型發射陣地！整齊排布壁厚 25mm 的無縫合金鋼迫擊砲筒與 32 連發速射斜架，將尺玉花火推向萬丈夜空。",
      items: [
        { id: "i11_1", name: "八門 10吋尺玉鋼砲陣", model: "mortar_tubes", desc: "垂直仰角 89 度校準之無縫合金鋼砲筒，承受瞬間極限膛壓。", facts: ["口徑 300mm", "展開直徑 320m", "垂直仰角 89°"], phase: "第 4 階段" },
        { id: "i11_2", name: "32連發扇形速射排架", model: "multi_launcher", desc: "以 15 度扇形交錯排列之速射箱架，打造滿天星河連發秀。", facts: ["連射間隔 0.15s", "覆蓋寬度 450m"], phase: "第 4 階段" },
        { id: "i11_3", name: "砲口防潮遮雨罩棚", model: "booth", desc: "發射前保護砲筒免受海風水氣侵襲之快拆式鋁箔罩。", facts: ["瞬間貫穿設計", "耐海風腐蝕"], phase: "第 4 階段" },
        { id: "i11_4", name: "盛典榮耀冠軍盃", model: "symbol_star", desc: "紀念全國花火競技大會優勝之金色錦冠菊模型。", facts: ["滯空時間 5.2s", "雙層變色蕊心"], phase: "第 4 階段" }
      ]
    },
    {
      id: "isl_12",
      num: "12",
      name: "觀禮指揮",
      enName: "Command & Viewing Yagura",
      axial: { q: 1, r: 1 },
      color: 0x3e7c8c,
      pattern: "stripes",
      treeType: "cherry",
      mainModel: "command_yagura",
      summary: "全島製程終點與新循環起點！雙層朱紅日式觀禮櫓內建微秒級電子點火台；盛典結束後，回收餘燼紙殼與觀禮數據直線回流至 01 配藥室。",
      items: [
        { id: "i12_1", name: "微秒級電子編程點火台", model: "stage", desc: "與背景音樂同步之數位點火主機，精準控制每一發升空時機。", facts: ["同步誤差 < 1ms", "控制 512 迴路", "無線加密通訊"], phase: "第 4 階段" },
        { id: "i12_2", name: "高空風速雷達測候儀", model: "hopper_tower", desc: "即時監測 300 公尺高空風向與風速，動態微調發射仰角。", facts: ["安全風速 < 7m/s", "每秒更新 20 次"], phase: "第 4 階段" },
        { id: "i12_3", name: "環保紙殼回收再生站", model: "canal_bridge", desc: "收集施放後落海之可降解牛皮紙殼與數據，直線送回 01 島循環再生。", facts: ["生物降解 100%", "12➔01 閉環回流"], phase: "第 4 階段" },
        { id: "i12_4", name: "花火祭典屋台廣場", model: "court", desc: "設有木造觀景座席與祭典燈籠，供市民仰望夜空璀璨花火。", facts: ["視野仰角 45°", "容納 2000 席"], phase: "第 4 階段" }
      ]
    }
  ],

  flows: [
    { id: "f01", from: "isl_01", to: "isl_02", cargo: "基底黑火藥桶", icon: "barrel", role: "worker", level: "official", desc: "將研磨過篩完成的 200 目高純度黑火藥送往調色所進行配伍。" },
    { id: "f02", from: "isl_02", to: "isl_03", cargo: "五彩金屬顯色鹽", icon: "flask", role: "researcher", level: "official", desc: "將調配標定完成的鍶紅、鋇綠、銅藍與草酸鈉顯色藥劑送入造粒滾筒。" },
    { id: "f03", from: "isl_03", to: "isl_04", cargo: "濕潤同心星珠盤", icon: "tray", role: "farmer", level: "official", desc: "將滾製滿 24 層的濕潤星珠平鋪於竹篩，送往陽光曬場脫水固化。" },
    { id: "f04", from: "isl_04", to: "isl_05", cargo: "乾燥定型星珠箱", icon: "box", role: "official", level: "thematic", desc: "第一排末端轉折：將含水率低於 0.3% 的堅硬星珠跨橋送往中排紙殼廠備用。" },
    { id: "f05", from: "isl_05", to: "isl_06", cargo: "模壓牛皮半球殼", icon: "shell", role: "worker", level: "official", desc: "將 5 噸液壓熱壓成型的對稱牛皮紙半球殼送入內膽排珠室。" },
    { id: "f06", from: "isl_06", to: "isl_07", cargo: "排珠內膽裸彈體", icon: "orb", role: "researcher", level: "official", desc: "將排滿 360 顆星珠與中央割火藥的合攏球體送往玉張工坊。" },
    { id: "f07", from: "isl_07", to: "isl_08", cargo: "玉張48層高壓球", icon: "orb", role: "worker", level: "official", desc: "將交叉纏繞 48 道牛皮紙帶並陰乾的堅硬尺玉送往裝底組。" },
    { id: "f08", from: "isl_08", to: "isl_09", cargo: "帶推進底杯尺玉", icon: "rocket", role: "official", level: "thematic", desc: "第二排末端轉折：將裝妥發射藥杯與延遲引信的成品彈送往 X 光探傷站。" },
    { id: "f09", from: "isl_09", to: "isl_11", cargo: "安檢封箱尺玉彈", icon: "box", role: "cyclist", level: "official", desc: "經由 10 號充氮封箱島，將 100% 探傷合格之尺玉直送 11 號迫擊砲陣地裝填！" },
    { id: "f10", from: "isl_12", to: "isl_01", cargo: "環保紙殼與觀測譜", icon: "recycle", role: "traveler", level: "pending", desc: "【結尾直線回到原點】將 12 號觀禮台收集之光譜數據與可降解紙殼，沿直線跨海長橋回流至 01 號火藥配研室，啟動新一輪工藝循環！" }
  ],

  dayCycle: [
    { name: "清晨備料", start: 300, end: 540, activeItems: ["i01_1", "i01_3", "i03_2", "i05_2"] },
    { name: "上午配研與造粒", start: 540, end: 780, activeItems: ["i01_2", "i02_1", "i03_1", "i04_1", "i05_1"] },
    { name: "午後排珠與玉張", start: 780, end: 1020, activeItems: ["i04_2", "i06_1", "i06_3", "i07_1", "i08_1"] },
    { name: "黃昏探傷與封箱", start: 1020, end: 1170, activeItems: ["i08_2", "i09_1", "i09_3", "i10_1", "i10_2"] },
    { name: "夜間花火盛典", start: 1170, end: 1440, activeItems: ["i11_1", "i11_2", "i12_1", "i12_4"] },
    { name: "深夜回流整備", start: 0, end: 300, activeItems: ["i12_3", "i01_4", "i09_4"] }
  ]
};
