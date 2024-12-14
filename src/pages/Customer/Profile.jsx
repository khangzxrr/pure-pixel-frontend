import { useQueries, useQuery } from "@tanstack/react-query"; // Change the import to react-query
import UserApi from "../../apis/UserApi";

export default function Profile() {
  const result = useQuery({
    queryKey: ["user-profile"],
    //20 is the limit of API returns
    //handle infinity scroll takes 20 elements each time
    queryFn: () => UserApi.getApplicationProfile,
  });
  // console.log(result);

  // if (result[0]?.isLoading) {
  //   return <div>Loading keycloak profile...</div>;
  // }

  // if (result[1]?.isLoading) {
  //   return <div>Loading application profile... </div>;
  // }

  return (
    <div>
      {/* {JSON?.stringify(result[0]?.data)}  */}
      {/* {JSON?.stringify(result[1]?.data)} */}
    </div>
  );
}
