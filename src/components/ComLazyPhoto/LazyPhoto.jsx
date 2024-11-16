const LazyPhoto = ({ src, thumbnail, blurhash }) => {
  return (
    <img
      src={photo.signedUrl.thumbnail}
      alt={`Photo ${photo.id}`}
      className="w-full h-auto object-cover"
      onClick={() => handleOnClick(photo)}
    />
  );
};

export default LazyPhoto;
