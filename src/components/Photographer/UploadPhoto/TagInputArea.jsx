import React, { useEffect, useRef, useState } from "react";
import { Input, Tag, theme } from "antd";
import { TweenOneGroup } from "rc-tween-one";
import { Controller } from "react-hook-form";

export default function TagInputArea({
  field,
  updatePhotoPropertyByUid,
  selectedPhoto,
  isError,
}) {
  const { token } = theme.useToken();
  const [tags, setTags] = useState(
    selectedPhoto.photoTags || ["hello", "kitty"]
  ); // Initialize tags from field value
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef(null);
  const prevTagsRef = useRef(selectedPhoto.photoTags);

  useEffect(() => {
    if (prevTagsRef.current !== selectedPhoto.photoTags) {
      field.onChange(selectedPhoto.photoTags); // Update form field when tags change
      updatePhotoPropertyByUid(
        selectedPhoto.file.uid,
        "photoTags",
        selectedPhoto.photoTags
      ); // Update photo tags
      prevTagsRef.current = selectedPhoto.photoTags;
    }
  }, [field, updatePhotoPropertyByUid, selectedPhoto.file.uid]);

  const handleClose = (removedTag) => {
    const newTags = selectedPhoto.photoTags.filter((tag) => tag !== removedTag);
    updatePhotoPropertyByUid(selectedPhoto.file.uid, "photoTags", newTags); // Update photo tags
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    const newTag = inputValue.trim();
    if (newTag && !(selectedPhoto.photoTags ?? []).includes(newTag)) {
      updatePhotoPropertyByUid(selectedPhoto.file.uid, "photoTags", [
        ...(selectedPhoto.photoTags ?? []),
        newTag,
      ]); // Update photo tags
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleInputConfirm();
    }
  };

  const tagChild = selectedPhoto.photoTags?.map((tag, index) => (
    <span
      key={tag}
      style={{
        display: "inline-block",
      }}
    >
      <Tag
        closable
        onClose={(e) => {
          e.preventDefault();
          handleClose(tag);
        }}
        color={index % 3 == 0 ? "green" : index % 3 == 1 ? "blue" : "red"}
      >
        {tag}
      </Tag>
    </span>
  ));
  const tagPlusStyle = {
    background: token.colorBgContainer,
    borderStyle: "dashed",
  };

  return (
    <>
      {tagChild && (
        <div
          style={{
            marginBottom: 16,
          }}
        >
          <TweenOneGroup
            appear={false}
            enter={{
              scale: 0.8,
              opacity: 0,
              type: "from",
              duration: 100,
            }}
            leave={{
              opacity: 0,
              width: 0,
              scale: 0,
              duration: 200,
            }}
            onEnd={(e) => {
              if (e.type === "appear" || e.type === "enter") {
                e.target.style = "display: inline-block";
              }
            }}
          >
            {tagChild}
          </TweenOneGroup>
        </div>
      )}
      <Input
        ref={inputRef}
        type="text"
        size="small"
        style={{
          width: "100%",
        }}
        className={`w-full p-2 m-2 border-[1px] ${
          isError ? "border-red-500" : "border-gray-300"
        } focus:outline-none focus:border-[#e0e0e0]`}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputConfirm}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag and press space or enter"
      />
    </>
  );
}
