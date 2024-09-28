import React from "react";
import { User, Link, ChevronDown, Info } from "lucide-react";
import { Select } from "antd";

export default function ComSharePhoto() {
  const handleChange = (value) => {
    console.log(`selected ${value}`);
  };
  return (
    <div className="bg-white text-gray-800 py-8 px-1 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Share 'Photo'</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <Info size={20} />
        </button>
      </div>

      {/* <div className="mb-6">
        <input
          type="text"
          placeholder="Add people, groups and calendar events"
          className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div> */}

      <h3 className="text-lg font-semibold mb-2 flex items-center">
        People with access
        <button className="ml-2 text-gray-500 hover:text-gray-700">
          <Info size={16} />
        </button>
      </h3>

      <h3 className="text-lg font-semibold mb-2">General access</h3>
      <div className="flex items-center justify-between bg-gray-100 p-3 rounded-md mb-6">
        <div className="flex items-center">
          <Link size={20} className="mr-3 text-gray-500" />
          <span>Quality</span>
        </div>
        <div className="flex items-center">
          <Select
            defaultValue="Viewer"
            variant="borderless"
            style={{ width: 120, backgroundColor: "#f3f4f6", textAlign: "end" }}
            onChange={handleChange}
            options={[
              { value: "Viewer", label: "Viewer" },
              { value: "Commenter", label: "Commenter" },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
          Copy link
        </button>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Done
        </button>
      </div>
    </div>
  );
}
