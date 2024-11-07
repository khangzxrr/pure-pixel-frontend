import React from "react";

import { useKeycloak } from "@react-keycloak/web";
import OwnerSharePhotoComponent from "./OwnerSharePhotoComponent";
import OtherUserSharePhotoComponent from "./OtherUserSharePhotoComponent";

export default function ComSharePhoto({ photoId, userId, onClose }) {
  const { keycloak } = useKeycloak();

  if (keycloak.tokenParsed.sub === userId) {
    return <OwnerSharePhotoComponent photoId={photoId} onClose={onClose} />;
  }

  return (
    <div className="bg-white text-gray-800 py-8 px-1 max-w-md mx-auto">
      <OtherUserSharePhotoComponent photoId={photoId} onClose={onClose} />
    </div>
  );
}
