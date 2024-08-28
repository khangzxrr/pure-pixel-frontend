import React from "react";

export default function Booking() {
  return (
    <div className="flex bg-gray-400">
      <div>
        <div className="my-3 text-right text-white">
          &lt;- 1 2 3 ... 6 7 8 -&gt;
        </div>
        <div className="flex flex-wrap w-full">
          {[...Array(6)].map((x, i) => (
            <div key={i} className="w-1/3 p-3">
              <div className="bg-white p-3 rounded-md">
                <div className="flex flex-wrap">
                  <div className="w-1/4 sm:w-1/4 px-4">
                    <img
                      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPfJ8A0fKzNYCQrV7VIJhffbXZFMvLVjWQXA&s"
                      alt="..."
                      className="shadow rounded-full max-w-full h-auto align-middle border-none"
                    />
                  </div>
                </div>
                <p>name</p>
                <p>photographer name</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
