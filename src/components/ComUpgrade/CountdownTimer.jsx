import React, { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [time, setTime] = useState(300);

  useEffect(() => {
    let timer = setInterval(() => {
      setTime((time) => {
        if (time === 0) {
          clearInterval(timer);
          return 0;
        } else return time - 1;
      });
    }, 1000);
  }, []);

  return (
    <p className="text-red-500 text-center">
      Thời gian hiệu lực còn: {`${Math.floor(time / 60)}`.padStart(2, 0)}:
      {`${time % 60}`.padStart(2, 0)}
    </p>
  );
}
