import { v4 as uuidv4 } from "uuid";
import { Coords } from "bmat/dom";
import { EvaError, ActionResult } from "@eva-ics/webengine";
import { useDoubleTap } from "./hooks/useDoubleTap.tsx";
import { Property, PropertyKind } from "./properties";
import { DispatchWithoutAction } from "react";

export interface ElementClass {
  description: string;
  group: string;
  defaults: object;
  props: Array<Property>;
  vendored?: any;
  default_size: Coords;
  boxed: boolean;
  actions: boolean;
  default_zIndex?: number;
  IconDraw?: () => JSX.Element;
  Viewer?: ({
    kind,
    dragged,
    vendored,
    setVariable,
    getVariable,
    forceUpdate,
    ...params
  }: {
    kind: string;
    dragged: boolean;
    vendored?: any;
    setVariable: (name: string, value: string) => void;
    getVariable: (name: string) => string | undefined;
    forceUpdate: DispatchWithoutAction;
  }) => JSX.Element;
}

export interface ElementPack {
  classes: Map<string, ElementClass>;
  Viewer: ({
    kind,
    dragged,
    vendored,
    setVariable,
    getVariable,
    forceUpdate,
    ...params
  }: {
    kind: string;
    dragged: boolean;
    vendored?: any;
    setVariable: (name: string, value: string) => void;
    getVariable: (name: string) => string | undefined;
    forceUpdate: DispatchWithoutAction;
  }) => JSX.Element;
}

export class ElementPool {
  items: Array<DElement>;
  pack: ElementPack;
  selected_elements: Set<DElement>;
  elements_dragged: boolean;
  variables: Map<string, string>;
  variables_map_id: string;

  constructor(pack: ElementPack) {
    this.items = [];
    this.pack = pack;
    this.selected_elements = new Set();
    this.elements_dragged = false;
    this.variables = new Map();
    this.variables_map_id = uuidv4();
  }

  setVariable(name: string, value: string) {
    this.variables.set(name, value);
    this.variables_map_id = uuidv4();
  }

  getVariable(name: string): string | undefined {
    return this.variables.get(name);
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
              break;
            }
          }
        }
      });
    });
    return Array.from(oids_to_subscribe).map((oid) => {
      for (const [var_name, var_value] of this.variables) {
        oid = oid.replaceAll("${" + var_name + "}", var_value);
      }
      return oid;
    });
  }

  add(kind: string, pos?: Coords): DElement {
    const el_class = this.pack.classes.get(kind);
    const zindex = el_class?.default_zIndex;
    const el: DElement = {
      id: uuidv4(),
      kind: kind,
      params: JSON.parse(JSON.stringify(el_class?.defaults)),
      position: pos || { x: 0, y: 0 },
      zindex: zindex === undefined ? 10 : zindex
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
    if (el) {
      this.selected_elements.add(el);
    } else {
      this.selected_elements.clear();
    }
  }

  toggle_selected(el: DElement) {
    if (this.selected_elements.has(el)) {
      this.selected_elements.delete(el);
    } else {
      this.selected_elements.add(el);
    }
  }

  selection_active(): boolean {
    return this.selected_elements.size > 0;
  }

  set_dragged(dragged: boolean) {
    this.elements_dragged = dragged;
  }

  top_selected_element(): DElement | null {
    if (this.selected_elements.size > 0) {
      let top_el: DElement | undefined = undefined;
      this.selected_elements.forEach((el) => {
        if (!top_el) {
          top_el = el;
        } else if (el.position.x < top_el.position.x) {
          top_el = el;
        } else if (
          el.position.x == top_el.position.x &&
          el.position.y < top_el.position.y
        ) {
          top_el = el;
        }
      });
      return top_el || null;
    } else {
      return null;
    }
  }

  clear() {
    this.items = [];
  }

  export(): Array<DElementData> {
    return this.items.map((el) => {
      return {
        kind: el.kind,
        params: JSON.parse(JSON.stringify(el.params)),
        position: JSON.parse(JSON.stringify(el.position)),
        zindex: el.zindex
      };
    });
  }

  import(data: Array<DElementData>) {
    if (data) {
      this.items = data.map((d) => {
        const data = JSON.parse(JSON.stringify(d));
        return { id: uuidv4(), ...data };
      });
    } else {
      this.items = [];
    }
  }
}

export const DisplayElements = ({
  element_pool,
  onMouseDown,
  onMouseUp,
  setSidebarVisible,
  editor_mode,
  onActionSuccess,
  onActionFail,
  cur_offset,
  viewport_scrolled,
  forceUpdate
}: {
  element_pool: ElementPool;
  onMouseDown?: (e: any, element: DElement) => void;
  onMouseUp?: (e: any, element: DElement) => void;
  setSidebarVisible?: (visible: boolean) => void;
  editor_mode: boolean;
  onActionSuccess?: (result: ActionResult) => void;
  onActionFail?: (err: EvaError) => void;
  cur_offset: Coords;
  viewport_scrolled?: boolean;
  forceUpdate: DispatchWithoutAction;
}): JSX.Element => {
  const doubleTapOpenSideBar = useDoubleTap(() => {
    if (setSidebarVisible) {
      setSidebarVisible(true);
    }
  });

  const DefaultViewer = element_pool.pack.Viewer;

  return (
    <>
      {element_pool.items.map((el, i) => {
        const element_class = element_pool.pack.classes.get(el.kind) as
          | ElementClass
          | undefined;
        let css_class;
        const selected = element_pool.selected_elements.has(el);
        const dragged = element_pool.elements_dragged && selected;
        if (editor_mode) {
          css_class = "idc-element";
          if (selected) css_class += " idc-element-selected";
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
        for (const key of Object.keys(params)) {
          if (typeof params[key] === "string") {
            for (const [var_name, var_value] of element_pool.variables) {
              // replace variables ${var_name} with var_value
              params[key] = params[key].replaceAll("${" + var_name + "}", var_value);
            }
          }
        }
        const key = el.id || `dashboard-element-${i}`;
        const setDashboardVariable =
          element_pool.setVariable.bind(element_pool);
        const Viewer = element_class?.Viewer || DefaultViewer;
        let el_view = (
          <>
            <Viewer
              kind={el.kind}
              dragged={dragged || viewport_scrolled}
              vendored={element_class?.vendored}
              setVariable={(name, value) => {
                setDashboardVariable(name, value);
                forceUpdate();
              }}
              getVariable={element_pool.getVariable.bind(element_pool)}
              forceUpdate={forceUpdate}
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
            onMouseUp={(e) => {
              if (onMouseUp) {
                onMouseUp(e, el);
              }
            }}
            onTouchStart={(e) => {
              if (onMouseDown) {
                onMouseDown(e, el);
              }
            }}
            onTouchEnd={(e) => {
              if (onMouseUp) {
                onMouseUp(e, el);
              }
            }}
            key={key}
            className={css_class}
            style={{
              left: el.position.x - cur_offset.x - (selected ? 2 : 0),
              top: el.position.y - cur_offset.y - (selected ? 2 : 0),
              zIndex: el.zindex
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
  zindex: number;
}

export interface DElementData {
  kind: string;
  params: any;
  position: Coords;
  zindex: number;
}
