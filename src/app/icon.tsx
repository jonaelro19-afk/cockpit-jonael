import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const GRAD = "linear-gradient(120deg,#ffd23f,#ff7a3d,#ff4fa0,#b14fff)";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: 999,
            background: GRAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 250,
              height: 250,
              borderRadius: 999,
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 999,
                background: GRAD,
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
