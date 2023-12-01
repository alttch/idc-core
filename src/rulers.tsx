import { DElement } from "./elements";
import { Coords } from "bmat/dom";

export const Rulers = ({
  el,
  cur_offset
}: {
  el?: DElement | null;
  cur_offset: Coords;
}) => {
  if (el) {
    const pos = {
      x: el.position.x - cur_offset.x,
      y: el.position.y - cur_offset.y
    };
    const pos_left = pos.x + 5;
    let pos_top = pos.y - 15;
    if (pos_top < 1) {
      pos_top = 1;
    }
    return (
      <>
        <div
          className="idc-ruler idc-ruler-legend"
          style={{
            left: pos_left,
            top: pos_top
          }}
        >
          {el.kind} x: {el.position.x}, y: {el.position.y}
        </div>
        <div
          style={{ height: `${pos.y}px` }}
          className="idc-ruler idc-ruler-x"
        ></div>
        <div
          style={{ width: `${pos.x}px` }}
          className="idc-ruler idc-ruler-y"
        ></div>
      </>
    );
  } else {
    return <></>;
  }
};
