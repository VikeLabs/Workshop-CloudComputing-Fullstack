import { Button, Box, Image, Text, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";

type Loading = {
  status: "loading";
};

type Data = {
  status: "loaded";
  name: string;
  image: string;
  price: string;
};

type ProductInfo = Loading | Data;

export interface ProductProps {
  id: number;
}

const Product = (props: ProductProps) => {
  const [info, setInfo] = useState<ProductInfo>({
    status: "loading",
  });

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
        });
      }
    };

    update().catch(console.error);
  }, []);

  return (
    <Box
      sx={{
        border: "2px solid black",
        borderRadius: "20px",
        width: "500px",
        height: "200px",
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
        justifyContent="center"
        alignItems="center"
      >
        {info.status === "loaded" ? (
          <Text
            sx={{
              fontSize: "26px",
            }}
          >
            $5
          </Text>
        ) : (
          <Spinner />
        )}
        <Button
          size="lg"
          colorScheme="blue"
          onClick={() => {
            console.log("button pressed");
          }}
        >
          Buy Now
        </Button>
      </Box>
    </Box>
  );
};

export default Product;
