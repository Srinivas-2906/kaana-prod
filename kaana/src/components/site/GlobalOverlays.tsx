"use client";

export default function GlobalOverlays() {
  return (
    <>
      <div className="page-transition" id="pageTransition" />
      <div className="custom-cursor" id="cursor" />
      <div className="cursor-follower" id="cursorFollower" />
      <div className="noise" />
      <div className="grid-lines" id="gridLines" />
      <div className="scroll-progress" id="scrollProgress" />
    </>
  );
}
