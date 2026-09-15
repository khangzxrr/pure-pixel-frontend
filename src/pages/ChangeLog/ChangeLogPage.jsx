import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { IoIosArrowBack } from "react-icons/io";
import { getData } from "../../apis/api";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import UseChangeLogStore from "../../states/UseChangeLogStore";

const ChangeLogPage = () => {
  const navigate = useNavigate();
  const markSeen = UseChangeLogStore((state) => state.markSeen);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["changelog"],
    queryFn: async () =>
      (await getData("/changelog", { limit: 100, page: 0 })).data,
  });

  // entries come newest first; opening the page clears the "new" badge in the sidebar
  useEffect(() => {
    const newest = data?.objects?.[0];
    if (newest?.publishedAt) {
      markSeen(newest.publishedAt);
    }
  }, [data, markSeen]);

  const entries = data?.objects ?? [];

  return (
    <div>
      <div className="bg-[#383c42] h-[60px] flex items-center p-2">
        <div
          onClick={() => navigate("/")}
          className="m-1 p-2 flex items-center gap-2 rounded-full bg-[#292b2f] hover:cursor-pointer transition duration-200 hover:bg-[#4f545c]"
        >
          <IoIosArrowBack className="size-5" />
          <div className="hidden lg:block">Về trang chủ</div>
        </div>
      </div>
      <div className="custom-scrollbar max-h-screen">
        <div className="p-10 mx-auto max-w-3xl flex flex-col gap-8">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold">
              <i>NHẬT KÝ CẬP NHẬT</i>
            </h1>
          </div>

          {isLoading && (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          )}

          {isError && (
            <div className="text-center text-red-400">
              Không tải được nhật ký cập nhật, vui lòng thử lại
            </div>
          )}

          {!isLoading && !isError && entries.length === 0 && (
            <div className="text-center text-[#b9bbbe]">
              Chưa có bản cập nhật nào
            </div>
          )}

          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-2 border-l-2 border-[#4f545c] pl-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-2 py-0.5 rounded-md bg-[#0F296D] text-sm font-semibold">
                  {entry.version}
                </span>
                <span className="text-sm text-[#b9bbbe]">
                  {dayjs(entry.publishedAt).format("DD/MM/YYYY")}
                </span>
              </div>
              <h2 className="text-xl font-bold">{entry.title}</h2>
              <div
                // Quill HTML has no global styles here, so give its tags readable defaults
                className="uploaded-content font-normal leading-relaxed [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_a]:text-blue-400 [&_a]:underline [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_strong]:font-bold [&_em]:italic [&_blockquote]:border-l-4 [&_blockquote]:border-[#4f545c] [&_blockquote]:pl-3"
                dangerouslySetInnerHTML={{ __html: entry.content }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChangeLogPage;
