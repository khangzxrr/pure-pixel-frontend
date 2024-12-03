export default function calculateRemainingTime(expirationDate) {
  const now = new Date();
  const expiry = new Date(expirationDate);

  // Tính số ngày còn lại (theo chênh lệch thời gian)
  const remainingTimeInMs = expiry - now;
  const remainingDays = Math.ceil(remainingTimeInMs / (1000 * 60 * 60 * 24));

  return remainingDays > 0 ? remainingDays : 0; // Trả về 0 nếu đã hết hạn
}
