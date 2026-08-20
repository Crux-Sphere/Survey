import React from "react";
import CustomModal from "../ui/Modal";

interface Props {
  mapModalIsOpen: boolean;
  setMapModalIsOpen: (isOpen: boolean) => void;
  isLoaded?: boolean;
  coordinates: { lat: number; lng: number };
}

function MapModal({ mapModalIsOpen, setMapModalIsOpen, coordinates }: Props) {
  const isLocationValid = coordinates.lat !== 0 || coordinates.lng !== 0;
  const { lat, lng } = coordinates;
  const delta = 0.03;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${lat},${lng}`;
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <CustomModal open={mapModalIsOpen} closeModal={() => setMapModalIsOpen(false)}>
      <div className="p-4 flex justify-center items-center">
        <div className="flex h-full w-full justify-center items-center flex-col gap-4">
          {isLocationValid ? (
            <>
              <iframe
                title="Response location"
                src={osmEmbedUrl}
                width={500}
                height={500}
                className="rounded-lg border-0"
              />
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-300 font-medium hover:underline"
              >
                Open in Google Maps
              </a>
            </>
          ) : (
            <div className="flex justify-center items-center w-[500px] h-[500px] font-thin text-sm">
              No location found
            </div>
          )}
        </div>
      </div>
    </CustomModal>
  );
}

export default MapModal;
