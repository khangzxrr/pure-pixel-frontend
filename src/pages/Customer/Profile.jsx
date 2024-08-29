import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";

export default function Profile() {
  const { keycloak } = useKeycloak();
  const [profile, setProfile] = useState({});
  useEffect(() => {
    keycloak.loadUserProfile().then((profile) => {
      console.log(profile);
      setProfile(profile);
    });
  }, []);
  return <div>Hello {JSON.stringify(profile)}</div>;
}
