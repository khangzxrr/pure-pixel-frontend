const SinglePhotoUpload = ({
  originNode,
  file,
  fileList,
  actions,
  handleDoubleClick,
  setSelectedPhoto,
}) => {
  return (
    <div
      className="hover:border-2 rounded-xl border-gray-300"
      onDoubleClick={() => handleDoubleClick(file)}
      onClick={() => setSelectedPhoto(file)}
    >
      {originNode}
    </div>
  );
};

export default SinglePhotoUpload;
