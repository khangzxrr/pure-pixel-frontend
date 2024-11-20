export const calculateDateDifference = (inputDate) => {
  const currentDate = new Date();
  const givenDate = new Date(inputDate);
  const differenceInMs = inputDate ? currentDate - givenDate : -1;

  if (differenceInMs < 0) {
    return "Không xác định";
  }

  const differenceInHours = differenceInMs / (1000 * 60 * 60);

  if (differenceInHours < 1) {
    const hours = Math.floor(differenceInHours);
    const minutes = Math.floor((differenceInHours - hours) * 60);
    return `${minutes} phút trước`;
  } else if (differenceInHours < 24) {
    const hours = Math.floor(differenceInHours);
    return `${hours} giờ trước`;
  } else {
    const days = Math.floor(differenceInHours / 24);
    return `${days} ngày trước`;
  }
};
