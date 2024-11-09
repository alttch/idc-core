import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { EditNumber } from "./property_editors/number";
import { EditString } from "./property_editors/string";
import { EditSelectNumber } from "./property_editors/select_number";
import { DIMENSIONS, GRIDS } from "./common";
import { ElementPool } from "./elements";
import { PropertyEditor } from "./properties";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import BlockIcon from "@mui/icons-material/Block";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import CustomButton from "./components/buttons/custom_button.tsx";
import {
  ClearAllOutlined,
  CopyAllOutlined,
  DeleteOutline,
  ExitToAppOutlined,
  FormatAlignJustifyOutlined,
  SaveAltOutlined,
  SourceOutlined
} from "@mui/icons-material";
import NorthWestIcon from "@mui/icons-material/NorthWest";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ModalDialog from "./components/modal/ModalDialog.tsx";
import { Coords, getMouseEventCoords } from "bmat/dom";

export const Sidebar = ({
  session_id,
  element_pool,
  visible,
  width,
  viewport,
  setViewport,
  scale,
  setScale,
  grid,
  setGrid,
  cur_offset,
  setCurOffset,
  scrolling_enabled,
  setScrollingEnabled,
  name,
  setName,
  forceUpdate,
  addElement,
  setVisible,
  setDragged,
  setLastMouseCoords,
  alignElements,
  copySelectedElement,
  deleteSelectedElement,
  deleteAllElements,
  showSource,
  save,
  finish,
  notifySubscribedOIDsChanged,
  onError,
  setModified
}: {
  session_id: string;
  element_pool: ElementPool;
  visible: boolean;
  width: number;
  viewport: Coords;
  setViewport: (val: Coords) => void;
  scale: number;
  setScale: (val: number) => void;
  grid: number;
  setGrid: (val: number) => void;
  cur_offset: Coords;
  setCurOffset: (val: Coords) => void;
  scrolling_enabled: boolean;
  setScrollingEnabled: (val: boolean) => void;
  name: string;
  setName: (val: string) => void;
  forceUpdate: () => void;
  addElement: (kind: string, pos: Coords) => void;
  setVisible: (visible: boolean) => void;
  setDragged: Dispatch<SetStateAction<boolean>>;
  setLastMouseCoords: (coords: Coords) => void;
  alignElements: () => void;
  copySelectedElement: () => void;
  deleteSelectedElement: () => void;
  deleteAllElements: () => void;
  showSource: () => void;
  save?: () => Promise<boolean> | undefined;
  finish?: () => void;
  notifySubscribedOIDsChanged: () => void;
  onError: (message: any) => void;
  setModified: () => void;
}) => {
  const [error_message, setErrorMessage] = useState<null | string>(null);

  if (!element_pool.selection_active() && error_message) {
    setErrorMessage(null);
  }

  let css_class = "idc-editor-sidebar";
  let css_opts = {};

  if (visible) {
    css_opts = { width: width };
  } else {
    css_class += " idc-editor-sidebar-collapsed";
  }

  return (
    <>
      <div
        draggable={false}
        className="idc-editor-sidebar-burger"
        onClick={() => setVisible(true)}
      >
        <MenuIcon />
      </div>
      <div draggable={false} className={css_class} style={css_opts}>
        <SideBarLeft
          visible={visible}
          setVisible={setVisible}
          setDragged={setDragged}
          setLastMouseCoords={setLastMouseCoords}
        />
        <ElementPropsBar
          element_pool={element_pool}
          forceUpdate={forceUpdate}
          setErrorMessage={setErrorMessage}
          copySelectedElement={copySelectedElement}
          deleteSelectedElement={deleteSelectedElement}
          viewport={viewport}
          onError={onError}
          setModified={setModified}
          notifySubscribedOIDsChanged={notifySubscribedOIDsChanged}
        />
        <ElementsBar
          element_pool={element_pool}
          cur_offset={cur_offset}
          addElement={addElement}
          forceUpdate={forceUpdate}
        />
        <GlobalsBar
          session_id={session_id}
          viewport={viewport}
          setViewport={setViewport}
          scale={scale}
          setScale={setScale}
          grid={grid}
          setGrid={setGrid}
          cur_offset={cur_offset}
          setCurOffset={setCurOffset}
          scrolling_enabled={scrolling_enabled}
          setScrollingEnabled={setScrollingEnabled}
          name={name}
          setName={setName}
          alignElements={alignElements}
          deleteAllElements={deleteAllElements}
          showSource={showSource}
          save={save}
          finish={finish}
          setModified={setModified}
        />
      </div>
    </>
  );
};

const SideBarLeft = ({
  visible,
  setVisible,
  setDragged,
  setLastMouseCoords
}: {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  setDragged: Dispatch<SetStateAction<boolean>>;
  setLastMouseCoords: (coords: Coords) => void;
}) => {
  const handleMouseDown = (e: any) => {
    setLastMouseCoords(getMouseEventCoords(e));
    setDragged(true);
  };
  let class_name = "idc-editor-sidebar-toggle";
  if (visible) class_name += " idc-editor-sidebar-toggle-visible";
  return (
    <>
      <div
        style={{ display: visible ? "block" : "none" }}
        className="idc-editor-sidebar-close-button"
        onClick={() => setVisible(false)}
      >
        <CloseIcon />
      </div>
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        className={class_name}
      >
        <div
          className="idc-editor-sidebar-toggle-button"
          onClick={() => setVisible(!visible)}
        >
          <div className={visible ? "idc-arrow-right" : "idc-arrow-left"}></div>
        </div>
      </div>
    </>
  );
};

const ElementPropsBar = ({
  element_pool,
  forceUpdate,
  setErrorMessage,
  copySelectedElement,
  deleteSelectedElement,
  viewport,
  onError,
  setModified,
  notifySubscribedOIDsChanged
}: {
  element_pool: ElementPool;
  forceUpdate: () => void;
  setErrorMessage: Dispatch<SetStateAction<string | null>>;
  copySelectedElement: () => void;
  deleteSelectedElement: () => void;
  viewport: Coords;
  onError: (message: any) => void;
  setModified: () => void;
  notifySubscribedOIDsChanged: () => void;
}) => {
  if (element_pool.selected_elements.size > 1) {
    return (
      <div className="idc-editor-sidebar-header">
        <Accordion defaultExpanded className="idc-editor-accordion">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="elements_parameters"
            id="element_parameters_sidebar"
          >
            <Typography>Element parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="idc-elements-parameters-wrapper">
              <div className="idc-elements-parameters-wrapper__content">
                <div className="idc-elements-parameters-wrapper__content--block">
                  <div className="idc-elements-parameters-wrapper__content--buttons">
                    <CustomButton
                      className="idc-btn idc-btn-outlined"
                      onClick={copySelectedElement}
                    >
                      <CopyAllOutlined />
                      Copy
                    </CustomButton>
                    <CustomButton
                      className="idc-btn idc-btn-delete"
                      onClick={deleteSelectedElement}
                    >
                      <DeleteOutline />
                      Delete
                    </CustomButton>
                  </div>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }
  const el = element_pool.selected_elements.values().next().value;
  if (!el) return <></>;
  const element_class = element_pool.pack.classes.get(el.kind);

  if (element_class) {
    const position = el.position;

    return (
      <div className="idc-editor-sidebar-header">
        <Accordion defaultExpanded className="idc-editor-accordion">
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="elements_parameters"
            id="element_parameters_sidebar"
          >
            <Typography>Element parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div className="idc-elements-parameters-wrapper">
              <div className="idc-elements-parameters-wrapper__content">
                <div className="idc-elements-parameters-wrapper__content--block">
                  <div className="idc-elements-parameters-wrapper__content--item">
                    Class
                  </div>
                  <div className="idc-elements-parameters-wrapper__content--item">
                    <span className="idc-element-class-name">{el.kind}</span>
                  </div>
                  <div className="idc-elements-parameters-wrapper__content--buttons">
                    <CustomButton
                      className="idc-btn idc-btn-outlined"
                      onClick={copySelectedElement}
                    >
                      <CopyAllOutlined />
                      Copy
                    </CustomButton>
                    <CustomButton
                      className="idc-btn idc-btn-delete"
                      onClick={deleteSelectedElement}
                    >
                      <DeleteOutline />
                      Delete
                    </CustomButton>
                  </div>
                </div>
                <div className="idc-elements-parameters-wrapper__content--block">
                  <div className="idc-elements-parameters-wrapper__content--item">
                    X
                  </div>
                  <div className="idc-elements-parameters-wrapper__content--item">
                    <EditNumber
                      element_id={el.id}
                      update_key={el.position.x}
                      current_value={position.x}
                      setParam={(x) => {
                        position.x = x;
                        setModified();
                        forceUpdate();
                      }}
                      params={{ size: 4, min: 0, max: viewport.x }}
                    />
                  </div>
                  <div className="idc-elements-parameters-wrapper__content--item">
                    Y
                  </div>
                  <div className="idc-elements-parameters-wrapper__content--item">
                    <EditNumber
                      element_id={el.id}
                      update_key={el.position.y}
                      current_value={position.y}
                      setParam={(y) => {
                        position.y = y;
                        setModified();
                        forceUpdate();
                      }}
                      params={{ size: 4, min: 0, max: viewport.y }}
                    />
                  </div>
                </div>
                <div className="idc-elements-parameters-wrapper__content--block-editor">
                  <table className="idc-editor-elements-table">
                    <tbody>
                      <tr>
                        <td>z-index</td>
                        <td>
                          <EditNumber
                            element_id={el.id}
                            update_key={el.zindex}
                            current_value={el.zindex}
                            setParam={(z) => {
                              el.zindex = z;
                              setModified();
                              forceUpdate();
                            }}
                            params={{ size: 3, min: 0, max: 99 }}
                          />
                        </td>
                      </tr>
                      {element_class.props.map((v, k) => {
                        const setParam = (value: any) => {
                          el.params[v.name] = value;
                          setModified();
                          forceUpdate();
                        };
                        return (
                          <tr key={k}>
                            <td>{v.name}</td>
                            <td>
                              <PropertyEditor
                                kind={v.kind}
                                element_id={el.id}
                                current_value={el.params[v.name]}
                                setParam={setParam}
                                params={v.params}
                                setErrorMessage={setErrorMessage}
                                notifySubscribedOIDsChanged={
                                  notifySubscribedOIDsChanged
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  } else {
    onError(`unsupported element: ${el.kind}`);
    return <></>;
  }
};

const GlobalsBar = ({
  session_id,
  viewport,
  setViewport,
  scale,
  setScale,
  grid,
  setGrid,
  cur_offset,
  setCurOffset,
  scrolling_enabled,
  setScrollingEnabled,
  name,
  setName,
  alignElements,
  deleteAllElements,
  showSource,
  save,
  finish,
  setModified
}: {
  session_id: string;
  viewport: Coords;
  setViewport: (val: Coords) => void;
  scale: number;
  setScale: (val: number) => void;
  grid: number;
  setGrid: (val: number) => void;
  cur_offset: Coords;
  setCurOffset: (val: Coords) => void;
  scrolling_enabled: boolean;
  setScrollingEnabled: (val: boolean) => void;
  name: string;
  setName: (val: string) => void;
  alignElements: () => void;
  deleteAllElements: () => void;
  showSource: () => void;
  save?: () => Promise<boolean> | undefined;
  finish?: () => void;
  setModified: () => void;
}) => {
  const [isShowModal, setIsShowModal] = useState(false);

  const setViewportX = (x: number) => {
    setViewport({ x: x, y: viewport.y });
    setModified();
  };

  const setViewportY = (y: number) => {
    setViewport({ x: viewport.x, y: y });
    setModified();
  };

  let btn_save;
  let btn_finish;

  if (save) {
    btn_save = (
      <CustomButton
        className="idc-btn idc-btn-outlined"
        type="button"
        onClick={save}
      >
        <SaveAltOutlined />
        Save
      </CustomButton>
    );
  }

  if (finish) {
    btn_finish = (
      <CustomButton
        className="idc-btn idc-btn-outlined"
        type="button"
        onClick={finish}
      >
        <ExitToAppOutlined />
        Exit editor
      </CustomButton>
    );
  }

  const handleClose = () => {
    setIsShowModal(false);
  };

  return (
    <div className="idc-editor-sidebar-header">
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="globals_content"
          id="globals_params"
        >
          <Typography>Dashboard</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <table draggable={false} className="idc-editor-sidebar-table">
            <tbody>
              <tr className="idc-editor-sidebar-row">
                <td className="idc-editor-sidebar-param-name idc-editor-sidebar-col">
                  Name
                </td>
                <td>
                  <EditString
                    current_value={name}
                    setParam={(...params) => {
                      setModified();
                      setName(...params);
                    }}
                    params={{ size: 20 }}
                  />
                </td>
              </tr>
              <tr className="idc-editor-sidebar-row">
                <td colSpan={2}>
                  <div className="idc-editor-sidebar-buttons-container">
                    <CustomButton
                      type="button"
                      className="idc-btn idc-btn-outlined"
                      onClick={showSource}
                    >
                      <SourceOutlined />
                      Source
                    </CustomButton>
                    <CustomButton
                      type="button"
                      className="idc-btn idc-btn-delete"
                      onClick={() => {
                        setIsShowModal(true);
                      }}
                    >
                      <ClearAllOutlined />
                      Clear
                    </CustomButton>
                  </div>
                </td>
              </tr>
              <tr className="idc-editor-sidebar-row">
                <td className="editor-sidebar-param-name idc-editor-sidebar-col">
                  Viewport
                </td>
                <td className="idc-dashboard-editor-viewport">
                  <EditSelectNumber
                    current_value={viewport.x}
                    setParam={setViewportX}
                    params={DIMENSIONS}
                  />
                  x
                  <EditSelectNumber
                    current_value={viewport.y}
                    setParam={setViewportY}
                    params={DIMENSIONS}
                  />
                </td>
              </tr>
              <tr className="idc-editor-sidebar-row">
                <td className="editor-sidebar-param-name idc-editor-sidebar-col">
                  Scale
                </td>
                <td className="idc-dashboard-editor-viewport">
                  <EditNumber
                    element_id={`${session_id}-scale`}
                    current_value={scale}
                    setParam={(val: number) => {
                      setScale(val);
                      setModified();
                    }}
                    step={0.1}
                    params={{ min: 0.1, float: true }}
                  />
                </td>
              </tr>
              <tr className="idc-editor-sidebar-row">
                <td className="idc-editor-sidebar-param-name idc-editor-sidebar-col">
                  Grid
                </td>
                <td className="idc-editor-grid-select">
                  <Select
                    sx={{ width: "80px" }}
                    value={grid}
                    onChange={(e) => {
                      setGrid(parseInt(e.target.value as string));
                      setModified();
                    }}
                  >
                    {GRIDS.map((d) => {
                      return (
                        <MenuItem key={d} value={d}>
                          {d}x{d}
                        </MenuItem>
                      );
                    })}
                  </Select>
                  <CustomButton
                    className="idc-btn idc-btn-outlined"
                    type="button"
                    onClick={alignElements}
                  >
                    <FormatAlignJustifyOutlined />
                    Align
                  </CustomButton>
                </td>
              </tr>
              <tr className="idc-editor-sidebar-row">
                <td className="idc-editor-sidebar-param-name idc-editor-sidebar-col">
                  Offset
                </td>
                <td className="idc-editor-grid-select">
                  <div style={{ marginTop: "8px" }}>
                    X:{cur_offset.x} Y:{cur_offset.y}
                  </div>
                  <div className="idc-editor-sidebar-buttons-container">
                    <CustomButton
                      className="idc-btn idc-btn-outlined"
                      type="button"
                      onClick={() => setScrollingEnabled(!scrolling_enabled)}
                    >
                      {scrolling_enabled ? <AspectRatioIcon /> : <BlockIcon />}
                      <span>Scroll</span>
                    </CustomButton>
                    <CustomButton
                      className="idc-btn idc-btn-outlined"
                      type="button"
                      onClick={() => setCurOffset({ x: 0, y: 0 })}
                    >
                      <NorthWestIcon />
                      Home
                    </CustomButton>
                  </div>
                </td>
              </tr>
              <tr className="idc-editor-sidebar-row">
                <td colSpan={2}>
                  <div className="idc-editor-sidebar-buttons-container">
                    {btn_save}
                    {btn_finish}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </AccordionDetails>
      </Accordion>

      <ModalDialog
        open={isShowModal}
        onClose={handleClose}
        title="All dashboard elements will be deleted"
        onClick={() => {
          deleteAllElements();
          setIsShowModal(false);
        }}
      />
    </div>
  );
};

const ElementsBar = ({
  element_pool,
  cur_offset,
  addElement,
  forceUpdate
}: {
  element_pool: ElementPool;
  cur_offset: Coords;
  addElement: (kind: string, pos: Coords, set_selected?: boolean) => void;
  forceUpdate: () => void;
}) => {
  const element_map = useMemo(() => {
    let map = new Map();
    for (const [k, el_class] of element_pool.pack.classes) {
      let group_map = map.get(el_class.group);
      if (group_map === undefined) {
        group_map = new Map();
        map.set(el_class.group, group_map);
      }
      group_map.set(k, el_class);
    }
    return Array.from(map);
  }, [element_pool]);

  return (
    <div className="idc-editor-sidebar-header">
      <Accordion defaultExpanded className="idc-editor-accordion">
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="elements_content"
          id="elements_sidebar_summary"
        >
          <Typography>Elements</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {element_map.map(([group_name, group_map]) => {
            return (
              <div key={group_name} className="idc-elements-group-label">
                <Accordion className="idc-editor-accordion">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="elements_content"
                    id="elements_sidebar_summary"
                  >
                    <Typography>
                      <span className="idc-editor-accordion-group">
                        {group_name}
                      </span>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "10px"
                    }}
                  >
                    {[...group_map].map(([k, v]) => {
                      let icon;
                      if (v.IconDraw) {
                        icon = (
                          <>
                            <v.IconDraw />
                          </>
                        );
                      } else {
                        icon = (
                          <>
                            <img
                              className="idc-element-icon"
                              src={`idc/elements/${k}.png`}
                              alt="icon"
                            />
                          </>
                        );
                      }
                      return (
                        <div
                          key={k}
                          onTouchStart={() => {
                            addElement(k, cur_offset, true);
                            forceUpdate();
                          }}
                          onDragStart={(e) =>
                            e.dataTransfer.setData("new-element", k)
                          }
                          draggable
                          className="idc-editor-sidebar-element-class"
                        >
                          {icon}
                          <div> {v.description}</div>
                        </div>
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              </div>
            );
          })}
        </AccordionDetails>
      </Accordion>
    </div>
  );
};
