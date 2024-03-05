import { useLoaderData } from "react-router-dom";
import ProductCard from "../components/ProductCard";

export async function loader({ params }: any) {
  return {
    id: params.productId,
  };
}

interface LoaderData {
  id: number;
}

const Product = () => {
  const loaderData = useLoaderData() as LoaderData;

  return <ProductCard id={loaderData.id} />;
};

export default Product;
