const { getClient } = require('bottender');
const { router, text, messenger } = require('bottender/router');

// 為了 demo 效果讓它保持 false
const inStock = false;
const client = getClient('messenger');

async function HandleQuestion(context) {
  if (!inStock) {
    await context.sendText(
      '很不幸，現在 Switch 沒有庫存，但我們可以在補貨時立刻通知你！'
    );
    await context.sendOneTimeNotifReqTemplate({
      title: '當 Switch 補貨的時候',
      payload: 'NOTIFY_ME_WHEN_IN_STOCK',
    });
    return;
  }

  await context.sendText('很幸運，現在 Switch 還有庫存！');
}

async function HandleOptin(context) {
  const { optin } = context.event;
  // optin.type -> 會是 "one_time_notif_req"
  // optin.payload -> 前面 `context.sendOneTimeNotifReqTemplate` 所送出的 payload
  if (
    optin.type === 'one_time_notif_req' &&
    optin.payload === 'NOTIFY_ME_WHEN_IN_STOCK'
  ) {
    // 收到 token 啦：optin.oneTimeNotifToken
    await context.sendText('好的，之後 Switch 到貨馬上通知你！');

    // 為了 demo 效果在一分鐘後直接通知到貨
    setTimeout(() => {
      client.sendGenericTemplate(
        { oneTimeNotifToken: optin.oneTimeNotifToken },
        [
          {
            title: 'Switch 有現貨了!快來買！',
            imageUrl:
              'https://www.nintendo.tw/hardware/switch/feature/img/01-hero/local-hero__model-pic.png',
            buttons: [
              {
                type: 'web_url',
                url: 'https://www.nintendo.tw/hardware/switch/feature/',
                title: '買起來',
              },
            ],
          },
        ]
      );
    }, 1000 * 60);
  }
}

module.exports = async function App() {
  return router([
    text('有 Switch 嗎？', HandleQuestion),
    messenger.optin(HandleOptin),
  ]);
};
