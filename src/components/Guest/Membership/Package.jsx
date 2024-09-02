import React, { useState } from "react";

export default function Package() {
  const [data, setData] = useState([
    {
      name: "Explorer",
      money: "Free",
      text: "Ideal for hobbyists and those new to photography, seeking to develop their skills and creativity.",
      data: [
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
      ],
    },
    {
      name: "Explorer",
      money: "Free",
      text: "Ideal for hobbyists and those new to photography, seeking to develop their skills and creativity.",
      data: [
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
      ],
    },
    {
      name: "Explorer",
      money: "Free",
      text: "Ideal for hobbyists and those new to photography, seeking to develop their skills and creativity.",
      data: [
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
        {
          title: "Daily inspiration",
          context: "Personalized photo recommendations each day",
        },
      ],
    },
  ]);
  return (
    <div className="bg-black">
      <p className="text-center font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
        Take Advantage of This Exclusive Offer - 50% OFF
      </p>
      <p className=" text-center font-inter p-5 md:px-52 text-[16px] font-light leading-[19.36px]   text-white">
        Step into a fuller experience with our exclusive offer. Continue to
        grow, inspire, and earn with a 500px membership—enhance your creative
        journey without any constraints.
      </p>
      <div className="grid gap-14  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-6 justify-items-center  ">
        {data.map((e, i) => (
          <div
            key={i}
            className="w-[340px]  flex flex-col justify-between gap-6"
          >
            <div className="bg-white rounded-[20px] h-full">
              <div className="flex justify-between px-8  py-4 ">
                <p className="font-inter text-[16px] md:text-[16px]  font-extrabold">
                  {e.name}
                </p>
                <p className="font-inter text-[16px] md:text-[16px] ] font-extrabold">
                  {e.money}
                </p>
              </div>
              <div className=" p-2 bg-[#EDF6FE] mx-4 rounded-[20px]">
                {e.text}
              </div>
              <table className="p-2">
                <tbody className="">
                  {e?.data.map((value, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 mx-4 font-medium">
                        <l className=" text-black font-extrabold">
                          {value.title}:
                        </l>
                        {value.context}
                        <div
                          className={` ${
                            e?.data.length === index + 1 ? "" : "border-b "
                          }`}
                        ></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-black px-6 py-2 text-center rounded-[20px] bg-white font-extrabold ">
              {" "}
              Basic Account
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
