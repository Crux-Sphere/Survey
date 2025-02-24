import { GoogleMap, Marker } from "@react-google-maps/api";
import React, { useEffect, useState } from "react";
import CustomModal from "../ui/Modal";

interface Props {
  mapModalIsOpen: boolean;
  setMapModalIsOpen: (isOpen: boolean) => void;
  isLoaded: boolean;
  coordinates: { lat: number; lng: number };
}

function MapModal({ mapModalIsOpen, isLoaded, setMapModalIsOpen, coordinates }: Props) {
  console.log("coordinates in map--->", coordinates);

  const [center, setCenter] = useState({ lat: coordinates.lat, lng: coordinates.lng });

  useEffect(() => {
    setCenter(coordinates);
  }, [coordinates]);

  console.log("center--->", center);

  const isLocationValid = coordinates.lat !== 0 || coordinates.lng !== 0;

  return (
    <CustomModal open={mapModalIsOpen} closeModal={() => setMapModalIsOpen(false)}>
      <div className="p-4 flex justify-center items-center">
        <div className="flex h-full w-full justify-center items-center flex-col gap-4">
          {isLocationValid ? (
            isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  width: "500px",
                  height: "500px",
                }}
                center={coordinates}
                zoom={11}
              >
                <Marker position={coordinates} />
              </GoogleMap>
            ) : (
              <p>Loading map...</p>
            )
          ) : (
            <div className="flex justify-center items-center w-[500px] h-[500px] font-thin text-sm">No location found</div>
          )}
        </div>
      </div>
    </CustomModal>
  );
}

export default MapModal;
