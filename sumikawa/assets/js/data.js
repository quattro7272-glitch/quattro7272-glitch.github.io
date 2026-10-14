// build.py が content.py から作ったファイル。直接は編集しない
window.SUMIKAWA = {
  "roomTypes": {
    "standard": {
      "label": "標準和室",
      "price": 28000,
      "capacity": 3
    },
    "wide": {
      "label": "広めの和室",
      "price": 36000,
      "capacity": 4
    },
    "special": {
      "label": "特別室",
      "price": 52000,
      "capacity": 4
    }
  },
  "rooms": [
    {
      "id": "sakura",
      "name": "桜",
      "type": "standard"
    },
    {
      "id": "fuji",
      "name": "藤",
      "type": "standard"
    },
    {
      "id": "hagi",
      "name": "萩",
      "type": "standard"
    },
    {
      "id": "kaede",
      "name": "楓",
      "type": "standard"
    },
    {
      "id": "tsubaki",
      "name": "椿",
      "type": "standard"
    },
    {
      "id": "take",
      "name": "竹",
      "type": "standard"
    },
    {
      "id": "katsura",
      "name": "桂",
      "type": "wide"
    },
    {
      "id": "ume",
      "name": "梅",
      "type": "wide"
    },
    {
      "id": "matsu",
      "name": "松",
      "type": "wide"
    },
    {
      "id": "hiiragi",
      "name": "柊",
      "type": "wide"
    },
    {
      "id": "hinoki",
      "name": "檜",
      "type": "special"
    },
    {
      "id": "sugi",
      "name": "杉",
      "type": "special"
    }
  ],
  "plans": [
    {
      "id": "basic",
      "name": "季節の会席プラン",
      "priceLabel": "28,000円〜",
      "roomTypes": [
        "standard",
        "wide"
      ],
      "roomLabel": "標準和室（広めの和室へ変更可・差額あり）",
      "meal": "夕：季節の会席／朝：和朝食",
      "checkout": "10:00",
      "reason": "温泉と夕食・朝食を、ほどよく楽しむ標準的な滞在です。"
    },
    {
      "id": "special",
      "name": "特別室で過ごす休日",
      "priceLabel": "52,000円〜",
      "roomTypes": [
        "special"
      ],
      "roomLabel": "特別室（檜・杉）",
      "meal": "夕：季節の会席／朝：和朝食",
      "checkout": "11:00",
      "reason": "専用の露天風呂付きの特別室で、時間を気にせずゆっくり過ごす休日です。"
    },
    {
      "id": "anniversary",
      "name": "記念日のご宿泊",
      "priceLabel": "36,000円〜",
      "roomTypes": [
        "wide",
        "special"
      ],
      "roomLabel": "広めの和室以上",
      "meal": "夕：季節の会席／朝：和朝食",
      "checkout": "10:00",
      "reason": "記念日のお祝いについて、宿にご相談いただけるプランです。内容はご相談のうえ決めます。"
    }
  ],
  "shuttle": {
    "toInn": [
      "14:30",
      "15:30",
      "16:30"
    ],
    "fromInn": [
      "9:30",
      "10:30"
    ]
  },
  "childRate": 0.7
};
