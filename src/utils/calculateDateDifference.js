export default function calculateDateDifference(inputDate) {
  const currentDate = new Date();
  const givenDate = new Date(inputDate);
  const differenceInMs = inputDate ? currentDate - givenDate : -1;
  if (differenceInMs < 0) {
    return "vừa xong";
  }
  console.log("differenceInMs", differenceInMs);
  const differenceInHours = differenceInMs / (1000 * 60 * 60);

  if (differenceInHours < 1 / 30) {
    return "vừa xong";
  } else if (differenceInHours < 1) {
    const minutes = Math.floor(differenceInHours * 60);
    return `${minutes} phút trước`;
  } else if (differenceInHours < 24) {
    const hours = Math.floor(differenceInHours);
    return `${hours} giờ trước`;
  } else if (differenceInHours < 24 * 30) {
    const days = Math.floor(differenceInHours / 24);
    return `${days} ngày trước`;
  } else {
    // Format the date as HH:mm - DD-MM-YYYY
    const hours = String(givenDate.getHours()).padStart(2, "0");
    const minutes = String(givenDate.getMinutes()).padStart(2, "0");
    const day = String(givenDate.getDate()).padStart(2, "0");
    const month = String(givenDate.getMonth() + 1).padStart(2, "0");
    const year = givenDate.getFullYear();

    return `${hours}:${minutes}-${day}-${month}-${year}`;
  }
}
