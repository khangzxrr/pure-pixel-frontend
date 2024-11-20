import http from "../configs/Http";

const getMyProfile = async () => {
  const response = await http.get(`/me`);

  return response.data;
};

const updateUserProfile = async (data) => {
  const formData = new FormData();

  // Append cover image if present
  if (data?.cover) {
    formData.append("cover", data.cover);
  }

  // Append avatar image if present
  if (data?.avatar) {
    formData.append("avatar", data.avatar);
  }

  // Append name if present
  if (data?.name) {
    formData.append("name", data.name);
  }

  // Append quote if present
  if (data?.quote) {
    formData.append("quote", data.quote);
  }

  // Append location if present
  if (data?.location) {
    formData.append("location", data.location);
  }

  // Append mail if present
  if (data?.mail) {
    formData.append("mail", data.mail);
  }

  // Append phone number if present
  if (data?.phonenumber) {
    formData.append("phonenumber", data.phonenumber);
  }

  // Append social links if present
  if (data?.socialLinks) {
    data.socialLinks.forEach((socialLink, index) => {
      formData.append(`socialLinks[${index}]`, socialLink); // Each social link gets its own field with a unique name
    });
  }

  // Append expertises if present
  if (data?.expertises) {
    data.expertises.forEach((expertise, index) => {
      formData.append(`expertises[${index}]`, expertise); // Each expertise gets its own field with a unique name
    });
  }

  // Send the PATCH request to update the user's profile
  const response = await http.patch(`me`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // onUploadProgress,
  });

  // Return the response data from the server
  return response.data;
};

const UserProfileApi = {
  getMyProfile,
  updateUserProfile,
};

export default UserProfileApi;
