export const fetchPhotos = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/photos");

  return await response.json();
};
