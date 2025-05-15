import React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio"; // adjust path as needed

const ImagePreview = () => {
  return (
    <AspectRatio ratio={16 / 9}>
      <img
        src="https://via.placeholder.com/800x450"
        alt="Preview"
        className="rounded-md object-cover"
      />
    </AspectRatio>
  );
};

export default ImagePreview;
