const LazyThumbnail = ({ id, src, blurhash, onClick }) => {
  return (
    <img
      src={src}
      alt={`Photo ${id}`}
      onClick={onClick}
      className="w-full h-auto object-cover"
    />
  );
};

export default LazyPhoto;
