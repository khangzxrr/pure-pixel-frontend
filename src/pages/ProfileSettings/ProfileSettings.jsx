import React, { useState, useRef } from "react";
import { Upload, X, Camera, Pencil } from "lucide-react";

const SocialLink = ({ name, placeholder }) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-300 mb-1"
    >
      {name}
    </label>
    <input
      type="text"
      id={name}
      name={name}
      placeholder={placeholder}
      className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default function ProfileSettings() {
  const [avatar, setAvatar] = useState(null);
  const [wallpaper, setWallpaper] = useState(null);
  const avatarInputRef = useRef(null);
  const wallpaperInputRef = useRef(null);

  const handleFileChange = (event, setFile) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFile(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#36393f] text-gray-200 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h2 className="text-sm font-semibold mb-2">Avatar</h2>
            <div className="relative w-32 h-32 mx-auto">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => avatarInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              onChange={(e) => handleFileChange(e, setAvatar)}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h2 className="text-sm font-semibold mb-2">Wallpaper</h2>
            <div className="relative w-full h-32">
              {wallpaper ? (
                <img
                  src={wallpaper}
                  alt="Wallpaper"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => wallpaperInputRef.current.click()}
                className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2 hover:bg-blue-600 transition-colors"
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={wallpaperInputRef}
              onChange={(e) => handleFileChange(e, setWallpaper)}
              className="hidden"
              accept="image/*"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="quote"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Quote
            </label>
            <textarea
              id="quote"
              name="quote"
              rows={3}
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="expertises"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Expertises
            </label>
            <input
              type="text"
              id="expertises"
              name="expertises"
              className="w-full bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Photography, Web Design, Writing"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Social Media</h2>
        <div className="space-y-4">
          <SocialLink name="Instagram" placeholder="@username" />
          <SocialLink name="Facebook" placeholder="username" />
          <SocialLink name="Twitter" placeholder="@username" />
          <SocialLink name="TikTok" placeholder="@username" />
          <SocialLink
            name="Blog/Website"
            placeholder="https://www.example.com"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            Revert
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
