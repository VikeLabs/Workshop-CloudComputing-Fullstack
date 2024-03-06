import {
  Button,
  Box,
  Image,
  Text,
  Spinner,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

type Loading = {
  status: "loading";
};

type Data = {
  status: "loaded";
  name: string;
  image: string;
  price: string;
  bidderName?: string;
  seller: string;
};

type Error = {
  status: "error";
};

type ProductInfo = Loading | Data | Error;

export interface ProductProps {
  id: number;
}

const Product = (props: ProductProps) => {
  const [info, setInfo] = useState<ProductInfo>({
    status: "loading",
  });
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [name, setName] = useState<string>("");

  const { sendMessage, readyState } = useWebSocket(
    `ws://localhost:8080/bidding?id=${props.id}`,
    {
      onOpen: () => {
        console.log("ws opened");
      },
      onMessage: (msg) => {
        const msgData = JSON.parse(msg.data);
        if (info.status === "loaded") {
          if (msgData.id === props.id) {
            setInfo({
              ...info,
              price: msgData.newPrice,
              bidderName: msgData.name,
            });
          }
        }
      },
    }
  );

  useEffect(() => {
    const update = async () => {
      const res = await fetch(`http://localhost:5000/product/${props.id}`);
      if (res.status === 200) {
        const data = await res.json();

        setInfo({
          status: "loaded",
          name: data.nam,
          image: data.img,
          price: data.pri,
          seller: data.sel,
        });

        sendMessage(
          JSON.stringify({
            type: "ready",
          })
        );
      } else {
        setInfo({
          status: "error",
        });
      }
    };

    update().catch(console.error);
  }, []);

  return (
    <>
      {info.status === "error" ? (
        <Text color="red">That product does not exist.</Text>
      ) : (
        <Box
          sx={{
            border: "2px solid black",
            borderRadius: "20px",
            width: "500px",
            height: "250px",
            textAlign: "center",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Box
            width="50%"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="5px"
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              width="150px"
              height="150px"
              sx={{
                border: "2px solid black",
                borderRadius: "5px",
              }}
            >
              {info.status === "loaded" ? (
                <Image
                  src={info.image}
                  loading="eager"
                  width="100%"
                  height="100%"
                />
              ) : (
                <Spinner />
              )}
            </Box>
            {info.status === "loaded" ? <Text>{info.name}</Text> : <Spinner />}
          </Box>
          <Box
            width="50%"
            display="flex"
            flexDirection="column"
            justifyContent="space-around"
            alignItems="center"
          >
            {info.status === "loaded" ? (
              <>
                <Text fontSize="26px">${info.price}</Text>
                {info.bidderName && (
                  <Text color="grey" fontSize="11px">
                    bid by {info.bidderName}
                  </Text>
                )}
                <Text>{info.seller}</Text>
              </>
            ) : (
              <Spinner />
            )}
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => {
                sendMessage(
                  JSON.stringify({
                    type: "bid",
                    id: props.id,
                    bidPrice,
                    name,
                  })
                );
              }}
            >
              Bid for ${bidPrice}
            </Button>
            <Input
              width="80%"
              placeholder="Name (e.g. Riley)"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
            <Box
              display="flex"
              flexDirection="row"
              alignItems="center"
              width="80%"
            >
              <InputGroup>
                <InputLeftAddon>$</InputLeftAddon>
                <Input
                  placeholder="Amount (e.g. 50)"
                  onChange={(e) => {
                    const r = parseFloat(e.target.value);
                    if (!isNaN(r)) {
                      setBidPrice(r);
                    }
                  }}
                />
              </InputGroup>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
};

export default Product;
