import { useKeycloak } from "@react-keycloak/web";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import PhotoApi from "../../apis/PhotoApi";
import UserService from "../../services/Keycloak";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useParams } from "react-router-dom";

const Icon = ({ children, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${className}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const getNavigation = (idImg, listImg) => {
  // Tìm vị trí của hình ảnh hiện tại trong mảng
  const currentIndex = listImg.findIndex((img) => img.id === idImg);

  // Lấy id của hình ảnh trước đó, nếu có
  const prevId = currentIndex > 0 ? listImg[currentIndex - 1].id : null;

  // Lấy id của hình ảnh kế tiếp, nếu có
  const nextId =
    currentIndex < listImg.length - 1 ? listImg[currentIndex + 1].id : null;

  // Trả về đối tượng chứa id của hình ảnh trước đó và kế tiếp
  return { prevId, nextId };
};
export default function DetailedPhotoView({ idImg, onClose, listImg }) {
  const [selectedImage, setSelectedImage] = useState(idImg);

  const { id } = useParams();
  const { prevId, nextId } = getNavigation(selectedImage, listImg);
  const getPhotoById = useQuery({
    queryKey: ["get-getPhotoById-by-id", selectedImage],
    queryFn: () => PhotoApi.getPhotoById(selectedImage),
  });
  useEffect(() => {
    setSelectedImage(idImg);
  }, [idImg]);

  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const userId = userData?.sub;
  console.log(UserService.hasRole(["photographer"]));

  useEffect(() => {
    if (idImg) {
      // Khi modal mở, thêm lớp `overflow-hidden` vào body
      document.body.style.overflow = "hidden";
    } else {
      // Khi modal đóng, khôi phục lại cuộn
      document.body.style.overflow = "auto";
    }

    // Cleanup khi component bị unmount
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [idImg]);
  console.log("====================================");
  console.log(idImg);
  console.log(listImg);
  console.log("====================================");
  // if (!getPhotoById.data || getPhotoById.isError) {
  //   return (
  //     <div className="text-red-500 text-center">
  //       Error loading getPhotoById details
  //     </div>
  //   );
  // }

  const photographerId = getPhotoById.data?.photographer?.id;
  const titleT = getPhotoById.data?.title;
  const description = getPhotoById.data?.description;
  const dateTime = new Date(getPhotoById.data?.captureTime);
  const photographerName = getPhotoById.data?.photographer?.name;
  const photographerAvatar = getPhotoById.data?.photographer?.avatar;
  const photoTag = getPhotoById.data?.photoTags;
  const categoryName = getPhotoById.data?.category?.name;
  const location = getPhotoById.data?.location;
  const exifPhoto = getPhotoById.data?.exif;
  const quoteUser = getPhotoById.data?.photographer?.quote;
  const votePhoto = getPhotoById.data?._count?.votes;
  const commentPhoto = getPhotoById.data?._count?.comments;
  console.log("====================================");
  console.log(getPhotoById.photographer);
  console.log("====================================");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 md:flex justify-center items-center z-50 w-screen overflow-y-auto">
      <div className="flex flex-col md:flex-row bg-black text-white md:h-screen w-screen">
        {/* Left side - Image */}
        <div className="flex-1 md:relative h-screen">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px] bg-opacity-50 hover:bg-opacity-75 hover:scale-110"
          >
            <Icon>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </Icon>
          </button>
          <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-slate-400 border-slate-500 border-[1px]  bg-opacity-50 hover:bg-opacity-75 hover:scale-110">
            <Icon>
              <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
            </Icon>
          </button>
          <div className="flex  justify-center">
            <img
              src={getPhotoById?.data?.signedUrl?.url}
              alt="Traunfall waterfall"
              className="w-auto h-screen object-cover "
            />
          </div>
          {prevId && (
            <button
              onClick={() => setSelectedImage(prevId)}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white p-2 rounded-full bg-slate-300 bg-opacity-50 transition duration-300 ease-in-out hover:bg-opacity-75 hover:scale-110"
            >
              <Icon>
                <path d="M15 18l-6-6 6-6" />
              </Icon>
            </button>
          )}
          {nextId && (
            <button
              onClick={() => setSelectedImage(nextId)}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-white p-2 rounded-full bg-slate-300 bg-opacity-50 transition duration-300 ease-in-out hover:bg-opacity-75 hover:scale-110"
            >
              <Icon>
                <path d="M9 18l6-6-6-6" />
              </Icon>
            </button>
          )}
        </div>

        {/* Right side - Details */}
        <div className="w-full md:w-96 p-6 bg-zinc-900 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={photographerAvatar}
                alt="GueM"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold">{photographerName}</h2>
                <p className="text-sm text-gray-400">1 day ago</p>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-800">
              <Icon>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </Icon>
            </button>
          </div>

          <div className="flex items-center space-x-4 mb-6 justify-center">
            <div className="flex items-center">
              <Icon className="mr-2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </Icon>
              <span>4894</span>
            </div>
            <div className="bg-yellow-600 text-white px-2 py-1 rounded-full flex items-center">
              <Icon className="w-4 h-4 mr-1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </Icon>
              <span className="text-sm">Inspiration</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 mb-6">
            <button className="flex items-center hover:text-red-500">
              <Icon className="mr-2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </Icon>
              <span>264</span>
            </button>
            <button className="flex items-center hover:text-blue-500">
              <Icon className="mr-2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </Icon>
              <span>27</span>
            </button>
            <button className="hover:text-green-500">
              <Icon>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </Icon>
            </button>
            <button className="hover:text-gray-400">
              <Icon>
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </Icon>
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {["COMPOSITION", "CONTENT", "CREATIVITY", "TECHNIQUE"].map(
              (category, index) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm font-medium">{37 - index}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full">
                    <div
                      className={`h-full rounded-full ${
                        index === 0
                          ? "bg-blue-500"
                          : index === 1
                          ? "bg-pink-500"
                          : index === 2
                          ? "bg-purple-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${37 - index}%` }}
                    ></div>
                  </div>
                </div>
              )
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4">Traunfall</h1>

          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <Icon className="mr-2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </Icon>
              <span>Austria</span>
              <img
                src="https://youpic.com/flag/in.svg"
                alt="Austria flag"
                className="w-6 ml-2"
              />
            </div>
            <div className="flex items-center">
              <Icon className="mr-2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </Icon>
              <span>Taken 22/9/2024</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 bg-gray-800 rounded-full text-sm mr-2">
                Landscape
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Icon className="mr-2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </Icon>
              <span>SONY ILCE-7CR</span>
            </div>
            <div className="flex items-center">
              <Icon className="mr-2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </Icon>
              <span>FE 14mm F1.8 GM</span>
              <span className="ml-2">14 mm</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>f/11</span>
              <span>25/10s</span>
              <span>ISO 100</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">3 Comments</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <img
                  src="https://noithatbinhminh.com.vn/wp-content/uploads/2022/08/anh-dep-44.jpg.webp"
                  alt="Gianni Meini"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">Gianni Meini</span>
                    <span className="text-xs text-gray-400 ml-2">
                      2024-09-23 14:07
                    </span>
                  </div>
                  <p className="text-sm">Bravo Gue</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 pl-8">
                <img
                  src="https://noithatbinhminh.com.vn/wp-content/uploads/2022/08/anh-dep-44.jpg.webp"
                  alt="GueM"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">GueM</span>
                    <span className="text-xs text-gray-400 ml-2">
                      Yesterday at 14:55
                    </span>
                  </div>
                  <p className="text-sm">Grazie !!</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <img
                  src="https://noithatbinhminh.com.vn/wp-content/uploads/2022/08/anh-dep-44.jpg.webp"
                  alt="Gianni Meini"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">Gianni Meini</span>
                    <span className="text-xs text-gray-400 ml-2">
                      2024-09-23 14:06
                    </span>
                  </div>
                  <p className="text-sm">Congrats, gorgeous image!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
