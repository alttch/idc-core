import { v4 as uuidv4 } from "uuid";
import { Coords } from "bmat/dom";
import { EvaError, ActionResult } from "@eva-ics/webengine";
import { useDoubleTap } from "./hooks/useDoubleTap.tsx";
import { Property, PropertyKind } from "./properties";

export interface ElementClass {
  description: string;
  group: string;
  defaults: object;
  props: Array<Property>;
  default_size: Coords;
  boxed: boolean;
  actions: boolean;
  IconDraw?: () => JSX.Element;
}

export interface ElementPack {
  classes: Map<string, ElementClass>;
  Viewer: ({
    kind,
    dragged,
    ...params
  }: {
    kind: string;
    dragged: boolean;
  }) => JSX.Element;
}

export class ElementPool {
  items: Array<DElement>;
  pack: ElementPack;
  selected_element?: DElement;
  dragged_element?: DElement;

  constructor(pack: ElementPack) {
    this.items = [];
    this.pack = pack;
    this.selected_element = undefined;
    this.dragged_element = undefined;
  }

  oids_to_subscribe(): Array<string> {
    const oids_to_subscribe: Set<string> = new Set();
    this.items.forEach((el) => {
      Object.entries(el.params).forEach(([key, value]) => {
        let c = this.pack.classes.get(el.kind);
        if (c?.props) {
          for (const prop of c.props) {
            if (prop.name === key) {
              if (prop.kind === PropertyKind.OIDSubscribed) {
                if (typeof value === "string") {
                  oids_to_subscribe.add(value);
                }
              }
            }
            break;
          }
        }
      });
    });
    return Array.from(oids_to_subscribe);
  }

  add(kind: string, pos?: Coords): DElement {
    const el: DElement = {
      id: uuidv4(),
      kind: kind,
      params: JSON.parse(JSON.stringify(this.pack.classes.get(kind)?.defaults)),
      position: pos || { x: 0, y: 0 }
    };
    this.items.push(el);
    return el;
  }

  delete(id: string) {
    const idx = this.items.findIndex((el) => el.id === id);
    if (idx > -1) {
      this.items.splice(idx, 1);
    }
  }

  set_selected(el?: DElement) {
    this.selected_element = el;
  }

  set_dragged(el?: DElement) {
    this.dragged_element = el;
  }

  clear() {
    this.items = [];
  }

  export(): Array<DElementData> {
    return this.items.map((el) => {
      return {
        kind: el.kind,
        params: el.params,
        position: el.position
      };
    });
  }

  import(data: Array<DElementData>) {
    if (data) {
      this.items = data.map((d) => {
        return { id: uuidv4(), ...d };
      });
    } else {
      this.items = [];
    }
  }
}

export const DisplayElements = ({
  element_pool,
  onMouseDown,
  setSidebarVisible,
  editor_mode,
  onActionSuccess,
  onActionFail,
  cur_offset,
  viewport_scrolled
}: {
  element_pool: ElementPool;
  onMouseDown?: (e: any, element: DElement) => void;
  setSidebarVisible?: (visible: boolean) => void;
  editor_mode: boolean;
  onActionSuccess?: (result: ActionResult) => void;
  onActionFail?: (err: EvaError) => void;
  cur_offset: Coords;
  viewport_scrolled?: boolean;
}): JSX.Element => {
  const doubleTapOpenSideBar = useDoubleTap(() => {
    if (setSidebarVisible) {
      setSidebarVisible(true);
    }
  });

  const Viewer = element_pool.pack.Viewer;

  return (
    <>
      {element_pool.items.map((el, i) => {
        const element_class = element_pool.pack.classes.get(el.kind) as
          | ElementClass
          | undefined;
        let css_class;
        const dragged = el.id == element_pool.dragged_element?.id;
        if (editor_mode) {
          css_class = "idc-element";
          if (el.id == element_pool.selected_element?.id)
            css_class += " idc-element-selected";
          if (dragged) css_class += " idc-element-dragged";
        } else {
          css_class = "idc-element-view";
        }
        const params = { ...el.params };
        if (element_class?.actions) {
          if (editor_mode) {
            params.disabled_actions = true;
          } else {
            params.on_success = onActionSuccess;
            params.on_fail = onActionFail;
          }
        }
        const key = el.id || `dashboard-element-${i}`;
        let el_view = (
          <>
            <Viewer
              kind={el.kind}
              dragged={dragged || viewport_scrolled}
              {...params}
            />
          </>
        );
        if (element_class?.boxed) {
          el_view = <div className="idc-element-box">{el_view}</div>;
        }
        return (
          <div
            onMouseDown={(e) => {
              if (onMouseDown) {
                onMouseDown(e, el);
              }
            }}
            onTouchStart={(e) => {
              if (onMouseDown) {
                onMouseDown(e, el);
              }
            }}
            key={key}
            className={css_class}
            style={{
              left: el.position.x - cur_offset.x,
              top: el.position.y - cur_offset.y
            }}
            {...doubleTapOpenSideBar}
          >
            {el_view}
          </div>
        );
      })}
    </>
  );
};

export interface DElement {
  id: string;
  kind: string;
  params: any;
  position: Coords;
}

export interface DElementData {
  kind: string;
  params: any;
  position: Coords;
}
