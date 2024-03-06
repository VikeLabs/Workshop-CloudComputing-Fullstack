import { WebSocketServer } from "ws";

let dataStore = {};

const wss = new WebSocketServer({
  port: 8080,
});

wss.on("connection", (ws, req) => {
  ws.on("error", console.error);
  ws.on("message", (msg) => {
    let msgData = JSON.parse(msg);
    if (msgData.type === "bid") {
      const id = msgData.id;
      const bid = msgData.bidPrice;
      const name = msgData.name;

      if (name && name.trim()) {
        if (dataStore[id]) {
          const val = dataStore[id].bid;
          if (val < bid) {
            dataStore[id] = {
              bid,
              name,
            };
            wss.clients.forEach((w) => {
              w.send(
                JSON.stringify({
                  id,
                  newPrice: bid,
                  name,
                })
              );
            });
          }
        } else {
          dataStore[msgData.id] = {
            bid: msgData.bidPrice,
            name: name,
          };
          wss.clients.forEach((w) => {
            w.send(
              JSON.stringify({
                id,
                newPrice: bid,
                name,
              })
            );
          });
        }
      }
    } else if (msgData.type === "ready") {
      const url = new URL(req.url, "https://example.com/");
      const id = url.searchParams.get("id");
      if (dataStore[id]) {
        ws.send(
          JSON.stringify({
            id,
            newPrice: dataStore[id].bid,
            name: dataStore[id].name,
          })
        );
      }
    }
  });
});
