import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Rulers } from "./rulers";
import { Sidebar } from "./sidebar";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowLeftOutlinedIcon from "@mui/icons-material/ArrowLeftOutlined";
import ArrowRightOutlinedIcon from "@mui/icons-material/ArrowRightOutlined";
import {
  DEFAULT_GRID,
  DEFAULT_NAME,
  DEFAULT_VIEWPORT,
  MIN_SIDEBAR_WIDTH
} from "./common";
import { clearSelection, Coords, getMouseEventCoords } from "bmat/dom";
import {
  DElement,
  DElementData,
  DisplayElements,
  ElementClass,
  ElementPack,
  ElementPool
} from "./elements";
import { Box, Dialog, DialogContent, DialogTitle } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { ActionResult, EvaError } from "@eva-ics/webengine";
import { useEvaStateBlock } from "@eva-ics/webengine-react";
import ModalDialog from "./components/modal/ModalDialog.tsx";
import CustomButton from "./components/buttons/custom_button.tsx";

const DASHBOARD_MODIFIED_CONFIRM = "Dashboard has been modified. Exit editor?";
const CLICK_MS = 300;

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const coordsRect = (coords1: Coords, coords2: Coords): Rect => {
  return {
    left: Math.min(coords1.x, coords2.x),
    top: Math.min(coords1.y, coords2.y),
    right: Math.max(coords1.x, coords2.x),
    bottom: Math.max(coords1.y, coords2.y),
    width: Math.abs(coords1.x - coords2.x),
    height: Math.abs(coords1.y - coords2.y)
  };
};

export interface DashboardData {
  name: string;
  viewport: Coords;
  scale: number;
  grid: number;
  elements: Array<DElementData>;
  // the custom_data field can be set externally, the editor passes it as-is
  custom_data?: any;
}

const isBodyKeyEvent = (e: any): boolean => {
  return (
    e.target.nodeName === "BODY" ||
    (e.target.nodeName === "INPUT" &&
      e.target.classList?.contains("eva") &&
      e.target.classList?.contains("button")) ||
    (e.target.offsetParent?.classList?.contains("eva") &&
      e.target.offsetParent?.classList?.contains("button"))
  );
};

const handleOutEvent = (e: any, modified: boolean) => {
  if (modified) {
    if (!confirm(DASHBOARD_MODIFIED_CONFIRM)) {
      e.preventDefault();
      e.returnValue = "";
    }
  }
};

const DashboardSource = ({
  data,
  setSource
}: {
  data: DashboardData;
  setSource: (data: DashboardData | null) => void;
}) => {
  const areaRef = useRef(null);
  const [json_value, setJSONValue] = useState(JSON.stringify(data, null, 2));

  const applySource = () => {
    try {
      const value = JSON.parse((areaRef.current as any).value);
      if (!value.name) throw new Error("no dashboard name");
      value.viewport.x = parseInt(value.viewport.x);
      value.viewport.y = parseInt(value.viewport.y);
      if (
        isNaN(value.viewport.x) ||
        isNaN(value.viewport.y) ||
        value.viewport.x < 100 ||
        value.viewport.y < 100
      )
        throw new Error("invalid viewport");
      value.grid = parseInt(value.grid);
      if (isNaN(value.grid) || value.grid < 1) throw new Error("invalid grid");
      if (!Array.isArray(value.elements)) throw new Error("no elements");
      setSource(value);
    } catch (err) {
      alert(err);
    }
  };

  const downloadSource = () => {
    const element = document.createElement("a");
    const file = new Blob([json_value], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "dashboard.json";
    document.body.appendChild(element);
    element.click();
  };

  //Upload files
  const handleSourceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileContents = event.target?.result as string;

      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".json") || fileName.endsWith(".txt")) {
        setJSONValue(fileContents);
      } else {
        alert("Invalid file type. Please select a JSON or TXT file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={true}>
      <DialogTitle>Copy/paste/edit the dashboard code</DialogTitle>
      <DialogContent>
        <Box>
          <TextareaAutosize
            className="idc-source-textarea"
            ref={areaRef}
            cols={100}
            value={json_value}
            onChange={(e) => setJSONValue(e.target.value)}
          />
        </Box>
        <input
          type="file"
          accept=".json, .txt"
          onChange={handleSourceUpload}
          style={{ display: "none" }}
          id="file-input"
        />
      </DialogContent>
      <Box
        sx={{
          padding: "10px",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <CustomButton
          className="idc-btn idc-btn-outlined-no-icon"
          onClick={() => applySource()}
        >
          Apply
        </CustomButton>
        <CustomButton
          className="idc-btn idc-btn-outlined-no-icon"
          onClick={() => setSource(null)}
        >
          Cancel
        </CustomButton>
        <CustomButton
          className="idc-btn idc-btn-outlined-no-icon"
          onClick={() => downloadSource()}
        >
          Download
        </CustomButton>
        <CustomButton
          className="idc-btn idc-btn-outlined-no-icon"
          onClick={() => {
            (areaRef.current as any).select();
            document.execCommand("copy");
          }}
        >
          Copy
        </CustomButton>
        <CustomButton
          className="idc-btn idc-btn-outlined-no-icon clear"
          onClick={() => ((areaRef.current as any).value = "")}
        >
          Clear
        </CustomButton>
        <label
          className="idc-btn idc-btn-outlined-no-icon"
          htmlFor="file-input"
        >
          <span>Upload</span>
        </label>
      </Box>
    </Dialog>
  );
};

export const DashboardViewer = ({
  session_id,
  data,
  element_pack,
  finish,
  body_color,
  onActionSuccess,
  onActionFail
}: {
  session_id: string;
  data: DashboardData;
  element_pack: ElementPack;
  finish?: () => void;
  body_color: string;
  onActionSuccess: (result: ActionResult) => void;
  onActionFail: (err: EvaError) => void;
}) => {
  const pool = useMemo(() => {
    let pool = new ElementPool(element_pack);
    pool.import(data.elements);
    return pool;
  }, [session_id]);

  const oids_to_subscribe = useMemo(() => {
    const oids = pool.oids_to_subscribe();
    return oids;
  }, [pool]);

  useEvaStateBlock(
    { name: `idc-${session_id}`, state_updates: oids_to_subscribe },
    [oids_to_subscribe]
  );

  useEffect(() => {
    const prev_body_color = document.body.style.backgroundColor;
    const viewport = document.querySelector("meta[name=viewport]");
    document.body.style.backgroundColor = body_color;
    if (viewport && data.scale) {
      viewport.setAttribute(
        "content",
        `width=device-width, initial-scale=${data.scale}`
      );
    }
    return () => {
      document.body.style.backgroundColor = prev_body_color;
      if (viewport) {
        viewport.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0"
        );
      }
    };
  }, [session_id]);

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (isBodyKeyEvent(e)) {
        //setHelpVisible(false);
        switch (e.code) {
          case "KeyQ":
            if (e.shiftKey && !e.altKey) {
              if (finish) {
                e.preventDefault();
                finish();
              }
            }
            break;
          default:
            break;
        }
      }
    };
    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="idc-dashboard-viewer-container">
      <div className="idc-dashboard-viewport-container">
        <div
          className="idc-viewer-viewport"
          style={{
            width: data.viewport.x,
            height: data.viewport.y
          }}
        >
          <DisplayElements
            element_pool={pool}
            editor_mode={false}
            onActionSuccess={onActionSuccess}
            onActionFail={onActionFail}
            cur_offset={{ x: 0, y: 0 }}
          />
        </div>
      </div>
      <div
        className="idc-dashboard-viewer-close-button"
        onClick={() => {
          if (finish) finish();
        }}
      >
        <CloseIcon />
      </div>
    </div>
  );
};

const isClick = (click_time: Date): boolean => {
  return new Date().getTime() - click_time.getTime() < CLICK_MS;
};

export const DashboardEditor = ({
  session_id,
  offsetX,
  offsetY,
  element_pack,
  data,
  save,
  finish,
  onSuccess,
  onError,
  ignore_modified
}: {
  session_id: string;
  offsetX: number;
  offsetY: number;
  element_pack: ElementPack;
  data?: DashboardData;
  save?: (data: DashboardData) => Promise<boolean>;
  finish?: () => void;
  onSuccess: (message: any) => void;
  onError: (message: any) => void;
  ignore_modified?: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);
  const name = useRef(DEFAULT_NAME);
  const customData = useRef<any>(null);
  const viewport = useRef(DEFAULT_VIEWPORT);
  const scale = useRef(1);
  const grid = useRef(DEFAULT_GRID);
  const cur_offset = useRef<Coords>({ x: 0, y: 0 });
  const [sidebar_dragged, setSidebarDragged] = useState(false);
  const [sidebar_width, setSidebarWidth] = useState(
    Math.min(window.innerWidth, 390)
  );
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  const [resOids, resubscribeOids] = useReducer((x) => x + 1, 0);
  const [isShowModalExit, setIsShowModalExit] = useState(false);
  const [last_click, setLastClick] = useState<Date>(new Date());
  const element_pool = useMemo(() => {
    let pool = new ElementPool(element_pack);
    if (data) {
      pool.import(data.elements);
    }
    return pool;
  }, [session_id]);
  // keep as useRef to make dragging faster!
  const last_mouse_coords = useRef({ x: 0, y: 0 });
  // keep as useRef to let global key bindings work
  const sidebar_visible = useRef(true);
  const help_visible = useRef(false);
  const source_visible = useRef(false);
  const viewport_scrolled = useRef(false);
  const scrolling_enabled = useRef(false);
  const last_mouse_down = useRef(new Date());
  const selection_start = useRef<Coords | null>(null);

  const oids_to_subscribe = useMemo(() => {
    const oids = element_pool.oids_to_subscribe();
    return oids;
  }, [element_pool, resOids]);

  useEvaStateBlock(
    { name: `idc-${session_id}`, state_updates: oids_to_subscribe },
    [oids_to_subscribe]
  );

  const modified = useRef(false);

  const setModified = () => {
    modified.current = true;
  };

  const notifySubscribedOIDsChanged = () => {
    resubscribeOids();
  };

  const setName = (val: string) => {
    name.current = val;
    forceUpdate();
  };

  const setViewport = (val: Coords) => {
    viewport.current = val;
    forceUpdate();
  };

  const setScale = (val: number) => {
    scale.current = val;
    forceUpdate();
  };

  const setGrid = (val: number) => {
    grid.current = val;
    forceUpdate();
  };

  const setCurOffset = (val: Coords) => {
    if (val.x >= 0 && val.y >= 0) {
      cur_offset.current = val;
      forceUpdate();
    }
  };

  const setScrollingEnabled = (val: boolean) => {
    scrolling_enabled.current = val;
    forceUpdate();
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      handleOutEvent(e, modified.current && !ignore_modified);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session_id]);

  useEffect(() => {
    if (data) {
      setName(data.name);
      setViewport(data.viewport);
      setScale(data.scale);
      setGrid(data.grid);
      customData.current = data?.custom_data || null;
      element_pool.import(data.elements);
    } else {
      setName(DEFAULT_NAME);
      setViewport(DEFAULT_VIEWPORT);
      setScale(1);
      setGrid(DEFAULT_GRID);
      element_pool.clear();
    }
    setLoaded(true);
  }, [session_id]);

  const setSelectedElement = (el?: DElement) => {
    element_pool.set_selected(el);
    forceUpdate();
  };

  const toggleSelectedElement = (el: DElement) => {
    element_pool.toggle_selected(el);
    forceUpdate();
  };

  const setElementDragged = () => {
    element_pool.set_dragged(true);
    forceUpdate();
  };

  const unsetElementDragged = () => {
    element_pool.set_dragged(false);
    forceUpdate();
  };

  const setHelpVisible = (visible: boolean) => {
    help_visible.current = visible;
    forceUpdate();
  };

  const setViewportScrolled = (scrolled: boolean) => {
    viewport_scrolled.current = scrolled;
    forceUpdate();
  };

  const setSidebarVisible = (visible: boolean) => {
    sidebar_visible.current = visible;
    forceUpdate();
  };

  const toggleSideBar = () => {
    setSidebarVisible(!sidebar_visible.current);
  };

  const setLastMouseCoords = (coords: Coords) => {
    last_mouse_coords.current = coords;
  };

  const handleClose = () => {
    setIsShowModalExit(false);
  };

  const addElement = (
    kind: string,
    pos?: Coords,
    set_selected?: boolean
  ): DElement | null => {
    const el = element_pool.add(kind, pos || { ...cur_offset.current });
    if (el) {
      fixPosition(el);
      if (set_selected) {
        setSelectedElement(el);
      }
      setModified();
      return el;
    }
    return null;
  };

  const alignElements = () => {
    element_pool.items.map((el) => {
      fixPosition(el);
    });
    setModified();
    forceUpdate();
  };

  const copySelectedElement = () => {
    const new_elements = new Set<DElement>();
    element_pool.selected_elements.forEach((selected: DElement) => {
      const el = addElement(selected.kind, {
        x: selected.position.x + grid.current,
        y: selected.position.y + grid.current
      });
      if (el) {
        el.params = JSON.parse(JSON.stringify(selected.params));
        new_elements.add(el);
        setModified();
      }
    });
    element_pool.selected_elements = new_elements;
    forceUpdate();
  };

  const deleteSelectedElement = () => {
    if (element_pool.selection_active()) {
      element_pool.selected_elements.forEach((el: DElement) => {
        element_pool.delete(el.id);
      });
      setModified();
    }
    setSelectedElement();
    notifySubscribedOIDsChanged();
  };

  const deleteAllElements = () => {
    if (element_pool.items.length > 0) {
      setModified();
    }
    element_pool.clear();
    setSelectedElement();
    notifySubscribedOIDsChanged();
    onSuccess("dashboard cleared");
  };

  const exportData = (): DashboardData => {
    const data: DashboardData = {
      name: name.current,
      viewport: viewport.current,
      scale: scale.current,
      grid: grid.current,
      elements: element_pool.export(),
      custom_data: customData.current
    };
    return data;
  };

  const showSource = () => {
    source_visible.current = true;
    forceUpdate();
  };

  const hideSource = () => {
    source_visible.current = false;
    forceUpdate();
  };

  const calculateX = (val: number): number => {
    return val - offsetX + cur_offset.current.x;
  };

  const calculateY = (val: number): number => {
    return val - offsetY + cur_offset.current.y;
  };

  const fixPosition = (el: DElement, align_to_grid = true) => {
    const el_class = element_pool.pack.classes.get(el.kind) as
      | ElementClass
      | undefined;
    if (el.position.x + (el_class?.default_size?.x || 0) > viewport.current.x) {
      el.position.x = viewport.current.x - (el_class?.default_size?.x || 0);
    }
    if (el.position.y + (el_class?.default_size?.y || 0) > viewport.current.y) {
      el.position.y = viewport.current.y - (el_class?.default_size?.y || 0);
    }
    if (el.position.x < 0) el.position.x = 0;
    if (el.position.y < 0) el.position.y = 0;
    if (align_to_grid) {
      el.position.x = Math.round(el.position.x / grid.current) * grid.current;
      el.position.y = Math.round(el.position.y / grid.current) * grid.current;
    }
  };

  const handleMouseUp = (e: any) => {
    if (element_pool.elements_dragged) {
      element_pool.selected_elements.forEach((el: DElement) => {
        fixPosition(el);
      });
    }
    setSidebarDragged(false);
    setViewportScrolled(false);
    unsetElementDragged();
    if (selection_start.current) {
      const end_coords = getMouseEventCoords(e);
      const rect = coordsRect(selection_start.current, end_coords);
      setSelectedElement();
      element_pool.items.forEach((el: DElement) => {
        if (
          el.position.x >= rect.left &&
          el.position.x + 5 <= rect.right &&
          el.position.y >= rect.top &&
          el.position.y + 5 <= rect.bottom
        ) {
          element_pool.selected_elements.add(el);
        }
      });
      selection_start.current = null;
    }
  };

  const handleMouseMove = (e: any) => {
    if (element_pool.elements_dragged) {
      const coords = getMouseEventCoords(e);
      const delta_x = last_mouse_coords.current.x - coords.x;
      const delta_y = last_mouse_coords.current.y - coords.y;
      element_pool.selected_elements.forEach((el: DElement) => {
        el.position.x -= delta_x;
        el.position.y -= delta_y;
        fixPosition(el, false);
      });
      setModified();
      setLastMouseCoords(coords);
      forceUpdate();
    } else if (sidebar_dragged) {
      let width = sidebar_width;
      const coords = getMouseEventCoords(e);
      const delta_x = last_mouse_coords.current.x - coords.x;
      width += delta_x;
      setLastMouseCoords(coords);
      if (width < MIN_SIDEBAR_WIDTH) {
        width = MIN_SIDEBAR_WIDTH;
      }
      if (width > e.view.innerWidth) {
        width = e.view.innerWidth;
      }
      clearSelection();
      setSidebarWidth(width);
    } else if (viewport_scrolled.current) {
      const coords = getMouseEventCoords(e);
      const delta_x = last_mouse_coords.current.x - coords.x;
      const delta_y = last_mouse_coords.current.y - coords.y;
      const cur = {
        x: cur_offset.current.x + delta_x,
        y: cur_offset.current.y + delta_y
      };
      if (cur.x < 0) cur.x = 0;
      if (cur.y < 0) cur.y = 0;
      if (cur.x > viewport.current.x - 100) cur.x = viewport.current.x - 100;
      if (cur.y > viewport.current.y - 100) cur.y = viewport.current.y - 100;
      setCurOffset(cur);
      setLastMouseCoords(coords);
    } else {
      const coords = getMouseEventCoords(e);
      const coords_changed = last_mouse_coords.current.x !== coords.x;
      setLastMouseCoords(coords);
      if (selection_start.current && coords_changed) {
        forceUpdate();
      }
    }
  };

  const handleMouseDown = (e: any) => {
    try {
      const now: Date = new Date();
      if (e.target.className.indexOf("idc-editor-viewport") != -1) {
        const coords = getMouseEventCoords(e);
        setLastMouseCoords(coords);
        setSelectedElement();
        setHelpVisible(false);
        if (isClick(last_click) && !e.touches) {
          setSidebarVisible(true);
        } else {
          if (scrolling_enabled.current) {
            setViewportScrolled(true);
          }
          if (
            viewport.current.x + sidebar_width - cur_offset.current.x >=
            window.innerWidth
          ) {
            setSidebarVisible(false);
          }
        }
      }
      if (!e.touches) {
        setLastClick(now);
      }
    } catch (e) {}
    if (!e?.element_click && !scrolling_enabled.current) {
      selection_start.current = getMouseEventCoords(e);
    }
  };

  let saveDashboard: () => Promise<boolean> | undefined = undefined as any;
  if (save) {
    saveDashboard = async () => {
      const result = await save(exportData());
      if (result) {
        modified.current = false;
      }
      return result;
    };
  }

  let finishDashboard: () => void | undefined = undefined as any;
  if (finish) {
    finishDashboard = () => {
      if (modified.current && !ignore_modified) {
        setIsShowModalExit(true);
      } else {
        finish();
        modified.current = false;
      }
    };
  }

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (isBodyKeyEvent(e)) {
        setHelpVisible(false);
        switch (e.code) {
          case "Home":
            e.preventDefault();
            setCurOffset({ x: 0, y: 0 });
            break;
          case "Backquote":
            e.preventDefault();
            toggleSideBar();
            forceUpdate();
            break;
          case "Backspace":
            handleOutEvent(e, modified.current && !ignore_modified);
            break;
          case "ArrowLeft":
            if (e.altKey) {
              handleOutEvent(e, modified.current && !ignore_modified);
            } else if (!e.shiftKey) {
              if (element_pool.selection_active()) {
                element_pool.selected_elements.forEach((el: DElement) => {
                  el.position.x -= grid.current;
                  fixPosition(el, true);
                });
                setModified();
                forceUpdate();
              }
            } else {
              setCurOffset({
                x: cur_offset.current.x + grid.current,
                y: cur_offset.current.y
              });
            }
            break;
          case "ArrowRight":
            if (e.altKey) {
              handleOutEvent(e, modified.current && !ignore_modified);
            } else if (!e.shiftKey) {
              if (element_pool.selection_active()) {
                element_pool.selected_elements.forEach((el: DElement) => {
                  el.position.x += grid.current;
                  fixPosition(el, true);
                });
                setModified();
                forceUpdate();
              }
            } else {
              setCurOffset({
                x: cur_offset.current.x - grid.current,
                y: cur_offset.current.y
              });
            }
            break;
          case "ArrowUp":
            if (!e.shiftKey) {
              if (element_pool.selection_active()) {
                element_pool.selected_elements.forEach((el: DElement) => {
                  el.position.y -= grid.current;
                  fixPosition(el, true);
                });
                setModified();
                forceUpdate();
              }
            } else {
              setCurOffset({
                x: cur_offset.current.x,
                y: cur_offset.current.y + grid.current
              });
            }
            break;
          case "ArrowDown":
            if (!e.shiftKey) {
              if (element_pool.selection_active()) {
                element_pool.selected_elements.forEach((el: DElement) => {
                  el.position.y += grid.current;
                  fixPosition(el, true);
                });
                setModified();
                forceUpdate();
              }
            } else {
              setCurOffset({
                x: cur_offset.current.x,
                y: cur_offset.current.y - grid.current
              });
            }
            break;
          case "KeyX":
            if (!e.shiftKey && !e.altKey) {
              e.preventDefault();
              showSource();
            }
            break;
          case "KeyH":
            if (!e.shiftKey && !e.altKey) {
              e.preventDefault();
              setHelpVisible(true);
            }
            break;
          case "KeyL":
            if (!e.shiftKey && !e.altKey) {
              e.preventDefault();
              setScrollingEnabled(!scrolling_enabled.current);
            }
            break;
          case "KeyS":
            if (!e.altKey) {
              if (saveDashboard) {
                e.preventDefault();
                saveDashboard()?.then((result) => {
                  if (e.shiftKey && result) finishDashboard();
                });
              }
            }
            break;
          case "KeyQ":
            if (e.shiftKey && !e.altKey) {
              if (finishDashboard) {
                e.preventDefault();
                finishDashboard();
              }
            }
            break;
          case "KeyC":
            if (!e.shiftKey && !e.altKey) {
              e.preventDefault();
              copySelectedElement();
            }
            break;
          case "Delete":
            if (!e.shiftKey && !e.altKey) {
              e.preventDefault();
              deleteSelectedElement();
            }
            break;
          default:
            break;
        }
      }
    };
    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [session_id]);

  let help_box;
  if (help_visible.current) {
    help_box = (
      <HelpBox
        save_allowed={save !== undefined}
        finish_allowed={finish !== undefined}
      />
    );
  }

  const handleMouseDownEl = (e: any, element: DElement) => {
    e.element_click = true;
    last_mouse_down.current = new Date();
    setHelpVisible(false);
    if (!e.shiftKey) {
      if (!element_pool.selected_elements.has(element)) {
        setSelectedElement();
        setSelectedElement(element);
      }
      setElementDragged();
    }
    setHelpVisible(false);
  };

  const handleMouseUpEl = (e: any, element: DElement) => {
    setLastMouseCoords(getMouseEventCoords(e));
    if (e.shiftKey) {
      toggleSelectedElement(element);
    } else if (isClick(last_click)) {
      setSelectedElement();
      setSelectedElement(element);
    }
  };

  const setSource = (data: DashboardData | null) => {
    if (data) {
      setName(data.name);
      setViewport(data.viewport);
      setGrid(data.grid);
      element_pool.import(data.elements);
      customData.current = data?.custom_data || null;
      setModified();
      onSuccess("dashboard source set");
    }
    setSelectedElement();
    unsetElementDragged();
    notifySubscribedOIDsChanged();
    hideSource();
  };

  if (source_visible.current) {
    return <DashboardSource data={exportData()} setSource={setSource} />;
  }

  const cur_offset_aligned = {
    x: Math.floor(cur_offset.current.x / grid.current) * grid.current,
    y: Math.floor(cur_offset.current.y / grid.current) * grid.current
  };

  if (!loaded) {
    return;
  }

  return (
    <div
      className="idc-dashboard-container"
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleMouseMove}
      onTouchStart={handleMouseDown}
    >
      <Sidebar
        session_id={session_id}
        element_pool={element_pool}
        visible={sidebar_visible.current}
        width={sidebar_width}
        viewport={viewport.current}
        setViewport={setViewport}
        scale={scale.current}
        setScale={setScale}
        grid={grid.current}
        setGrid={setGrid}
        cur_offset={cur_offset_aligned}
        setCurOffset={setCurOffset}
        scrolling_enabled={scrolling_enabled.current}
        setScrollingEnabled={setScrollingEnabled}
        name={name.current}
        setName={setName}
        forceUpdate={forceUpdate}
        addElement={addElement}
        setDragged={setSidebarDragged}
        setVisible={setSidebarVisible}
        setLastMouseCoords={setLastMouseCoords}
        alignElements={alignElements}
        copySelectedElement={copySelectedElement}
        deleteSelectedElement={deleteSelectedElement}
        deleteAllElements={deleteAllElements}
        showSource={showSource}
        save={saveDashboard}
        finish={finishDashboard}
        notifySubscribedOIDsChanged={notifySubscribedOIDsChanged}
        onError={onError}
        setModified={setModified}
      />
      {help_box}
      <div className="idc-dashboard-viewport-container">
        <div
          className="idc-editor-viewport"
          style={{
            width: viewport.current.x - cur_offset_aligned.x,
            height: viewport.current.y - cur_offset_aligned.y,
            backgroundSize: `${grid.current}px ${grid.current}px`,
            cursor: scrolling_enabled.current ? "grab" : "auto"
          }}
          onMouseDown={handleMouseDown}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const k = e.dataTransfer.getData("new-element");
            if (k) {
              const pos: Coords = {
                x: calculateX(e.pageX),
                y: calculateY(e.pageY)
              };
              const el = addElement(k, pos);
              if (el) {
                setSelectedElement(el);
              }
            }
          }}
        >
          <ScrollHelpers
            viewport_scrolled={viewport_scrolled.current}
            cur_offset={cur_offset_aligned}
            viewport={viewport.current}
          />
          {!isClick(last_click) ? (
            <Rulers
              el={
                element_pool.elements_dragged
                  ? element_pool.top_selected_element()
                  : null
              }
              cur_offset={cur_offset_aligned}
            />
          ) : null}
          {!isClick(last_click) && selection_start.current ? (
            <SelectionRect
              rect={coordsRect(
                selection_start.current,
                last_mouse_coords.current
              )}
            />
          ) : null}
          <DisplayElements
            element_pool={element_pool}
            onMouseDown={handleMouseDownEl}
            onMouseUp={handleMouseUpEl}
            setSidebarVisible={setSidebarVisible}
            editor_mode={true}
            cur_offset={cur_offset_aligned}
            viewport_scrolled={viewport_scrolled.current}
          />
        </div>
      </div>
      <ModalDialog
        open={isShowModalExit}
        onClose={handleClose}
        title={DASHBOARD_MODIFIED_CONFIRM}
        onClick={() => {
          if (finish) {
            finish();
            modified.current = false;
          }
        }}
      />
    </div>
  );
};

const HelpBox = ({
  save_allowed,
  finish_allowed
}: {
  save_allowed: boolean;
  finish_allowed: boolean;
}): JSX.Element => {
  let save_help;
  if (save_allowed) {
    save_help = (
      <tr>
        <td>[s]</td>
        <td>save dashboard</td>
      </tr>
    );
  }

  let save_finish_help;
  if (finish_allowed) {
    save_finish_help = (
      <tr>
        <td>[Shift+Q]</td>
        <td>exit editor</td>
      </tr>
    );
  }

  let save_plus_finish_help;
  if (save_allowed && finish_allowed) {
    save_plus_finish_help = (
      <tr>
        <td>[Shift+S]</td>
        <td>save and exit editor</td>
      </tr>
    );
  }

  return (
    <div className="idc-editor-help">
      <table className="idc-editor-help-table">
        <tbody>
          <tr>
            <td>[h]</td>
            <td>this help</td>
          </tr>
          <tr>
            <td>[c]</td>
            <td>copy selected element</td>
          </tr>
          <tr>
            <td>[Del]</td>
            <td>delete selected element</td>
          </tr>
          <tr>
            <td>[x]</td>
            <td>show source window</td>
          </tr>
          <tr>
            <td>[l]</td>
            <td>Enable/disable scrolling</td>
          </tr>
          <tr>
            <td>[Arrow keys]</td>
            <td>Move selected element</td>
          </tr>
          <tr>
            <td>[Shift+Arrow keys]</td>
            <td>Scroll viewport</td>
          </tr>
          <tr>
            <td>[Home]</td>
            <td>Scroll home</td>
          </tr>
          {save_help}
          {save_plus_finish_help}
          {save_finish_help}
          <tr>
            <td>[`]</td>
            <td>toggle side bar</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ScrollHelpers = ({
  viewport_scrolled,
  cur_offset,
  viewport
}: {
  viewport_scrolled: boolean;
  cur_offset: Coords;
  viewport: Coords;
}) => {
  return (
    <>
      {viewport_scrolled ? (
        <div
          className="idc-viewport-scrolled-val"
          style={{
            width: Math.min(viewport.x - cur_offset.x, window.innerWidth),
            height: Math.min(viewport.y - cur_offset.y, window.innerHeight)
          }}
        >
          <div className="idc-viewport-scrolled-val-inner">
            X: {cur_offset.x} Y: {cur_offset.y}
          </div>
        </div>
      ) : null}
      {cur_offset.x > 0 ? (
        <div
          className="idc-scroll-helper idc-scroll-helper-x"
          style={{
            height: Math.min(viewport.y - cur_offset.y, window.innerHeight)
          }}
        >
          <div className="idc-scroll-helper-x-inner">
            <div>
              <ArrowLeftOutlinedIcon fontSize="small" />
            </div>
            <div>
              <ArrowLeftOutlinedIcon fontSize="small" />
            </div>
            <div>
              <ArrowLeftOutlinedIcon fontSize="small" />
            </div>
          </div>
        </div>
      ) : null}
      {cur_offset.y > 0 ? (
        <div
          className="idc-scroll-helper idc-scroll-helper-y"
          style={{
            width: Math.min(viewport.x - cur_offset.x, window.innerWidth)
          }}
        >
          <ArrowDropUpOutlinedIcon fontSize="small" />
          <ArrowDropUpOutlinedIcon fontSize="small" />
          <ArrowDropUpOutlinedIcon fontSize="small" />
        </div>
      ) : null}
      {viewport.x - cur_offset.x > window.innerWidth ? (
        <div
          className="idc-scroll-helper idc-scroll-helper-x-right"
          style={{
            height: Math.min(viewport.y - cur_offset.y, window.innerHeight)
          }}
        >
          <div className="idc-scroll-helper-x-inner">
            <div>
              <ArrowRightOutlinedIcon fontSize="small" />
            </div>
            <div>
              <ArrowRightOutlinedIcon fontSize="small" />
            </div>
            <div>
              <ArrowRightOutlinedIcon fontSize="small" />
            </div>
          </div>
        </div>
      ) : null}
      {viewport.y - cur_offset.y > window.innerHeight ? (
        <div
          className="idc-scroll-helper idc-scroll-helper-y-down"
          style={{
            width: Math.min(viewport.x - cur_offset.x, window.innerWidth)
          }}
        >
          <ArrowDropDownOutlinedIcon fontSize="small" />
          <ArrowDropDownOutlinedIcon fontSize="small" />
          <ArrowDropDownOutlinedIcon fontSize="small" />
        </div>
      ) : null}
    </>
  );
};

const SelectionRect = ({ rect }: { rect: Rect }) => {
  return (
    <div
      className="idc-selection-rect"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
      }}
    ></div>
  );
};
