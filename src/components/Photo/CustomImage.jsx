import { useQuery } from "@tanstack/react-query";

//TODO: should I immplement auto fetch signed url from photo?
export default function CustomImage(photo) {
  const result = useQuery({
    queryKey: ["photo"],
  });

  return <img></img>;
}
