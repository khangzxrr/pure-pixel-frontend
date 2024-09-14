import { useQueries } from "react-query"; // Change the import to react-query
import UserApi from "../../apis/UserApi";

export default function Profile() {
  const result = useQueries([
    {
      queryKey: ["keycloak", 1],
      queryFn: UserApi.getKeycloakProfile,
    },
    {
      queryKey: ["application", 2],
      queryFn: UserApi.getApplicationProfile,
    },
  ]);

  if (result[0].isLoading) {
    return <div>Loading keycloak profile...</div>;
  }

  if (result[1].isLoading) {
    return <div>Loading application profile... </div>;
  }

  return (
    <div>
      {JSON.stringify(result[0].data)} {JSON.stringify(result[1].data)}
    </div>
  );
}
