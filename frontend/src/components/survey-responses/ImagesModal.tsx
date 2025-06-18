import React from "react";
import CustomModal from "../ui/Modal";
import ImageSlider from "./ImageSlider";

function ImagesModal({
  images,
  closeModal,
  open,
}: {
  images: string[];
  closeModal: any;
  open: boolean;
}) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <CustomModal closeModal={closeModal} open={open}>
        <ImageSlider images={images} />
      </CustomModal>
    </div>
  );
}

export default ImagesModal;
