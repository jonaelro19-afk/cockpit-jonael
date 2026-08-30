import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const GRAD = "linear-gradient(120deg,#ffd23f,#ff7a3d,#ff4fa0,#b14fff)";

export default function AppleIcon() {
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
            width: 120,
            height: 120,
            borderRadius: 999,
            background: GRAD,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 999,
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 999, background: GRAD }} />
          </div>
        </div>
      </div>
    ),
    size,
  );
}
