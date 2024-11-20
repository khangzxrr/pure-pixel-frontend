import React from "react";

export default function Footer() {
 const data = [
   {
     title: "Company",
     items: ["Newsroom", "About us", "Careers"],
   },
   {
     title: "By community",
     items: ["Popular photos", "Editor's Choice", "Quests", "Portfolio"],
   },
   {
     title: "Licensing",
     items: [
       "About licensing",
       "Become a Contributor",
       "Submission requirements",
       "Content types",
       "Distribution",
     ],
   },
   {
     title: "Social",
     items: ["Facebook", "Twitter", "Instagram"],
   },
 ];

  return (
    <>
      <div className="grid gap-14  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-6 bg-black">
        {data.map((category, index) => (
          <div
            key={index}
            className="gap-10 flex flex-col items-center font-inter text-white text-center"
          >
            <p className="font-inter text-[34px] font-semibold leading-[19.36px] text-white">
              {category.title}
            </p>
            {category.items.map((item, i) => (
              <p
                key={i}
                className="font-inter text-[20px] font-light leading-[19.36px] text-white"
              >
                {item}
              </p>
            ))}
          </div>
        ))}
      </div>
      <div className="p-10 font-semibold text-[34px] font-light leading-[19.36px] text-white bg-black">
        Pure Pixel
      </div>
    </>
  );
}
